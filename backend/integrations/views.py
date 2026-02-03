from __future__ import annotations

from django.db.models import Q
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import CallSummary
from .serializers import CallSummarySerializer


class CallSummaryViewSet(viewsets.ModelViewSet):
    """
    List, retrieve, and delete call summaries for the authenticated user.
    """

    serializer_class = CallSummarySerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_queryset(self):
        queryset = CallSummary.objects.filter(owner=self.request.user).order_by(
            "-created_at"
        )
        search = (self.request.query_params.get("search") or "").strip()
        if search:
            queryset = queryset.filter(
                Q(caller_name__icontains=search)
                | Q(caller_number__icontains=search)
                | Q(summary__icontains=search)
                | Q(service_name__icontains=search)
            )
        service = (self.request.query_params.get("service") or "").strip()
        if service:
            queryset = queryset.filter(service_name__iexact=service)
        return queryset

    @action(detail=False, methods=["post"], url_path="delete-all")
    def delete_all(self, request):
        """Delete all call summaries for the current user."""
        deleted, _ = CallSummary.objects.filter(owner=request.user).delete()
        return Response(status=204)
