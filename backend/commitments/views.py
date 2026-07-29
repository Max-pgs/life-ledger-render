from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Commitment
from .serializers import CommitmentCreateSerializer

class CommitmentCreateView(generics.CreateAPIView):
    # Allow an authenticated user to create a personal commitment.
    
    queryset = Commitment.objects.all()
    serializer_class = CommitmentCreateSerializer
    permission_classes = [IsAuthenticated]
