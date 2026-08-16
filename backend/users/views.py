from rest_framework import generics, status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserProfile

from .serializers import AccountSerializer, RegisterSerializer, LoginSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(
            data = request.data,
            context = {"request": request},
        )
        serializer.is_valid(raise_exception = True)
        
        user = serializer.validated_data["user"]
        
        # Reuse the existing token if the user has logged in before.
        
        token, _ = Token.objects.get_or_create(user = user)
        
        return Response(
            {
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
            },
            status = status.HTTP_200_OK,
        )
        
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        request.auth.delete()
        
        return Response(
            {
                "message": "Successfully logged out."
            },
            status = status.HTTP_200_OK,
        )
        
class AccountView(generics.RetrieveAPIView):
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user

        UserProfile.objects.get_or_create(user=user)

        return user
    
class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        confirmation = request.data.get("confirmation", "")
        expected_confirmation = f"delete_{user.username}"

        if confirmation != expected_confirmation:
            return Response(
                {
                    "confirmation": (
                        f'Type "{expected_confirmation}" to confirm account deletion.'
                    )
                },
                status = status.HTTP_400_BAD_REQUEST,
            )

        user.delete()

        return Response(status = status.HTTP_204_NO_CONTENT)