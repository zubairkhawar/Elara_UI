from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "name",
            "business_name",
            "phone_number",
            "business_type",
            "service_hours",
            "custom_service_hours",
            "currency",
            "email_notifications",
            "sms_notifications",
        ]
        # Email and id are not editable through the profile endpoint.
        read_only_fields = ["id", "email"]


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "name",
            "business_name",
            "phone_number",
            "business_type",
            "service_hours",
            "custom_service_hours",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        return user
