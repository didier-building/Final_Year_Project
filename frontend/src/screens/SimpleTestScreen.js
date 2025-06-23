/**
 * Ultra-simple test screen to isolate touch issues
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

export default function SimpleTestScreen() {
  const [tapCount, setTapCount] = useState(0);
  const [lastTap, setLastTap] = useState('None');

  const handleTap = (buttonName) => {
    console.log(`🔥 ${buttonName} TAPPED!`);
    setTapCount(prev => prev + 1);
    setLastTap(buttonName);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Touch Test</Text>
      
      <View style={styles.stats}>
        <Text style={styles.statText}>Total Taps: {tapCount}</Text>
        <Text style={styles.statText}>Last Tap: {lastTap}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#FF0000' }]}
        onPress={() => handleTap('Red Button')}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Red Button</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#00FF00' }]}
        onPress={() => handleTap('Green Button')}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Green Button</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#0000FF' }]}
        onPress={() => handleTap('Blue Button')}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Blue Button</Text>
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          If buttons work, touch events are functional.{'\n'}
          If not, there's a fundamental touch issue.{'\n'}
          Check console for tap logs.
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
  content: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  stats: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  statText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  info: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
});
