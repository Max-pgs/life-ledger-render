from rest_framework import serializers
from datetime import timedelta
from django.utils import timezone

from .models import CommitmentGroup, CommitmentTemplate, Commitment, Status

from guides.serializers import GroupInformationLinkSerializer

class CommitmentGroupSerializer(serializers.ModelSerializer):
    # Group guidance is read-only for ordinary users and maintained by administrators.
    
    information_links = GroupInformationLinkSerializer(
        many=True,
        read_only=True,
    )
    
    class Meta:
        model = CommitmentGroup
        fields = (
            "id",
            "name",
            "description",
            "last_reviewed_at",
            "updated_at",
            "is_active",
            "information_links",
        )
        read_only_fields = fields
        
class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = (
            "id",
            "name",
            "description",
        )
        read_only_fields = fields

class CommitmentSerializer(serializers.ModelSerializer):
    cancellation_deadline = serializers.SerializerMethodField()
    effective_payment_status = serializers.SerializerMethodField()
    
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
            "effective_payment_status",
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
        cleaned_title = value.strip()
        
        if not cleaned_title:
            raise serializers.ValidationError("Commitment title cannot be empty")
        
        return cleaned_title
    
    def validate_provider_name(self, value):
        return value.strip()
    
    def validate_amount(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Amount cannot be negative."
            )

        return value
    
    def validate_notice_period_days(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Notice period cannot be negative."
            )

        return value
    
    def get_cancellation_deadline(self, obj):
        if (
            obj.contract_end_date is None
            or obj.notice_period_days is None
        ):
            return None
        
        deadline = (
            obj.contract_end_date - timedelta(days = obj.notice_period_days)
        )
        
        return deadline.isoformat()
    
    def get_effective_payment_status(self, obj):
        # Treat an unpaid commitment with a past due date as overdue without changing stored data.

        if (
            obj.payment_status == Commitment.PaymentStatus.PENDING
            and obj.due_date is not None
            and obj.due_date < timezone.localdate()
        ):
            return Commitment.PaymentStatus.OVERDUE

        return obj.payment_status
        
class CommitmentTemplateSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(
        source = "group.name",
        read_only = True,
    )

    default_status_name = serializers.CharField(
        source = "default_status.name",
        read_only = True,
    )

    class Meta:
        model = CommitmentTemplate
        fields = (
            "id",
            "name",
            "description",
            "group",
            "group_name",
            "default_title",
            "default_provider_name",
            "default_amount",
            "default_payment_frequency",
            "default_priority",
            "default_status",
            "default_status_name",
            "recommended_fields",
            "display_order",
        )
        
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
    
    # active_templates is populated by the guided-setup queryset using Prefetch.
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