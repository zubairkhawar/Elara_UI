from __future__ import annotations

from django.urls import path
from rest_framework import routers

from .views import AlertViewSet, alerts_stream

app_name = 'notifications'

router = routers.DefaultRouter()
router.register('', AlertViewSet, basename='alert')

urlpatterns: list = [
    path('stream/', alerts_stream),
    *router.urls,
]
