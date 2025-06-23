/**
 * Marketplace screen - Browse and buy agricultural produce
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { produceAPI, apiUtils } from '../services/api';

export default function MarketplaceScreen({ navigation }) {
  const [produces, setProduces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' or 'available'

  useEffect(() => {
    console.log('🔄 MarketplaceScreen: Loading produces with filter:', filter);
    loadProduces();
  }, [filter]);

  const loadProduces = async () => {
    try {
      setLoading(true);
      let response;
      
      if (filter === 'available') {
        response = await produceAPI.getAvailable();
      } else {
        response = await produceAPI.getAll();
      }
      
      setProduces(response.data.results || response.data);
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      Alert.alert('Error', errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProduces();
    setRefreshing(false);
  };

  const syncFromBlockchain = async () => {
    try {
      setLoading(true);
      const response = await produceAPI.syncFromBlockchain();
      Alert.alert('Success', response.data.message);
      await loadProduces();
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      Alert.alert('Error', errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const renderProduceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.produceCard}
      onPress={() => {
        console.log('🔥 Produce item tapped:', item.name);
        navigation.navigate('ProduceDetail', { produce: item });
      }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.produceName}>{item.name}</Text>
        <View style={[styles.statusBadge, item.is_sold ? styles.soldBadge : styles.availableBadge]}>
          <Text style={styles.statusText}>
            {item.is_sold ? 'SOLD' : 'AVAILABLE'}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Ionicons name="scale-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{item.quantity} kg</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="diamond-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {apiUtils.formatPrice(item.price_per_unit_eth)} ETH/kg
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="wallet-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            Total: {apiUtils.formatPrice(item.total_price_eth)} ETH
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            Farmer: {apiUtils.formatAddress(item.farmer_address)}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            Listed: {apiUtils.formatTimestamp(item.listed_timestamp)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>🌾 AgriChain Marketplace</Text>
      <Text style={styles.subtitle}>Fresh produce directly from farmers</Text>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            All Produce
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'available' && styles.activeFilter]}
          onPress={() => setFilter('available')}
        >
          <Text style={[styles.filterText, filter === 'available' && styles.activeFilterText]}>
            Available Only
          </Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={[
          styles.syncButton,
          loading && { opacity: 0.6 }
        ]}
        onPress={loading ? undefined : syncFromBlockchain}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Ionicons name="sync-outline" size={20} color="white" />
        )}
        <Text style={styles.syncButtonText}>
          {loading ? 'Syncing...' : 'Sync from Blockchain'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading marketplace...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={produces}
        renderItem={renderProduceItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  listContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
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
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeFilter: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  syncButton: {
    flexDirection: 'row',
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  produceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  produceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
  cardContent: {
    paddingVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});
