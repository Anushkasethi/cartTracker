import { useState, useEffect, useCallback } from 'react';
import { firebaseService, RideRequest } from '../services/FirebaseService';

interface RideRequestState {
  currentRequest: RideRequest | null;
  loading: boolean;
  error: string | null;
}

export const useRideRequest = (riderId: string | null) => {
  const [state, setState] = useState<RideRequestState>({
    currentRequest: null,
    loading: false,
    error: null,
  });

  const [unsubscribeListener, setUnsubscribeListener] = useState<(() => void) | null>(null);

  // Create a new ride request
  const createRideRequest = useCallback(async (
    location: { latitude: number; longitude: number; address?: string }
  ): Promise<string | null> => {
    if (!riderId) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }));
      return null;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const requestId = await firebaseService.createRideRequest(riderId, location);
      
      // Start listening to this request
      const unsubscribe = firebaseService.listenToRideRequest(requestId, (rideRequest) => {
        setState(prev => ({
          ...prev,
          currentRequest: rideRequest,
          loading: false,
          error: null,
        }));
      });

      // Clean up previous listener
      if (unsubscribeListener) {
        unsubscribeListener();
      }
      
      setUnsubscribeListener(() => unsubscribe);
      
      return requestId;
    } catch (error: any) {
      console.error('Error creating ride request:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create ride request',
      }));
      return null;
    }
  }, [riderId, unsubscribeListener]);

  // Cancel current ride request
  const cancelRideRequest = useCallback(async (): Promise<void> => {
    if (!state.currentRequest?.id) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await firebaseService.updateRideRequestStatus(
        state.currentRequest.id,
        'cancelled'
      );
      
      // Stop listening
      if (unsubscribeListener) {
        unsubscribeListener();
        setUnsubscribeListener(null);
      }
      
      setState(prev => ({
        ...prev,
        currentRequest: null,
        loading: false,
      }));
    } catch (error: any) {
      console.error('Error cancelling ride request:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to cancel ride request',
      }));
    }
  }, [state.currentRequest?.id, unsubscribeListener]);

  // Get rider's recent requests
  const getRiderRequests = useCallback(async (): Promise<RideRequest[]> => {
    if (!riderId) return [];

    try {
      return await firebaseService.getRiderRequests(riderId);
    } catch (error) {
      console.error('Error getting rider requests:', error);
      return [];
    }
  }, [riderId]);

  // Clean up listener on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeListener) {
        unsubscribeListener();
      }
    };
  }, [unsubscribeListener]);

  // Helper to check if user has an active request
  const hasActiveRequest = state.currentRequest && 
    ['pending', 'accepted', 'on_way'].includes(state.currentRequest.status);

  // Helper to get status message
  const getStatusMessage = (): string => {
    if (!state.currentRequest) return '';
    
    switch (state.currentRequest.status) {
      case 'pending':
        return 'Looking for available cart...';
      case 'accepted':
        return 'Cart assigned! Getting ready...';
      case 'on_way':
        return 'Your cart is on the way!';
      case 'arrived':
        return 'Your cart has arrived!';
      case 'completed':
        return 'Ride completed. Thank you!';
      case 'cancelled':
        return 'Ride was cancelled.';
      default:
        return '';
    }
  };

  return {
    ...state,
    createRideRequest,
    cancelRideRequest,
    getRiderRequests,
    hasActiveRequest,
    getStatusMessage,
  };
};
