# pragma version 0.4.0
# @license MIT

# AgriChain: Blockchain-Based Agricultural Supply Chain Platform
# Smart contract for direct farmer-to-buyer agricultural marketplace

# ============================================================================
# STRUCTS AND STATE VARIABLES
# ============================================================================

struct Produce:
    id: uint256
    farmer: address
    name: String[100]
    quantity: uint256  # in kg or units
    price_per_unit: uint256  # price in wei per unit
    total_price: uint256  # total price in wei
    is_sold: bool
    buyer: address
    listed_timestamp: uint256
    sold_timestamp: uint256

# State variables
produce_counter: public(uint256)
produces: public(HashMap[uint256, Produce])
farmer_produces: public(HashMap[address, DynArray[uint256, 1000]])  # farmer -> produce IDs
buyer_purchases: public(HashMap[address, DynArray[uint256, 1000]])  # buyer -> produce IDs

# ============================================================================
# EVENTS
# ============================================================================

event ProduceListed:
    produce_id: indexed(uint256)
    farmer: indexed(address)
    name: String[100]
    quantity: uint256
    price_per_unit: uint256
    total_price: uint256
    timestamp: uint256

event ProduceSold:
    produce_id: indexed(uint256)
    farmer: indexed(address)
    buyer: indexed(address)
    name: String[100]
    quantity: uint256
    total_price: uint256
    timestamp: uint256

# ============================================================================
# CONSTRUCTOR
# ============================================================================

@deploy
def __init__():
    """Initialize the AgriChain contract"""
    self.produce_counter = 0

# ============================================================================
# CORE FUNCTIONS
# ============================================================================

@external
def listProduce(produce_name: String[100], quantity: uint256, price_per_unit: uint256):
    """
    Farmer lists new produce for sale

    Args:
        produce_name: Name/description of the produce
        quantity: Quantity available (in kg or units)
        price_per_unit: Price per unit in wei
    """
    # Validation
    assert len(produce_name) > 0, "Produce name cannot be empty"
    assert quantity > 0, "Quantity must be greater than 0"
    assert price_per_unit > 0, "Price per unit must be greater than 0"

    # Calculate total price
    total_price: uint256 = quantity * price_per_unit

    # Increment counter and create new produce
    self.produce_counter += 1
    produce_id: uint256 = self.produce_counter

    # Create produce struct
    new_produce: Produce = Produce(
        id=produce_id,
        farmer=msg.sender,
        name=produce_name,
        quantity=quantity,
        price_per_unit=price_per_unit,
        total_price=total_price,
        is_sold=False,
        buyer=empty(address),
        listed_timestamp=block.timestamp,
        sold_timestamp=0
    )

    # Store produce
    self.produces[produce_id] = new_produce
    self.farmer_produces[msg.sender].append(produce_id)

    # Emit event
    log ProduceListed(produce_id, msg.sender, produce_name, quantity, price_per_unit, total_price, block.timestamp)

@external
@payable
def buyProduce(produce_id: uint256):
    """
    Buyer purchases produce and transfers ETH to farmer

    Args:
        produce_id: ID of the produce to purchase
    """
    # Validation
    assert produce_id > 0 and produce_id <= self.produce_counter, "Invalid produce ID"

    produce: Produce = self.produces[produce_id]
    assert not produce.is_sold, "Produce already sold"
    assert produce.farmer != msg.sender, "Farmer cannot buy their own produce"
    assert msg.value == produce.total_price, "Incorrect payment amount"

    # Update produce status
    self.produces[produce_id].is_sold = True
    self.produces[produce_id].buyer = msg.sender
    self.produces[produce_id].sold_timestamp = block.timestamp

    # Add to buyer's purchase history
    self.buyer_purchases[msg.sender].append(produce_id)

    # Transfer payment to farmer
    send(produce.farmer, msg.value)

    # Emit event
    log ProduceSold(produce_id, produce.farmer, msg.sender, produce.name, produce.quantity, produce.total_price, block.timestamp)

@external
@view
def getProduceDetails(produce_id: uint256) -> Produce:
    """
    Get full traceable details of a produce item

    Args:
        produce_id: ID of the produce

    Returns:
        Produce struct with all details
    """
    assert produce_id > 0 and produce_id <= self.produce_counter, "Invalid produce ID"
    return self.produces[produce_id]

# ============================================================================
# VIEW FUNCTIONS
# ============================================================================

@external
@view
def getAvailableProduces() -> DynArray[uint256, 1000]:
    """
    Get all available (unsold) produce IDs

    Returns:
        Array of available produce IDs
    """
    available: DynArray[uint256, 1000] = []

    for i: uint256 in range(1, 1001):  # Max 1000 produces
        if i > self.produce_counter:
            break
        if not self.produces[i].is_sold:
            available.append(i)

    return available

@external
@view
def getFarmerProduces(farmer: address) -> DynArray[uint256, 1000]:
    """
    Get all produce IDs listed by a specific farmer

    Args:
        farmer: Address of the farmer

    Returns:
        Array of produce IDs listed by the farmer
    """
    return self.farmer_produces[farmer]

@external
@view
def getBuyerPurchases(buyer: address) -> DynArray[uint256, 1000]:
    """
    Get all produce IDs purchased by a specific buyer

    Args:
        buyer: Address of the buyer

    Returns:
        Array of produce IDs purchased by the buyer
    """
    return self.buyer_purchases[buyer]

@external
@view
def getTotalProduces() -> uint256:
    """
    Get total number of produces listed

    Returns:
        Total produce count
    """
    return self.produce_counter

@external
@view
def isProduceSold(produce_id: uint256) -> bool:
    """
    Check if a produce is sold

    Args:
        produce_id: ID of the produce

    Returns:
        True if sold, False if available
    """
    assert produce_id > 0 and produce_id <= self.produce_counter, "Invalid produce ID"
    return self.produces[produce_id].is_sold
