from __future__ import annotations

import json
import logging
from datetime import timedelta

from django.http import HttpResponse, StreamingHttpResponse
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.request import Request
from rest_framework.response import Response

from .models import Alert
from .serializers import AlertSerializer
from .stream import register_queue, unregister_queue

logger = logging.getLogger(__name__)

# Alerts older than this are excluded from the API (auto-removed from user's view)
ALERT_RETENTION_DAYS = 7


class AlertViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for managing alerts/notifications.
    Alerts older than 7 days are excluded and can be purged via management command.
    """
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return alerts for the current user (last 7 days only)."""
        cutoff = timezone.now() - timedelta(days=ALERT_RETENTION_DAYS)
        queryset = Alert.objects.filter(
            owner=self.request.user,
            created_at__gte=cutoff,
        )

        # Filter by read/unread status
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            is_read_bool = is_read.lower() == 'true'
            queryset = queryset.filter(is_read=is_read_bool)

        # Filter by type
        alert_type = self.request.query_params.get('type')
        if alert_type:
            queryset = queryset.filter(type=alert_type)

        return queryset.order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_read(self, request: Request, pk: int = None) -> Response:
        """Mark a specific alert as read."""
        alert = self.get_object()
        if alert.owner != request.user:
            return Response(
                {'detail': 'Not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        alert.mark_as_read()
        return Response(AlertSerializer(alert).data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request: Request) -> Response:
        """Mark all unread alerts as read."""
        updated = Alert.objects.filter(
            owner=request.user,
            is_read=False,
        ).update(
            is_read=True,
            read_at=timezone.now(),
        )
        return Response({'marked_read': updated})

    @action(detail=False, methods=['get'])
    def unread_count(self, request: Request) -> Response:
        """Get count of unread alerts (last 7 days)."""
        cutoff = timezone.now() - timedelta(days=ALERT_RETENTION_DAYS)
        count = Alert.objects.filter(
            owner=request.user,
            is_read=False,
            created_at__gte=cutoff,
        ).count()
        return Response({'count': count})

    @action(detail=False, methods=['post'])
    def clear_all(self, request: Request) -> Response:
        """Delete all alerts for the current user (last 7 days scope)."""
        cutoff = timezone.now() - timedelta(days=ALERT_RETENTION_DAYS)
        deleted, _ = Alert.objects.filter(
            owner=request.user,
            created_at__gte=cutoff,
        ).delete()
        return Response({'deleted': deleted})


def _get_user_from_token(access_token: str):
    """Validate JWT and return User or None."""
    from rest_framework_simplejwt.tokens import AccessToken
    from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

    if not access_token:
        return None
    try:
        token = AccessToken(access_token)
        user_id = token.get("user_id")
        if not user_id:
            return None
        from django.contrib.auth import get_user_model
        User = get_user_model()
        return User.objects.filter(pk=user_id, is_active=True).first()
    except (InvalidToken, TokenError):
        return None


def _event_stream(user_id: int):
    """Generator yielding SSE events (new alerts or heartbeat)."""
    import queue
    q = register_queue(user_id)
    try:
        while True:
            try:
                payload = q.get(timeout=30)
                yield f"data: {json.dumps(payload)}\n\n"
            except queue.Empty:
                yield ": heartbeat\n\n"
    except GeneratorExit:
        pass
    finally:
        unregister_queue(user_id, q)


@api_view(["GET"])
@permission_classes([])
def alerts_stream(request: Request) -> HttpResponse:
    """
    Server-Sent Events stream for live alerts.
    Requires ?access_token=<jwt> (EventSource does not send custom headers).
    """
    access_token = request.GET.get("access_token") or request.GET.get("token")
    user = _get_user_from_token(access_token)
    if not user:
        return HttpResponse(status=401)
    response = StreamingHttpResponse(
        _event_stream(user.id),
        content_type="text/event-stream",
    )
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"
    return response
