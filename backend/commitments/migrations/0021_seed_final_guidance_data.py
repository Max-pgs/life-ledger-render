from datetime import date

from django.db import migrations


# AI Usage Declaration:
# [SIGNIFICANT AI ASSISTANCE: ChatGPT, 2026-08-25]
# AI assistance was used to create this corrective data migration from the
# administrator-managed guidance, trusted links, and template data exported
# from the working Life Ledger database. The migration was reviewed and tested.


GROUP_DATA = [{'description': 'Household bills are the regular costs that keep your home running, from energy '
                 'and water to Council Tax and other essential services. Keeping these payments '
                 'together makes it easier to see what is due, how often you pay and which costs '
                 'may need attention when prices or circumstances change.\r\n'
                 '\r\n'
                 'For energy bills, it is useful to keep details such as your supplier, payment '
                 'amount, payment frequency and any tariff or contract information that applies. '
                 'If you do not have a smart meter, regular meter readings can help reduce the '
                 'risk of estimated bills and make it easier to understand whether your account is '
                 'in credit or debit. Smart meters can also provide more up-to-date information '
                 'about energy use and costs.\r\n'
                 '\r\n'
                 'Household costs can change over time, so review these commitments when a '
                 'supplier changes its prices, when you switch provider, when you move home, or '
                 'when the people living in your household change. For Council Tax, the amount and '
                 'responsibility for payment depend on your property and circumstances, so the '
                 'relevant local authority should be checked if anything changes.\r\n'
                 '\r\n'
                 'If you are struggling to pay an energy bill, do not simply ignore the payment. '
                 'Contacting the supplier early can help you understand what support or repayment '
                 'options may be available. Ofgem also provides information about help with energy '
                 'bills.',
  'is_active': True,
  'last_reviewed_at': '2026-08-10',
  'name': 'Household Bills'},
 {'description': 'Your home often comes with several important dates and responsibilities that are '
                 'easy to lose track of. Rent payments, tenancy dates, notice periods, Council Tax '
                 'and other housing commitments are worth keeping together so that upcoming '
                 'changes or deadlines do not come as a surprise.\r\n'
                 '\r\n'
                 'Record key dates from your tenancy agreement, particularly the tenancy start '
                 'date, any fixed end date, rent payment dates and any notice period that may '
                 'apply if you want to leave. Having these dates recorded in advance can help '
                 'prevent important deadlines from being missed and gives you time to review your '
                 'options before a tenancy ends or renews.\r\n'
                 '\r\n'
                 'It is useful to review this information whenever your rent changes, your tenancy '
                 'is renewed, you plan to move home, or your household circumstances change. You '
                 'should also keep the original tenancy agreement and any important correspondence '
                 'from your landlord or letting agent somewhere safe.\r\n'
                 '\r\n'
                 'Responsibilities such as paying rent, looking after the property and paying '
                 'agreed household charges can form part of a tenancy. Housing law and tenancy '
                 'types differ across the UK, so always check guidance that applies specifically '
                 'to the nation where you live. GOV.UK provides general private renting '
                 'information for England, while Scotland, Wales and Northern Ireland have their '
                 'own housing rules and official guidance.',
  'is_active': True,
  'last_reviewed_at': '2026-08-10',
  'name': 'Home & Tenancy'},
 {'description': 'Broadband, mobile and other communications contracts can quietly continue for '
                 'months or years after they were first arranged. Keeping the key details in one '
                 'place helps you know what you are paying for, when a minimum term ends and when '
                 'it may be worth reviewing or switching a service.\r\n'
                 '\r\n'
                 'Record the provider, regular payment amount, contract start date, minimum '
                 'contract period, expected end date and any cancellation or notice requirements '
                 'you know about. If your provider tells you that a price or contract term is '
                 'changing, update the commitment so your dashboard reflects the new position.\r\n'
                 '\r\n'
                 'Review broadband and mobile contracts as they approach the end of their minimum '
                 'term. This is a good time to check whether the service still meets your needs, '
                 'whether the price has changed, and whether another tariff or provider would be '
                 'better. Ofcom provides consumer guidance on comparing services and switching '
                 'mobile, broadband and landline providers.\r\n'
                 '\r\n'
                 'When moving home, remember that broadband availability and service arrangements '
                 'can differ at the new address. If you plan to switch provider, allow enough time '
                 'to arrange the new service and check whether there are any remaining contractual '
                 'obligations with the existing provider.',
  'is_active': True,
  'last_reviewed_at': '2026-08-10',
  'name': 'Utilities & Communications'},
 {'description': 'Owning or regularly using a vehicle involves more than simply paying for fuel. '
                 'Insurance, vehicle tax, MOT dates, breakdown cover and other transport-related '
                 'commitments may all have separate renewal dates, making them particularly useful '
                 'to track together.\r\n'
                 '\r\n'
                 'For a vehicle used on public roads, important legal responsibilities can include '
                 'having the vehicle properly registered, taxed, insured and, when required, '
                 'covered by a valid MOT. These dates are worth recording separately because '
                 'missing one can have more serious consequences than simply forgetting an '
                 'ordinary subscription.\r\n'
                 '\r\n'
                 'Add renewal or expiry dates for your insurance, MOT and any annual breakdown or '
                 'roadside assistance plan. Review these commitments before they expire so you '
                 'have enough time to renew, compare alternatives or make any required '
                 'arrangements.\r\n'
                 '\r\n'
                 'Motor insurance is a legal requirement for driving on UK roads, with third-party '
                 'cover being the legal minimum. Your own policy may provide additional protection '
                 'depending on the cover purchased, so check the policy documents rather than '
                 'relying only on the renewal date stored in Life Ledger.\r\n'
                 '\r\n'
                 'If you sell a vehicle, stop using it, move address or change how it is used, '
                 'review the related commitments and check whether you need to update the relevant '
                 'provider or official record.',
  'is_active': True,
  'last_reviewed_at': '2026-08-10',
  'name': 'Vehicle & Transport'},
 {'description': 'Insurance is most useful when the cover still matches your circumstances and you '
                 'know when it needs to be reviewed. Bringing policy payments, renewal dates and '
                 'other key details together can help you avoid forgotten renewals and gives you '
                 'time to check whether existing cover is still appropriate.\r\n'
                 '\r\n'
                 'For each policy, record the insurer, regular or annual premium, policy renewal '
                 'date and any important cancellation or review deadline. If possible, also keep '
                 'the policy number and original policy documents somewhere secure outside Life '
                 'Ledger so they are easy to find if you need to make a claim.\r\n'
                 '\r\n'
                 'Insurance needs can change when your circumstances change. Review policies after '
                 'major events such as moving home, buying valuable possessions, changing '
                 'employment, travelling, getting married or experiencing another significant '
                 'change that might affect the cover you need.\r\n'
                 '\r\n'
                 'Do not assume that an automatically renewed policy is still the most appropriate '
                 'one. Before renewal, check the premium, excess, exclusions, limits and whether '
                 'the policy still reflects your circumstances. Different types of insurance work '
                 'differently, so the policy wording and provider information should always be '
                 'checked carefully. MoneyHelper provides guidance covering home, travel, life, '
                 'health and other common forms of insurance.\r\n'
                 '\r\n'
                 'Cancelling an insurance payment is also not necessarily the same as cancelling '
                 "the policy itself. Always check the insurer's cancellation process and whether "
                 'any outstanding payment, fee or notice requirement applies.',
  'is_active': True,
  'last_reviewed_at': '2026-08-10',
  'name': 'Insurance'},
 {'description': 'Streaming services, gyms, software, clubs and memberships are easy to sign up '
                 'for and equally easy to forget about. Because many continue charging '
                 'automatically, keeping an overview of what you pay for and when contracts or '
                 'introductory offers end can help prevent unnecessary ongoing costs.\r\n'
                 '\r\n'
                 'Record the payment amount, billing frequency, renewal date and, where relevant, '
                 'the end of any minimum contract period. If the service requires advance notice '
                 'to cancel, record the notice period so Life Ledger can help you identify the '
                 'point at which a decision needs to be made.\r\n'
                 '\r\n'
                 'Subscriptions are particularly easy to forget because payments may continue '
                 'automatically. Review this group periodically and ask whether you still use each '
                 'service, whether the price has increased and whether a cheaper or more suitable '
                 'option is available.\r\n'
                 '\r\n'
                 'Be careful when cancelling recurring payments. Cancelling a Direct Debit through '
                 'your bank stops that payment method, but it does not necessarily cancel the '
                 'underlying contract or remove any amount you still owe. Contact the provider and '
                 'follow its cancellation process where required.\r\n'
                 '\r\n'
                 'For free trials or introductory offers, record the date when the trial or '
                 'discounted period ends. This gives you time to decide whether to continue before '
                 'the service changes to its normal recurring price.',
  'is_active': True,
  'last_reviewed_at': '2026-08-10',
  'name': 'Subscriptions & Memberships'},
 {'description': 'Passports, driving licences, certificates and other official records may not '
                 'require attention very often, which is exactly why their deadlines are easy to '
                 'miss. Keeping renewal and expiry dates visible gives you time to deal with '
                 'important paperwork before it becomes urgent.\r\n'
                 '\r\n'
                 'For each document, record the expiry or renewal date if one exists and give '
                 'yourself enough time to deal with the renewal before the document becomes '
                 'invalid. Some applications may take time to process, and an expired document can '
                 'cause problems with travel, driving, employment or other services depending on '
                 'what the document is used for.\r\n'
                 '\r\n'
                 'It is also useful to record administrative commitments that do not involve a '
                 'regular payment but still have an important deadline. Examples could include '
                 'licence renewals, official registrations or other time-sensitive personal '
                 'paperwork.\r\n'
                 '\r\n'
                 'Keep original documents and sensitive personal information securely. Life Ledger '
                 'is intended to help you remember commitments and dates, not to replace the '
                 'original document or official record. When completing a renewal or application, '
                 'always use the relevant official service and verify the current requirements '
                 'directly.\r\n'
                 '\r\n'
                 'If your name, address or other important personal details change, consider which '
                 'records and organisations may need to be updated. GOV.UK provides access to a '
                 'wide range of official UK services and information and is a useful starting '
                 'point for checking current procedures.',
  'is_active': True,
  'last_reviewed_at': '2026-08-10',
  'name': 'Documents & Personal Admin'},
 {'description': 'Some commitments simply do not fit neatly into a standard category. This section '
                 'provides a place for those less common responsibilities while still allowing '
                 'important payments, dates, renewals and deadlines to be tracked alongside the '
                 'rest of your life admin.\r\n'
                 '\r\n'
                 'Because this is a flexible category, add enough information to make the '
                 'commitment understandable when you return to it later. Record the provider or '
                 'organisation where relevant, the amount and payment frequency if money is '
                 'involved, and any important due date, renewal date, contract end date or notice '
                 'period.\r\n'
                 '\r\n'
                 'Try to avoid using Other simply because you are unsure which category to choose. '
                 'If a commitment clearly relates to housing, utilities, insurance, transport, '
                 'subscriptions or personal documents, using the more specific group will make '
                 'your dashboard easier to understand and review.\r\n'
                 '\r\n'
                 'For unusual commitments, think about what would happen if you forgot about them. '
                 'If missing a date could result in an extra charge, loss of a service, automatic '
                 'renewal or another significant consequence, make sure the relevant deadline is '
                 'recorded.\r\n'
                 '\r\n'
                 'Review this group occasionally because miscellaneous commitments can easily '
                 'become outdated. Archive commitments that are no longer relevant and update any '
                 'dates or amounts that have changed.',
  'is_active': True,
  'last_reviewed_at': '2026-08-10',
  'name': 'Other'}]

