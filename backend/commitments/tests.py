from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import Commitment

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