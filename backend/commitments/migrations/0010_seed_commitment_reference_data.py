from django.db import migrations


GROUPS = [
    {
        "name": "Home & Tenancy",
        "description": (
            "Home and tenancy-related commitments such as rent, "
            "Council Tax, TV Licence and tenancy deadlines."
        ),
    },
    {
        "name": "Utilities & Communications",
        "description": (
            "Regular household services such as electricity, gas, "
            "water, broadband and mobile contracts."
        ),
    },
    {
        "name": "Vehicle & Transport",
        "description": (
            "Vehicle-related commitments such as MOT, road tax, "
            "servicing and other transport-related deadlines."
        ),
    },
    {
        "name": "Insurance",
        "description": (
            "Insurance policies and renewal commitments, including "
            "car, home and other personal insurance."
        ),
    },
    {
        "name": "Subscriptions & Memberships",
        "description": (
            "Recurring services such as streaming subscriptions, "
            "gym memberships, software and other memberships."
        ),
    },
    {
        "name": "Documents & Personal Admin",
        "description": (
            "Important documents, renewal dates and personal "
            "administrative deadlines."
        ),
    },
    {
        "name": "Other",
        "description": (
            "Commitments that do not fit another available group."
        ),
    },
]


STATUSES = [
    {
        "name": "Active",
        "description": "The commitment is currently active.",
    },
    {
        "name": "Completed",
        "description": "The commitment has been completed.",
    },
    {
        "name": "Cancelled",
        "description": "The commitment has been cancelled.",
    },
    {
        "name": "Renewed",
        "description": "The commitment has been renewed.",
    },
]


def seed_reference_data(apps, schema_editor):
    CommitmentGroup = apps.get_model(
        "commitments",
        "CommitmentGroup",
    )
    Status = apps.get_model(
        "commitments",
        "Status",
    )

    for group_data in GROUPS:
        CommitmentGroup.objects.update_or_create(
            name=group_data["name"],
            defaults={
                "description": group_data["description"],
                "is_active": True,
            },
        )

    for status_data in STATUSES:
        Status.objects.update_or_create(
            name=status_data["name"],
            defaults={
                "description": status_data["description"],
            },
        )


def remove_reference_data(apps, schema_editor):
    CommitmentGroup = apps.get_model(
        "commitments",
        "CommitmentGroup",
    )
    Status = apps.get_model(
        "commitments",
        "Status",
    )

    CommitmentGroup.objects.filter(
        name__in=[group["name"] for group in GROUPS]
    ).delete()

    Status.objects.filter(
        name__in=[status["name"] for status in STATUSES]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("commitments", "0009_commitmenttemplate"),
    ]

    operations = [
        migrations.RunPython(
            seed_reference_data,
            remove_reference_data,
        ),
    ]