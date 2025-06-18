from contracts import AgriChain
from moccasin.boa_tools import VyperContract
import boa
from eth_account import Account

def deploy() -> VyperContract:
    """Deploy the AgriChain smart contract"""

    # Check if we need to add account (for Anvil network)
    if not boa.env.eoa:
        # Add the specific Anvil account
        private_key = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
        account = Account.from_key(private_key)
        boa.env.add_account(account, force_eoa=True)
        print(f"✅ Added Anvil account: {account.address}")

    # Display network and account information
    print("🚀 Deploying AgriChain Smart Contract")
    print("=" * 50)
    print(f"🌐 Network: {boa.env}")
    print(f"👤 Deployer Account: {boa.env.eoa}")
    print(f"💰 Account Balance: {boa.env.get_balance(boa.env.eoa) / 10**18:.6f} ETH")
    print("=" * 50)

    agrichain: VyperContract = AgriChain.deploy()
    print("🌾 AgriChain contract deployed successfully!")
    print(f"📍 Contract address: {agrichain.address}")
    print(f"📊 Total produces listed: {agrichain.getTotalProduces()}")

    # Test basic functionality
    print("\n🧪 Testing basic functionality...")

    # List a sample produce (this will be from the deployer account)
    print("📝 Listing sample produce...")
    tx = agrichain.listProduce("Organic Tomatoes", 100, 1000000000000000)  # 100 kg at 0.001 ETH per kg
    print(f"✅ Produce listed! Transaction: {tx}")

    print(f"📊 Total produces after listing: {agrichain.getTotalProduces()}")

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

    return agrichain

def moccasin_main() -> VyperContract:
    return deploy()
