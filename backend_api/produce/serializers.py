"""
Serializers for the produce app
"""
from rest_framework import serializers
from .models import Produce, ProduceCategory, ProduceImage


class ProduceCategorySerializer(serializers.ModelSerializer):
    """Serializer for produce categories"""
    
    class Meta:
        model = ProduceCategory
        fields = ['id', 'name', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProduceImageSerializer(serializers.ModelSerializer):
    """Serializer for produce images"""
    
    class Meta:
        model = ProduceImage
        fields = ['id', 'image', 'caption', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class ProduceSerializer(serializers.ModelSerializer):
    """Serializer for produce listings"""
    
    images = ProduceImageSerializer(many=True, read_only=True)
    price_per_unit_eth = serializers.ReadOnlyField()
    total_price_eth = serializers.ReadOnlyField()
    farmer_username = serializers.CharField(source='farmer_user.username', read_only=True)
    buyer_username = serializers.CharField(source='buyer_user.username', read_only=True)
    
    class Meta:
        model = Produce
        fields = [
            'id', 'blockchain_id', 'contract_address',
            'name', 'quantity', 'price_per_unit', 'total_price',
            'price_per_unit_eth', 'total_price_eth',
            'farmer_address', 'buyer_address',
            'farmer_username', 'buyer_username',
            'is_sold', 'listed_timestamp', 'sold_timestamp',
            'created_at', 'updated_at', 'images'
        ]
        read_only_fields = [
            'id', 'blockchain_id', 'contract_address', 'buyer_address',
            'is_sold', 'listed_timestamp', 'sold_timestamp',
            'created_at', 'updated_at', 'farmer_username', 'buyer_username'
        ]


class ProduceCreateSerializer(serializers.Serializer):
    """Serializer for creating new produce listings"""
    
    name = serializers.CharField(max_length=100)
    quantity = serializers.IntegerField(min_value=1)
    price_per_unit_eth = serializers.DecimalField(max_digits=10, decimal_places=6, min_value=0.000001)
    
    def validate_name(self, value):
        if len(value.strip()) == 0:
            raise serializers.ValidationError("Produce name cannot be empty")
        return value.strip()
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value
    
    def validate_price_per_unit_eth(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value


class ProducePurchaseSerializer(serializers.Serializer):
    """Serializer for purchasing produce"""
    
    buyer_private_key = serializers.CharField(max_length=66, write_only=True)
    
    def validate_buyer_private_key(self, value):
        if not value.startswith('0x') or len(value) != 66:
            raise serializers.ValidationError("Invalid private key format")
        return value


class ProduceListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing produces"""
    
    price_per_unit_eth = serializers.ReadOnlyField()
    total_price_eth = serializers.ReadOnlyField()
    farmer_username = serializers.CharField(source='farmer_user.username', read_only=True)
    
    class Meta:
        model = Produce
        fields = [
            'id', 'blockchain_id', 'name', 'quantity',
            'price_per_unit_eth', 'total_price_eth',
            'farmer_address', 'farmer_username', 'is_sold',
            'listed_timestamp', 'created_at'
        ]
