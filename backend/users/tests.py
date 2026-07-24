from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()

class RegisterAPITests(APITestCase):
    # Test the account registration endpoint.
    
    def setUp(self):
        self.url = reverse("users:register")
        self.valid_payload = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "SecureTestPassword1!",
            "password_confirm": "SecureTestPassword1!",
        }
        
    def test_user_can_register(self):
        response = self.client.post(
            self.url,
            self.valid_payload,
            format = "json",
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        
        user = User.objects.get(username = "testuser")
        
        self.assertEqual(user.email, "test@example.com")
        self.assertTrue(user.check_password("SecureTestPassword1!"))
        self.assertNotIn("password", response.data)
        self.assertNotIn("password_confirm", response.data)
        
    def test_registration_rejects_mismatched_passwords(self):
        payload = self.valid_payload.copy()
        payload["password_confirm"] = "AnotherPassword1!"
        
        response = self.client.post(
            self.url,
            payload,
            format = "json",
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 0)
        self.assertIn("password_confirm", response.data)
        
    def test_registration_rejects_duplicate_email(self):
        User.objects.create_user(
            username = "userexists",
            email = "test@example.com",
            password = "SecureTestPassword1!",
        )
        
        payload = self.valid_payload.copy()
        payload["username"] = "anotheruser"
        
        response = self.client.post(
            self.url,
            payload,
            format = "json",
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 1)
        self.assertIn("email", response.data)
        
class LoginAPITests(APITestCase):
    # Test the token-based login endpoint.
    
    def setUp(self):
        self.url = reverse("users:login")
        self.password = "SecureTestPassword123!"

        self.user = User.objects.create_user(
            username = "testuser",
            email = "test@example.com",
            password = self.password,
        )

    def test_user_can_login_with_valid_credentials(self):
        response = self.client.post(
            self.url,
            {
                "username": "testuser",
                "password": self.password,
            },
            format = "json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["user"]["username"], "testuser")
        self.assertEqual(response.data["user"]["email"], "test@example.com")

    def test_login_rejects_invalid_password(self):
        response = self.client.post(
            self.url,
            {
                "username": "testuser",
                "password": "WrongPassword123!",
            },
            format = "json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertNotIn("token", response.data)

    def test_login_rejects_unknown_username(self):
        response = self.client.post(
            self.url,
            {
                "username": "unknownuser",
                "password": self.password,
            },
            format = "json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertNotIn("token", response.data)
