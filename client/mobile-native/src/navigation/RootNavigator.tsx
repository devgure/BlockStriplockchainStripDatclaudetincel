
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

// Screens
import LoginScreen from '../../screens/LoginScreen';
import SwipeScreen from '../../screens/SwipeScreen';
import MatchesScreen from '../screens/MatchesScreen';
import ChatScreen from '../../screens/ChatScreen';
import ProfileScreen from '../../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    
      
      
      
      
    
  );
}

export default function RootNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    
      {!isAuthenticated ? (
        
      ) : (
        
      )}
    
  );
}