import React from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { globalStyles } from './src/styles/globalStyles';
import { useLocation } from './src/hooks/useLocation';
import { useAuth } from './src/hooks/useAuth';
import { useRideRequest } from './src/hooks/useRideRequest';
import { LocationButton } from './src/components/LocationButton';
import { ErrorDisplay, InfoDisplay } from './src/components/StatusDisplay';
import { AuthScreen } from './src/components/AuthScreen';
import { RideStatus } from './src/components/RideStatus';
import { MapLocation } from './src/components/Map';

const App: React.FC = () => {
  const { user, loading: authLoading, isAuthenticated, otpSent, startPhoneSignIn, confirmCode, signOut } = useAuth();

  // Uncomment this if you want to always start fresh (for testing)
  // React.useEffect(() => {
  //   signOut();
  // }, []);
  
  const { location, loading: locationLoading, error, getCurrentPosition } = useLocation();
  const { 
    currentRequest, 
    loading: rideLoading, 
    error: rideError,
    createRideRequest,
    cancelRideRequest,
    hasActiveRequest,
    getStatusMessage 
  } = useRideRequest(user?.uid || null);

  const handleSignIn = async (phoneNumber: string) => {
    try {
      await startPhoneSignIn(phoneNumber);
    } catch (err) {
      console.error('Sign in error:', err);
      throw err;
    }
  };

  const handleConfirmCode = async (code: string) => {
    try {
      await confirmCode(code);
    } catch (err) {
      console.error('Code confirmation error:', err);
      throw err;
    }
  };

  const handleRideRequest = async () => {
    if (!location) {
      // First get location
      try {
        await getCurrentPosition();
        // Location will be updated via the hook, then we can create request
        Alert.alert('Success', 'Location obtained! Please press Call Go Cart again to request a ride.');
      } catch (err: any) {
        Alert.alert('Location Error', 'Please enable location to request a cart');
      }
    } else {
      // Use existing location
      await createRideRequest({
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
  };

  const handleCancelRide = async () => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride request?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: () => cancelRideRequest()
        }
      ]
    );
  };

  // Show authentication screen if not signed in
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={globalStyles.container}>
        <AuthScreen 
          onSignIn={handleSignIn} 
          onConfirmCode={handleConfirmCode}
          loading={authLoading} 
          otpSent={otpSent}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={globalStyles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <View>
              <Text style={globalStyles.title}>Cart Tracker</Text>
              <Text style={globalStyles.subtitle}>
                📱 {user?.phoneNumber}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={signOut}
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                padding: 8, 
                borderRadius: 4 
              }}
            >
              <Text style={{ color: '#fff', fontSize: 12 }}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={globalStyles.content}>
          <LocationButton 
            onPress={handleRideRequest}
            loading={locationLoading || rideLoading}
            hasActiveRequest={hasActiveRequest || false}
            statusMessage={getStatusMessage()}
          />

          {/* Show ride status if there's an active request */}
          {currentRequest && (
            <RideStatus 
              rideRequest={currentRequest}
              onCancel={handleCancelRide}
              loading={rideLoading}
            />
          )}

          {/* Show errors */}
          {error && (
            <ErrorDisplay 
              error={error} 
              onRetry={getCurrentPosition} 
            />
          )}

          {rideError && (
            <ErrorDisplay 
              error={rideError} 
              onRetry={() => {}} 
            />
          )}

          {/* Show info when no location and no active request */}
          {!location && !error && !locationLoading && !hasActiveRequest && (
            <InfoDisplay 
              message="Tap 'Call Go Cart' to request a cart. We'll get your location and find an available cart nearby."
            />
          )}

          {/* Show map when location is available */}
          {location && (
            <MapLocation location={location} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