LINK_DATA = [{'group_name': 'Documents & Personal Admin',
  'is_active': True,
  'title': 'UK government services and information',
  'url': 'https://www.gov.uk/browse'},
 {'group_name': 'Home & Tenancy',
  'is_active': True,
  'title': 'Private renting: rights and responsibilities',
  'url': 'https://www.gov.uk/private-renting/your-rights-and-responsibilities'},
 {'group_name': 'Household Bills',
  'is_active': True,
  'title': 'Energy advice for households',
  'url': 'https://www.ofgem.gov.uk/information-consumers/energy-advice-households'},
 {'group_name': 'Utilities & Communications',
  'is_active': True,
  'title': 'Phone and broadband consumer advice',
  'url': 'https://www.ofcom.org.uk/advice-for-consumers'},
 {'group_name': 'Vehicle & Transport',
  'is_active': True,
  'title': 'Vehicle tax, MOT and insurance',
  'url': 'https://www.gov.uk/browse/driving/vehicle-tax-mot-insurance'},
 {'group_name': 'Insurance',
  'is_active': True,
  'title': 'Insurance guidance',
  'url': 'https://www.moneyhelper.org.uk/en/everyday-money/insurance'},
 {'group_name': 'Subscriptions & Memberships',
  'is_active': True,
  'title': 'Cancelling a service or subscription',
  'url': 'https://www.citizensadvice.org.uk/consumer/changed-your-mind/cancelling-a-service-youve-arranged/'}]

