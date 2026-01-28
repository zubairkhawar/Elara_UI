from __future__ import annotations

from django.conf import settings
from django.db import models

from clients.models import Client


class Booking(models.Model):
    """
    Basic booking model to support the dashboard.

    Can be extended later with integration-specific metadata.
    """

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("cancelled", "Cancelled"),
    ]

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    status = models.CharField(
        max_length=32,
        choices=STATUS_CHOICES,
        default="pending",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-starts_at"]

    def __str__(self) -> str:
        return f"{self.client} @ {self.starts_at:%Y-%m-%d %H:%M}"

