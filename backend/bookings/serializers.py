from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Booking, Service


User = get_user_model()


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = [
            "id",
            "name",
            "price",
            "currency",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        assert request is not None
        validated_data["owner"] = request.user
        return super().create(validated_data)


class BookingSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    client_email = serializers.EmailField(source='client.email', read_only=True)
    client_phone = serializers.CharField(source='client.phone_number', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True, allow_null=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'client',
            'client_name',
            'client_email',
            'client_phone',
            'service',
            'service_name',
            'starts_at',
            'ends_at',
            'status',
            'notes',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        request = self.context.get('request')
        assert request is not None
        validated_data['owner'] = request.user
        return super().create(validated_data)

