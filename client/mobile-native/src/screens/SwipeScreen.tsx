
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import SwipeCard from '../components/SwipeCard';
import { apiClient } from '../services/apiClient';

const { width, height } = Dimensions.get('window');

export default function SwipeScreen() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const response = await apiClient.get('/matches/potential');
      setProfiles(response.data);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (index: number, liked: boolean) => {
    const profile = profiles[index];
    try {
      const response = await apiClient.post('/matches/swipe', {
        receiverId: profile.id,
        liked,
      });

      if (response.data.matched) {
        // Show match animation
        console.log('Its a match!');
      }
    } catch (error) {
      console.error('Error swiping:', error);
    }
  };

  if (loading) {
    return Loading...;
  }

  return (
    
      <Swiper
        cards={profiles}
        renderCard={(card) => }
        onSwipedLeft={(index) => handleSwipe(index, false)}
        onSwipedRight={(index) => handleSwipe(index, true)}
        cardIndex={0}
        backgroundColor="transparent"
        stackSize={3}
        stackSeparation={15}
        overlayLabels={{
          left: {
            title: 'NOPE',
            style: {
              label: {
                backgroundColor: 'red',
                color: 'white',
                fontSize: 24,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                marginTop: 30,
                marginLeft: -30,
              },
            },
          },
          right: {
            title: 'LIKE',
            style: {
              label: {
                backgroundColor: 'green',
                color: 'white',
                fontSize: 24,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                marginTop: 30,
                marginLeft: 30,
              },
            },
          },
        }}
        animateOverlayLabelsOpacity
        animateCardOpacity
      />
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});