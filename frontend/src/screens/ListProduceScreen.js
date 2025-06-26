/**
 * List Produce Screen - Create new produce listings
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWeb3 } from '../hooks/useWeb3';
import { produceAPI, userAPI } from '../services/api';
import WalletConnect from '../components/WalletConnect';
import { web3Service } from '../services/web3Service';
import { colors, spacing, radii, font, shadow } from '../theme';

export default function ListProduceScreen({ navigation }) {
  const {
    account,
    isConnected,
    isCorrectNetwork,
    listProduce,
    connectWallet,
  } = useWeb3();

  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    price_per_unit_eth: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter a produce name');
      return false;
    }
    if (!formData.quantity || formData.quantity.trim() === '') {
      Alert.alert('Validation Error', 'Please enter quantity');
      return false;
    }
    if (isNaN(formData.quantity) || parseInt(formData.quantity) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid quantity (must be a positive number)');
      return false;
    }
    if (!formData.price_per_unit_eth || formData.price_per_unit_eth.trim() === '') {
      Alert.alert('Validation Error', 'Please enter price per unit');
      return false;
    }
    if (isNaN(formData.price_per_unit_eth) || parseFloat(formData.price_per_unit_eth) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price per unit (must be a positive number)');
      return false;
    }
    return true;
  };

  const calculateTotalPrice = () => {
    const quantity = parseInt(formData.quantity) || 0;
    const pricePerUnit = parseFloat(formData.price_per_unit_eth) || 0;
    const total = quantity * pricePerUnit;
    return isNaN(total) ? 0 : total;
  };

  const isFormValid = () => {
    return formData.name &&
           formData.name.trim() !== '' &&
           formData.quantity &&
           formData.quantity.trim() !== '' &&
           formData.price_per_unit_eth &&
           formData.price_per_unit_eth.trim() !== '' &&
           !isNaN(parseInt(formData.quantity)) &&
           parseInt(formData.quantity) > 0 &&
           !isNaN(parseFloat(formData.price_per_unit_eth)) &&
           parseFloat(formData.price_per_unit_eth) > 0;
  };

  const shouldShowSummary = () => {
    return isFormValid();
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    if (!validateForm()) {
      return;
    }
    if (!isConnected) {
      Alert.alert(
        'Wallet Required',
        'Please connect your MetaMask wallet to list produce.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Connect Wallet', onPress: connectWallet }
        ]
      );
      return;
    }
    if (!isCorrectNetwork) {
      Alert.alert(
        'Wrong Network',
        'Please switch to Sepolia testnet to list produce.',
        [{ text: 'OK' }]
      );
      return;
    }
    // Use window.confirm for web compatibility
    if (window.confirm(
      `List ${formData.name}?\n\nQuantity: ${formData.quantity} kg\nPrice per kg: ${formData.price_per_unit_eth} ETH\nTotal Value: ${calculateTotalPrice().toFixed(4)} ETH\n\nThis will create a blockchain transaction.`
    )) {
      submitListing();
    }
  };

  const submitListing = async () => {
    console.log('submitListing called');
    // Check if contract is initialized before listing
    if (!web3Service.contract) {
      Alert.alert(
        'Wallet/Contract Not Ready',
        'Smart contract is not initialized. Please reconnect your wallet or reload the app.'
      );
      return;
    }
    let errorCaught = false;
    try {
      setLoading(true);
      const name = formData.name.trim();
      const quantity = parseInt(formData.quantity);
      const pricePerUnitEth = parseFloat(formData.price_per_unit_eth);
      const result = await listProduce(name, quantity, pricePerUnitEth);
      if (typeof fetchProduces === 'function') {
        await fetchProduces();
      }
      const transaction = {
        id: Date.now(),
        type: 'list_produce',
        produceName: name,
        quantity,
        pricePerUnitEth,
        totalPriceEth: (quantity * pricePerUnitEth).toFixed(4),
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed,
        timestamp: new Date().toISOString(),
        network: 'sepolia',
        status: 'confirmed'
      };
      try {
        const existingTxs = JSON.parse(localStorage.getItem('agrichain_transactions') || '[]');
        existingTxs.unshift(transaction);
        localStorage.setItem('agrichain_transactions', JSON.stringify(existingTxs.slice(0, 50)));
      } catch (storageError) {}
      try {
        await produceAPI.syncFromBlockchain();
      } catch (syncError) {}
      Alert.alert(
        'Listing Successful! 🎉',
        `Your produce has been listed on the blockchain!\n\nTransaction Hash: ${result.transactionHash}\n\nBlock: ${result.blockNumber}\nGas Used: ${result.gasUsed}\n\n✅ Synced with marketplace`,
        [
          {
            text: 'View on Blockscout',
            onPress: () => {
              const explorerUrl = `https://eth-sepolia.blockscout.com/tx/${result.transactionHash}`;
              Linking.openURL(explorerUrl).catch(() => {
                Alert.alert('Error', 'Could not open Blockscout');
              });
            }
          },
          {
            text: 'OK',
            onPress: () => {
              setFormData({
                name: '',
                quantity: '',
                price_per_unit_eth: '',
              });
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      errorCaught = true;
      Alert.alert(
        'Listing Failed',
        `Error: ${error && error.message ? error.message : error}\n\nPlease check your wallet connection and contract address.`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      // Fallback: If no alert was shown and nothing happened, show a generic error
      setTimeout(() => {
        if (!errorCaught && !loading) {
          Alert.alert(
            'No Response',
            'No transaction or error was detected. Please check your wallet, reload the app, and try again.'
          );
        }
      }, 3000);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Wallet Connection Section */}
      <WalletConnect style={styles.walletSection} />

      <View style={styles.header}>
        <Text style={styles.title}>🌱 List New Produce</Text>
        <Text style={styles.subtitle}>Add your agricultural produce to the marketplace</Text>

        {!isConnected && (
          <View style={styles.warningCard}>
            <Ionicons name="warning-outline" size={20} color="#FF9800" />
            <Text style={styles.warningText}>Connect your wallet to list produce</Text>
          </View>
        )}
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Ionicons name="leaf-outline" size={16} color="#2E7D32" />
            <Text style={styles.label}>Produce Name</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="e.g., Organic Tomatoes, Fresh Apples"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Ionicons name="scale-outline" size={16} color="#2E7D32" />
            <Text style={styles.label}>Quantity (kg)</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="e.g., 100"
            value={formData.quantity}
            onChangeText={(value) => handleInputChange('quantity', value)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Ionicons name="diamond-outline" size={16} color="#2E7D32" />
            <Text style={styles.label}>Price per kg (ETH)</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="e.g., 0.001"
            value={formData.price_per_unit_eth}
            onChangeText={(value) => handleInputChange('price_per_unit_eth', value)}
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (loading || !isFormValid()) && styles.disabledButton
          ]}
          onPress={async () => {
            if (loading) {
              return;
            }

            if (!isFormValid()) {
              Alert.alert('Form Incomplete', 'Please fill in all fields with valid values');
              return;
            }

            handleSubmit();
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <View style={styles.buttonContent}>
              <Ionicons name="add-circle-outline" size={24} color="white" />
              <Text style={styles.submitButtonText}>
                {!isFormValid() ? 'Fill All Fields' : 'List Produce'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color="#1976D2" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>How it works:</Text>
            <Text style={styles.infoText}>
              1. Fill in your produce details{'\n'}
              2. Set your price in ETH{'\n'}
              3. Submit to blockchain{'\n'}
              4. Buyers can purchase directly from you
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  walletSection: {
    margin: spacing.lg,
    marginBottom: 0,
  },
  header: {
    backgroundColor: colors.card,
    padding: spacing.xl,
    borderBottomWidth: 0,
    borderRadius: radii.xl,
    margin: spacing.md,
    marginBottom: 0,
    ...shadow.header,
    alignItems: 'center',
  },
  title: {
    fontSize: font.size.xl,
    fontWeight: font.weight.bold,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: font.size.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningBg,
    padding: spacing.md,
    borderRadius: radii.md,
    marginTop: spacing.lg,
    borderLeftWidth: 5,
    borderLeftColor: colors.warning,
    ...shadow.warning,
  },
  warningText: {
    fontSize: font.size.sm,
    color: colors.warning,
    fontWeight: font.weight.medium,
    marginLeft: spacing.sm,
  },
  form: {
    padding: spacing.lg,
    margin: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    ...shadow.card,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm - 1,
  },
  label: {
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
    color: colors.primary,
    marginLeft: spacing.sm + 1,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg + 2,
    paddingVertical: spacing.md - 3,
    fontSize: font.size.md,
    color: colors.text,
    marginTop: 1,
  },
  submitButton: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
    marginLeft: spacing.sm + 2,
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  infoCard: {
    backgroundColor: colors.cardAlt,
    flexDirection: 'row',
    padding: spacing.lg,
    borderRadius: radii.md,
    alignItems: 'flex-start',
    marginTop: spacing.md,
    ...shadow.accent,
  },
  infoContent: {
    flex: 1,
    marginLeft: spacing.md - 2,
  },
  infoTitle: {
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: font.size.sm,
    color: colors.accent,
    lineHeight: 22,
  },
});
