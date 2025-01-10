from rest_framework import serializers
from .models import Drawing


class DrawingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drawing  # Correct model reference
        fields = '__all__'
