from rest_framework import serializers

from .models import Commitment

class CommitmentSerializer(serializers.ModelSerializer):
    # Validate and create a basic personal commitment.
    
    class Meta:
        model = Commitment
        fields = (
            "id",
            "title",
            "notes",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )
        
    def validate_title(self, value):
        # Reject titles containing only whitespace.
        
        cleaned_title = value.strip()
        
        if not cleaned_title:
            raise serializers.ValidationError("Commitment title cannot be empty")
        
        return cleaned_title
    