
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation, { GeoPosition } from 'react-native-geolocation-service';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

function toLocationData(pos: GeoPosition): LocationData {
  const { coords, timestamp } = pos;
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    altitude: coords.altitude ?? null,
    heading: coords.heading ?? null,
    speed: coords.speed ?? null,
    timestamp,
  };
}
  
async function requestLocationPermissions(): Promise<boolean> {
  console.log('📍 Requesting location permissions...');
  
  if (Platform.OS === 'ios') {
    console.log('📍 iOS platform - permissions handled automatically');
    return true;
  }

  console.log('📍 Android platform - requesting multiple permissions');
  
  const status = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  ]);

  console.log('📍 Permission status received:', status);

  const fine = status[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
  const coarse = status[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION];

  const hasPermission = (
    fine === PermissionsAndroid.RESULTS.GRANTED ||
    coarse === PermissionsAndroid.RESULTS.GRANTED
  );

  console.log('📍 Final permission result:', { fine, coarse, hasPermission });

  return hasPermission;
}

function getPosition(options: Parameters<typeof Geolocation.getCurrentPosition>[2]) {
  return new Promise<GeoPosition>((resolve, reject) => {
    Geolocation.getCurrentPosition(resolve, reject, options);
  });
}

export const LocationService = {
  /**
   * Format coordinates for display
   */
  formatCoordinate(coord: number): string {
    return typeof coord === 'number' ? coord.toFixed(6) : '';
  },
    
  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  },

  /**
   * Calculate distance between two coordinates (in meters)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  },

  /**
   * Request location permission on Android
   */
  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to track your cart.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  },

  /**
   * Format location error with user-friendly messages
   */
  formatLocationError(error: any): Error {
    let errorMessage = 'Unable to get location';
    
    switch (error?.code) {
      case 1:
        errorMessage = 'Location permission denied. Please enable location access in your device settings.';
        break;
      case 2:
        errorMessage = 'Location not available. Please check that location services are enabled and you have a clear view of the sky if outdoors.';
        break;
      case 3:
        errorMessage = 'Location request timed out. Please ensure you have a good GPS signal and try again.';
        break;
      default:
        errorMessage = `Location error: ${error?.message || 'Unknown error'}`;
    }
    
    return new Error(errorMessage);
  },

  /**
   * Get current position with:
   * 1) Fused provider (normal path, allows cache)
   * 2) Fallback to LocationManager if Fused fails (bypasses the null Task path)
   */
  async getCurrentPosition(opts?: {
    cacheMs?: number;          // how old a cached fix we allow (default 2 min)
    highAccuracy?: boolean;    // default true
    timeoutMs?: number;        // default 12s first try, 15s fallback
    disableFallback?: boolean; // set true to skip LocationManager fallback
  }): Promise<LocationData> {
    const cacheMs = opts?.cacheMs ?? 120000; // 2 minutes
    const highAccuracy = opts?.highAccuracy ?? true;

    const hasPerm = await requestLocationPermissions();
    if (!hasPerm) {
      throw new Error('Location permission denied');
    }

    // --- try 1: Fused provider (this is where some devices used to crash with null Task) ---
    try {
      const pos1 = await getPosition({
        enableHighAccuracy: highAccuracy,
        timeout: opts?.timeoutMs ?? 12000,
        maximumAge: cacheMs,
        showLocationDialog: true, // prompt to turn location ON
        // forceLocationManager: false (default)
      });
      return toLocationData(pos1);
    } catch (e1: any) {
      // --- try 2: fallback to OS LocationManager (no Google Task involved) ---
      if (opts?.disableFallback) throw this.formatLocationError(e1);
      try {
        const pos2 = await getPosition({
          enableHighAccuracy: highAccuracy,
          timeout: Math.max(15000, opts?.timeoutMs ?? 12000),
          maximumAge: 0,            // force a fresh fix on fallback
          showLocationDialog: true,
          forceLocationManager: true,
        });
        return toLocationData(pos2);
      } catch (e2: any) {
        throw this.formatLocationError(e2);
      }
    }
  },
  
  /**
   * Watch user's position with continuous updates.
   * Returns an unsubscribe function.
   */
  async watchPosition(
    onSuccess: (location: LocationData) => void,
    onError?: (error: Error) => void,
    options?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
      distanceFilter?: number;
      intervalMs?: number;
      useLocationManager?: boolean; // if you want to always bypass fused for stability
    }
  ): Promise<number> {
    console.log('📍 LocationService.watchPosition called with options:', options);
    
    // Request permissions first
    const hasPerm = await requestLocationPermissions();
    if (!hasPerm) {
      const error = new Error('Location permission denied');
      console.warn('📍 Permission denied, calling onError');
      onError?.(error);
      throw error;
    }

    console.log('📍 Permissions granted, starting watch');
    
    const defaultOptions = {
      enableHighAccuracy: options?.enableHighAccuracy ?? true,
      timeout: options?.timeout ?? 15000,
      maximumAge: options?.maximumAge ?? 0,
      distanceFilter: options?.distanceFilter ?? 10, // Update every 10 meters
      interval: options?.intervalMs ?? 5000,
      fastestInterval: 3000,
      showLocationDialog: true,
      forceLocationManager: options?.useLocationManager ?? false,
    };

    console.log('📍 Starting Geolocation.watchPosition with options:', defaultOptions);

    const watchId = Geolocation.watchPosition(
      (position) => {
        console.log('📍 Raw position received:', position);
        const locationData = toLocationData(position);
        console.log('📍 Converted location data:', locationData);
        onSuccess(locationData);
      },
      (error) => {
        console.warn('📍 Geolocation error:', error);
        onError?.(this.formatLocationError(error));
      },
      defaultOptions
    );

    console.log('📍 Geolocation.watchPosition returned watchId:', watchId);
    return watchId;
  },

  /**
   * Stop watching position
   */
  clearWatch(watchId: number): void {
    Geolocation.clearWatch(watchId);
  },
};

