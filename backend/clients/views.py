from __future__ import annotations

from django.db.models import Count
from rest_framework import permissions, viewsets

from .models import Client
from .serializers import ClientSerializer


class ClientViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for business clients/customers.
    """

    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Client.objects.filter(owner=self.request.user).order_by('-created_at')
        # Annotate with bookings count
        queryset = queryset.annotate(
            bookings_count=Count('bookings')
        )
        return queryset
