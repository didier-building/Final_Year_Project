from src import AgriChain
from moccasin.boa_tools import VyperContract

def deploy() -> VyperContract:
    """Deploy the AgriChain smart contract"""
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
