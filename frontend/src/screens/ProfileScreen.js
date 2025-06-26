/**
 * Profile Screen - User profile and app information
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWeb3 } from '../hooks/useWeb3';
import WalletConnect from '../components/WalletConnect';
import { userAPI } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const {
    account,
    isConnected,
    network,
    balance,
    isCorrectNetwork,
    networkName,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  } = useWeb3();

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && account) {
      loadUserProfile();
    }
  }, [isConnected, account]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      // Load user profile from API
      const response = await userAPI.getProfile();
      setUserProfile(response.data);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      Alert.alert('Error', 'Failed to load your profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturePress = (feature) => {
    if (!isConnected) {
      Alert.alert('Wallet Required', 'Please connect your wallet to access this feature.');
      return;
    }
    Alert.alert('Coming Soon', `${feature} feature will be available in future updates!`);
  };

  const handleWalletPress = () => {
    if (!isConnected) {
      connectWallet();
    } else {
      Alert.alert(
        'Wallet Connected',
        `Address: ${account}\nBalance: ${parseFloat(balance).toFixed(4)} ETH\nNetwork: ${networkName}`,
        [
          { text: 'Disconnect', onPress: disconnectWallet, style: 'destructive' },
          { text: 'OK', style: 'default' }
        ]
      );
    }
  };

  const handleNetworkPress = () => {
    if (!isConnected) {
      Alert.alert('Wallet Required', 'Please connect your wallet first.');
      return;
    }

    if (!isCorrectNetwork) {
      Alert.alert(
        'Wrong Network',
        `You're connected to ${networkName}. Switch to Sepolia testnet?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Switch', onPress: switchNetwork }
        ]
      );
    } else {
      Alert.alert('Network Status', `Connected to ${networkName} ✅`);
    }
  };

  const renderProfileItem = (icon, title, subtitle, onPress) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={24} color="#2E7D32" />
        <View style={styles.itemText}>
          <Text style={styles.itemTitle}>{title}</Text>
          {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Wallet Connection Section */}
      <WalletConnect style={styles.walletSection} />

      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#2E7D32" />
        </View>
        <Text style={styles.userName}>
          {userProfile?.username || 'Connect Wallet'}
        </Text>
        <Text style={styles.userType}>
          {userProfile?.userType || 'Please connect your wallet to continue'}
        </Text>
        {userProfile?.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        {renderProfileItem(
          'wallet-outline',
          'Wallet Address',
          isConnected ? `${account?.slice(0, 6)}...${account?.slice(-4)}` : 'Not connected',
          handleWalletPress
        )}
        
        {renderProfileItem(
          'person-outline',
          'Edit Profile',
          'Update your information',
          () => handleFeaturePress('Profile Editing')
        )}
        
        {renderProfileItem(
          'shield-checkmark-outline',
          'Verification',
          'Verify your identity',
          () => handleFeaturePress('Identity Verification')
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Farm Details</Text>
        
        {renderProfileItem(
          'leaf-outline',
          'Farm Information',
          userProfile?.farmDetails?.farmName || 'Set up your farm',
          () => handleFeaturePress('Farm Management')
        )}

        {renderProfileItem(
          'ribbon-outline',
          'Certifications',
          userProfile?.farmDetails?.farmingType || 'Add certifications',
          () => handleFeaturePress('Certifications')
        )}

        {renderProfileItem(
          'location-outline',
          'Farm Location',
          userProfile?.farmDetails?.hasLocation ? 'Location set' : 'Set your farm location',
          () => handleFeaturePress('Location Settings')
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Blockchain</Text>
        
        {renderProfileItem(
          'link-outline',
          'Transaction History',
          'View all blockchain transactions',
          () => {
            if (!isConnected) {
              Alert.alert('Wallet Required', 'Please connect your wallet to view transaction history.');
              return;
            }
            navigation.navigate('TransactionHistory');
          }
        )}
        
        {renderProfileItem(
          'server-outline',
          'Network Settings',
          isConnected ? `${networkName} ${isCorrectNetwork ? '✅' : '⚠️'}` : 'Not connected',
          handleNetworkPress
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        {renderProfileItem(
          'help-circle-outline',
          'Help & FAQ',
          'Get help using AgriChain',
          () => handleFeaturePress('Help Center')
        )}
        
        {renderProfileItem(
          'mail-outline',
          'Contact Support',
          'Get in touch with our team',
          () => handleFeaturePress('Contact Support')
        )}
        
        {renderProfileItem(
          'information-circle-outline',
          'About AgriChain',
          'Learn more about our platform',
          () => Alert.alert(
            'About AgriChain',
            'AgriChain is a blockchain-based agricultural marketplace that connects farmers directly with buyers, ensuring transparency and fair pricing.\n\nVersion: 1.0.0\nBuilt with React Native & Django'
          )
        )}
      </View>

      <View style={styles.appInfo}>
        <Text style={styles.appVersion}>AgriChain v1.0.0</Text>
        <Text style={styles.appDescription}>
          Connecting farmers and buyers through blockchain technology
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  walletSection: {
    margin: 16,
    marginBottom: 0,
  },
  header: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userType: {
    fontSize: 16,
    color: '#666',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemText: {
    marginLeft: 16,
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  appVersion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
