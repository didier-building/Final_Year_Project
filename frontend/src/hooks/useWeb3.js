/**
 * React hook for Web3/MetaMask integration
 */
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { web3Service } from '../services/web3Service';
import { NETWORKS, DEFAULT_NETWORK } from '../config/networks';

export const useWeb3 = () => {
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState('0');

  // Contract configuration
  const CONTRACT_ADDRESS = process.env.EXPO_PUBLIC_CONTRACT_ADDRESS;
  const REQUIRED_NETWORK = process.env.EXPO_PUBLIC_NETWORK || DEFAULT_NETWORK;
  const isContractAddressValid = !!CONTRACT_ADDRESS && /^0x[a-fA-F0-9]{40}$/.test(CONTRACT_ADDRESS);

  /**
   * Connect to MetaMask
   */
  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const result = await web3Service.connectWallet();
      setAccount(result.account);
      setNetwork(result.network);
      setIsConnected(true);
      // Always initialize contract after connect
      if (CONTRACT_ADDRESS) {
        console.log('Initializing contract with address:', CONTRACT_ADDRESS);
        web3Service.initContract(CONTRACT_ADDRESS);
      } else {
        console.warn('No contract address found in environment variables!');
      }
      if (web3Service.provider) {
        const balanceWei = await web3Service.provider.getBalance(result.account);
        setBalance(ethers.formatEther(balanceWei));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  }, [CONTRACT_ADDRESS]);

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(() => {
    web3Service.disconnect();
    setAccount(null);
    setNetwork(null);
    setIsConnected(false);
    setBalance('0');
    setError(null);
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  }, []);

  /**
   * Handle account changes
   */
  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      web3Service.disconnect();
      setAccount(null);
      setNetwork(null);
      setIsConnected(false);
      setBalance('0');
      setError(null);
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      if (web3Service.provider) {
        web3Service.provider.getBalance(accounts[0]).then(balanceWei => {
          setBalance(ethers.formatEther(balanceWei));
        });
      }
    }
  }, [account]);

  /**
   * Handle network changes
   */
  const handleChainChanged = useCallback((chainId) => {
    setNetwork(chainId);
    if (isConnected) {
      connectWallet();
    }
  }, [isConnected, connectWallet]);

  /**
   * Switch to required network
   */
  const switchNetwork = useCallback(async () => {
    setError(null);
    try {
      await web3Service.switchToNetwork(REQUIRED_NETWORK);
      // Always re-initialize contract after network switch
      if (CONTRACT_ADDRESS) {
        console.log('Re-initializing contract after network switch with address:', CONTRACT_ADDRESS);
        web3Service.initContract(CONTRACT_ADDRESS);
      } else {
        console.warn('No contract address found in environment variables!');
      }
      await connectWallet();
    } catch (err) {
      setError(err.message);
    }
  }, [REQUIRED_NETWORK, connectWallet, CONTRACT_ADDRESS]);

  /**
   * Check if on correct network
   */
  const isCorrectNetwork = useCallback(() => {
    if (!network || !REQUIRED_NETWORK) return false;
    const requiredChainIdHex = NETWORKS[REQUIRED_NETWORK]?.chainId;
    let requiredChainIdNum = Number(requiredChainIdHex);
    if (isNaN(requiredChainIdNum) && typeof requiredChainIdHex === 'string' && requiredChainIdHex.startsWith('0x')) {
      requiredChainIdNum = parseInt(requiredChainIdHex, 16);
    }
    let currentChainIdNum = Number(network);
    if (isNaN(currentChainIdNum) && typeof network === 'string' && network.startsWith('0x')) {
      currentChainIdNum = parseInt(network, 16);
    }
    return currentChainIdNum === requiredChainIdNum;
  }, [network, REQUIRED_NETWORK]);

  /**
   * Check if already connected on mount
   */
  useEffect(() => {
    const checkConnection = async () => {
      if (web3Service.isMetaMaskInstalled()) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (err) {}
      }
    };
    checkConnection();
  }, [connectWallet]);

  /**
   * Set up event listeners
   */
  useEffect(() => {
    web3Service.onAccountsChanged(handleAccountsChanged);
    web3Service.onChainChanged(handleChainChanged);
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [handleAccountsChanged, handleChainChanged]);

  /**
   * Contract interaction methods
   */
  const listProduce = useCallback(async (name, quantity, pricePerUnitEth) => {
    const correctNetwork = isCorrectNetwork();
    if (!isConnected || !correctNetwork) {
      throw new Error('Please connect wallet and switch to correct network');
    }
    return await web3Service.listProduce(name, quantity, pricePerUnitEth);
  }, [isConnected, isCorrectNetwork]);

  const buyProduce = useCallback(async (produceId, totalPriceEth) => {
    if (!isConnected || !isCorrectNetwork()) {
      throw new Error('Please connect wallet and switch to correct network');
    }
    return await web3Service.buyProduce(produceId, totalPriceEth);
  }, [isConnected, isCorrectNetwork]);

  const getAvailableProduces = useCallback(async () => {
    if (!isConnected) {
      throw new Error('Please connect wallet');
    }
    return await web3Service.getAvailableProduces();
  }, [isConnected]);

  const getProduceDetails = useCallback(async (produceId) => {
    if (!isConnected) {
      throw new Error('Please connect wallet');
    }
    return await web3Service.getProduceDetails(produceId);
  }, [isConnected]);

  return {
    account,
    network,
    isConnected,
    isConnecting,
    error,
    balance,
    isCorrectNetwork: isCorrectNetwork(),
    requiredNetwork: REQUIRED_NETWORK,
    networkName: NETWORKS[REQUIRED_NETWORK]?.chainName,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    listProduce,
    buyProduce,
    getAvailableProduces,
    getProduceDetails,
    isMetaMaskInstalled: web3Service.isMetaMaskInstalled(),
    isContractAddressValid,
    contractAddress: CONTRACT_ADDRESS,
  };
};
