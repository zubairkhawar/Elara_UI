from __future__ import annotations

from rest_framework import serializers

from .models import CallSummary
from .summary_utils import infer_from_summary


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
        if obj.duration_seconds is not None:
            return max(0, obj.duration_seconds // 60)
        if obj.started_at and obj.ended_at:
            try:
                delta = obj.ended_at - obj.started_at
                return max(0, int(delta.total_seconds()) // 60)
            except (TypeError, ValueError):
                pass
        return None

    def to_representation(self, instance: CallSummary):
        data = super().to_representation(instance)
        # When Vapi didn't send caller/service/outcome, infer from summary for display
        if instance.summary:
            inferred = infer_from_summary(instance.summary)
            if inferred:
                if not (data.get("caller_name") or "").strip():
                    data["caller_name"] = inferred.get("caller_name") or ""
                if not (data.get("service_name") or "").strip():
                    data["service_name"] = inferred.get("service_name") or ""
                if not (data.get("outcome") or "").strip():
                    data["outcome"] = inferred.get("outcome") or ""
        return data
