from __future__ import annotations

import json
import logging
import re
from decimal import Decimal
from datetime import datetime, timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import CallSummary

User = get_user_model()
logger = logging.getLogger(__name__)


def _normalize_phone(phone: str) -> str:
    """Strip to digits (and leading +) for matching."""
    if not phone:
        return ""
    return re.sub(r"[^\d+]", "", phone.strip())


def _create_alert_for_call_summary(instance: CallSummary) -> None:
    """Create an Alert so the user sees the new call in Alerts and dashboard. Never raises."""
    try:
        from notifications.models import Alert
        title = "New call"
        message = (instance.summary or "").strip() or f"Call from {instance.caller_name or instance.caller_number or 'Unknown'}"
        if len(message) > 500:
            message = message[:497] + "..."
        Alert.objects.create(
            owner_id=instance.owner_id,
            type="info",
            title=title,
            message=message,
            related_client_id=instance.related_client_id,
            related_booking_id=instance.related_booking_id,
        )
    except Exception as e:
        logger.exception("Vapi webhook: create_alert_for_call_summary failed: %s", e)


def _link_call_summary_to_booking_and_client(instance: CallSummary) -> None:
    """
    Try to set related_client and related_booking on a CallSummary by matching
    caller phone to a Client (or creating a new Client if no match), then
    finding or creating a Booking. Never raises; logs and returns on any error.
    """
    try:
        owner_id = instance.owner_id
        from clients.models import Client
        from bookings.models import Booking, Service

        caller = (_normalize_phone(instance.caller_number) or "").strip()
        caller_name = (instance.caller_name or "").strip() or "Caller"

        # Find or create Client
        related_client = None
        if caller:
            clients = list(
                Client.objects.filter(owner_id=owner_id).only("id", "phone_number")
            )
            for c in clients:
                if _normalize_phone(c.phone_number) and caller in _normalize_phone(c.phone_number):
                    related_client = c
                    break
                if _normalize_phone(c.phone_number) and _normalize_phone(c.phone_number) in caller:
                    related_client = c
                    break
        if not related_client and (instance.caller_name or instance.caller_number):
            # New caller → create Client so they appear in Customers
            related_client = Client.objects.create(
                owner_id=owner_id,
                name=caller_name,
                phone_number=instance.caller_number or "",
                email="",
            )
        if not related_client:
            return
        instance.related_client_id = related_client.id

        # Find existing booking around call time, or create one from the call
        call_time = instance.ended_at or instance.created_at
        if call_time and timezone.is_naive(call_time):
            call_time = timezone.make_aware(call_time)
        if call_time:
            window_start = call_time - timedelta(minutes=15)
            window_end = call_time + timedelta(minutes=2)
            booking = (
                Booking.objects.filter(
                    owner_id=owner_id,
                    client_id=related_client.id,
                    created_at__gte=window_start,
                    created_at__lte=window_end,
                )
                .order_by("-created_at")
                .first()
            )
            if booking:
                instance.related_booking_id = booking.id
        if not instance.related_booking_id and instance.service_name:
            # Create a placeholder booking from the call so it shows on Bookings page
            service = (
                Service.objects.filter(owner_id=owner_id, name__iexact=instance.service_name.strip())
                .first()
                or Service.objects.filter(owner_id=owner_id, is_active=True).first()
            )
            start = (call_time or timezone.now()) + timedelta(days=1)
            start = start.replace(hour=9, minute=0, second=0, microsecond=0)
            if timezone.is_naive(start):
                start = timezone.make_aware(start)
            end = start + timedelta(hours=1)
            booking = Booking.objects.create(
                owner_id=owner_id,
                client_id=related_client.id,
                service_id=service.id if service else None,
                starts_at=start,
                ends_at=end,
                status="pending",
                notes=f"From voice call: {(instance.summary or '')[:500]}",
            )
            instance.related_booking_id = booking.id
        instance.save(update_fields=["related_client_id", "related_booking_id"])
    except Exception as e:
        logger.exception("Vapi webhook: link_call_summary_to_booking_and_client failed: %s", e)


def _get_webhook_owner():
    """Resolve the owner user for incoming Vapi webhooks."""
    email = getattr(settings, "VAPI_DEFAULT_OWNER_EMAIL", None) or ""
    email = (email or "").strip()
    if email:
        try:
            return User.objects.get(email=email, is_active=True)
        except User.DoesNotExist:
            logger.warning("VAPI_DEFAULT_OWNER_EMAIL=%s not found, using first user", email)
    return User.objects.filter(is_active=True).order_by("id").first()


def _parse_iso_datetime(s: str | None):
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except (ValueError, TypeError):
        return None


