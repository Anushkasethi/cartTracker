import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { buttonStyles } from '../styles/componentStyles';

interface LocationButtonProps {
  onPress: () => void;
  loading: boolean;
  disabled?: boolean;
  hasActiveRequest?: boolean;
  statusMessage?: string;
}

export const LocationButton: React.FC<LocationButtonProps> = ({ 
  onPress, 
  loading, 
  disabled = false,
  hasActiveRequest = false,
  statusMessage = ''
}) => {
  const getButtonText = () => {
    if (loading) return null;
    if (hasActiveRequest && statusMessage) return statusMessage;
    return "Call Go Cart";
  };

  const getButtonStyle = () => {
    if (disabled) return [buttonStyles.primary, buttonStyles.disabled];
    if (hasActiveRequest) return [buttonStyles.primary, buttonStyles.success];
    return buttonStyles.primary;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={loading || disabled || hasActiveRequest}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={buttonStyles.text}>{getButtonText()}</Text>
      )}
    </TouchableOpacity>
  );
};
