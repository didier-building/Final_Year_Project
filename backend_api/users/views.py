"""
API views for user profile and farm management
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import UserProfile, FarmDetails, Certification, TransactionHistory
from .serializers import (
    UserProfileSerializer, FarmDetailsSerializer, CertificationSerializer,
    TransactionHistorySerializer, UserProfileUpdateSerializer,
    FarmDetailsUpdateSerializer, WalletConnectionSerializer,
    LocationUpdateSerializer
)


class UserProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for user profile management"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    def get_object(self):
        """Get or create user profile for current user"""
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile"""
        profile = self.get_object()
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'])
    def update_profile(self, request):
        """Update current user's profile"""
        profile = self.get_object()
        serializer = UserProfileUpdateSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Return full profile data
            full_serializer = UserProfileSerializer(profile)
            return Response(full_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def connect_wallet(self, request):
        """Connect wallet address to user profile"""
        serializer = WalletConnectionSerializer(data=request.data)
        if serializer.is_valid():
            profile = self.get_object()
            wallet_address = serializer.validated_data['wallet_address']

            # Check if wallet is already connected to another user
            existing_profile = UserProfile.objects.filter(
                wallet_address=wallet_address
            ).exclude(user=request.user).first()

            if existing_profile:
                return Response(
                    {'error': 'This wallet is already connected to another account'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            profile.wallet_address = wallet_address
            profile.save()

            full_serializer = UserProfileSerializer(profile)
            return Response(full_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def disconnect_wallet(self, request):
        """Disconnect wallet from user profile"""
        profile = self.get_object()
        profile.wallet_address = None
        profile.save()

        full_serializer = UserProfileSerializer(profile)
        return Response(full_serializer.data)


class FarmDetailsViewSet(viewsets.ModelViewSet):
    """ViewSet for farm details management"""
    serializer_class = FarmDetailsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FarmDetails.objects.filter(user_profile__user=self.request.user)

    def get_object(self):
        """Get or create farm details for current user"""
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        farm_details, created = FarmDetails.objects.get_or_create(user_profile=profile)
        return farm_details

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's farm details"""
        farm_details = self.get_object()
        serializer = self.get_serializer(farm_details)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'])
    def update_farm(self, request):
        """Update current user's farm details"""
        farm_details = self.get_object()
        serializer = FarmDetailsUpdateSerializer(farm_details, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Return full farm data
            full_serializer = FarmDetailsSerializer(farm_details)
            return Response(full_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def update_location(self, request):
        """Update farm location"""
        farm_details = self.get_object()
        serializer = LocationUpdateSerializer(data=request.data)
        if serializer.is_valid():
            farm_details.latitude = serializer.validated_data['latitude']
            farm_details.longitude = serializer.validated_data['longitude']
            if 'farm_address' in serializer.validated_data:
                farm_details.farm_address = serializer.validated_data['farm_address']
            farm_details.save()

            full_serializer = FarmDetailsSerializer(farm_details)
            return Response(full_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CertificationViewSet(viewsets.ModelViewSet):
    """ViewSet for farm certifications"""
    serializer_class = CertificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Certification.objects.filter(
            farm_details__user_profile__user=self.request.user
        )

    def perform_create(self, serializer):
        """Create certification for current user's farm"""
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        farm_details, _ = FarmDetails.objects.get_or_create(user_profile=profile)
        serializer.save(farm_details=farm_details)


class TransactionHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for transaction history (read-only)"""
    serializer_class = TransactionHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TransactionHistory.objects.filter(user_profile__user=self.request.user)

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Filter transactions by type"""
        transaction_type = request.query_params.get('type')
        queryset = self.get_queryset()

        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get transaction statistics"""
        queryset = self.get_queryset()

        stats = {
            'total_transactions': queryset.count(),
            'list_transactions': queryset.filter(transaction_type='list_produce').count(),
            'buy_transactions': queryset.filter(transaction_type='buy_produce').count(),
            'total_value_eth': sum(tx.value_eth for tx in queryset),
            'recent_transactions': TransactionHistorySerializer(
                queryset[:5], many=True
            ).data
        }

        return Response(stats)
