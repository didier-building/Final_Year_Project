"""
Web3 service for interacting with AgriChain smart contract
"""
import json
from datetime import datetime
from decimal import Decimal
from typing import Dict, List, Optional

from django.conf import settings
from web3 import Web3
try:
    from web3.middleware import geth_poa_middleware
except ImportError:
    # For newer versions of web3.py
    from web3.middleware import ExtraDataToPOAMiddleware as geth_poa_middleware
from eth_account import Account

from .models import BlockchainTransaction, ContractEvent


class Web3Service:
    """Service for interacting with the AgriChain smart contract"""
    
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(settings.BLOCKCHAIN_CONFIG['ANVIL_RPC_URL']))

        # Add middleware for POA networks (like Anvil)
        try:
            self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        except Exception:
            # For newer versions, middleware might not be needed or different
            pass
        
        # Contract configuration
        self.contract_address = settings.BLOCKCHAIN_CONFIG['CONTRACT_ADDRESS']
        self.private_key = settings.BLOCKCHAIN_CONFIG['PRIVATE_KEY']
        self.account = Account.from_key(self.private_key)
        
        # Load contract ABI (we'll need to add this)
        self.contract_abi = self._load_contract_abi()
        self.contract = self.w3.eth.contract(
            address=self.contract_address,
            abi=self.contract_abi
        )
    
    def _load_contract_abi(self) -> List[Dict]:
        """Load the contract ABI from the compiled contract"""
        # For now, we'll define a minimal ABI based on our contract
        # In production, this should be loaded from the compiled contract files
        return [
            {
                "inputs": [
                    {"name": "produce_name", "type": "string"},
                    {"name": "quantity", "type": "uint256"},
                    {"name": "price_per_unit", "type": "uint256"}
                ],
                "name": "listProduce",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "produce_id", "type": "uint256"}],
                "name": "buyProduce",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [{"name": "produce_id", "type": "uint256"}],
                "name": "getProduceDetails",
                "outputs": [
                    {"name": "", "type": "tuple", "components": [
                        {"name": "id", "type": "uint256"},
                        {"name": "farmer", "type": "address"},
                        {"name": "name", "type": "string"},
                        {"name": "quantity", "type": "uint256"},
                        {"name": "price_per_unit", "type": "uint256"},
                        {"name": "total_price", "type": "uint256"},
                        {"name": "is_sold", "type": "bool"},
                        {"name": "buyer", "type": "address"},
                        {"name": "listed_timestamp", "type": "uint256"},
                        {"name": "sold_timestamp", "type": "uint256"}
                    ]}
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getAvailableProduces",
                "outputs": [{"name": "", "type": "uint256[]"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getTotalProduces",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            }
        ]
    
    def is_connected(self) -> bool:
        """Check if connected to the blockchain"""
        try:
            return self.w3.is_connected()
        except Exception:
            return False
    
    def get_total_produces(self) -> int:
        """Get total number of produces from the contract"""
        try:
            return self.contract.functions.getTotalProduces().call()
        except Exception as e:
            print(f"Error getting total produces: {e}")
            return 0
    
    def get_available_produces(self) -> List[int]:
        """Get list of available produce IDs"""
        try:
            return self.contract.functions.getAvailableProduces().call()
        except Exception as e:
            print(f"Error getting available produces: {e}")
            return []
    
    def get_produce_details(self, produce_id: int) -> Optional[Dict]:
        """Get details of a specific produce"""
        try:
            result = self.contract.functions.getProduceDetails(produce_id).call()
            return {
                'id': result[0],
                'farmer': result[1],
                'name': result[2],
                'quantity': result[3],
                'price_per_unit': result[4],
                'total_price': result[5],
                'is_sold': result[6],
                'buyer': result[7],
                'listed_timestamp': result[8],
                'sold_timestamp': result[9]
            }
        except Exception as e:
            print(f"Error getting produce details for ID {produce_id}: {e}")
            return None
    
    def list_produce(self, produce_name: str, quantity: int, price_per_unit: int) -> Optional[str]:
        """List a new produce on the blockchain"""
        try:
            # Build transaction
            transaction = self.contract.functions.listProduce(
                produce_name, quantity, price_per_unit
            ).build_transaction({
                'from': self.account.address,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'gas': 500000,
                'gasPrice': self.w3.eth.gas_price,
            })
            
            # Sign and send transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Record transaction
            BlockchainTransaction.objects.create(
                transaction_hash=tx_hash.hex(),
                transaction_type='list_produce',
                from_address=self.account.address,
                to_address=self.contract_address,
                value=0
            )
            
            return tx_hash.hex()
            
        except Exception as e:
            print(f"Error listing produce: {e}")
            return None
    
    def buy_produce(self, produce_id: int, buyer_address: str, buyer_private_key: str) -> Optional[str]:
        """Buy a produce from the blockchain"""
        try:
            # Get produce details to determine payment amount
            produce_details = self.get_produce_details(produce_id)
            if not produce_details:
                return None
            
            total_price = produce_details['total_price']
            buyer_account = Account.from_key(buyer_private_key)
            
            # Build transaction
            transaction = self.contract.functions.buyProduce(produce_id).build_transaction({
                'from': buyer_address,
                'nonce': self.w3.eth.get_transaction_count(buyer_address),
                'gas': 500000,
                'gasPrice': self.w3.eth.gas_price,
                'value': total_price,
            })
            
            # Sign and send transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, buyer_private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Record transaction
            BlockchainTransaction.objects.create(
                transaction_hash=tx_hash.hex(),
                transaction_type='buy_produce',
                from_address=buyer_address,
                to_address=self.contract_address,
                value=total_price,
                produce_id=produce_id
            )
            
            return tx_hash.hex()
            
        except Exception as e:
            print(f"Error buying produce: {e}")
            return None


# Global instance
web3_service = Web3Service()