def _process_vapi_webhook(request, owner: User) -> JsonResponse:
    """
    Process Vapi end-of-call-report payload and create/update CallSummary for the given owner.
    """
    try:
        body = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    message = body.get("message") or body
    if isinstance(message, dict) and message.get("type") == "end-of-call-report":
        payload = message
    else:
        payload = body

    call_id = (
        payload.get("call", {}).get("id")
        if isinstance(payload.get("call"), dict)
        else payload.get("callId") or payload.get("id") or ""
    )
    call_id = (call_id or "").strip()

    # Idempotency: update existing summary if we have a vapi call id
    instance = None
    if call_id:
        instance = CallSummary.objects.filter(
            owner=owner, vapi_call_id=call_id
        ).first()

    # Extract common Vapi end-of-call-report fields (names may vary by version).
    call = payload.get("call") if isinstance(payload.get("call"), dict) else {}
    transcript = payload.get("transcript") or call.get("transcript") or ""
    if isinstance(transcript, list):
        transcript = "\n".join(
            (t.get("message") or t.get("content") or str(t) for t in transcript)
        )
    transcript = (transcript or "")[:65535]

    summary_text = (payload.get("summary") or call.get("summary") or "")[:65535]
    customer = call.get("customer") or payload.get("customer") or {}
    if isinstance(customer, dict):
        caller_number = customer.get("number") or customer.get("phone") or ""
        caller_name = customer.get("name") or ""
    else:
        caller_number = payload.get("callerNumber") or payload.get("phone") or ""
        caller_name = payload.get("callerName") or ""

    # Duration
    duration_seconds = payload.get("duration") or call.get("duration")
    if duration_seconds is not None:
        try:
            duration_seconds = int(duration_seconds)
        except (TypeError, ValueError):
            duration_seconds = None

    # Started/ended
    started_at = _parse_iso_datetime(
        payload.get("startedAt") or call.get("startedAt")
    )
    ended_at = _parse_iso_datetime(
        payload.get("endedAt") or call.get("endedAt")
    )

    # Custom fields some assistants send (e.g. from tool calls or summary prompt)
    outcome = (payload.get("outcome") or payload.get("result") or "")[:64]
    service_name = (payload.get("serviceName") or payload.get("service") or "")[:255]
    price = payload.get("price")
    if price is not None:
        try:
            price = Decimal(str(price))
        except (TypeError, ValueError):
            price = None
    currency = (payload.get("currency") or "USD")[:8]

    if instance:
        instance.transcript = transcript or instance.transcript
        instance.summary = summary_text or instance.summary
        instance.caller_name = caller_name or instance.caller_name
        instance.caller_number = caller_number or instance.caller_number
        instance.duration_seconds = duration_seconds if duration_seconds is not None else instance.duration_seconds
        instance.started_at = started_at or instance.started_at
        instance.ended_at = ended_at or instance.ended_at
        instance.outcome = outcome or instance.outcome
        instance.service_name = service_name or instance.service_name
        if price is not None:
            instance.price = price
        instance.currency = currency or instance.currency
        instance.save()
        _link_call_summary_to_booking_and_client(instance)
        logger.info("Vapi webhook: CallSummary updated id=%s", instance.id)
        return JsonResponse({"ok": True, "action": "updated", "id": instance.id})

    # Avoid creating a new row for every Vapi ping when there's no call_id and no real content
    if not call_id and not transcript.strip() and not summary_text.strip():
        logger.info("Vapi webhook: skipped create (no call_id and no transcript/summary)")
        return JsonResponse({"ok": True, "action": "skipped"})

    instance = CallSummary.objects.create(
        owner=owner,
        vapi_call_id=call_id or "",
        caller_name=caller_name,
        caller_number=caller_number,
        service_name=service_name,
        price=price,
        currency=currency,
        transcript=transcript,
        summary=summary_text,
        outcome=outcome,
        duration_seconds=duration_seconds,
        started_at=started_at,
        ended_at=ended_at,
    )
    _link_call_summary_to_booking_and_client(instance)
    _create_alert_for_call_summary(instance)
    logger.info("Vapi webhook: CallSummary created id=%s", instance.id)
    return JsonResponse({"ok": True, "action": "created"})


@csrf_exempt
@require_http_methods(["POST"])
def vapi_webhook(request):
    """
    Legacy single-tenant webhook. Uses VAPI_DEFAULT_OWNER_EMAIL or first user.
    For new clients use webhook_by_token (URL includes the client's token).
    """
    owner = _get_webhook_owner()
    if not owner:
        logger.warning("Vapi webhook: no owner user found, skipping")
        return JsonResponse({"ok": False, "reason": "no_owner"}, status=200)
    return _process_vapi_webhook(request, owner)


@csrf_exempt
@require_http_methods(["POST"])
def vapi_webhook_by_token(request, token: str):
    """
    Per-client webhook. URL: /api/v1/vapi/webhook/<token>/
    Resolve the client (User) by vapi_webhook_token and create/update CallSummary for that user.
    Use this URL when configuring each Vapi agent (one agent per client).
    """
    logger.info("Vapi webhook received: POST /api/v1/vapi/webhook/<token>/ (token=%s)", token[:8] + "...")
    try:
        owner = User.objects.filter(
            vapi_webhook_token=token.strip(),
            is_active=True,
        ).first()
        if not owner:
            logger.warning("Vapi webhook: unknown or inactive token")
            return JsonResponse({"ok": False, "reason": "unknown_token"}, status=200)
        return _process_vapi_webhook(request, owner)
    except Exception as e:
        logger.exception("Vapi webhook: unhandled error: %s", e)
        return JsonResponse(
            {"ok": False, "error": str(e)},
            status=500,
        )
