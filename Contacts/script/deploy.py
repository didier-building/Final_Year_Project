from contracts import AgriChain
from moccasin.boa_tools import VyperContract
from moccasin.config import get_active_network
import boa
from eth_account import Account

def deploy_agrichain() -> VyperContract:
    """Deploy the AgriChain smart contract"""

    # Check if we need to add account (for Anvil network)
    if not boa.env.eoa:
        # Get private key from environment variable
        import os
        private_key = os.getenv('ANVIL_PRIVATE_KEY')
        if not private_key:
            raise ValueError("ANVIL_PRIVATE_KEY environment variable not set")

        account = Account.from_key(private_key)
        boa.env.add_account(account, force_eoa=True)
        print(f"✅ Added account: {account.address}")

    # Get active network info
    active_network = get_active_network()

    # Display network and account information
    print("🚀 Deploying AgriChain Smart Contract")
    print("=" * 50)
    print(f"🌐 Network: {active_network.name}")
    print(f"👤 Deployer Account: {boa.env.eoa}")
    print(f"💰 Account Balance: {boa.env.get_balance(boa.env.eoa) / 10**18:.6f} ETH")
    print("=" * 50)

    # Deploy the contract
    agrichain: VyperContract = AgriChain.deploy()
    print("🌾 AgriChain contract deployed successfully!")
    print(f"📍 Contract address: {agrichain.address}")

    # Check initial state
    initial_produces: int = agrichain.getTotalProduces()
    print(f"📊 Initial produces count: {initial_produces}")

    # Test basic functionality
    print("\n🧪 Testing basic functionality...")

    # List a sample produce (this will be from the deployer account)
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

    # Verify contract on explorer if available
    if active_network.has_explorer():
        print(f"\n🔍 Verifying contract on {active_network.name} explorer...")
        try:
            result = active_network.moccasin_verify(agrichain)
            result.wait_for_verification()
            print("✅ Contract verified successfully!")
        except Exception as e:
            print(f"⚠️ Contract verification failed: {e}")
    else:
        print(f"\n📝 No explorer available for {active_network.name} network")

    print("\n" + "=" * 50)
    print("🎉 Deployment completed successfully!")
    print(f"📍 Contract Address: {agrichain.address}")
    if active_network.has_explorer():
        explorer_url = f"{active_network.explorer_url}/address/{agrichain.address}"
        print(f"🔗 Explorer: {explorer_url}")
    print("=" * 50)

    return agrichain

def moccasin_main() -> VyperContract:
    return deploy_agrichain()
