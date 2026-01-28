from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/accounts/", include("accounts.urls")),
    path("api/v1/bookings/", include("bookings.urls")),
    path("api/v1/clients/", include("clients.urls")),
    path("api/v1/vapi/", include("integrations.vapi_urls")),
]

