from django.db import migrations


def seed_commitment_templates(apps, schema_editor):
    CommitmentTemplate = apps.get_model(
        "commitments",
        "CommitmentTemplate",
    )
    CommitmentGroup = apps.get_model(
        "commitments",
        "CommitmentGroup",
    )
    Status = apps.get_model(
        "commitments",
        "Status",
    )

    active_status = Status.objects.filter(
        name = "Active",
    ).first()

    templates = [
        {
            "group": "Household Bills",
            "name": "Energy bill",
            "description": "Gas or electricity household account.",
            "priority": "medium",
            "recommended_fields": [
                "provider_name",
                "amount",
                "payment_frequency",
                "due_date",
            ],
        },
        {
            "group": "Household Bills",
            "name": "Council Tax",
            "description": "Regular Council Tax payments for your home.",
            "priority": "high",
            "recommended_fields": [
                "amount",
                "payment_frequency",
                "due_date",
            ],
        },
        {
            "group": "Home & Tenancy",
            "name": "Rent",
            "description": "Rent payments and important tenancy dates.",
            "priority": "high",
            "recommended_fields": [
                "provider_name",
                "amount",
                "payment_frequency",
                "due_date",
                "contract_end_date",
                "notice_period_days",
            ],
        },
        {
            "group": "Utilities & Communications",
            "name": "Broadband",
            "description": "Home broadband or internet contract.",
            "priority": "medium",
            "recommended_fields": [
                "provider_name",
                "amount",
                "payment_frequency",
                "contract_end_date",
                "notice_period_days",
            ],
        },
        {
            "group": "Utilities & Communications",
            "name": "Mobile phone",
            "description": "Mobile phone plan or handset contract.",
            "priority": "medium",
            "recommended_fields": [
                "provider_name",
                "amount",
                "payment_frequency",
                "contract_end_date",
                "notice_period_days",
            ],
        },
        {
            "group": "Vehicle & Transport",
            "name": "Car insurance",
            "description": "Motor insurance policy and renewal.",
            "priority": "high",
            "recommended_fields": [
                "provider_name",
                "amount",
                "renewal_date",
            ],
        },
        {
            "group": "Vehicle & Transport",
            "name": "MOT",
            "description": "Keep track of your next MOT deadline.",
            "priority": "high",
            "recommended_fields": [
                "renewal_date",
            ],
        },
        {
            "group": "Vehicle & Transport",
            "name": "Breakdown cover",
            "description": "Roadside assistance or breakdown membership.",
            "priority": "medium",
            "recommended_fields": [
                "provider_name",
                "amount",
                "payment_frequency",
                "renewal_date",
            ],
        },
        {
            "group": "Insurance",
            "name": "Home insurance",
            "description": "Home or contents insurance policy.",
            "priority": "medium",
            "recommended_fields": [
                "provider_name",
                "amount",
                "renewal_date",
            ],
        },
        {
            "group": "Insurance",
            "name": "Pet insurance",
            "description": "Insurance policy for a pet.",
            "priority": "medium",
            "recommended_fields": [
                "provider_name",
                "amount",
                "payment_frequency",
                "renewal_date",
            ],
        },
        {
            "group": "Subscriptions & Memberships",
            "name": "Gym membership",
            "description": "Recurring gym or fitness membership.",
            "priority": "medium",
            "recommended_fields": [
                "provider_name",
                "amount",
                "payment_frequency",
                "contract_end_date",
                "notice_period_days",
            ],
        },
        {
            "group": "Subscriptions & Memberships",
            "name": "Streaming subscription",
            "description": "TV, film or music streaming subscription.",
            "priority": "low",
            "recommended_fields": [
                "provider_name",
                "amount",
                "payment_frequency",
                "due_date",
            ],
        },
        {
            "group": "Documents & Personal Admin",
            "name": "Passport renewal",
            "description": "Keep track of an upcoming passport renewal.",
            "priority": "high",
            "recommended_fields": [
                "renewal_date",
            ],
        },
        {
            "group": "Documents & Personal Admin",
            "name": "Driving licence renewal",
            "description": "Keep track of your driving licence renewal.",
            "priority": "high",
            "recommended_fields": [
                "renewal_date",
            ],
        },
    ]

    for display_order, template_data in enumerate(
        templates,
        start = 1,
    ):
        group = CommitmentGroup.objects.filter(
            name = template_data["group"],
        ).first()

        if group is None:
            continue

        CommitmentTemplate.objects.update_or_create(
            group = group,
            name = template_data["name"],
            defaults={
                "description": template_data["description"],
                "default_title": template_data["name"],
                "default_provider_name": "",
                "default_amount": None,
                "default_payment_frequency": "",
                "default_priority": template_data["priority"],
                "default_status": active_status,
                "recommended_fields": template_data[
                    "recommended_fields"
                ],
                "is_active": True,
                "display_order": display_order,
            },
        )


def remove_commitment_templates(apps, schema_editor):
    CommitmentTemplate = apps.get_model(
        "commitments",
        "CommitmentTemplate",
    )

    template_names = [
        "Energy bill",
        "Council Tax",
        "Rent",
        "Broadband",
        "Mobile phone",
        "Car insurance",
        "MOT",
        "Breakdown cover",
        "Home insurance",
        "Pet insurance",
        "Gym membership",
        "Streaming subscription",
        "Passport renewal",
        "Driving licence renewal",
    ]

    CommitmentTemplate.objects.filter(
        name__in = template_names,
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        (
            "commitments",
            "0013_alter_commitmenttemplate_options_and_more",
        ),
    ]

    operations = [
        migrations.RunPython(
            seed_commitment_templates,
            remove_commitment_templates,
        ),
    ]