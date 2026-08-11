from rest_framework import generics, status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import RegisterSerializer, LoginSerializer

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