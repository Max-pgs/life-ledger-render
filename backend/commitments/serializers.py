from rest_framework import serializers

from .models import CommitmentGroup, Commitment, Status

class CommitmentGroupSerializer(serializers.ModelSerializer):
    # Represent an admin-managed commitment group.
    # Ordinary users can view group guidance but cannot create
    # or modify the group, description or information link.
    
    class Meta:
        model = CommitmentGroup
        fields = (
            "id",
            "name",
            "description",
            "information_url",
        )
        read_only_fields = fields
        
class StatusSerializer(serializers.ModelSerializer):
    # Represent a reusable commitment lifecycle status.
    
    class Meta:
        model = Status
        fields = (
            "id",
            "name",
            "description",
        )
        read_only_fields = fields

class CommitmentSerializer(serializers.ModelSerializer):
    # Validate and represent a structured personal commitment.
    
    group = CommitmentGroupSerializer(
        read_only = True,
    )
    
    group_id = serializers.PrimaryKeyRelatedField(
        source = "group",
        queryset = CommitmentGroup.objects.filter(is_active = True),
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
            "group",
            "group_id",
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
    