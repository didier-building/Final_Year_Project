/**
 * Web3 service for interacting with MetaMask and smart contracts
 */
import { ethers } from 'ethers';
import { NETWORKS, addNetworkToMetaMask, getCurrentNetwork } from '../config/networks';

// Complete AgriChain Contract ABI
const AGRICHAIN_ABI = [
  {
    "name": "ProduceListed",
    "inputs": [
      {"name": "produce_id", "type": "uint256", "indexed": true},
      {"name": "farmer", "type": "address", "indexed": true},
      {"name": "name", "type": "string", "indexed": false},
      {"name": "quantity", "type": "uint256", "indexed": false},
      {"name": "price_per_unit", "type": "uint256", "indexed": false},
      {"name": "total_price", "type": "uint256", "indexed": false},
      {"name": "timestamp", "type": "uint256", "indexed": false}
    ],
    "anonymous": false,
    "type": "event"
  },
  {
    "name": "ProduceSold",
    "inputs": [
      {"name": "produce_id", "type": "uint256", "indexed": true},
      {"name": "farmer", "type": "address", "indexed": true},
      {"name": "buyer", "type": "address", "indexed": true},
      {"name": "name", "type": "string", "indexed": false},
      {"name": "quantity", "type": "uint256", "indexed": false},
      {"name": "total_price", "type": "uint256", "indexed": false},
      {"name": "timestamp", "type": "uint256", "indexed": false}
    ],
    "anonymous": false,
    "type": "event"
  },
  {
    "stateMutability": "nonpayable",
    "type": "function",
    "name": "listProduce",
    "inputs": [
      {"name": "produce_name", "type": "string"},
      {"name": "quantity", "type": "uint256"},
      {"name": "price_per_unit", "type": "uint256"}
    ],
    "outputs": []
  },
  {
    "stateMutability": "payable",
    "type": "function",
    "name": "buyProduce",
    "inputs": [{"name": "produce_id", "type": "uint256"}],
    "outputs": []
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "getProduceDetails",
    "inputs": [{"name": "produce_id", "type": "uint256"}],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "components": [
          {"name": "id", "type": "uint256"},
          {"name": "farmer", "type": "address"},
          {"name": "name", "type": "string"},
          {"name": "quantity", "type": "uint256"},
          {"name": "price_per_unit", "type": "uint256"},
          {"name": "total_price", "type": "uint256"},
          {"name": "is_sold", "type": "bool"},
          {"name": "buyer", "type": "address"},
          {"name": "listed_timestamp", "type": "uint256"},
          {"name": "sold_timestamp", "type": "uint256"}
        ]
      }
    ]
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "getAvailableProduces",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256[]"}]
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "getFarmerProduces",
    "inputs": [{"name": "farmer", "type": "address"}],
    "outputs": [{"name": "", "type": "uint256[]"}]
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "getBuyerPurchases",
    "inputs": [{"name": "buyer", "type": "address"}],
    "outputs": [{"name": "", "type": "uint256[]"}]
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "getTotalProduces",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}]
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "isProduceSold",
    "inputs": [{"name": "produce_id", "type": "uint256"}],
    "outputs": [{"name": "", "type": "bool"}]
  }
];

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
    this.network = null;
  }

  /**
   * Check if MetaMask is installed
   */
  isMetaMaskInstalled() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  /**
   * Connect to MetaMask
   */
  async connectWallet() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask not installed. Please install MetaMask to continue.');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      // Set up provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.account = accounts[0];

      // Check network
      const network = await this.provider.getNetwork();
      this.network = network.chainId.toString();

      return {
        account: this.account,
        network: this.network
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Switch to correct network
   */
  async switchToNetwork(networkKey) {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask not installed');
    }

    try {
      await addNetworkToMetaMask(networkKey);
      
      // Reconnect after network switch
      await this.connectWallet();
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Initialize contract
   */
  initContract(contractAddress) {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    this.contract = new ethers.Contract(contractAddress, AGRICHAIN_ABI, this.signer);
  }

  /**
   * List a new produce
   */
  async listProduce(name, quantity, pricePerUnitEth) {
    if (!this.contract) {
      console.error('Contract not initialized in listProduce');
      throw new Error('Contract not initialized');
    }
    try {
      const pricePerUnitWei = ethers.parseEther(pricePerUnitEth.toString());
      console.log('Calling contract.listProduce with:', { name, quantity, pricePerUnitWei: pricePerUnitWei.toString() });
      const tx = await this.contract.listProduce(name, quantity, pricePerUnitWei);
      console.log('Transaction sent, tx:', tx);
      const receipt = await tx.wait();
      console.log('Transaction confirmed, receipt:', receipt);
      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Error in contract.listProduce:', error);
      throw error;
    }
  }

  /**
   * Buy a produce
   */
  async buyProduce(produceId, totalPriceEth) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const totalPriceWei = ethers.parseEther(totalPriceEth.toString());
      
      const tx = await this.contract.buyProduce(produceId, {
        value: totalPriceWei
      });
      const receipt = await tx.wait();
      
      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available produces
   */
  async getAvailableProduces() {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const produces = await this.contract.getAvailableProduces();
      return produces.map(id => id.toString());
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get produce details
   */
  async getProduceDetails(produceId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const details = await this.contract.getProduceDetails(produceId);
      
      return {
        id: details[0].toString(),
        farmer: details[1],
        name: details[2],
        quantity: details[3].toString(),
        pricePerUnit: details[4].toString(),
        totalPrice: details[5].toString(),
        isSold: details[6],
        buyer: details[7],
        listedTimestamp: details[8].toString(),
        soldTimestamp: details[9].toString(),
        // Convenience fields
        pricePerUnitEth: ethers.formatEther(details[4]),
        totalPriceEth: ethers.formatEther(details[5])
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Listen for account changes
   */
  onAccountsChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback);
    }
  }

  /**
   * Listen for network changes
   */
  onChainChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback);
    }
  }

  /**
   * Disconnect wallet
   */
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
    this.network = null;
  }
}

// Export singleton instance
export const web3Service = new Web3Service();
export default web3Service;
