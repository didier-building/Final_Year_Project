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
import { colors, spacing, radii, font, shadow } from '../theme';

export default function MarketplaceScreen({ navigation }) {
  const [produces, setProduces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' or 'available'

  useEffect(() => {
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
      console.error('Failed to load produces:', error);
      const errorInfo = apiUtils.handleError(error);
      Alert.alert('Error Loading Produces', errorInfo.message);
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
      
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
            All Produce
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'available' && styles.filterButtonActive]}
          onPress={() => setFilter('available')}
        >
          <Text style={[styles.filterButtonText, filter === 'available' && styles.filterButtonTextActive]}>
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
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContainer: {
    padding: 0,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: font.size.xl,
    fontWeight: font.weight.bold,
    color: colors.primaryDark,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: font.size.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    ...shadow.card,
    padding: spacing.sm,
  },
  filterButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    marginHorizontal: spacing.xs,
    backgroundColor: colors.inputBg,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    color: colors.textSecondary,
    fontSize: font.size.md,
    fontWeight: font.weight.medium,
  },
  filterButtonTextActive: {
    color: 'white',
    fontWeight: font.weight.bold,
  },
  syncButton: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    ...shadow.accent,
  },
  syncButtonText: {
    color: 'white',
    fontSize: font.size.md,
    fontWeight: font.weight.medium,
    marginLeft: spacing.xs,
  },
  produceCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  produceName: {
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
    color: colors.primaryDark,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.lg,
  },
  availableBadge: {
    backgroundColor: colors.primary,
  },
  soldBadge: {
    backgroundColor: colors.error,
  },
  statusText: {
    color: 'white',
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
  },
  cardContent: {
    paddingVertical: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: font.size.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
});
