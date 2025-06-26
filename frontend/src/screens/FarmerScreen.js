/**
 * Farmer Screen - Manage farm and produce listings
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
import { useWeb3 } from '../hooks/useWeb3';

export default function FarmerScreen({ navigation }) {
  const { account, isConnected } = useWeb3();
  const [myProduces, setMyProduces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    if (isConnected && account) {
      loadMyProduces();
    }
  }, [isConnected, account]);

  const loadMyProduces = async () => {
    if (!account) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Always use lowercase for filtering
      const response = await produceAPI.filter({ farmer: account.toLowerCase() });
      const produces = response.data.results || response.data;

      setMyProduces(produces);
      calculateStats(produces);
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      Alert.alert('Error', errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (produces) => {
    const total = produces.length;
    const available = produces.filter(p => !p.is_sold).length;
    const sold = produces.filter(p => p.is_sold).length;
    const totalEarnings = produces
      .filter(p => p.is_sold)
      .reduce((sum, p) => sum + parseFloat(p.total_price_eth), 0);

    setStats({ total, available, sold, totalEarnings });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyProduces();
    setRefreshing(false);
  };

  const renderProduceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.produceCard}
      onPress={() => navigation.navigate('ProduceDetail', { produce: item })}
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
            {apiUtils.formatPrice(item.total_price_eth)} ETH
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            Listed: {apiUtils.formatTimestamp(item.listed_timestamp)}
          </Text>
        </View>

        {item.is_sold && (
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
            <Text style={[styles.infoText, { color: '#4CAF50' }]}>
              Sold: {apiUtils.formatTimestamp(item.sold_timestamp)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>📊 Farm Statistics</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Listed</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.available}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#F44336' }]}>{stats.sold}</Text>
          <Text style={styles.statLabel}>Sold</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#2E7D32' }]}>
            {apiUtils.formatPrice(stats.totalEarnings)}
          </Text>
          <Text style={styles.statLabel}>ETH Earned</Text>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>🌾 My Farm</Text>
      <Text style={styles.subtitle}>Manage your agricultural produce</Text>
      
      {account && (
        <View style={styles.farmerInfo}>
          <Ionicons name="person-circle-outline" size={24} color="#2E7D32" />
          <Text style={[styles.farmerAddress, { marginLeft: 8 }]}>
            {apiUtils.formatAddress(account)}
          </Text>
        </View>
      )}

      {renderStatsCard()}
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          navigation.navigate('ListProduce');
        }}
      >
        <Ionicons name="add-outline" size={24} color="white" />
        <Text style={[styles.addButtonText, { marginLeft: 8 }]}>List New Produce</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isConnected) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="wallet-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>Wallet Not Connected</Text>
        <Text style={styles.emptySubtitle}>
          Please connect your wallet to view your farm
        </Text>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading your farm...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={myProduces}
        renderItem={renderProduceItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Produce Listed Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start by listing your first agricultural produce
            </Text>
          </View>
        }
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
    marginBottom: 16,
  },
  farmerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  farmerAddress: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  statsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
