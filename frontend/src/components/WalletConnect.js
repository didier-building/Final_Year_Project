/**
 * Wallet connection component for MetaMask integration
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWeb3 } from '../hooks/useWeb3';

const WalletConnect = ({ style }) => {
  const {
    account,
    isConnected,
    isConnecting,
    error,
    balance,
    isCorrectNetwork,
    networkName,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    isMetaMaskInstalled,
    isContractAddressValid,
    contractAddress
  } = useWeb3();

  const [showDisconnectInfo, setShowDisconnectInfo] = useState(false);

  const handleConnect = async () => {
    if (!isMetaMaskInstalled) {
      Alert.alert(
        'MetaMask Required',
        'Please install MetaMask browser extension or use MetaMask mobile browser to connect your wallet.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await connectWallet();
    } catch (err) {
      Alert.alert('Connection Failed', err.message);
    }
  };

  const handleNetworkSwitch = async () => {
    try {
      await switchNetwork();
    } catch (err) {
      Alert.alert('Network Switch Failed', err.message);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet? You will need to reconnect to use the marketplace. To fully disconnect, you must also remove this site from MetaMask\'s connected sites.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', onPress: () => {
            disconnectWallet();
            setShowDisconnectInfo(true);
          }, style: 'destructive' }
      ]
    );
  };

  const formatAddress = (address) => {
    if (!address) return '';
    
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    return parseFloat(balance).toFixed(4);
  };

  if (!isConnected) {
    return (
      <View style={[styles.container, style]}>
        {/* Contract address warning */}
        {!isContractAddressValid && (
          <Text style={styles.errorText}>
            Contract address is missing or invalid. Please check your .env and restart the app.
          </Text>
        )}
        <TouchableOpacity
          style={styles.connectButton}
          onPress={handleConnect}
          disabled={isConnecting}
        >
          <Ionicons name="wallet-outline" size={24} color="white" />
          <Text style={styles.connectButtonText}>
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Text>
        </TouchableOpacity>
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        {showDisconnectInfo && (
          <Text style={styles.infoText}>
            To fully disconnect, open MetaMask, go to Settings {'>'} Connections, and remove this site from your connected sites. {'\n'}
            <Text style={{color: '#1976D2', textDecorationLine: 'underline'}} onPress={() => window.open('https://metamask.io/faq#how-do-i-disconnect-a-website-from-my-wallet', '_blank')}>Learn how</Text>
          </Text>
        )}
        {!isMetaMaskInstalled && (
          <Text style={styles.warningText}>
            MetaMask not detected. Please install MetaMask to continue.
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Connected Wallet Info */}
      <View style={styles.walletInfo}>
        <View style={styles.walletHeader}>
          <Ionicons name="wallet" size={20} color="#2E7D32" />
          <Text style={styles.walletTitle}>Connected Wallet</Text>
        </View>
        
        <Text style={styles.address}>{formatAddress(account)}</Text>
        <Text style={styles.balance}>{formatBalance(balance)} ETH</Text>
      </View>

      {/* Network Status */}
      <View style={styles.networkInfo}>
        <View style={styles.networkHeader}>
          <Ionicons 
            name="globe-outline" 
            size={16} 
            color={isCorrectNetwork ? "#2E7D32" : "#F57C00"} 
          />
          <Text style={[
            styles.networkText,
            { color: isCorrectNetwork ? "#2E7D32" : "#F57C00" }
          ]}>
            {networkName || 'Unknown Network'}
          </Text>
        </View>
        
        {!isCorrectNetwork && (
          <TouchableOpacity
            style={styles.switchButton}
            onPress={handleNetworkSwitch}
          >
            <Text style={styles.switchButtonText}>Switch Network</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Disconnect Button */}
      <TouchableOpacity
        style={styles.disconnectButton}
        onPress={handleDisconnect}
      >
        <Ionicons name="log-out-outline" size={16} color="#D32F2F" />
        <Text style={styles.disconnectButtonText}>Disconnect Wallet</Text>
      </TouchableOpacity>
      {showDisconnectInfo && (
        <Text style={styles.infoText}>
          You have disconnected from the app. To fully disconnect, open MetaMask, go to Settings {'>'} Connections, and remove this site from your connected sites. {'\n'}
          <Text style={{color: '#1976D2', textDecorationLine: 'underline'}} onPress={() => window.open('https://metamask.io/faq#how-do-i-disconnect-a-website-from-my-wallet', '_blank')}>Learn how</Text>
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  connectButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  walletInfo: {
    marginBottom: 12,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  address: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  balance: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  networkInfo: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  networkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  networkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  switchButton: {
    backgroundColor: '#F57C00',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  switchButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    marginTop: 8,
  },
  disconnectButtonText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  warningText: {
    color: '#F57C00',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  infoText: {
    color: '#1976D2',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default WalletConnect;