HOUSEHOLD_TEMPLATES = [{'default_amount': None,
  'default_payment_frequency': '',
  'default_priority': 'medium',
  'default_provider_name': '',
  'default_title': 'Energy bill',
  'description': 'Gas or electricity household account.',
  'display_order': 1,
  'is_active': True,
  'name': 'Energy bill',
  'recommended_fields': ['provider_name', 'amount', 'payment_frequency', 'due_date']},
 {'default_amount': None,
  'default_payment_frequency': '',
  'default_priority': 'high',
  'default_provider_name': '',
  'default_title': 'Council Tax',
  'description': 'Regular Council Tax payments for your home.',
  'display_order': 2,
  'is_active': True,
  'name': 'Council Tax',
  'recommended_fields': ['amount', 'payment_frequency', 'due_date']}]


def seed_final_reference_data(apps, schema_editor):
    CommitmentGroup = apps.get_model("commitments", "CommitmentGroup")
    CommitmentTemplate = apps.get_model("commitments", "CommitmentTemplate")
    Status = apps.get_model("commitments", "Status")
    GroupInformationLink = apps.get_model("guides", "GroupInformationLink")

    group_objects = {}

    for item in GROUP_DATA:
        reviewed = date.fromisoformat(item["last_reviewed_at"])

        group, _ = CommitmentGroup.objects.update_or_create(
            name=item["name"],
            defaults={
                "description": item["description"],
                "is_active": item["is_active"],
                "last_reviewed_at": reviewed,
            },
        )
        group_objects[item["name"]] = group

    for item in LINK_DATA:
        GroupInformationLink.objects.update_or_create(
            group=group_objects[item["group_name"]],
            title=item["title"],
            defaults={
                "url": item["url"],
                "is_active": item["is_active"],
            },
        )

    active_status = Status.objects.filter(name__iexact="Active").first()
    household_group = group_objects["Household Bills"]

    for item in HOUSEHOLD_TEMPLATES:
        name = item["name"]
        defaults = dict(item)
        defaults.pop("name")
        defaults["default_status"] = active_status

        CommitmentTemplate.objects.update_or_create(
            group=household_group,
            name=name,
            defaults=defaults,
        )


class Migration(migrations.Migration):

    dependencies = [
        ("guides", "0001_initial"),
        ("commitments", "0020_remove_commitment_last_paid_at"),
    ]

    operations = [
        migrations.RunPython(
            seed_final_reference_data,
            migrations.RunPython.noop,
        ),
    ]
