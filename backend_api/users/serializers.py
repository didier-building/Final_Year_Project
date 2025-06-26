"""
Serializers for user profile and farm management
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, FarmDetails, Certification, TransactionHistory


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class CertificationSerializer(serializers.ModelSerializer):
    is_expired = serializers.ReadOnlyField()
    
    class Meta:
        model = Certification
        fields = [
            'id', 'certification_type', 'certification_name', 'issuing_authority',
            'issue_date', 'expiry_date', 'certificate_document', 'verification_url',
            'is_active', 'is_expired', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'is_expired']


class FarmDetailsSerializer(serializers.ModelSerializer):
    certifications = CertificationSerializer(many=True, read_only=True)
    has_location = serializers.ReadOnlyField()
    
    class Meta:
        model = FarmDetails
        fields = [
            'id', 'farm_name', 'farm_size', 'farming_type', 'crops_grown',
            'farm_description', 'farm_address', 'latitude', 'longitude',
            'farm_image', 'organic_certified', 'certification_details',
            'has_location', 'certifications', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'has_location']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    farm_details = FarmDetailsSerializer(read_only=True)
    is_farmer = serializers.ReadOnlyField()
    is_buyer = serializers.ReadOnlyField()
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'user_type', 'wallet_address', 'phone_number',
            'location', 'bio', 'profile_image', 'is_verified', 'verification_date',
            'is_farmer', 'is_buyer', 'farm_details', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'is_verified', 'verification_date', 'created_at', 'updated_at']


class TransactionHistorySerializer(serializers.ModelSerializer):
    value_eth = serializers.ReadOnlyField()
    explorer_url = serializers.ReadOnlyField()
    
    class Meta:
        model = TransactionHistory
        fields = [
            'id', 'transaction_hash', 'transaction_type', 'from_address', 'to_address',
            'value_wei', 'value_eth', 'gas_used', 'gas_price', 'produce_id', 'produce_name',
            'network', 'block_number', 'status', 'explorer_url', 'timestamp'
        ]
        read_only_fields = ['id', 'value_eth', 'explorer_url', 'timestamp']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = UserProfile
        fields = [
            'user_type', 'phone_number', 'location', 'bio', 'profile_image'
        ]


class FarmDetailsUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating farm details"""
    
    class Meta:
        model = FarmDetails
        fields = [
            'farm_name', 'farm_size', 'farming_type', 'crops_grown',
            'farm_description', 'farm_address', 'latitude', 'longitude',
            'farm_image', 'organic_certified', 'certification_details'
        ]


class WalletConnectionSerializer(serializers.Serializer):
    """Serializer for connecting wallet to profile"""
    wallet_address = serializers.CharField(max_length=42)
    signature = serializers.CharField(required=False)
    
    def validate_wallet_address(self, value):
        """Validate Ethereum address format"""
        if not value.startswith('0x') or len(value) != 42:
            raise serializers.ValidationError("Invalid Ethereum address format")
        return value.lower()


class LocationUpdateSerializer(serializers.Serializer):
    """Serializer for updating farm location"""
    latitude = serializers.DecimalField(max_digits=10, decimal_places=8)
    longitude = serializers.DecimalField(max_digits=11, decimal_places=8)
    farm_address = serializers.CharField(max_length=500, required=False, allow_blank=True)
