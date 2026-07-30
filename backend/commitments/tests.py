from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase
from datetime import timedelta


from .models import CommitmentGroup, Commitment, Status

User = get_user_model()

class CommitmentCreateAPITests(APITestCase):
    # Test creation of personal commitment records.
    
    def setUp(self):
        self.url = reverse("commitments:commitment-list-create")

        self.user = User.objects.create_user(
            username = "testuser",
            email = "test@example.com",
            password = "SecureTestPassword123!",
        )

        self.token = Token.objects.create(
            user = self.user,
        )

        self.valid_payload = {
            "title": "Council Tax",
            "notes": "Monthly household commitment.",
        }
        
        self.active_group = CommitmentGroup.objects.create(
            name="Bills",
            description="General guidance for bills.",
            information_url="https://example.com/bills",
            is_active=True,
        )
        
    def authenticate(self):
        # Authenticate API requests using the user's DRF token.
        
        self.client.credentials(
            HTTP_AUTHORIZATION = f"Token {self.token.key}"
        )
        
    def test_authenticated_user_can_create_commitment(self):
        self.authenticate()

        response = self.client.post(
            self.url,
            self.valid_payload,
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            Commitment.objects.count(),
            1,
        )

        commitment = Commitment.objects.get()

        self.assertEqual(
            commitment.title,
            "Council Tax",
        )

        self.assertEqual(
            commitment.notes,
            "Monthly household commitment.",
        )
        
    def test_created_commitment_is_linked_to_authenticated_user(self):
        self.authenticate()

        self.client.post(
            self.url,
            self.valid_payload,
            format = "json",
        )

        commitment = Commitment.objects.get()

        self.assertEqual(
            commitment.user,
            self.user,
        )
        
    def test_unauthenticated_user_cannot_create_commitment(self):
        response = self.client.post(
            self.url,
            self.valid_payload,
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

        self.assertEqual(
            Commitment.objects.count(),
            0,
        )
        
    def test_commitment_rejects_blank_title(self):
        self.authenticate()

        response = self.client.post(
            self.url,
            {
                "title": "   ",
                "notes": "Invalid commitment.",
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(
            Commitment.objects.count(),
            0,
        )

        self.assertIn(
            "title",
            response.data,
        )
        
    def test_group_guidance_cannot_be_modified_through_api(self):
        self.authenticate()

        detail_url = reverse(
            "commitments:commitment-group-list"
        )

        response = self.client.patch(
            detail_url,
            {
                "description": "User-modified guidance.",
                "information_url": "https://example.org/",
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        )

        self.active_group.refresh_from_db()

        self.assertEqual(
            self.active_group.description,
            "General guidance for bills.",
        )
        self.assertEqual(
            self.active_group.information_url,
            "https://example.com/bills",
        )
        
class CommitmentListAPITests(APITestCase):
    # Test retrieval of user-specific commitment records.

    def setUp(self):
        self.url = reverse(
            "commitments:commitment-list-create"
        )

        self.user = User.objects.create_user(
            username = "testuser",
            email = "test@example.com",
            password = "SecureTestPassword123!",
        )

        self.other_user = User.objects.create_user(
            username = "otheruser",
            email = "other@example.com",
            password = "SecureTestPassword123!",
        )

        self.token = Token.objects.create(
            user = self.user,
        )

        self.user_commitment_one = Commitment.objects.create(
            user = self.user,
            title = "Council Tax",
            notes = "Monthly household commitment.",
        )

        self.user_commitment_two = Commitment.objects.create(
            user = self.user,
            title = "Broadband",
            notes = "Internet contract.",
        )

        self.other_user_commitment = Commitment.objects.create(
            user = self.other_user,
            title = "Private commitment",
            notes = "This must not be visible.",
        )

    def authenticate(self):
        # Authenticate requests using the current user's token.
        
        self.client.credentials(
            HTTP_AUTHORIZATION = f"Token {self.token.key}"
        )

    def test_authenticated_user_can_view_own_commitments(self):
        self.authenticate()

        response = self.client.get(
            self.url,
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            2,
        )

        returned_titles = {
            commitment["title"]
            for commitment in response.data
        }

        self.assertIn(
            "Council Tax",
            returned_titles,
        )

        self.assertIn(
            "Broadband",
            returned_titles,
        )

    def test_user_cannot_view_another_users_commitments(self):
        self.authenticate()

        response = self.client.get(
            self.url,
            format = "json",
        )

        returned_titles = {
            commitment["title"]
            for commitment in response.data
        }

        self.assertNotIn(
            "Private commitment",
            returned_titles,
        )

    def test_unauthenticated_user_cannot_view_commitments(self):
        response = self.client.get(
            self.url,
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_commitments_are_returned_in_newest_first_order(self):
        self.authenticate()

        response = self.client.get(
            self.url,
            format = "json",
        )

        self.assertEqual(
            response.data[0]["id"],
            self.user_commitment_two.id,
        )

        self.assertEqual(
            response.data[1]["id"],
            self.user_commitment_one.id,
        )
        
class CommitmentUpdateAPITests(APITestCase):
    # Test retrieval and updating of individual commitments.

    def setUp(self):
        self.user = User.objects.create_user(
            username = "testuser",
            email = "test@example.com",
            password = "SecureTestPassword123!",
        )

        self.other_user = User.objects.create_user(
            username = "otheruser",
            email = "other@example.com",
            password = "SecureTestPassword123!",
        )

        self.token = Token.objects.create(
            user = self.user,
        )

        self.commitment = Commitment.objects.create(
            user = self.user,
            title = "Old Council Tax",
            notes = "Old notes.",
        )

        self.other_user_commitment = Commitment.objects.create(
            user = self.other_user,
            title = "Private commitment",
            notes = "Must remain inaccessible.",
        )

        self.url = reverse(
            "commitments:commitment-detail",
            kwargs = {"pk": self.commitment.pk},
        )

    def authenticate(self):
        # Authenticate API requests with the current user's token.
        
        self.client.credentials(
            HTTP_AUTHORIZATION = f"Token {self.token.key}"
        )

    def test_authenticated_user_can_view_own_commitment(self):
        self.authenticate()

        response = self.client.get(
            self.url,
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(
            response.data["title"],
            "Old Council Tax",
        )

    def test_authenticated_user_can_partially_update_commitment(self):
        self.authenticate()

        response = self.client.patch(
            self.url,
            {
                "title": "Updated Council Tax",
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.commitment.refresh_from_db()

        self.assertEqual(
            self.commitment.title,
            "Updated Council Tax",
        )
        self.assertEqual(
            self.commitment.notes,
            "Old notes.",
        )

    def test_authenticated_user_can_fully_update_commitment(self):
        self.authenticate()

        response = self.client.put(
            self.url,
            {
                "title": "Updated Council Tax",
                "notes": "Updated notes.",
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.commitment.refresh_from_db()

        self.assertEqual(
            self.commitment.title,
            "Updated Council Tax",
        )
        self.assertEqual(
            self.commitment.notes,
            "Updated notes.",
        )

    def test_user_cannot_update_another_users_commitment(self):
        self.authenticate()

        other_url = reverse(
            "commitments:commitment-detail",
            kwargs = {"pk": self.other_user_commitment.pk},
        )

        response = self.client.patch(
            other_url,
            {
                "title": "Unauthorised update",
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.other_user_commitment.refresh_from_db()

        self.assertEqual(
            self.other_user_commitment.title,
            "Private commitment",
        )

    def test_unauthenticated_user_cannot_update_commitment(self):
        response = self.client.patch(
            self.url,
            {
                "title": "Unauthorised update",
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_update_rejects_blank_title(self):
        self.authenticate()

        response = self.client.patch(
            self.url,
            {
                "title": "   ",
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.commitment.refresh_from_db()

        self.assertEqual(
            self.commitment.title,
            "Old Council Tax",
        )
        
class CommitmentArchiveAPITests(APITestCase):
    # Test safe archival of commitment records.

    def setUp(self):
        self.user = User.objects.create_user(
            username = "testuser",
            email = "test@example.com",
            password = "SecureTestPassword123!",
        )

        self.other_user = User.objects.create_user(
            username = "otheruser",
            email = "other@example.com",
            password = "SecureTestPassword123!",
        )

        self.token = Token.objects.create(
            user = self.user,
        )

        self.commitment = Commitment.objects.create(
            user = self.user,
            title = "Old Subscription",
            notes = "No longer required.",
        )

        self.other_user_commitment = Commitment.objects.create(
            user = self.other_user,
            title = "Private commitment",
            notes = "Must remain unchanged.",
        )

        self.url = reverse(
            "commitments:commitment-archive",
            kwargs = {"pk": self.commitment.pk},
        )

        self.list_url = reverse(
            "commitments:commitment-list-create"
        )

    def authenticate(self):
        # Authenticate requests using the current user's token.
    
        self.client.credentials(
            HTTP_AUTHORIZATION = f"Token {self.token.key}"
        )

    def test_authenticated_user_can_archive_own_commitment(self):
        self.authenticate()

        response = self.client.post(
            self.url,
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["message"],
            "Commitment archived successfully.",
        )

        self.commitment.refresh_from_db()

        self.assertTrue(
            self.commitment.is_archived,
        )

        self.assertIsNotNone(
            self.commitment.archived_at,
        )

    def test_archived_commitment_is_removed_from_active_list(self):
        self.authenticate()

        self.client.post(
            self.url,
            format = "json",
        )

        response = self.client.get(
            self.list_url,
            format = "json",
        )

        returned_ids = {
            commitment["id"]
            for commitment in response.data
        }

        self.assertNotIn(
            self.commitment.id,
            returned_ids,
        )

    def test_archived_commitment_is_not_available_from_active_detail(self):
        self.authenticate()

        self.client.post(
            self.url,
            format = "json",
        )

        detail_url = reverse(
            "commitments:commitment-detail",
            kwargs = {"pk": self.commitment.pk},
        )

        response = self.client.get(
            detail_url,
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_user_cannot_archive_another_users_commitment(self):
        self.authenticate()

        other_url = reverse(
            "commitments:commitment-archive",
            kwargs = {"pk": self.other_user_commitment.pk},
        )

        response = self.client.post(
            other_url,
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.other_user_commitment.refresh_from_db()

        self.assertFalse(
            self.other_user_commitment.is_archived,
        )

    def test_unauthenticated_user_cannot_archive_commitment(self):
        response = self.client.post(
            self.url,
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

        self.commitment.refresh_from_db()

        self.assertFalse(
            self.commitment.is_archived,
        )

    def test_commitment_cannot_be_archived_twice(self):
        self.authenticate()

        first_response = self.client.post(
            self.url,
            format = "json",
        )

        second_response = self.client.post(
            self.url,
            format = "json",
        )

        self.assertEqual(
            first_response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            second_response.status_code,
            status.HTTP_404_NOT_FOUND,
        )
        
class CommitmentStructuredDetailsAPITests(APITestCase):
    # Test structured commitment fields.

    def setUp(self):
        self.user = User.objects.create_user(
            username = "testuser",
            email = "test@example.com",
            password = "SecureTestPassword123!",
        )

        self.token = Token.objects.create(
            user = self.user,
        )

        self.group = CommitmentGroup.objects.create(
            name = "Household",
            description = (
                "Household commitments may include council tax, "
                "energy, water and broadband."
            ),
            information_url = "https://www.moneysavingexpert.com/",
        )

        self.status = Status.objects.create(
            name = "Active",
            description = "The commitment is currently active.",
        )

        self.list_url = reverse(
            "commitments:commitment-list-create"
        )

        self.valid_payload = {
            "title": "Council Tax",
            "group_id": self.group.id,
            "provider_name": "Edinburgh Council",
            "due_date": "2026-08-15",
            "renewal_date": "2027-04-01",
            "priority": "high",
            "status_id": self.status.id,
            "notes": "Monthly council tax commitment.",
        }

    def authenticate(self):
        # Authenticate requests using the current user's token.
        
        self.client.credentials(
            HTTP_AUTHORIZATION = f"Token {self.token.key}"
        )

    def test_user_can_create_commitment_with_structured_details(self):
        self.authenticate()

        response = self.client.post(
            self.list_url,
            self.valid_payload,
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        commitment = Commitment.objects.get()

        self.assertEqual(
            commitment.group,
            self.group,
        )
        self.assertEqual(
            commitment.provider_name,
            "Edinburgh Council",
        )
        self.assertEqual(
            str(commitment.due_date),
            "2026-08-15",
        )
        self.assertEqual(
            str(commitment.renewal_date),
            "2027-04-01",
        )
        self.assertEqual(
            commitment.priority,
            Commitment.Priority.HIGH,
        )
        self.assertEqual(
            commitment.status,
            self.status,
        )

    def test_structured_details_are_returned_in_api_response(self):
        self.authenticate()

        response = self.client.post(
            self.list_url,
            self.valid_payload,
            format = "json",
        )

        self.assertEqual(
            response.data["group"]["name"],
            "Household",
        )

        self.assertEqual(
            response.data["group"]["description"],
            (
                "Household commitments may include council tax, "
                "energy, water and broadband."
            ),
        )

        self.assertEqual(
            response.data["group"]["information_url"],
            "https://www.moneysavingexpert.com/",
        )
        
        self.assertEqual(
            response.data["status"]["name"],
            "Active",
        )
        self.assertEqual(
            response.data["provider_name"],
            "Edinburgh Council",
        )
        self.assertEqual(
            response.data["priority"],
            "high",
        )

    def test_user_can_update_structured_commitment_details(self):
        commitment = Commitment.objects.create(
            user = self.user,
            title = "Council Tax",
        )

        detail_url = reverse(
            "commitments:commitment-detail",
            kwargs = {"pk": commitment.pk},
        )

        self.authenticate()

        response = self.client.patch(
            detail_url,
            {
                "group_id": self.group.id,
                "provider_name": "Edinburgh Council",
                "priority": "high",
                "status_id": self.status.id,
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        commitment.refresh_from_db()

        self.assertEqual(
            commitment.group,
            self.group,
        )
        self.assertEqual(
            commitment.provider_name,
            "Edinburgh Council",
        )
        self.assertEqual(
            commitment.priority,
            Commitment.Priority.HIGH,
        )
        self.assertEqual(
            commitment.status,
            self.status,
        )

    def test_invalid_priority_is_rejected(self):
        self.authenticate()

        payload = self.valid_payload.copy()
        payload["priority"] = "urgent"

        response = self.client.post(
            self.list_url,
            payload,
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "priority",
            response.data,
        )

    def test_unknown_group_is_rejected(self):
        self.authenticate()

        payload = self.valid_payload.copy()
        payload["group_id"] = 999999

        response = self.client.post(
            self.list_url,
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "group_id",
            response.data,
        )

    def test_invalid_date_format_is_rejected(self):
        self.authenticate()

        payload = self.valid_payload.copy()
        payload["due_date"] = "15-08-2026"

        response = self.client.post(
            self.list_url,
            payload,
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "due_date",
            response.data,
        )
    def test_inactive_group_cannot_be_selected(self):
        inactive_group = CommitmentGroup.objects.create(
            name = "Inactive Group",
            description = "This group is not available to users.",
            information_url = "https://example.com/",
            is_active = False,
        )

        self.authenticate()

        payload = self.valid_payload.copy()
        payload["group_id"] = inactive_group.id

        response = self.client.post(
            self.list_url,
            payload,
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "group_id",
            response.data,
        )
        
    def test_user_cannot_modify_admin_managed_group_content(self):
        commitment = Commitment.objects.create(
            user = self.user,
            title = "Council Tax",
            group = self.group,
        )

        detail_url = reverse(
            "commitments:commitment-detail",
            kwargs = {"pk": commitment.pk},
        )

        self.authenticate()

        response = self.client.patch(
            detail_url,
            {
                "group": {
                    "name": "Changed Group",
                    "description": "Changed by user.",
                    "information_url": "https://malicious.example/",
                }
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.group.refresh_from_db()

        self.assertEqual(
            self.group.name,
            "Household",
        )

        self.assertEqual(
            self.group.description,
            (
                "Household commitments may include council tax, "
                "energy, water and broadband."
            ),
        )

        self.assertEqual(
            self.group.information_url,
            "https://www.moneysavingexpert.com/",
        )
        
class CommitmentGroupListAPITests(APITestCase):
    # Test read-only access to active commitment groups.

    def setUp(self):
        self.user = User.objects.create_user(
            username = "testuser",
            email = "test@example.com",
            password = "SecureTestPassword123!",
        )

        self.token = Token.objects.create(
            user = self.user,
        )

        self.active_group = CommitmentGroup.objects.create(
            name = "Household",
            description = "Household-related commitments.",
            information_url = "https://www.moneysavingexpert.com/", 
            is_active = True,
        )

        self.inactive_group = CommitmentGroup.objects.create(
            name = "Inactive Group",
            description = "Hidden from users.",
            information_url = "https://example.com/",
            is_active = False,
        )

        self.url = reverse(
            "commitments:commitment-group-list"
        )

    def authenticate(self):
        self.client.credentials(
            HTTP_AUTHORIZATION = f"Token {self.token.key}"
        )

    def test_authenticated_user_can_view_active_groups(self):
        self.authenticate()

        response = self.client.get(
            self.url,
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["name"],
            "Household",
        )

        self.assertEqual(
            response.data[0]["description"],
            "Household-related commitments.",
        )

        self.assertEqual(
            response.data[0]["information_url"],
            "https://www.moneysavingexpert.com/",
        )

    def test_inactive_groups_are_not_returned(self):
        self.authenticate()

        response = self.client.get(
            self.url,
            format = "json",
        )

        returned_names = {
            group["name"]
            for group in response.data
        }

        self.assertNotIn(
            "Inactive Group",
            returned_names,
        )

    def test_unauthenticated_user_cannot_view_groups(self):
        response = self.client.get(
            self.url,
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )
    def test_group_endpoint_does_not_allow_user_modifications(self):
        self.authenticate()

        response = self.client.post(
            self.url,
            {
                "name": "User-created group",
                "description": "This should not be created.",
                "information_url": "https://example.com/",
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        )

        self.assertFalse(
            CommitmentGroup.objects.filter(
                name = "User-created group",
            ).exists()
        )
        
class CommitmentBillContractDetailsAPITests(APITestCase):
    # Test bill and contract detail fields.

    def setUp(self):
        self.user = User.objects.create_user(
            username = "testuser",
            email = "test@example.com",
            password = "SecureTestPassword123!",
        )

        self.token = Token.objects.create(
            user = self.user,
        )

        self.url = reverse(
            "commitments:commitment-list-create"
        )

    def authenticate(self):
        self.client.credentials(
            HTTP_AUTHORIZATION = f"Token {self.token.key}"
        )

    def test_user_can_create_commitment_with_bill_and_contract_details(self):
        self.authenticate()

        response = self.client.post(
            self.url,
            {
                "title": "Broadband Contract",
                "provider_name": "Example Broadband",
                "amount": "39.99",
                "payment_frequency": "monthly",
                "contract_end_date": "2027-06-30",
                "notice_period_days": 30,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        commitment = Commitment.objects.get()

        self.assertEqual(
            str(commitment.amount),
            "39.99",
        )
        self.assertEqual(
            commitment.payment_frequency,
            Commitment.PaymentFrequency.MONTHLY,
        )
        self.assertEqual(
            str(commitment.contract_end_date),
            "2027-06-30",
        )
        self.assertEqual(
            commitment.notice_period_days,
            30,
        )

    def test_bill_and_contract_details_are_returned_in_response(self):
        self.authenticate()

        response = self.client.post(
            self.url,
            {
                "title": "Car Insurance",
                "amount": "600.00",
                "payment_frequency": "annually",
                "contract_end_date": "2027-08-01",
                "notice_period_days": 21,
            },
            format = "json",
        )

        self.assertEqual(
            response.data["amount"],
            "600.00",
        )
        self.assertEqual(
            response.data["payment_frequency"],
            "annually",
        )
        self.assertEqual(
            response.data["contract_end_date"],
            "2027-08-01",
        )
        self.assertEqual(
            response.data["notice_period_days"],
            21,
        )

    def test_user_can_update_bill_and_contract_details(self):
        commitment = Commitment.objects.create(
            user = self.user,
            title = "Old Contract",
        )

        detail_url = reverse(
            "commitments:commitment-detail",
            kwargs = {"pk": commitment.pk},
        )

        self.authenticate()

        response = self.client.patch(
            detail_url,
            {
                "amount": "45.50",
                "payment_frequency": "monthly",
                "contract_end_date": "2027-12-31",
                "notice_period_days": 30,
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        commitment.refresh_from_db()

        self.assertEqual(
            str(commitment.amount),
            "45.50",
        )
        self.assertEqual(
            commitment.payment_frequency,
            Commitment.PaymentFrequency.MONTHLY,
        )
        self.assertEqual(
            str(commitment.contract_end_date),
            "2027-12-31",
        )
        self.assertEqual(
            commitment.notice_period_days,
            30,
        )

    def test_negative_amount_is_rejected(self):
        self.authenticate()

        response = self.client.post(
            self.url,
            {
                "title": "Invalid Bill",
                "amount": "-10.00",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertIn(
            "amount",
            response.data,
        )

    def test_invalid_payment_frequency_is_rejected(self):
        self.authenticate()

        response = self.client.post(
            self.url,
            {
                "title": "Invalid Contract",
                "payment_frequency": "fortnightly",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertIn(
            "payment_frequency",
            response.data,
        )

    def test_invalid_contract_end_date_is_rejected(self):
        self.authenticate()

        response = self.client.post(
            self.url,
            {
                "title": "Invalid Contract",
                "contract_end_date": "31-12-2027",
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertIn(
            "contract_end_date",
            response.data,
        )

    def test_negative_notice_period_is_rejected(self):
        self.authenticate()

        response = self.client.post(
            self.url,
            {
                "title": "Invalid Contract",
                "notice_period_days": -1,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertIn(
            "notice_period_days",
            response.data,
        )
        
class UpcomingCommitmentListAPITests(APITestCase):
    # Test the upcoming commitments endpoint.

    def setUp(self):
        self.user = User.objects.create_user(
            username = "upcominguser",
            email = "upcoming@example.com",
            password = "SecureTestPassword123!",
        )

        self.other_user = User.objects.create_user(
            username = "otheruser",
            email = "other@example.com",
            password = "SecureTestPassword123!",
        )

        self.token = Token.objects.create(user=self.user)

        self.url = reverse(
            "commitments:commitment-upcoming"
        )

    def authenticate(self):
        self.client.credentials(
            HTTP_AUTHORIZATION = f"Token {self.token.key}"
        )

    def test_authentication_is_required(self):
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_only_commitments_due_within_next_30_days_are_returned(self):
        today = timezone.localdate()

        included_today = Commitment.objects.create(
            user = self.user,
            title = "Due today",
            due_date = today,
        )

        included_later = Commitment.objects.create(
            user = self.user,
            title = "Due in 30 days",
            due_date = today + timedelta(days = 30),
        )

        Commitment.objects.create(
            user = self.user,
            title = "Overdue",
            due_date = today - timedelta(days=1),
        )

        Commitment.objects.create(
            user = self.user,
            title = "Too far away",
            due_date = today + timedelta(days=31),
        )

        Commitment.objects.create(
            user = self.user,
            title = "No due date",
            due_date = None,
        )

        self.authenticate()

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        returned_ids = [
            item["id"] for item in response.data
        ]

        self.assertEqual(
            returned_ids,
            [
                included_today.id,
                included_later.id,
            ],
        )

    def test_archived_commitments_are_excluded(self):
        today = timezone.localdate()

        Commitment.objects.create(
            user = self.user,
            title = "Archived commitment",
            due_date = today + timedelta(days = 5),
            is_archived = True,
            archived_at = timezone.now(),
        )

        self.authenticate()

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(
            response.data,
            [],
        )

    def test_commitments_owned_by_other_users_are_excluded(self):
        today = timezone.localdate()

        Commitment.objects.create(
            user = self.other_user,
            title = "Other user's commitment",
            due_date = today + timedelta(days = 5),
        )

        self.authenticate()

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(
            response.data,
            [],
        )

    def test_commitments_are_ordered_by_nearest_due_date(self):
        today = timezone.localdate()

        later = Commitment.objects.create(
            user = self.user,
            title = "Later",
            due_date = today + timedelta(days = 20),
        )

        sooner = Commitment.objects.create(
            user = self.user,
            title = "Sooner",
            due_date = today + timedelta(days = 3),
        )

        self.authenticate()

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            [item["id"] for item in response.data],
            [
                sooner.id,
                later.id,
            ],
        )
        
class OverdueCommitmentListAPITests(APITestCase):
    # Test the overdue commitments endpoint.

    def setUp(self):
        self.user = User.objects.create_user(
            username = "overdueuser",
            email = "overdue@example.com",
            password = "SecureTestPassword123!",
        )

        self.other_user = User.objects.create_user(
            username = "otheroverdueuser",
            email = "otheroverdue@example.com",
            password = "SecureTestPassword123!",
        )

        self.token = Token.objects.create(user = self.user)

        self.url = reverse(
            "commitments:commitment-overdue"
        )

    def authenticate(self):
        self.client.credentials(
            HTTP_AUTHORIZATION = f"Token {self.token.key}"
        )

    def test_authentication_is_required(self):
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_only_overdue_commitments_are_returned(self):
        today = timezone.localdate()

        oldest = Commitment.objects.create(
            user = self.user,
            title = "Oldest overdue",
            due_date = today - timedelta(days = 20),
        )

        recent = Commitment.objects.create(
            user = self.user,
            title = "Recently overdue",
            due_date = today - timedelta(days = 1),
        )

        Commitment.objects.create(
            user = self.user,
            title = "Due today",
            due_date = today,
        )

        Commitment.objects.create(
            user = self.user,
            title = "Future commitment",
            due_date = today + timedelta(days = 1),
        )

        Commitment.objects.create(
            user = self.user,
            title = "No due date",
            due_date = None,
        )

        self.authenticate()

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            [item["id"] for item in response.data],
            [
                oldest.id,
                recent.id,
            ],
        )

    def test_archived_commitments_are_excluded(self):
        today = timezone.localdate()

        Commitment.objects.create(
            user = self.user,
            title = "Archived overdue commitment",
            due_date = today - timedelta(days = 5),
            is_archived = True,
            archived_at = timezone.now(),
        )

        self.authenticate()

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(
            response.data,
            [],
        )

    def test_commitments_owned_by_other_users_are_excluded(self):
        today = timezone.localdate()

        Commitment.objects.create(
            user = self.other_user,
            title = "Other user's overdue commitment",
            due_date = today - timedelta(days = 5),
        )

        self.authenticate()

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(
            response.data,
            [],
        )

    def test_commitments_are_ordered_by_oldest_due_date(self):
        today = timezone.localdate()

        recent = Commitment.objects.create(
            user = self.user,
            title = "Recent overdue",
            due_date = today - timedelta(days = 2),
        )

        oldest = Commitment.objects.create(
            user = self.user,
            title = "Oldest overdue",
            due_date = today - timedelta(days = 10),
        )

        self.authenticate()

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            [item["id"] for item in response.data],
            [
                oldest.id,
                recent.id,
            ],
        )
        
class HighPriorityCommitmentListAPITests(APITestCase):
    # Test the high-priority commitments endpoint.

    def setUp(self):
        self.user = User.objects.create_user(
            username = "priorityuser",
            email = "priority@example.com",
            password = "SecureTestPassword123!",
        )

        self.other_user = User.objects.create_user(
            username = "otherpriorityuser",
            email = "otherpriority@example.com",
            password = "SecureTestPassword123!",
        )

        self.token = Token.objects.create(user = self.user)

        self.url = reverse(
            "commitments:commitment-high-priority"
        )

    def authenticate(self):
        self.client.credentials(
            HTTP_AUTHORIZATION = f"Token {self.token.key}"
        )

    def test_authentication_is_required(self):
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_only_high_priority_commitments_are_returned(self):
        today = timezone.localdate()

        high_priority = Commitment.objects.create(
            user = self.user,
            title = "High priority commitment",
            priority = Commitment.Priority.HIGH,
            due_date = today + timedelta(days = 5),
        )

        Commitment.objects.create(
            user = self.user,
            title = "Medium priority commitment",
            priority = Commitment.Priority.MEDIUM,
            due_date = today + timedelta(days = 3),
        )

        Commitment.objects.create(
            user = self.user,
            title = "Low priority commitment",
            priority = Commitment.Priority.LOW,
            due_date = today + timedelta(days = 1),
        )

        self.authenticate()

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            [item["id"] for item in response.data],
            [high_priority.id],
        )

    def test_archived_commitments_are_excluded(self):
        Commitment.objects.create(
            user = self.user,
            title = "Archived high priority",
            priority = Commitment.Priority.HIGH,
            is_archived = True,
            archived_at = timezone.now(),
        )

        self.authenticate()

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(
            response.data,
            [],
        )

    def test_commitments_owned_by_other_users_are_excluded(self):
        Commitment.objects.create(
            user = self.other_user,
            title = "Other user's high priority commitment",
            priority = Commitment.Priority.HIGH,
        )

        self.authenticate()

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(
            response.data,
            [],
        )

    def test_commitments_are_ordered_by_nearest_due_date(self):
        today = timezone.localdate()

        no_due_date = Commitment.objects.create(
            user = self.user,
            title = "No due date",
            priority = Commitment.Priority.HIGH,
            due_date = None,
        )

        later = Commitment.objects.create(
            user = self.user,
            title = "Later",
            priority = Commitment.Priority.HIGH,
            due_date = today + timedelta(days = 20),
        )

        sooner = Commitment.objects.create(
            user = self.user,
            title = "Sooner",
            priority = Commitment.Priority.HIGH,
            due_date = today + timedelta(days = 2),
        )

        self.authenticate()

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            [item["id"] for item in response.data],
            [
                sooner.id,
                later.id,
                no_due_date.id,
            ],
        )
        
class CommitmentPaymentStatusAPITests(APITestCase):
    # Test payment-status creation, updates and validation.

    def setUp(self):
        self.user = User.objects.create_user(
            username = "paymentstatususer",
            email = "paymentstatus@example.com",
            password = "SecureTestPassword123!",
        )

        self.token = Token.objects.create(user = self.user)

        self.url = reverse(
            "commitments:commitment-list-create"
        )

    def authenticate(self):
        self.client.credentials(
            HTTP_AUTHORIZATION = f"Token {self.token.key}"
        )

    def test_default_payment_status_is_not_applicable(self):
        self.authenticate()

        response = self.client.post(
            self.url,
            {
                "title": "General commitment",
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )
        self.assertEqual(
            response.data["payment_status"],
            "not_applicable",
        )

    def test_user_can_create_commitment_with_payment_status(self):
        self.authenticate()

        response = self.client.post(
            self.url,
            {
                "title": "Electricity bill",
                "payment_status": "pending",
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )
        self.assertEqual(
            response.data["payment_status"],
            "pending",
        )

    def test_user_can_update_payment_status(self):
        commitment = Commitment.objects.create(
            user = self.user,
            title = "Council tax",
            payment_status = Commitment.PaymentStatus.PENDING,
        )

        detail_url = reverse(
            "commitments:commitment-detail",
            kwargs = {"pk": commitment.pk},
        )

        self.authenticate()

        response = self.client.patch(
            detail_url,
            {
                "payment_status": "paid",
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        commitment.refresh_from_db()

        self.assertEqual(
            commitment.payment_status,
            Commitment.PaymentStatus.PAID,
        )

    def test_invalid_payment_status_is_rejected(self):
        self.authenticate()

        response = self.client.post(
            self.url,
            {
                "title": "Invalid status",
                "payment_status": "partially_paid",
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertIn(
            "payment_status",
            response.data,
        )

    def test_user_cannot_update_another_users_payment_status(self):
        other_user = User.objects.create_user(
            username = "otherpaymentuser",
            email = "otherpayment@example.com",
            password = "SecureTestPassword123!",
        )

        commitment = Commitment.objects.create(
            user = other_user,
            title = "Other user's bill",
            payment_status=Commitment.PaymentStatus.PENDING,
        )

        detail_url = reverse(
            "commitments:commitment-detail",
            kwargs = {"pk": commitment.pk},
        )

        self.authenticate()

        response = self.client.patch(
            detail_url,
            {
                "payment_status": "paid",
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )
        
class CommitmentCancellationDeadlineAPITests(APITestCase):
    # Test cancellation-deadline calculation and API behaviour.

    def setUp(self):
        self.user = User.objects.create_user(
            username = "cancellationuser",
            email = "cancellation@example.com",
            password = "SecureTestPassword123!",
        )

        self.token = Token.objects.create(user = self.user)

        self.url = reverse(
            "commitments:commitment-list-create"
        )

    def authenticate(self):
        self.client.credentials(
            HTTP_AUTHORIZATION = f"Token {self.token.key}"
        )

    def test_cancellation_deadline_is_calculated(self):
        self.authenticate()

        response = self.client.post(
            self.url,
            {
                "title": "Broadband contract",
                "contract_end_date": "2027-06-30",
                "notice_period_days": 30,
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )
        self.assertEqual(
            response.data["cancellation_deadline"],
            "2027-05-31",
        )

    def test_deadline_is_null_without_contract_end_date(self):
        self.authenticate()

        response = self.client.post(
            self.url,
            {
                "title": "Contract without end date",
                "notice_period_days": 30,
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )
        self.assertIsNone(
            response.data["cancellation_deadline"],
        )

    def test_deadline_is_null_without_notice_period(self):
        self.authenticate()

        response = self.client.post(
            self.url,
            {
                "title": "Contract without notice period",
                "contract_end_date": "2027-06-30",
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )
        self.assertIsNone(
            response.data["cancellation_deadline"],
        )

    def test_deadline_is_recalculated_after_update(self):
        commitment = Commitment.objects.create(
            user = self.user,
            title = "Updated contract",
            contract_end_date = "2027-06-30",
            notice_period_days = 30,
        )

        detail_url = reverse(
            "commitments:commitment-detail",
            kwargs = {"pk": commitment.pk},
        )

        self.authenticate()

        response = self.client.patch(
            detail_url,
            {
                "notice_period_days": 60,
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(
            response.data["cancellation_deadline"],
            "2027-05-01",
        )

    def test_cancellation_deadline_is_read_only(self):
        self.authenticate()

        response = self.client.post(
            self.url,
            {
                "title": "Read-only deadline",
                "contract_end_date": "2027-06-30",
                "notice_period_days": 30,
                "cancellation_deadline": "2030-01-01",
            },
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )
        self.assertEqual(
            response.data["cancellation_deadline"],
            "2027-05-31",
        )
        
class ReviewSoonCommitmentListAPITests(APITestCase):
    # Test commitments approaching their cancellation deadline.

    def setUp(self):
        self.user = User.objects.create_user(
            username = "reviewuser",
            email = "review@example.com",
            password = "SecureTestPassword123!",
        )

        self.other_user = User.objects.create_user(
            username = "otherreviewuser",
            email = "otherreview@example.com",
            password = "SecureTestPassword123!",
        )

        self.token = Token.objects.create(user = self.user)

        self.url = reverse(
            "commitments:commitment-review-soon"
        )

    def authenticate(self):
        self.client.credentials(
            HTTP_AUTHORIZATION = f"Token {self.token.key}"
        )

    def test_authentication_is_required(self):
        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_only_commitments_with_deadlines_in_next_30_days_are_returned(self):
        today = timezone.localdate()

        due_today = Commitment.objects.create(
            user = self.user,
            title = "Review today",
            contract_end_date = today + timedelta(days = 30),
            notice_period_days = 30,
        )

        due_in_30_days = Commitment.objects.create(
            user = self.user,
            title = "Review in 30 days",
            contract_end_date = today + timedelta(days = 60),
            notice_period_days = 30,
        )

        Commitment.objects.create(
            user = self.user,
            title = "Deadline already passed",
            contract_end_date = today + timedelta(days = 20),
            notice_period_days = 30,
        )

        Commitment.objects.create(
            user = self.user,
            title = "Deadline too far away",
            contract_end_date = today + timedelta(days = 61),
            notice_period_days = 30,
        )

        Commitment.objects.create(
            user = self.user,
            title = "Missing notice period",
            contract_end_date = today + timedelta(days = 20),
            notice_period_days = None,
        )

        Commitment.objects.create(
            user = self.user,
            title = "Missing contract end date",
            contract_end_date = None,
            notice_period_days = 30,
        )

        self.authenticate()

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            [item["id"] for item in response.data],
            [
                due_today.id,
                due_in_30_days.id,
            ],
        )

    def test_archived_commitments_are_excluded(self):
        today = timezone.localdate()

        Commitment.objects.create(
            user = self.user,
            title = "Archived review",
            contract_end_date = today + timedelta(days = 35),
            notice_period_days = 30,
            is_archived = True,
            archived_at = timezone.now(),
        )

        self.authenticate()

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(
            response.data,
            [],
        )

    def test_commitments_owned_by_other_users_are_excluded(self):
        today = timezone.localdate()

        Commitment.objects.create(
            user = self.other_user,
            title = "Other user's review",
            contract_end_date = today + timedelta(days = 35),
            notice_period_days = 30,
        )

        self.authenticate()

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(
            response.data,
            [],
        )

    def test_commitments_are_ordered_by_nearest_cancellation_deadline(self):
        today = timezone.localdate()

        later = Commitment.objects.create(
            user = self.user,
            title = "Review later",
            contract_end_date = today + timedelta(days = 50),
            notice_period_days = 30,
        )

        sooner = Commitment.objects.create(
            user = self.user,
            title = "Review sooner",
            contract_end_date = today + timedelta(days = 35),
            notice_period_days = 30,
        )

        self.authenticate()

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            [item["id"] for item in response.data],
            [
                sooner.id,
                later.id,
            ],
        )

        self.assertEqual(
            response.data[0]["cancellation_deadline"],
            (today + timedelta(days = 5)).isoformat(),
        )

        self.assertEqual(
            response.data[1]["cancellation_deadline"],
            (today + timedelta(days = 20)).isoformat(),
        )