/**
 * Transaction History Screen - View blockchain transactions
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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWeb3 } from '../hooks/useWeb3';
import { userAPI, apiUtils } from '../services/api';

export default function TransactionHistoryScreen({ navigation }) {
  const { account, isConnected, network } = useWeb3();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, list_produce, buy_produce

  useEffect(() => {
    loadTransactions();
  }, [isConnected, account, filter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);

      // Load transactions from local storage
      const storedTxs = JSON.parse(localStorage.getItem('agrichain_transactions') || '[]');
      console.log('📊 Loaded transactions from local storage:', storedTxs.length);

      // Filter transactions based on current filter
      let filteredTxs = storedTxs;
      if (filter !== 'all') {
        filteredTxs = storedTxs.filter(tx => tx.type === filter);
      }

      // Transform to match expected format
      const transformedTxs = filteredTxs.map(tx => ({
        id: tx.id,
        transaction_type: tx.type,
        produce_name: tx.produceName,
        value_eth: tx.totalPriceEth || tx.pricePerUnitEth,
        transaction_hash: tx.transactionHash,
        timestamp: tx.timestamp,
        status: tx.status,
        gas_used: parseInt(tx.gasUsed) || 0,
        network: tx.network || 'sepolia'
      }));

      setTransactions(transformedTxs);
      console.log('📊 Filtered transactions:', transformedTxs.length);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const openInExplorer = (txHash, network) => {
    let explorerUrl;
    if (network === 'sepolia') {
      explorerUrl = `https://eth-sepolia.blockscout.com/tx/${txHash}`;
    } else {
      Alert.alert('Explorer', 'No explorer available for this network');
      return;
    }

    Linking.openURL(explorerUrl).catch(() => {
      Alert.alert('Error', 'Could not open explorer');
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'list_produce':
        return 'add-circle-outline';
      case 'buy_produce':
        return 'card-outline';
      default:
        return 'swap-horizontal-outline';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'list_produce':
        return '#4CAF50';
      case 'buy_produce':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  const formatTransactionType = (type) => {
    switch (type) {
      case 'list_produce':
        return 'Listed Produce';
      case 'buy_produce':
        return 'Bought Produce';
      default:
        return 'Transaction';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderTransaction = ({ item }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => openInExplorer(item.transaction_hash, item.network)}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.transactionLeft}>
          <Ionicons
            name={getTransactionIcon(item.transaction_type)}
            size={24}
            color={getTransactionColor(item.transaction_type)}
          />
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionType}>
              {formatTransactionType(item.transaction_type)}
            </Text>
            <Text style={styles.produceName}>{item.produce_name}</Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[styles.value, { color: getTransactionColor(item.transaction_type) }]}>
            {item.value_eth > 0 ? `${item.value_eth} ETH` : 'Free'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={styles.hash}>
          {item.transaction_hash.slice(0, 10)}...{item.transaction_hash.slice(-8)}
        </Text>
        <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>
      
      <View style={styles.gasInfo}>
        <Ionicons name="flash-outline" size={14} color="#666" />
        <Text style={styles.gasText}>Gas: {item.gas_used?.toLocaleString()}</Text>
        <Text style={styles.networkText}>• {item.network}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filterType, label) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterType && styles.activeFilterButton
      ]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[
        styles.filterText,
        filter === filterType && styles.activeFilterText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (!isConnected) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="wallet-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>Wallet Not Connected</Text>
        <Text style={styles.emptySubtitle}>
          Please connect your wallet to view transaction history
        </Text>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <Text style={styles.subtitle}>Your blockchain activity</Text>
        
        <View style={styles.filterContainer}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('list_produce', 'Listed')}
          {renderFilterButton('buy_produce', 'Purchased')}
        </View>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Transactions</Text>
            <Text style={styles.emptySubtitle}>
              Your transaction history will appear here
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
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#2E7D32',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  listContainer: {
    padding: 16,
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  produceName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  hash: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  gasInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gasText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  networkText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
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
