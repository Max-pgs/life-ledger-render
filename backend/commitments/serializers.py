from rest_framework import serializers
from datetime import timedelta
from django.utils import timezone

from .models import CommitmentGroup, CommitmentTemplate, Commitment, CommitmentPayment, Status

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
        
class CommitmentPaymentSerializer(serializers.ModelSerializer):
    effective_status = serializers.CharField(
        read_only = True,
    )

    commitment_id = serializers.IntegerField(
        source = "commitment.id",
        read_only = True,
    )

    commitment_title = serializers.CharField(
        source = "commitment.title",
        read_only = True,
    )

    group_name = serializers.SerializerMethodField()
    
    def get_group_name(self, obj):
        if obj.commitment.group:
            return obj.commitment.group.name

        return None

    class Meta:
        model = CommitmentPayment
        fields = (
            "id",
            "commitment_id",
            "commitment_title",
            "group_name",
            "due_date",
            "amount",
            "status",
            "effective_status",
            "paid_at",
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
    
    template_id = serializers.PrimaryKeyRelatedField(
        source = "template",
        queryset = CommitmentTemplate.objects.filter(is_active=True),
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
            "template_id",
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
    
    def create(self, validated_data):
        commitment = Commitment.objects.create(**validated_data)

        if (
            commitment.due_date
            and commitment.payment_frequency
            and commitment.payment_status
            != Commitment.PaymentStatus.NOT_APPLICABLE
        ):
            CommitmentPayment.objects.create(
                commitment = commitment,
                due_date = commitment.due_date,
                amount = commitment.amount,
                status = commitment.payment_status,
                paid_at = (
                    timezone.now()
                    if commitment.payment_status
                    == Commitment.PaymentStatus.PAID
                    else None
                ),
            )
            
            if (
                commitment.payment_status == Commitment.PaymentStatus.PAID
                and commitment.payment_frequency
                in {
                    Commitment.PaymentFrequency.WEEKLY,
                    Commitment.PaymentFrequency.MONTHLY,
                    Commitment.PaymentFrequency.QUARTERLY,
                    Commitment.PaymentFrequency.ANNUALLY,
                }
            ):
                commitment.due_date = commitment.get_next_due_date()
                commitment.payment_status = Commitment.PaymentStatus.PENDING

                commitment.save(
                    update_fields = [
                        "due_date",
                        "payment_status",
                    ]
                )

                CommitmentPayment.objects.create(
                    commitment = commitment,
                    due_date = commitment.due_date,
                    amount = commitment.amount,
                    status = CommitmentPayment.PaymentStatus.PENDING,
                )

        return commitment
    
    def update(self, instance, validated_data):
        previous_due_date = instance.due_date
        payment_status = validated_data.get("payment_status")

        for field, value in validated_data.items():
            setattr(instance, field, value)
            
        current_pending_payment = (
            instance.payments
            .filter(
                due_date=previous_due_date,
                status=CommitmentPayment.PaymentStatus.PENDING,
            )
            .order_by("-created_at")
            .first()
        )

        if current_pending_payment:
            current_pending_payment.due_date = instance.due_date
            current_pending_payment.amount = instance.amount

            current_pending_payment.save(
                update_fields=[
                    "due_date",
                    "amount",
                    "updated_at",
                ]
            )

        if payment_status == Commitment.PaymentStatus.PAID:
            paid_at = timezone.now()

            if current_pending_payment:
                current_pending_payment.status = CommitmentPayment.PaymentStatus.PAID
                current_pending_payment.paid_at = paid_at

                current_pending_payment.save(
                    update_fields=[
                        "status",
                        "paid_at",
                        "updated_at",
                    ]
                )
            elif (
                instance.due_date
                and instance.payment_frequency
                and instance.payment_status
                != Commitment.PaymentStatus.NOT_APPLICABLE
            ):
                CommitmentPayment.objects.create(
                    commitment=instance,
                    due_date=instance.due_date,
                    amount=instance.amount,
                    status=CommitmentPayment.PaymentStatus.PAID,
                    paid_at=paid_at,
                )

            if (
                instance.due_date
                and instance.payment_frequency
                in {
                    Commitment.PaymentFrequency.WEEKLY,
                    Commitment.PaymentFrequency.MONTHLY,
                    Commitment.PaymentFrequency.QUARTERLY,
                    Commitment.PaymentFrequency.ANNUALLY,
                }
            ):
                instance.due_date = instance.get_next_due_date()
                instance.payment_status = Commitment.PaymentStatus.PENDING

                CommitmentPayment.objects.get_or_create(
                    commitment = instance,
                    due_date = instance.due_date,
                    defaults = {
                        "amount": instance.amount,
                        "status": CommitmentPayment.PaymentStatus.PENDING,
                    },
                )

        instance.save()

        return instance
                
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
        
class ForgottenChecklistTemplateSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(
        source = "group.name",
        read_only = True,
    )

    checklist_status = serializers.SerializerMethodField()

    class Meta:
        model = CommitmentTemplate
        fields = (
            "id",
            "name",
            "description",
            "group",
            "group_name",
            "checklist_status",
        )

    def get_checklist_status(self, obj):
        user = self.context["request"].user

        if obj.commitments.filter(user = user).exists():
            return "tracked"

        if obj.excluded_by_users.filter(user = user).exists():
            return "not_relevant"

        return "missing"