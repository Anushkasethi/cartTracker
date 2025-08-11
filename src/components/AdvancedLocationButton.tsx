import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Animated } from 'react-native';
import { buttonStyles } from '../styles/componentStyles';

interface AdvancedLocationButtonProps {
  onPress: () => void;
  loading: boolean;
  disabled?: boolean;
}

export const AdvancedLocationButton: React.FC<AdvancedLocationButtonProps> = ({ 
  onPress, 
  loading, 
  disabled = false 
}) => {
  const [buttonState, setButtonState] = useState<'idle' | 'requesting' | 'sent' | 'matching'>('idle');
  const [scaleValue] = useState(new Animated.Value(1));
  const [countdown, setCountdown] = useState(0);

  const handlePress = () => {
    if (buttonState !== 'idle') return;

    // Animate button press
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Start the state progression
    setButtonState('requesting');
    onPress();

    // Simulate the state progression
    setTimeout(() => setButtonState('sent'), 1000);
    setTimeout(() => {
      setButtonState('matching');
      setCountdown(30); // 30 second countdown
    }, 2000);
  };

  // Countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && buttonState === 'matching') {
      // Reset after countdown
      setButtonState('idle');
    }
  }, [countdown, buttonState]);

  const getButtonText = () => {
    if (loading) return null;
    
    switch (buttonState) {
      case 'requesting':
        return 'Sending request...';
      case 'sent':
        return 'Request sent!';
      case 'matching':
        return `Matching you... ${countdown}s`;
      default:
        return 'Call Go Cart';
    }
  };

  const getButtonStyle = () => {
    if (disabled) return [buttonStyles.primary, buttonStyles.disabled];
    
    switch (buttonState) {
      case 'requesting':
        return [buttonStyles.primary, { backgroundColor: '#ff9800' }]; // Orange
      case 'sent':
        return [buttonStyles.primary, buttonStyles.success];
      case 'matching':
        return [buttonStyles.primary, { backgroundColor: '#2196F3' }]; // Blue
      default:
        return buttonStyles.primary;
    }
  };

  const isDisabled = loading || disabled || buttonState !== 'idle';

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={handlePress}
        disabled={isDisabled}
      >
        {loading || buttonState === 'requesting' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={buttonStyles.text}>{getButtonText()}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};
