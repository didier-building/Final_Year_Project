#!/usr/bin/env python3
"""
Test Sepolia connection using Alchemy RPC
"""
import os
import boa
from eth_account import Account

def test_sepolia_connection():
    """Test connection to Sepolia via Alchemy"""
    
    print("🔍 Testing Sepolia Connection via Alchemy")
    print("=" * 50)
    
    # Get configuration
    rpc_url = os.getenv('SEPOLIA_RPC_URL', 'https://eth-sepolia.g.alchemy.com/v2/z4apY4f867mavN6qu0m9dY0NqMbpgopv')
    private_key = os.getenv('SEPOLIA_PRIVATE_KEY')
    
    print(f"🔗 RPC URL: {rpc_url[:50]}...")
    
    try:
        # Set up connection
        boa.set_env(rpc_url)
        
        # Test basic connection
        latest_block = boa.env.vm.state.env.w3.eth.block_number
        chain_id = boa.env.vm.state.env.w3.eth.chain_id
        
        print(f"✅ Connected to Sepolia!")
        print(f"📦 Latest block: {latest_block}")
        print(f"🔗 Chain ID: {chain_id}")
        
        # Test account if private key provided
        if private_key and private_key != 'your-sepolia-private-key-here':
            account = Account.from_key(private_key)
            boa.env.add_account(account, force_eoa=True)
            
            balance = boa.env.get_balance(account.address)
            balance_eth = balance / 10**18
            
            print(f"👤 Account: {account.address}")
            print(f"💰 Balance: {balance_eth:.6f} ETH")
            
            if balance_eth < 0.01:
                print("⚠️  Low balance! Get Sepolia ETH from:")
                print("   - https://sepoliafaucet.com/")
                print("   - https://faucets.chain.link/sepolia")
            else:
                print("✅ Sufficient balance for deployment!")
        else:
            print("ℹ️  Set SEPOLIA_PRIVATE_KEY to test account balance")
        
        print("\n🎉 Sepolia connection test successful!")
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

if __name__ == "__main__":
    success = test_sepolia_connection()
    if success:
        print("\n🚀 Ready for Sepolia deployment!")
        print("Run: mox run deploy_sepolia --network sepolia")
    else:
        print("\n🔧 Please check your configuration and try again")
