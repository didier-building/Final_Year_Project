/**
 * Main navigation structure for AgriChain app
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import MarketplaceScreen from '../screens/MarketplaceScreen';
import FarmerScreen from '../screens/FarmerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProduceDetailScreen from '../screens/ProduceDetailScreen';
import ListProduceScreen from '../screens/ListProduceScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Marketplace Stack
function MarketplaceStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MarketplaceHome"
        component={MarketplaceScreen}
        options={{ title: 'AgriChain Marketplace' }}
      />
      <Stack.Screen 
        name="ProduceDetail" 
        component={ProduceDetailScreen}
        options={{ title: 'Produce Details' }}
      />
    </Stack.Navigator>
  );
}

// Farmer Stack
function FarmerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="FarmerHome" 
        component={FarmerScreen}
        options={{ title: 'My Farm' }}
      />
      <Stack.Screen 
        name="ListProduce" 
        component={ListProduceScreen}
        options={{ title: 'List New Produce' }}
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Marketplace') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'Farmer') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceStack}
        options={{ title: 'Marketplace' }}
      />
      <Tab.Screen 
        name="Farmer" 
        component={FarmerStack}
        options={{ title: 'My Farm' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <MainTabNavigator />
    </NavigationContainer>
  );
}
