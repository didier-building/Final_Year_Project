import pytest
from script.deploy import deploy

@pytest.fixture
def agrichain_contract():
    """Deploy AgriChain contract for testing"""
    return deploy()