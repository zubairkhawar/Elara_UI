from __future__ import annotations

from rest_framework import serializers

from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    bookings_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Client
        fields = [
            'id',
            'name',
            'email',
            'phone_number',
            'created_at',
            'bookings_count',
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        request = self.context.get('request')
        assert request is not None
        validated_data['owner'] = request.user
        return super().create(validated_data)
