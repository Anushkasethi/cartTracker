import { useState, useEffect } from 'react';
import { LocationService, LocationData } from '../services/LocationService';

interface UseLocationReturn {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  getCurrentPosition: () => Promise<void>;
  clearError: () => void;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPosition = async () => {
    console.log('📍 Rider useLocation: Starting getCurrentPosition');
    setLoading(true);
    setError(null);

    try {
      console.log('📍 Rider useLocation: Attempting primary location request');
      const position = await LocationService.getCurrentPosition({
        cacheMs: 120000,          // allow cached fix up to 2 min
        highAccuracy: true,
        timeoutMs: 12000,
        disableFallback: false,   // Allow fallback to LocationManager
      });
      console.log('📍 Rider useLocation: Primary request successful:', position);
      setLocation(position);
    } catch (err: any) {
      // If normal method fails, try with forced LocationManager
      try {
        console.log('📍 Rider location: Primary failed, retrying with LocationManager fallback');
        const fallbackPosition = await LocationService.getCurrentPosition({
          cacheMs: 0,               // Force fresh location
          highAccuracy: true,
          timeoutMs: 15000,
          disableFallback: false,
        });
        console.log('📍 Rider useLocation: Fallback successful:', fallbackPosition);
        setLocation(fallbackPosition);
      } catch (fallbackErr: any) {
        console.error('📍 Rider useLocation: Both attempts failed:', fallbackErr);
        const errorMessage = fallbackErr.message || 'Unable to get location';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    // Get location on initial load
    getCurrentPosition();
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentPosition,
    clearError,
  };
};
