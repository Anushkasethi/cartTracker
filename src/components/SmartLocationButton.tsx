import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { buttonStyles } from '../styles/componentStyles';

type ButtonState = 'call' | 'sending' | 'sent' | 'matching';

interface SmartLocationButtonProps {
  onPress: () => void;
  loading: boolean;
  disabled?: boolean;
  resetAfter?: number; // Reset button after X seconds (default: 8)
}

export const SmartLocationButton: React.FC<SmartLocationButtonProps> = ({ 
  onPress, 
  loading, 
  disabled = false,
  resetAfter = 8000 // 8 seconds default
}) => {
  const [state, setState] = useState<ButtonState>('call');

  const handlePress = () => {
    if (state !== 'call') return;

    setState('sending');
    onPress();

    // Progress through states
    setTimeout(() => setState('sent'), 1500);
    setTimeout(() => setState('matching'), 2500);
    
    // Reset after specified time
    setTimeout(() => setState('call'), resetAfter);
  };

  const getButtonConfig = () => {
    switch (state) {
      case 'sending':
        return {
          text: 'Sending request...',
          style: [buttonStyles.primary, { backgroundColor: '#ff9800' }],
          showSpinner: true
        };
      case 'sent':
        return {
          text: 'Request sent!',
          style: [buttonStyles.primary, buttonStyles.success],
          showSpinner: false
        };
      case 'matching':
        return {
          text: 'Matching you...',
          style: [buttonStyles.primary, { backgroundColor: '#2196F3' }],
          showSpinner: false
        };
      default:
        return {
          text: 'Call Go Cart',
          style: buttonStyles.primary,
          showSpinner: false
        };
    }
  };

  const config = getButtonConfig();
  const isDisabled = loading || disabled || state !== 'call';

  return (
    <TouchableOpacity
      style={[config.style, isDisabled && buttonStyles.disabled]}
      onPress={handlePress}
      disabled={isDisabled}
    >
      {(loading || config.showSpinner) ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={buttonStyles.text}>{config.text}</Text>
      )}
    </TouchableOpacity>
  );
};
