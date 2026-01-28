from __future__ import annotations

from django.urls import path
from rest_framework import routers

from .views import BookingViewSet, ServiceViewSet


app_name = "bookings"

router = routers.DefaultRouter()
router.register("services", ServiceViewSet, basename="service")
router.register("", BookingViewSet, basename="booking")

urlpatterns: list = router.urls

