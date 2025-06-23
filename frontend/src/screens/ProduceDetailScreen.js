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
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { produceAPI, apiUtils } from '../services/api';

export default function ProduceDetailScreen({ route, navigation }) {
  const { produce } = route.params;
  const [loading, setLoading] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  const handlePurchase = async () => {
    if (!privateKey.trim()) {
      Alert.alert('Error', 'Please enter your private key');
      return;
    }

    if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
      Alert.alert('Error', 'Invalid private key format');
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
    try {
      setLoading(true);
      const response = await produceAPI.purchase(produce.id, {
        buyer_private_key: privateKey,
      });

      Alert.alert(
        'Purchase Submitted!',
        `Your purchase has been submitted to the blockchain.\n\nTransaction Hash: ${response.data.transaction_hash}\n\nPlease wait for confirmation.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowPurchaseForm(false);
              setPrivateKey('');
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
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
          {!showPurchaseForm ? (
            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={() => setShowPurchaseForm(true)}
            >
              <Ionicons name="card-outline" size={24} color="white" />
              <Text style={styles.purchaseButtonText}>
                Purchase for {apiUtils.formatPrice(produce.total_price_eth)} ETH
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.purchaseForm}>
              <Text style={styles.formTitle}>🔐 Enter Your Private Key</Text>
              <Text style={styles.formSubtitle}>
                Your private key is needed to sign the blockchain transaction
              </Text>
              
              <TextInput
                style={styles.privateKeyInput}
                placeholder="0x..."
                value={privateKey}
                onChangeText={setPrivateKey}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowPurchaseForm(false);
                    setPrivateKey('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    loading && styles.disabledButton
                  ]}
                  onPress={loading ? undefined : handlePurchase}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-outline" size={20} color="white" />
                      <Text style={styles.confirmButtonText}>Confirm Purchase</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  purchaseForm: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  privateKeyInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
