from django.conf import settings
from django.db import models

class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        
class PaymentFrequency(models.TextChoices):
    WEEKLY = "weekly", "Weekly"
    MONTHLY = "monthly", "Monthly"
    QUARTERLY = "quarterly", "Quarterly"
    ANNUALLY = "annually", "Annually"
    ONE_OFF = "one_off", "One-off"

class CommitmentGroup(models.Model):
    # Group guidance is maintained by administrators and is read-only for users.
    
    name = models.CharField(
        max_length = 100,
        unique = True,
    )
    
    description = models.TextField(
        blank = True,
    )
    
    is_active = models.BooleanField(
        default = True,
    )
    
    last_reviewed_at = models.DateField(
        null = True,
        blank = True,
    )

    updated_at = models.DateTimeField(
        auto_now = True,
    )
        
    class Meta:
        ordering = ["name"]
        
    def __str__(self):
        return self.name
    
class Status(models.Model):
    name = models.CharField(
        max_length = 100,
        unique = True,
    )
    
    description = models.TextField(
        blank = True,
    )
    
    class Meta:
        ordering = ["name"]
        verbose_name_plural = "statuses"
        
    def __str__(self):
        return self.name

class Commitment(models.Model):
    PaymentFrequency = PaymentFrequency
    Priority = Priority
        
    class PaymentStatus(models.TextChoices):
        NOT_APPLICABLE = "not_applicable", "Not_applicable"
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        OVERDUE = "overdue", "Overdue"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE,
        related_name = "commitments",
    )
    
    group = models.ForeignKey(
        CommitmentGroup,
        on_delete = models.SET_NULL,
        null = True,
        blank = True,
        related_name = "commitments",
    )
    
    status = models.ForeignKey(
        Status,
        on_delete = models.SET_NULL,
        null = True,
        blank = True,
        related_name = "commitments",
    )
    
    title = models.CharField(
        max_length = 200,
    )
    
    provider_name = models.CharField(
        max_length = 200,
        blank = True,
    )
    
    amount = models.DecimalField(
        max_digits = 10,
        decimal_places = 2,
        null = True,
        blank = True,
    )
    
    payment_frequency = models.CharField(
        max_length = 20,
        choices = PaymentFrequency.choices,
        blank = True,
    )
    
    payment_status = models.CharField(
        max_length = 20,
        choices = PaymentStatus.choices,
        default = PaymentStatus.NOT_APPLICABLE,
    )
    
    contract_end_date = models.DateField(
        null = True,
        blank = True,
    )
    
    notice_period_days = models.PositiveIntegerField(
        null = True,
        blank = True,
    )
    
    due_date = models.DateField(
        null = True,
        blank = True,
    )
    
    renewal_date = models.DateField(
        null = True,
        blank = True,
    )
    
    priority = models.CharField(
        max_length = 10,
        choices = Priority.choices,
        default = Priority.MEDIUM,
    )
    
    notes = models.TextField(
        blank = True
    )
    
    is_archived = models.BooleanField(
        default = False,
    )
    
    archived_at = models.DateTimeField(
        null = True, 
        blank = True,
    )
    
    created_at = models.DateTimeField(
        auto_now_add = True,
    )
    
    updated_at = models.DateTimeField(
        auto_now = True,
    )
    
    class Meta:
        ordering = ["-created_at"]
        
    def __str__(self):
        return self.title

class CommitmentTemplate(models.Model):
    group = models.ForeignKey(
        CommitmentGroup,
        on_delete = models.PROTECT,
        related_name = "templates",
    )

    name = models.CharField(
        max_length = 120,
    )

    description = models.TextField(
        blank = True,
    )

    default_title = models.CharField(
        max_length = 200,
    )

    default_provider_name = models.CharField(
        max_length = 200,
        blank = True,
    )

    default_amount = models.DecimalField(
        max_digits = 10,
        decimal_places = 2,
        null = True,
        blank = True,
    )

    default_payment_frequency = models.CharField(
        max_length = 20,
        choices = PaymentFrequency.choices,
        blank = True,
    )

    default_priority = models.CharField(
        max_length = 10,
        choices = Priority.choices,
        default = Priority.MEDIUM,
    )

    default_status = models.ForeignKey(
        Status,
        on_delete = models.SET_NULL,
        null = True,
        blank = True,
        related_name = "templates",
    )

    recommended_fields = models.JSONField(
        default = list,
        blank = True,
    )

    is_active = models.BooleanField(
        default = True,
    )

    display_order = models.PositiveIntegerField(
        default = 0,
    )

    created_at = models.DateTimeField(
        auto_now_add = True,
    )

    updated_at = models.DateTimeField(
        auto_now = True,
    )

    class Meta:
        ordering = ["group__name", "display_order", "name"]
        constraints = [
            models.UniqueConstraint(
                fields = ["group", "name"],
                name = "unique_template_name_per_group",
            ),
        ]

    def __str__(self):
        return f"{self.group.name}: {self.name}"
