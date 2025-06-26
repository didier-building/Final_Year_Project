#!/usr/bin/env python3
"""
Direct contract deployment script using the same Web3 configuration as Django
"""
import os
import json
from web3 import Web3
from eth_account import Account

def deploy_contract():
    # Use same configuration as Django
    rpc_url = "http://127.0.0.1:8545"
    private_key = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    
    # Connect to Web3
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    print(f"🌐 Connected to Web3: {w3.is_connected()}")
    print(f"🔗 Chain ID: {w3.eth.chain_id}")
    print(f"📦 Latest block: {w3.eth.block_number}")
    
    # Setup account
    account = Account.from_key(private_key)
    print(f"👤 Deployer account: {account.address}")
    print(f"💰 Balance: {w3.from_wei(w3.eth.get_balance(account.address), 'ether')} ETH")
    
    # Load contract ABI and bytecode
    with open('blockchain/AgriChain.json', 'r') as f:
        contract_data = json.load(f)
    
    abi = contract_data['abi']
    bytecode = contract_data['bytecode']
    
    # Create contract
    contract = w3.eth.contract(abi=abi, bytecode=bytecode)
    
    # Build constructor transaction
    constructor_txn = contract.constructor().build_transaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
        'gas': 2000000,
        'gasPrice': w3.to_wei('20', 'gwei'),
        'chainId': w3.eth.chain_id
    })
    
    # Sign and send transaction
    signed_txn = w3.eth.account.sign_transaction(constructor_txn, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    
    print(f"📝 Deployment transaction: {tx_hash.hex()}")
    
    # Wait for transaction receipt
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    contract_address = tx_receipt.contractAddress
    
    print(f"✅ Contract deployed successfully!")
    print(f"📍 Contract address: {contract_address}")
    print(f"⛽ Gas used: {tx_receipt.gasUsed}")
    
    # Test the deployed contract
    deployed_contract = w3.eth.contract(address=contract_address, abi=abi)
    
    # Test basic functionality
    total_produces = deployed_contract.functions.getTotalProduces().call()
    print(f"📊 Total produces: {total_produces}")
    
    # List a sample produce
    print("\n🧪 Testing produce listing...")
    list_txn = deployed_contract.functions.listProduce(
        "Organic Tomatoes",
        100,
        w3.to_wei(0.001, 'ether')
    ).build_transaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
        'gas': 500000,
        'gasPrice': w3.to_wei('20', 'gwei'),
        'chainId': w3.eth.chain_id
    })
    
    signed_list_txn = w3.eth.account.sign_transaction(list_txn, private_key)
    list_tx_hash = w3.eth.send_raw_transaction(signed_list_txn.raw_transaction)
    list_receipt = w3.eth.wait_for_transaction_receipt(list_tx_hash)
    
    print(f"✅ Sample produce listed! Transaction: {list_tx_hash.hex()}")
    
    # Check results
    total_produces = deployed_contract.functions.getTotalProduces().call()
    available_produces = deployed_contract.functions.getAvailableProduces().call()
    
    print(f"📊 Total produces after listing: {total_produces}")
    print(f"🛒 Available produces: {available_produces}")
    
    if available_produces:
        details = deployed_contract.functions.getProduceDetails(available_produces[0]).call()
        print(f"📋 Sample produce details:")
        print(f"   ID: {details[0]}")
        print(f"   Farmer: {details[1]}")
        print(f"   Name: {details[2]}")
        print(f"   Quantity: {details[3]}")
        print(f"   Price per unit: {details[4]} wei")
        print(f"   Total price: {details[5]} wei")
        print(f"   Is sold: {details[6]}")
    
    return contract_address

if __name__ == "__main__":
    contract_address = deploy_contract()
    print(f"\n🔧 Update your .env file with:")
    print(f"CONTRACT_ADDRESS={contract_address}")
