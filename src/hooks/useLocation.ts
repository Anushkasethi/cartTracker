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
    setLoading(true);
    setError(null);

    try {
      const position = await LocationService.getCurrentPosition();
      setLocation(position);
    } catch (err: any) {
      const errorMessage = err.message || 'Unable to get location';
      setError(errorMessage);
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
