// src/hooks/useOperatorTracking.ts
import { useEffect, useRef, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { LocationService, LocationData } from '../services/LocationService';

export function useOperatorTracking(userId?: string, enabled?: boolean) {
  console.log('📍 useOperatorTracking HOOK CALLED with:', { userId, enabled });
  const watchId = useRef<number | null>(null);
  const [last, setLast] = useState<{ latitude: number, longitude: number } | null>(null);

  useEffect(() => {
    console.log('📍 useOperatorTracking effect called:', { userId, enabled });
    
    if (!userId || !enabled) {
      console.log('📍 Cleaning up location tracking - userId or enabled is false');
      if (watchId.current != null) LocationService.clearWatch(watchId.current);
      watchId.current = null;
      return;
    }

    console.log('📍 Starting location tracking for user:', userId);

    const startTracking = async () => {
      try {
        const id = await LocationService.watchPosition(
          async (location: LocationData) => {
            console.log('📍 Location received:', location);
            const { latitude, longitude } = location;
            setLast({ latitude, longitude });
            await firestore().collection('operators').doc(userId).set({
              available: true,
              location: { latitude, longitude },
              updatedAt: firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
            console.log('📍 Updated operator location in Firestore');
          },
          (error) => {
            console.warn('📍 Location tracking error:', error.message);
          },
          { 
            enableHighAccuracy: true, 
            distanceFilter: 10, 
            intervalMs: 5000,
            useLocationManager: true // Force LocationManager to avoid Fused provider issues
          }
        );
        
        watchId.current = id;
        console.log('📍 Started watching position with ID:', watchId.current);
      } catch (error) {
        console.error('📍 Failed to start location tracking:', error);
      }
    };

    startTracking();

    return () => {
      console.log('📍 Cleanup: stopping location watch');
      if (watchId.current != null) LocationService.clearWatch(watchId.current);
    };
  }, [userId, enabled]);

  return { lastLocation: last };
}
