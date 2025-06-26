from contracts import AgriChain
from moccasin.boa_tools import VyperContract
from moccasin.config import get_active_network
import boa
from eth_account import Account
import os

def deploy_agrichain_sepolia() -> VyperContract:
    """Deploy AgriChain contract to Sepolia testnet"""

    # Get active network info
    active_network = get_active_network()

    print("🚀 Deploying AgriChain Smart Contract to Sepolia Testnet")
    print("=" * 60)

    # Check if we need to add account (for Sepolia network)
    if not boa.env.eoa:
        # Try multiple ways to get the private key
        private_key = os.getenv('SEPOLIA_PRIVATE_KEY') or os.getenv('PRIVATE_KEY')

        # If still not found, use the known key directly for this deployment
        if not private_key:
            private_key = "44bff12f938c079fd6f5f57089254401420ea73b068eb31913f1d1670ca347b2"
            print("⚠️ Using direct private key for deployment")

        if private_key == 'your-sepolia-private-key-here':
            raise ValueError("Please replace 'your-sepolia-private-key-here' with your actual private key")

        account = Account.from_key(private_key)
        boa.env.add_account(account, force_eoa=True)
        print(f"✅ Added Sepolia account: {account.address}")

    print(f"🌐 Network: {active_network.name}")
    print(f"👤 Deployer Account: {boa.env.eoa}")

    # Check balance
    balance = boa.env.get_balance(boa.env.eoa)
    balance_eth = balance / 10**18
    print(f"💰 Account Balance: {balance_eth:.6f} ETH")

    if balance_eth < 0.01:
        print("⚠️  Warning: Low balance! You may need more Sepolia ETH")
        print("   Get Sepolia ETH from: https://sepoliafaucet.com/")

    print("=" * 60)
    
    # Deploy the contract
    agrichain: VyperContract = AgriChain.deploy()
    print("🌾 AgriChain contract deployed successfully!")
    print(f"📍 Contract address: {agrichain.address}")

    # Check initial state
    initial_produces: int = agrichain.getTotalProduces()
    print(f"📊 Initial produces count: {initial_produces}")

    # Test basic functionality
    print("\n🧪 Testing basic functionality...")

    # List a sample produce for testing
    print("📝 Listing sample produce...")
    agrichain.listProduce("Organic Tomatoes", 100, 1000000000000000)  # 100 kg at 0.001 ETH per kg
    print("✅ Sample produce listed!")

    # Verify the listing worked
    final_produces: int = agrichain.getTotalProduces()
    print(f"📊 Final produces count: {final_produces}")

    # Get available produces
    available = agrichain.getAvailableProduces()
    print(f"🛒 Available produces: {available}")

    if len(available) > 0:
        # Get details of the first produce
        produce_details = agrichain.getProduceDetails(available[0])
        print(f"📋 Sample produce details:")
        print(f"   ID: {produce_details[0]}")
        print(f"   Farmer: {produce_details[1]}")
        print(f"   Name: {produce_details[2]}")
        print(f"   Quantity: {produce_details[3]} kg")
        print(f"   Price per unit: {produce_details[4]} wei")
        print(f"   Total price: {produce_details[5]} wei")
        print(f"   Is sold: {produce_details[6]}")

    # Verify contract on Sepolia explorer
    if active_network.has_explorer():
        print(f"\n🔍 Verifying contract on Sepolia Etherscan...")
        try:
            result = active_network.moccasin_verify(agrichain)
            result.wait_for_verification()
            print("✅ Contract verified successfully!")
        except Exception as e:
            print(f"⚠️ Contract verification failed: {e}")
            print("You can manually verify later on Etherscan")

    print("\n" + "=" * 60)
    print("🎉 Sepolia deployment completed successfully!")
    print(f"📍 Contract Address: {agrichain.address}")
    if active_network.has_explorer():
        explorer_url = f"{active_network.explorer_url}/address/{agrichain.address}"
        print(f"🔗 Etherscan: {explorer_url}")

    print("\n📝 Next steps:")
    print(f"1. Update your backend .env file:")
    print(f"   CONTRACT_ADDRESS={agrichain.address}")
    print(f"   NETWORK=sepolia")
    print(f"2. Update your frontend to use Sepolia network")
    print(f"3. Make sure users have Sepolia ETH for transactions")
    print("=" * 60)

    return agrichain

def moccasin_main() -> VyperContract:
    return deploy_agrichain_sepolia()
