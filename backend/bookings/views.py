from __future__ import annotations

from rest_framework import permissions, viewsets

from .models import Booking, Service
from .serializers import BookingSerializer, ServiceSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for salon/business services that Elara can book.
    """

    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return services for the authenticated business owner.
        return Service.objects.filter(owner=self.request.user).order_by("name")


class BookingViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for bookings/appointments.
    """

    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return bookings for the authenticated business owner.
        return Booking.objects.filter(owner=self.request.user).select_related('client', 'service').order_by('-starts_at')

