import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// Configure geolocation
Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'whenInUse',
  enableBackgroundLocationUpdates: false,
  locationProvider: 'auto',
});

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export class LocationService {
  /**
   * Request location permission on Android
   */
  static async requestLocationPermission(): Promise<boolean> {
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
  }

  /**
   * Try to get location using cached/network data first
   */
  private static tryWithCachedLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { coords, timestamp } = position;
          resolve({
            latitude: coords.latitude,
            longitude: coords.longitude,
            altitude: coords.altitude,
            accuracy: coords.accuracy,
            altitudeAccuracy: coords.altitudeAccuracy,
            heading: coords.heading,
            speed: coords.speed,
            timestamp,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: false, // Use cached/network location first
          timeout: 5000, // Shorter timeout for cached location
          maximumAge: 120000, // Accept location up to 2 minutes old
        }
      );
    });
  }

  /**
   * Try to get high-accuracy GPS location
   */
  private static tryWithHighAccuracy(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { coords, timestamp } = position;
          resolve({
            latitude: coords.latitude,
            longitude: coords.longitude,
            altitude: coords.altitude,
            accuracy: coords.accuracy,
            altitudeAccuracy: coords.altitudeAccuracy,
            heading: coords.heading,
            speed: coords.speed,
            timestamp,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // Longer timeout for GPS
          maximumAge: 0, // Force fresh location
        }
      );
    });
  }

  /**
   * Get user's current position with fallback strategy
   */
  static async getCurrentPosition(): Promise<LocationData> {
    // Request permission first on Android
    if (Platform.OS === 'android') {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission denied. Please enable location access in settings.');
      }
    }

    try {
      // First try to get cached/network location quickly
      return await this.tryWithCachedLocation();
    } catch (cachedError) {
      console.log('Cached location failed, trying GPS...', cachedError);
      
      try {
        // If cached fails, try with high accuracy GPS
        return await this.tryWithHighAccuracy();
      } catch (gpsError: any) {
        console.error('GPS location also failed:', gpsError);
        throw this.formatLocationError(gpsError);
      }
    }
  }

  /**
   * Format location error with user-friendly messages
   */
  private static formatLocationError(error: any): Error {
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
  }

  /**
   * Watch user's position with continuous updates
   */
  static watchPosition(
    onSuccess: (location: LocationData) => void,
    onError: (error: Error) => void,
    options?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
      distanceFilter?: number;
    }
  ): number {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
      distanceFilter: 10, // Update every 10 meters
      ...options,
    };

    return Geolocation.watchPosition(
      (position) => {
        const { coords, timestamp } = position;
        onSuccess({
          latitude: coords.latitude,
          longitude: coords.longitude,
          altitude: coords.altitude,
          accuracy: coords.accuracy,
          altitudeAccuracy: coords.altitudeAccuracy,
          heading: coords.heading,
          speed: coords.speed,
          timestamp,
        });
      },
      (error) => {
        onError(this.formatLocationError(error));
      },
      defaultOptions
    );
  }

  /**
   * Stop watching position
   */
  static clearWatch(watchId: number): void {
    Geolocation.clearWatch(watchId);
  }

  /**
   * Format coordinates for display
   */
  static formatCoordinate(coord: number): string {
    return coord.toFixed(6);
  }

  /**
   * Format timestamp for display
   */
  static formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  /**
   * Calculate distance between two coordinates (in meters)
   */
  static calculateDistance(
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
  }
}
