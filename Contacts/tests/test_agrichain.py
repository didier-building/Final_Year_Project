import pytest
from moccasin.boa_tools import VyperContract
import boa

def test_initial_state(agrichain_contract):
    """Test initial contract state"""
    assert agrichain_contract.getTotalProduces() == 1, "Initial produce count is off" # One from deployment
    assert len(agrichain_contract.getAvailableProduces()) == 1

def test_list_produce(agrichain_contract):
    """Test listing new produce"""
    initial_count = agrichain_contract.getTotalProduces()

    # List a new produce
    agrichain_contract.listProduce("Fresh Apples", 50, 2000000000000000)  # 50 kg at 0.002 ETH per kg

    # Check if produce was listed
    assert agrichain_contract.getTotalProduces() == initial_count + 1

    # Get the new produce details
    produce_id = agrichain_contract.getTotalProduces()
    produce = agrichain_contract.getProduceDetails(produce_id)

    assert produce[2] == "Fresh Apples"  # name
    assert produce[3] == 50  # quantity
    assert produce[4] == 2000000000000000  # price_per_unit
    assert produce[5] == 50 * 2000000000000000  # total_price
    assert produce[6] == False  # is_sold

def test_list_produce_validation(agrichain_contract):
    """Test produce listing validation"""

    # Test empty name
    with pytest.raises(Exception):
        agrichain_contract.listProduce("", 10, 1000)

    # Test zero quantity
    with pytest.raises(Exception):
        agrichain_contract.listProduce("Test Produce", 0, 1000)

    # Test zero price
    with pytest.raises(Exception):
        agrichain_contract.listProduce("Test Produce", 10, 0)

def test_get_available_produces(agrichain_contract):
    """Test getting available produces"""
    # List a new produce
    agrichain_contract.listProduce("Organic Carrots", 30, 1500000000000000)

    available = agrichain_contract.getAvailableProduces()
    assert len(available) >= 2  # At least the deployment produce + new one

    # All available produces should not be sold
    for produce_id in available:
        assert not agrichain_contract.isProduceSold(produce_id)

def test_farmer_produces_tracking(agrichain_contract):
    """Test farmer produce tracking"""
    # Get the deployer address (which is the farmer in our tests)
    farmer_address = boa.env.eoa

    initial_farmer_produces = agrichain_contract.getFarmerProduces(farmer_address)
    initial_count = len(initial_farmer_produces)

    # List new produce
    agrichain_contract.listProduce("Sweet Corn", 75, 1200000000000000)

    # Check farmer's produces
    farmer_produces = agrichain_contract.getFarmerProduces(farmer_address)
    assert len(farmer_produces) == initial_count + 1

def test_buy_produce(agrichain_contract):
    """Test buyer purchasing produce"""
    # Get initial farmer address
    farmer_address = boa.env.eoa

    # Create a buyer address (we'll use a different address for testing)
    buyer_address = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"  # Second Anvil account

    # Give the buyer some ETH for testing
    boa.env.set_balance(buyer_address, 10**18)  # 1 ETH

    # List a produce as farmer
    agrichain_contract.listProduce("Fresh Strawberries", 25, 2000000000000000)  # 25 kg at 0.002 ETH per kg
    produce_id = agrichain_contract.getTotalProduces()

    # Get produce details before purchase
    produce_before = agrichain_contract.getProduceDetails(produce_id)
    total_price = produce_before[5]  # total_price field

    # Verify initial state
    assert produce_before[6] == False  # is_sold should be False
    assert produce_before[7] == "0x0000000000000000000000000000000000000000"  # buyer should be empty
    assert produce_before[9] == 0  # sold_timestamp should be 0

    # Get initial farmer balance
    farmer_balance_before = boa.env.get_balance(farmer_address)

    # Switch to buyer account and purchase the produce
    with boa.env.prank(buyer_address):
        agrichain_contract.buyProduce(produce_id, value=total_price)

    # Verify produce is now sold
    produce_after = agrichain_contract.getProduceDetails(produce_id)
    assert produce_after[6] == True  # is_sold should be True
    assert produce_after[7] == buyer_address  # buyer should be set
    assert produce_after[9] > 0  # sold_timestamp should be set

    # Verify the produce is no longer in available list
    available_produces = agrichain_contract.getAvailableProduces()
    assert produce_id not in available_produces

    # Verify buyer's purchase history
    buyer_purchases = agrichain_contract.getBuyerPurchases(buyer_address)
    assert produce_id in buyer_purchases

    # Verify farmer received payment
    farmer_balance_after = boa.env.get_balance(farmer_address)
    assert farmer_balance_after == farmer_balance_before + total_price

def test_buy_produce_validation(agrichain_contract):
    """Test buy produce validation and error cases"""
    # Create buyer addresses
    buyer_address = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"  # Third Anvil account
    buyer2_address = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"  # Fourth Anvil account

    # Give the buyers some ETH for testing
    boa.env.set_balance(buyer_address, 10**18)  # 1 ETH
    boa.env.set_balance(buyer2_address, 10**18)  # 1 ETH

    # List a produce
    agrichain_contract.listProduce("Test Produce", 10, 1000000000000000)
    produce_id = agrichain_contract.getTotalProduces()
    produce_details = agrichain_contract.getProduceDetails(produce_id)
    total_price = produce_details[5]

    with boa.env.prank(buyer_address):
        # Test buying non-existent produce
        with pytest.raises(Exception):
            agrichain_contract.buyProduce(999999, value=total_price)

        # Test buying with incorrect payment amount (too little)
        with pytest.raises(Exception):
            agrichain_contract.buyProduce(produce_id, value=total_price - 1)

        # Test buying with incorrect payment amount (too much)
        with pytest.raises(Exception):
            agrichain_contract.buyProduce(produce_id, value=total_price + 1)

    # Test farmer trying to buy their own produce
    with pytest.raises(Exception):
        agrichain_contract.buyProduce(produce_id, value=total_price)

    # Successfully buy the produce
    with boa.env.prank(buyer_address):
        agrichain_contract.buyProduce(produce_id, value=total_price)

    # Test buying already sold produce
    with boa.env.prank(buyer2_address):
        with pytest.raises(Exception):
            agrichain_contract.buyProduce(produce_id, value=total_price)

def test_invalid_produce_id(agrichain_contract):
    """Test invalid produce ID handling"""

    # Test getting details for non-existent produce
    with pytest.raises(Exception):
        agrichain_contract.getProduceDetails(999999)

    # Test checking sold status for non-existent produce
    with pytest.raises(Exception):
        agrichain_contract.isProduceSold(999999)
