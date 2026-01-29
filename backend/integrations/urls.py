from __future__ import annotations

from django.urls import path, include
from rest_framework import routers

from .views import CallSummaryViewSet

app_name = "integrations"

router = routers.DefaultRouter()
router.register("", CallSummaryViewSet, basename="call-summary")

urlpatterns = [
    path("", include(router.urls)),
]
