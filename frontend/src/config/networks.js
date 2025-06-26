/**
 * Network configurations for MetaMask and other wallets
 */

export const NETWORKS = {
  // Local Development (Anvil)
  anvil: {
    chainId: '0x7A69', // 31337 in hex
    chainName: 'Anvil Local',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['http://127.0.0.1:8545'],
    blockExplorerUrls: null, // No explorer for local
  },
  
  // Sepolia Testnet
  sepolia: {
    chainId: '0xAA36A7', // 11155111 in hex
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [
      'https://eth-sepolia.g.alchemy.com/v2/z4apY4f867mavN6qu0m9dY0NqMbpgopv',
      'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
      'https://ethereum-sepolia-rpc.publicnode.com'
    ],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  }
};

export const DEFAULT_NETWORK = process.env.EXPO_PUBLIC_NETWORK || 'anvil';

/**
 * Add network to MetaMask
 */
export const addNetworkToMetaMask = async (networkKey) => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  const network = NETWORKS[networkKey];
  if (!network) {
    throw new Error(`Network ${networkKey} not found`);
  }

  try {
    // Try to switch to the network first
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainId }],
    });
  } catch (switchError) {
    // If network doesn't exist, add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [network],
      });
    } else {
      throw switchError;
    }
  }
};

/**
 * Get current network from MetaMask
 */
export const getCurrentNetwork = async () => {
  if (!window.ethereum) {
    return null;
  }

  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  return Object.keys(NETWORKS).find(key => NETWORKS[key].chainId === chainId);
};
