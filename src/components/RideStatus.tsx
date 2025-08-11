import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { buttonStyles } from '../styles/componentStyles';
import { RideRequest } from '../services/FirebaseService';

interface RideStatusProps {
  rideRequest: RideRequest | null;
  onCancel?: () => void;
  loading?: boolean;
}

export const RideStatus: React.FC<RideStatusProps> = ({ 
  rideRequest, 
  onCancel,
  loading = false 
}) => {
  if (!rideRequest) return null;

  const getStatusColor = () => {
    switch (rideRequest.status) {
      case 'pending':
        return '#ff9800'; // Orange
      case 'accepted':
        return '#2196F3'; // Blue
      case 'on_way':
        return '#4CAF50'; // Green
      case 'arrived':
        return '#4CAF50'; // Green
      case 'completed':
        return '#4CAF50'; // Green
      case 'cancelled':
        return '#f44336'; // Red
      default:
        return '#666';
    }
  };

  const getStatusText = () => {
    switch (rideRequest.status) {
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
        return 'Unknown status';
    }
  };

  const showCancelButton = rideRequest.status === 'pending';

  return (
    <View style={{
      backgroundColor: '#fff',
      padding: 20,
      marginVertical: 10,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 15 
      }}>
        <View style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: getStatusColor(),
          marginRight: 10,
        }} />
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#333',
          flex: 1,
        }}>
          {getStatusText()}
        </Text>
      </View>

      <View style={{ marginBottom: 10 }}>
        <Text style={{ fontSize: 14, color: '#666' }}>
          Pickup Location:
        </Text>
        <Text style={{ fontSize: 16, color: '#333', marginTop: 2 }}>
          {rideRequest.location.address || 
           `${rideRequest.location.latitude.toFixed(6)}, ${rideRequest.location.longitude.toFixed(6)}`}
        </Text>
      </View>

      <View style={{ marginBottom: 15 }}>
        <Text style={{ fontSize: 14, color: '#666' }}>
          Requested: {rideRequest.requestedAt.toLocaleTimeString()}
        </Text>
        {rideRequest.acceptedAt && (
          <Text style={{ fontSize: 14, color: '#666' }}>
            Accepted: {rideRequest.acceptedAt.toLocaleTimeString()}
          </Text>
        )}
      </View>

      {rideRequest.operatorInfo && (
        <View style={{
          backgroundColor: '#f5f5f5',
          padding: 15,
          borderRadius: 8,
          marginBottom: 15,
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 }}>
            Cart Operator
          </Text>
          {rideRequest.operatorInfo.displayName && (
            <Text style={{ fontSize: 14, color: '#666' }}>
              {rideRequest.operatorInfo.displayName}
            </Text>
          )}
          {rideRequest.operatorInfo.phoneNumber && (
            <Text style={{ fontSize: 14, color: '#666' }}>
              {rideRequest.operatorInfo.phoneNumber}
            </Text>
          )}
        </View>
      )}

      {showCancelButton && onCancel && (
        <TouchableOpacity
          style={[buttonStyles.primary, { backgroundColor: '#f44336' }]}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={buttonStyles.text}>
            Cancel Request
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
