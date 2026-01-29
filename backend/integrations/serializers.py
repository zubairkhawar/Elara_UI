from __future__ import annotations

from rest_framework import serializers

from .models import CallSummary


class CallSummarySerializer(serializers.ModelSerializer):
    duration_minutes = serializers.SerializerMethodField()

    class Meta:
        model = CallSummary
        fields = [
            "id",
            "vapi_call_id",
            "caller_name",
            "caller_number",
            "service_name",
            "price",
            "currency",
            "summary",
            "transcript",
            "outcome",
            "duration_seconds",
            "duration_minutes",
            "started_at",
            "ended_at",
            "created_at",
            "related_booking",
            "related_client",
        ]
        read_only_fields = fields

    def get_duration_minutes(self, obj: CallSummary) -> int | None:
        if obj.duration_seconds is None:
            return None
        return max(0, obj.duration_seconds // 60)
