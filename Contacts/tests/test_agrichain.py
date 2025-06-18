import pytest
from moccasin.boa_tools import VyperContract

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
    import boa
    farmer_address = boa.env.eoa

    initial_farmer_produces = agrichain_contract.getFarmerProduces(farmer_address)
    initial_count = len(initial_farmer_produces)

    # List new produce
    agrichain_contract.listProduce("Sweet Corn", 75, 1200000000000000)

    # Check farmer's produces
    farmer_produces = agrichain_contract.getFarmerProduces(farmer_address)
    assert len(farmer_produces) == initial_count + 1

def test_invalid_produce_id(agrichain_contract):
    """Test invalid produce ID handling"""

    # Test getting details for non-existent produce
    with pytest.raises(Exception):
        agrichain_contract.getProduceDetails(999999)

    # Test checking sold status for non-existent produce
    with pytest.raises(Exception):
        agrichain_contract.isProduceSold(999999)