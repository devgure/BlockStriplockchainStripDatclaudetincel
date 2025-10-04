
import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface SwipeCardProps {
  profile: any;
}

export default function SwipeCard({ profile }: SwipeCardProps) {
  const mainPhoto = profile.photos?.find((p: any) => p.isMain) || profile.photos?.[0];

  return (
    
      <Image
        source={{ uri: mainPhoto?.url || 'https://via.placeholder.com/400' }}
        style={styles.image}
        resizeMode="cover"
      />
      
        {profile.name}, {calculateAge(profile.birthDate)}
        {profile.bio && {profile.bio}}
      
    
  );
}

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

const styles = StyleSheet.create({
  card: {
    height: height - 200,
    width: width - 40,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '75%',
  },
  infoContainer: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bio: {
    fontSize: 14,
    color: '#666',
  },
});