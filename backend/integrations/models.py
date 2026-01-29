from __future__ import annotations

from django.conf import settings
from django.db import models


class CallSummary(models.Model):
    """
    Stores AI call outcomes from Vapi (or other voice) webhooks.
    Used by the Call Summaries dashboard page.
    """

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="call_summaries",
    )
    vapi_call_id = models.CharField(
        max_length=255,
        blank=True,
        db_index=True,
        help_text="Vapi call/assistant call id for idempotency.",
    )
    caller_name = models.CharField(max_length=255, blank=True)
    caller_number = models.CharField(max_length=50, blank=True)
    service_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="Service discussed or booked (e.g. Haircut, Cleansing).",
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    currency = models.CharField(max_length=8, default="USD", blank=True)
    summary = models.TextField(
        blank=True,
        help_text="AI-generated call summary.",
    )
    transcript = models.TextField(
        blank=True,
        help_text="Full or partial call transcript.",
    )
    outcome = models.CharField(
        max_length=64,
        blank=True,
        help_text="e.g. Booking created, Rescheduled, Lead captured.",
    )
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Optional links to CRM/booking created from the call
    related_booking = models.ForeignKey(
        "bookings.Booking",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="call_summaries",
    )
    related_client = models.ForeignKey(
        "clients.Client",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="call_summaries",
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Call summaries"

    def __str__(self) -> str:
        return f"{self.caller_name or self.caller_number or 'Call'} @ {self.created_at}"
