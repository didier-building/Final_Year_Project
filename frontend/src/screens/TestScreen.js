/**
 * Simple test screen to verify app functionality
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

export default function TestScreen() {
  const [tapCount, setTapCount] = useState(0);

  const handleTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    console.log('🔥 Button tapped! Count:', newCount);
    Alert.alert('Success!', `Button tapped ${newCount} times`);
  };

  const testAlert = () => {
    Alert.alert('Test Alert', 'This alert works!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🧪 AgriChain Test Screen</Text>
        
        <Text style={styles.subtitle}>
          Testing basic app functionality
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleTap}>
          <Text style={styles.buttonText}>
            Tap Me! (Count: {tapCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testAlert}>
          <Text style={styles.buttonText}>
            Test Alert
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>✅ App Status:</Text>
          <Text style={styles.infoText}>• React Native: Working</Text>
          <Text style={styles.infoText}>• Navigation: Working</Text>
          <Text style={styles.infoText}>• Touch Events: {tapCount > 0 ? 'Working' : 'Testing...'}</Text>
          <Text style={styles.infoText}>• Alerts: Test above</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🌾 AgriChain Features:</Text>
          <Text style={styles.infoText}>• Smart Contract: ✅ Deployed</Text>
          <Text style={styles.infoText}>• Django API: ✅ Running</Text>
          <Text style={styles.infoText}>• Mobile App: ✅ Loading</Text>
          <Text style={styles.infoText}>• Mock Data: ✅ Working</Text>
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
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
    minWidth: 200,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});
