from __future__ import annotations

from django.urls import path
from rest_framework import routers


app_name = "bookings"

router = routers.DefaultRouter()

urlpatterns: list = [
    # ViewSets can be registered on `router` later.
] + router.urls

