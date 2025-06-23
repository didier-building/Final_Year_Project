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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { produceAPI, apiUtils } from '../services/api';

export default function ListProduceScreen({ navigation }) {
  console.log('🌱 ListProduceScreen loaded!');

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
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter produce name');
      return false;
    }

    if (!formData.quantity || isNaN(formData.quantity) || parseInt(formData.quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return false;
    }

    if (!formData.price_per_unit_eth || isNaN(formData.price_per_unit_eth) || parseFloat(formData.price_per_unit_eth) <= 0) {
      Alert.alert('Error', 'Please enter a valid price per unit');
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

  const shouldShowSummary = () => {
    return formData.quantity &&
           formData.price_per_unit_eth &&
           formData.quantity.toString().trim() !== '' &&
           formData.price_per_unit_eth.toString().trim() !== '' &&
           !isNaN(parseInt(formData.quantity)) &&
           !isNaN(parseFloat(formData.price_per_unit_eth));
  };

  const handleSubmit = async () => {
    console.log('🔥 List Produce button clicked!', formData);

    if (!validateForm()) return;

    const totalPrice = calculateTotalPrice();

    Alert.alert(
      'Confirm Listing',
      `List ${formData.name}?\n\nQuantity: ${formData.quantity} kg\nPrice per kg: ${formData.price_per_unit_eth} ETH\nTotal Value: ${totalPrice.toFixed(4)} ETH`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'List Produce', onPress: submitListing },
      ]
    );
  };

  const submitListing = async () => {
    try {
      setLoading(true);
      
      const listingData = {
        name: formData.name.trim(),
        quantity: parseInt(formData.quantity),
        price_per_unit_eth: parseFloat(formData.price_per_unit_eth),
      };

      const response = await produceAPI.create(listingData);

      Alert.alert(
        'Listing Submitted!',
        `Your produce has been submitted to the blockchain.\n\nTransaction Hash: ${response.data.transaction_hash}\n\nPlease wait for confirmation.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
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
      const errorInfo = apiUtils.handleError(error);
      Alert.alert('Listing Failed', errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌱 List New Produce</Text>
        <Text style={styles.subtitle}>Add your agricultural produce to the marketplace</Text>
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
            loading && styles.disabledButton
          ]}
          onPress={loading ? undefined : handleSubmit}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <View style={styles.buttonContent}>
              <Ionicons name="add-circle-outline" size={24} color="white" />
              <Text style={styles.submitButtonText}>List Produce</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: '#2E7D32',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
});
