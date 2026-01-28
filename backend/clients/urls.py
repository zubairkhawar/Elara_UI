from __future__ import annotations

from rest_framework import routers

from .views import ClientViewSet

app_name = 'clients'

router = routers.DefaultRouter()
router.register('', ClientViewSet, basename='client')

urlpatterns: list = router.urls
