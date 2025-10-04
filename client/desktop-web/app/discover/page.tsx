
////use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/services/apiClient';
import ProfileCard from '@/components/ProfileCard';
import { Heart, X } from 'lucide-react';

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const response = await apiClient.get('/api/v1/matches/potential');
      setProfiles(response.data);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (liked: boolean) => {
    if (currentIndex >= profiles.length) return;

    const profile = profiles[currentIndex];
    try {
      const response = await apiClient.post('/api/v1/matches/swipe', {
        receiverId: profile.id,
        liked,
      });

      if (response.data.matched) {
        // Show match modal
        alert("It's a Match!");
        router.push('/matches');
      }

      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error('Error swiping:', error);
    }
  };

  if (loading) {
    return (
      
        Loading profiles...
      
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      
        
          No more profiles
          Check back later for more matches!
        
      
    );
  }

  return (
    
      
        
        
        
          <button
            onClick={() => handleSwipe(false)}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-500 bg-white text-red-500 transition hover:bg-red-50"
          >
            
          
          
          <button
            onClick={() => handleSwipe(true)}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-500 bg-white text-green-500 transition hover:bg-green-50"
          >
            
          
        
      
    
  );
}