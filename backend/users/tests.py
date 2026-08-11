from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token

from .models import UserProfile

User = get_user_model()

class RegisterAPITests(APITestCase):
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
        
    def test_registration_requires_email(self):
        payload = self.valid_payload.copy()
        payload["email"] = ""

        response = self.client.post(
            self.url,
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)
        self.assertFalse(
            User.objects.filter(username=payload["username"]).exists()
        )
        
    def test_registration_rejects_password_without_uppercase_letter(self):
        payload = self.valid_payload.copy()
        payload["password"] = "securetestpassword1!"
        payload["password_confirm"] = "securetestpassword1!"

        response = self.client.post(
            self.url,
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertIn("password", response.data)
        self.assertFalse(
            User.objects.filter(
                username=payload["username"],
            ).exists()
        )


    def test_registration_rejects_password_without_number(self):
        payload = self.valid_payload.copy()
        payload["password"] = "SecureTestPassword!"
        payload["password_confirm"] = "SecureTestPassword!"

        response = self.client.post(
            self.url,
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertIn("password", response.data)
        self.assertFalse(
            User.objects.filter(
                username=payload["username"],
            ).exists()
        )
        
class LoginAPITests(APITestCase):
    def setUp(self):
        self.url = reverse("users:login")
        self.password = "SecureTestPassword1!"

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
                "password": "WrongPassword1!",
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
        
class LogoutAPITests(APITestCase):
    def setUp(self):
        self.url = reverse("users:logout")

        self.user = User.objects.create_user(
            username = "testuser",
            email = "test@example.com",
            password = "SecureTestPassword1!",
        )

        self.token = Token.objects.create(user = self.user)
        
    def test_authenticated_user_can_logout(self):
        self.client.credentials(
            HTTP_AUTHORIZATION = f"Token {self.token.key}"
        )

        response = self.client.post(
            self.url,
            format = "json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["message"],
            "Successfully logged out.",
        )
        self.assertFalse(
            Token.objects.filter(user = self.user).exists()
        )
    
    def test_logged_out_token_can_no_longer_be_used(self):
        self.client.credentials(
            HTTP_AUTHORIZATION = f"Token {self.token.key}"
        )

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
            status.HTTP_401_UNAUTHORIZED,
        )
        
    def test_logout_rejects_unauthenticated_request(self):

        response = self.client.post(
            self.url,
            format = "json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

class AccountAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username = "accountuser",
            email = "account@example.com",
            password = "SecureTestPassword123!",
        )

        self.profile = UserProfile.objects.create(
            user = self.user,
        )

        self.token = Token.objects.create(
            user = self.user,
        )

        self.url = reverse("users:account")

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

    def test_account_returns_current_user_details(self):
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
            response.data["id"],
            self.user.id,
        )

        self.assertEqual(
            response.data["username"],
            self.user.username,
        )

        self.assertEqual(
            response.data["email"],
            self.user.email,
        )

        self.assertEqual(
            response.data["plan"],
            "free",
        )

        self.assertIn(
            "member_since",
            response.data,
        )
        
    def test_user_can_delete_own_account(self):
        self.authenticate()

        delete_url = reverse("users:delete-account")

        response = self.client.delete(delete_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            User.objects.filter(id = self.user.id).exists()
        )

        self.assertFalse(
            UserProfile.objects.filter(user_id = self.user.id).exists()
        )
        
    def test_delete_account_requires_authentication(self):
        delete_url = reverse("users:delete-account")

        response = self.client.delete(delete_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )