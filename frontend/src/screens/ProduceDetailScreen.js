/**
 * Produce Detail Screen - View and purchase specific produce
 */
import React, { useState } from 'react';
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
import { produceAPI, apiUtils } from '../services/api';
import { web3Service } from '../services/web3Service';

export default function ProduceDetailScreen({ route, navigation }) {
  const { produce } = route.params;
  const [loading, setLoading] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  // Helper to initialize contract if needed
  const ensureContract = async () => {
    if (!web3Service.contract) {
      await web3Service.connectWallet();
      web3Service.initContract(produce.contract_address);
    }
  };

  const handlePurchase = async () => {
    Alert.alert('DEBUG', 'handlePurchase called');
    if (!web3Service.isMetaMaskInstalled()) {
      Alert.alert(
        'MetaMask Not Detected',
        'MetaMask is not installed or not available in this browser. Please use a web browser with MetaMask installed.'
      );
      return;
    }
    Alert.alert(
      'Confirm Purchase',
      `Are you sure you want to purchase ${produce.name} for ${apiUtils.formatPrice(produce.total_price_eth)} ETH?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Purchase', onPress: confirmPurchase },
      ]
    );
  };

  const confirmPurchase = async () => {
    if (!web3Service.contract) {
      Alert.alert(
        'Contract Not Initialized',
        'The smart contract is not initialized. Please refresh the page or reconnect your wallet.'
      );
      return;
    }
    try {
      setLoading(true);
      await ensureContract();
      // Call MetaMask buyProduce
      console.log('[DEBUG] Calling buyProduce with:', produce.blockchain_id, produce.total_price_eth);
      const txResult = await web3Service.buyProduce(produce.blockchain_id, produce.total_price_eth);
      console.log('[DEBUG] Transaction result:', txResult);
      // Notify backend to update DB (optional, if needed)
      await produceAPI.purchase(produce.id, {
        transaction_hash: txResult.transactionHash,
      });
      Alert.alert(
        'Purchase Submitted!',
        `Your purchase has been submitted to the blockchain.\n\nTransaction Hash: ${txResult.transactionHash}\n\nPlease wait for confirmation.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowPurchaseForm(false);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('[ERROR] MetaMask buyProduce failed:', error);
      const errorInfo = apiUtils.handleError(error);
      Alert.alert('Purchase Failed', errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const renderDetailRow = (icon, label, value, valueStyle = {}) => (
    <View style={styles.detailRow}>
      <View style={styles.detailLabel}>
        <Ionicons name={icon} size={20} color="#2E7D32" />
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <Text style={[styles.valueText, valueStyle]}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{produce.name}</Text>
        <View style={[
          styles.statusBadge,
          produce.is_sold ? styles.soldBadge : styles.availableBadge
        ]}>
          <Text style={styles.statusText}>
            {produce.is_sold ? 'SOLD' : 'AVAILABLE'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📊 Produce Information</Text>
        
        {renderDetailRow('scale-outline', 'Quantity', `${produce.quantity} kg`)}
        {renderDetailRow('diamond-outline', 'Price per kg', `${apiUtils.formatPrice(produce.price_per_unit_eth)} ETH`)}
        {renderDetailRow('wallet-outline', 'Total Price', `${apiUtils.formatPrice(produce.total_price_eth)} ETH`, styles.priceHighlight)}
        {renderDetailRow('time-outline', 'Listed Date', apiUtils.formatTimestamp(produce.listed_timestamp))}
        
        {produce.is_sold && produce.sold_timestamp && 
          renderDetailRow('checkmark-circle-outline', 'Sold Date', apiUtils.formatTimestamp(produce.sold_timestamp))
        }
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>👨‍🌾 Farmer Information</Text>
        
        {renderDetailRow('person-outline', 'Farmer Address', apiUtils.formatAddress(produce.farmer_address))}
        {produce.farmer_username && 
          renderDetailRow('at-outline', 'Username', produce.farmer_username)
        }
      </View>

      {produce.buyer_address && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🛒 Buyer Information</Text>
          
          {renderDetailRow('person-outline', 'Buyer Address', apiUtils.formatAddress(produce.buyer_address))}
          {produce.buyer_username && 
            renderDetailRow('at-outline', 'Username', produce.buyer_username)
          }
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>⛓️ Blockchain Information</Text>
        
        {renderDetailRow('link-outline', 'Blockchain ID', `#${produce.blockchain_id}`)}
        {renderDetailRow('server-outline', 'Contract', apiUtils.formatAddress(produce.contract_address))}
      </View>

      {!produce.is_sold && (
        <View style={styles.purchaseSection}>
          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={handlePurchase}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="card-outline" size={24} color="white" />
                <Text style={styles.purchaseButtonText}>
                  Purchase for {apiUtils.formatPrice(produce.total_price_eth)} ETH
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  availableBadge: {
    backgroundColor: '#4CAF50',
  },
  soldBadge: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  labelText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  valueText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  priceHighlight: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 18,
  },
  purchaseSection: {
    margin: 16,
  },
  purchaseButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
