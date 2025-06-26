"""
API views for the produce app
"""
from datetime import datetime
from decimal import Decimal

from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Produce, ProduceCategory
from .serializers import (
    ProduceSerializer, ProduceListSerializer, ProduceCreateSerializer,
    ProducePurchaseSerializer, ProduceCategorySerializer
)
from blockchain.services import web3_service


class ProduceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for produce categories"""

    queryset = ProduceCategory.objects.all()
    serializer_class = ProduceCategorySerializer
    permission_classes = [AllowAny]


class ProduceViewSet(viewsets.ModelViewSet):
    """ViewSet for produce listings"""

    queryset = Produce.objects.all()
    permission_classes = [AllowAny]  # For now, allow all access

    def get_serializer_class(self):
        if self.action == 'list':
            return ProduceListSerializer
        elif self.action == 'create':
            return ProduceCreateSerializer
        elif self.action == 'purchase':
            return ProducePurchaseSerializer
        return ProduceSerializer

    def get_queryset(self):
        queryset = Produce.objects.all()

        # Filter by availability
        is_available = self.request.query_params.get('available', None)
        if is_available is not None:
            if is_available.lower() == 'true':
                queryset = queryset.filter(is_sold=False)
            elif is_available.lower() == 'false':
                queryset = queryset.filter(is_sold=True)

        # Filter by farmer
        farmer_address = self.request.query_params.get('farmer', None)
        if farmer_address:
            farmer_address = farmer_address.lower()
            print(f"[DEBUG] Filtering produces for farmer_address: {farmer_address}")
            queryset = queryset.filter(farmer_address=farmer_address)
            print(f"[DEBUG] Found {queryset.count()} produces for farmer_address: {farmer_address}")
            for p in queryset:
                print(f"[DEBUG] Produce: {p.name}, Farmer Address: {p.farmer_address}")

        return queryset.order_by('-created_at')

    def create(self, request):
        """Create a new produce listing on the blockchain"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Convert ETH to wei
        price_per_unit_wei = int(serializer.validated_data['price_per_unit_eth'] * 10**18)

        # List produce on blockchain
        tx_hash = web3_service.list_produce(
            produce_name=serializer.validated_data['name'],
            quantity=serializer.validated_data['quantity'],
            price_per_unit=price_per_unit_wei
        )

        if not tx_hash:
            return Response(
                {'error': 'Failed to list produce on blockchain'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {
                'message': 'Produce listing submitted to blockchain',
                'transaction_hash': tx_hash,
                'status': 'pending'
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def purchase(self, request, pk=None):
        """Purchase a produce item"""
        produce = get_object_or_404(Produce, pk=pk)

        if produce.is_sold:
            return Response(
                {'error': 'This produce has already been sold'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Extract buyer address from private key
        from eth_account import Account
        buyer_account = Account.from_key(serializer.validated_data['buyer_private_key'])

        # Purchase on blockchain
        tx_hash = web3_service.buy_produce(
            produce_id=produce.blockchain_id,
            buyer_address=buyer_account.address,
            buyer_private_key=serializer.validated_data['buyer_private_key']
        )

        if not tx_hash:
            return Response(
                {'error': 'Failed to purchase produce on blockchain'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {
                'message': 'Purchase submitted to blockchain',
                'transaction_hash': tx_hash,
                'buyer_address': buyer_account.address,
                'status': 'pending'
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get all available (unsold) produces"""
        available_produces = self.get_queryset().filter(is_sold=False)
        serializer = ProduceListSerializer(available_produces, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def sync_from_blockchain(self, request):
        """Sync produce data from blockchain"""
        try:
            # Get total produces from blockchain
            total_produces = web3_service.get_total_produces()
            synced_count = 0

            for produce_id in range(1, total_produces + 1):
                # Check if we already have this produce
                if Produce.objects.filter(blockchain_id=produce_id).exists():
                    continue

                # Get produce details from blockchain
                produce_data = web3_service.get_produce_details(produce_id)
                if not produce_data:
                    continue

                # Create produce record
                print(f"[DEBUG] Syncing produce: {produce_data['name']} for farmer {produce_data['farmer']}")
                Produce.objects.create(
                    blockchain_id=produce_data['id'],
                    contract_address=web3_service.contract_address,
                    name=produce_data['name'],
                    quantity=produce_data['quantity'],
                    price_per_unit=produce_data['price_per_unit'],
                    total_price=produce_data['total_price'],
                    farmer_address=produce_data['farmer'].lower(),
                    buyer_address=produce_data['buyer'] if produce_data['buyer'] != '0x0000000000000000000000000000000000000000' else None,
                    is_sold=produce_data['is_sold'],
                    listed_timestamp=datetime.fromtimestamp(produce_data['listed_timestamp']),
                    sold_timestamp=datetime.fromtimestamp(produce_data['sold_timestamp']) if produce_data['sold_timestamp'] > 0 else None,
                )
                synced_count += 1

            return Response(
                {
                    'message': f'Successfully synced {synced_count} produces from blockchain',
                    'total_blockchain_produces': total_produces,
                    'synced_count': synced_count
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {'error': f'Failed to sync from blockchain: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
