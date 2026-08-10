from rest_framework import serializers

from .models import GroupInformationLink

class GroupInformationLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupInformationLink
        fields = (
            "id",
            "title",
            "url",
            "created_at",
            "updated_at",
        )