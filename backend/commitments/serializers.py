from rest_framework import serializers

from .models import Category, Commitment, Status

class CategorySerializer(serializers.ModelSerializer):
    # Represent a reusable commitment category.
    
    class Meta:
        model = Category
        fields = (
            "id",
            "name",
            "description",
        )
        
class StatusSerializer(serializers.ModelSerializer):
    # Represent a reusable commitment lifecycle status.
    
    class Meta:
        model = Status
        fields = (
            "id",
            "name",
            "description",
        )

class CommitmentSerializer(serializers.ModelSerializer):
    # Validate and represent a structured personal commitment.
    
    category = CategorySerializer(
        read_only = True,
    )
    
    category_id = serializers.PrimaryKeyRelatedField(
        source = "category",
        queryset = Category.objects.all(),
        write_only = True,
        required = False,
        allow_null = True,
    )
    
    status = StatusSerializer(
        read_only = True,
    )
    
    status_id = serializers.PrimaryKeyRelatedField(
        source = "status",
        queryset = Status.objects.all(),
        write_only = True,
        required = False,
        allow_null = True,
    )
    
    class Meta:
        model = Commitment
        fields = (
            "id",
            "title",
            "category",
            "category_id",
            "provider_name",
            "due_date",
            "renewal_date",
            "priority",
            "status",
            "status_id",
            "notes",
            "is_archived",
            "archived_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "is_archived",
            "archived_at",
            "created_at",
            "updated_at",
        )
        
    def validate_title(self, value):
        # Reject titles containing only whitespace.
        
        cleaned_title = value.strip()
        
        if not cleaned_title:
            raise serializers.ValidationError("Commitment title cannot be empty")
        
        return cleaned_title
    
    def validate_provider_name(self, value):
        # Remove unnecessary whitespace from provider names.
        
        return value.strip()
    