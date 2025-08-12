import React from 'react';
import { View, SafeAreaView, ScrollView, Alert } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { useLocation } from '../hooks/useLocation';
// import { useAuth } from './src/hooks/useAuth';
import { useRideRequest } from '../hooks/useRideRequest';
import { LocationButton } from './LocationButton';
import { ErrorDisplay, InfoDisplay } from './StatusDisplay';
// import { AuthScreen } from './src/components/AuthScreen';
import { RideStatus } from './RideStatus';
import { MapLocation } from './Map';
import { Header } from './Header';
import { RiderLiveMap } from './RiderLiveMap';
import { useOperatorLiveLocation } from '../hooks/useOperatorLiveLocation';
// import RoleSelection from './src/components/RoleSelection';
// Define User type if not imported from elsewhere
type User = {
  uid: string;
  phoneNumber?: string;
  // Add other fields as needed
};

export const RiderDashboard: React.FC<{ user: User; onSignOut: () => void }> = ({ user, onSignOut }) => {
  const { location, loading: locationLoading, error, getCurrentPosition } = useLocation();
  const {
    currentRequest,
    loading: rideLoading,
    error: rideError,
    createRideRequest,
    cancelRideRequest,
    hasActiveRequest,
    getStatusMessage,
  } = useRideRequest(user.uid);

  const handleRideRequest = async () => {
    if (!location) {
      try {
        await getCurrentPosition();
        Alert.alert('Success', 'Location obtained! Please press Call Go Cart again to request a ride.');
      } catch {
        Alert.alert('Location Error', 'Please enable location to request a cart');
      }
    } else {
      await createRideRequest({ latitude: location.latitude, longitude: location.longitude });
    }
  };

  const handleCancelRide = async () => {
    Alert.alert('Cancel Ride', 'Are you sure you want to cancel this ride request?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: () => cancelRideRequest() },
    ]);
  };
    const isAccepted = currentRequest?.status === 'accepted' && currentRequest?.operatorId;
    console.log('Current Request:', currentRequest);
    console.log('Is Accepted:', isAccepted);
    const operatorLoc = useOperatorLiveLocation(currentRequest?.operatorId);
    console.log('Operator Location:', operatorLoc);

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <Header title="Cart Tracker" subtitle={`📱 ${user.phoneNumber || ''}`} onSignOut={onSignOut} />
        <View style={globalStyles.content}>
          <LocationButton
            onPress={handleRideRequest}
            loading={locationLoading || rideLoading}
            hasActiveRequest={hasActiveRequest || false}
            statusMessage={getStatusMessage()}
          />

          {currentRequest && (
            <RideStatus rideRequest={currentRequest} onCancel={handleCancelRide} loading={rideLoading} />
          )}

          {error && <ErrorDisplay error={error} onRetry={getCurrentPosition} />}
          {rideError && <ErrorDisplay error={rideError} onRetry={() => {}} />}
        
        
          {!location && !error && !locationLoading && !hasActiveRequest && (
            <InfoDisplay message="Tap 'Call Go Cart' to request a cart. We'll get your location and find an available cart nearby." />
          )}

          {isAccepted ? (
        <RiderLiveMap
            riderLocation={{ latitude: location?.latitude!, longitude: location?.longitude! }}
            cartLocation={operatorLoc}
        />
      ) : (
        location && <MapLocation location={location} />
      )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

