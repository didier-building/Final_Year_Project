#!/usr/bin/env python3
"""
Get wallet address from private key
"""
import os
from eth_account import Account

def get_wallet_info():
    # Get private key from environment
    private_key = os.getenv('SEPOLIA_PRIVATE_KEY', '44bff12f938c079fd6f5f57089254401420ea73b068eb31913f1d1670ca347b2')
    
    # Create account from private key
    account = Account.from_key(private_key)
    
    print("🔑 Wallet Information")
    print("=" * 40)
    print(f"Address: {account.address}")
    print(f"Private Key: {private_key}")
    print("=" * 40)
    print("\n📋 Next Steps:")
    print(f"1. Fund this address with Sepolia ETH:")
    print(f"   https://sepoliafaucet.com/")
    print(f"2. Check balance on Etherscan:")
    print(f"   https://sepolia.etherscan.io/address/{account.address}")
    print(f"3. Import to MetaMask for testing")

if __name__ == "__main__":
    get_wallet_info()
