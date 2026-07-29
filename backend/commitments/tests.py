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
        self.url = reverse("commitments:commitment-create")

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