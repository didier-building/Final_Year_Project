/**
 * Profile Screen - User profile and app information
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const handleFeaturePress = (feature) => {
    Alert.alert('Coming Soon', `${feature} feature will be available in future updates!`);
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#2E7D32" />
        </View>
        <Text style={styles.userName}>Demo User</Text>
        <Text style={styles.userType}>Farmer & Buyer</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        {renderProfileItem(
          'wallet-outline',
          'Wallet Address',
          '0xf39F...2266',
          () => handleFeaturePress('Wallet Management')
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
          'Manage your farm details',
          () => handleFeaturePress('Farm Management')
        )}
        
        {renderProfileItem(
          'ribbon-outline',
          'Certifications',
          'Organic and quality certifications',
          () => handleFeaturePress('Certifications')
        )}
        
        {renderProfileItem(
          'location-outline',
          'Farm Location',
          'Set your farm location',
          () => handleFeaturePress('Location Settings')
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Blockchain</Text>
        
        {renderProfileItem(
          'link-outline',
          'Transaction History',
          'View all blockchain transactions',
          () => handleFeaturePress('Transaction History')
        )}
        
        {renderProfileItem(
          'server-outline',
          'Network Settings',
          'Anvil Local Network',
          () => handleFeaturePress('Network Settings')
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
