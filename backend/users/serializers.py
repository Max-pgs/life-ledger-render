from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    # Validate registration details and securely create a Django user.
    
    password = serializers.CharField(
        write_only = True,
        validators = [validate_password],
    )
    password_confirm = serializers.CharField(write_only = True)
    
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            "password_confirm",
        )
        read_only_fields = ("id",)
        
    def validate_email(self, value):
        # Normalise email and prevent duplicate email addresses.
        
        normalised_email = value.strip().lower()
        
        if User.objects.filter(email__iexact = normalised_email).exists():
            raise serializers.ValidationError(
                "A user with this email address already exists."
            )
        
        return normalised_email
    
    def validate(self, attrs):
        # Ensure both password fields match
        
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        
        return attrs
    
    def create(self, validated_data):
        # Remove the confirmation field and hash the password via create_user().
        
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        
        return User.objects.create_user(
            password=password,
            **validated_data,
        )
        
class LoginSerializer(serializers.Serializer):
    # Validate user credentials for token-based login.
    
    username = serializers.CharField()
    password = serializers.CharField(
        write_only = True,
        trim_whitespace = False,
    )
    
    def validate(self, attrs):
        # Authenticate the user using Django's authentication backend.
        
        user = authenticate(
            request = self.context.get("request"),
            username = attrs["username"],
            password = attrs["password"],
        )
        
        if user is None:
            raise serializers.ValidationError(
                "Invalod username or password."
            )
            
        if not user.is_active:
            raise serializers.ValidationError(
                "This user is currently inactive."
            )
            
        attrs["user"] = user
        return attrs
    
    