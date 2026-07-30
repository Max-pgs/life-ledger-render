from rest_framework import serializers
from datetime import timedelta

from .models import CommitmentGroup, CommitmentTemplate, Commitment, Status

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
    
    cancellation_deadline = serializers.SerializerMethodField()
    
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
            "amount",
            "payment_frequency",
            "payment_status",
            "contract_end_date",
            "notice_period_days",
            "cancellation_deadline",
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
    
    def validate_amount(self, value):
        # Reject negative monetary values.
        
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Amount cannot be negative."
            )

        return value
    
    def validate_notice_period_days(self, value):
        # Reject negative notice periods.

        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Notice period cannot be negative."
            )

        return value
    
    def get_cancellation_deadline(self, obj):
        # Calculate the final date by which a contract should be cancelled.
        
        if (
            obj.contract_end_date is None
            or obj.notice_period_days is None
        ):
            return None
        
        deadline = (
            obj.contract_end_date - timedelta(days = obj.notice_period_days)
        )
        
        return deadline.isoformat()
        
class CommitmentTemplateSerializer(serializers.ModelSerializer):
    group = CommitmentGroupSerializer(read_only = True)

    class Meta:
        model = CommitmentTemplate
        fields = [
            "id",
            "name",
            "description",
            "group",
            "default_provider_name",
            "default_amount",
            "default_payment_frequency",
            "default_priority",
        ]
        
class GuidedSetupGroupSerializer(serializers.ModelSerializer):
    templates = serializers.SerializerMethodField()
    
    class Meta:
        model = CommitmentGroup
        fields = [
            "id",
            "name",
            "description",
            "templates",
        ]
        
    def get_templates(self, obj):
        templates = getattr(
            obj,
            "active_templates",
            [],
        )
        
        return CommitmentTemplateSerializer(
            templates,
            many = True,
        ).data