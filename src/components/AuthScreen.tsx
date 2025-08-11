import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { buttonStyles, authStyles } from '../styles/componentStyles';
import { PhoneInputComponent } from './PhoneInputComponent';

interface AuthScreenProps {
  onSignIn: (phoneNumber: string) => Promise<void>;
  onConfirmCode?: (code: string) => Promise<void>;
  loading: boolean;
  otpSent?: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ 
  onSignIn, 
  onConfirmCode,
  loading, 
  otpSent = false 
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const handlePhoneSubmit = async (phone: string) => {
    try {
      setPhoneNumber(phone);
      await onSignIn(phone);
    } catch (error) {
      Alert.alert('Sign In Failed', 'Please try again');
    }
  };

  const handleConfirmCode = async () => {
    try {
      if (!verificationCode.trim()) {
        Alert.alert('Error', 'Please enter the verification code');
        return;
      }
      if (onConfirmCode) {
        await onConfirmCode(verificationCode.trim());
      }
    } catch (error) {
      Alert.alert('Verification Failed', 'Invalid code. Please try again.');
    }
  };

  const resetToPhoneInput = () => {
    setVerificationCode('');
    setPhoneNumber('');
  };

  // If OTP was sent, show verification screen
  if (otpSent) {
    return (
      <View style={[globalStyles.container, authStyles.container]}>
        <View style={authStyles.headerContainer}>
          <Text style={[globalStyles.title, authStyles.titleContainer]}>
            Verify Phone Number
          </Text>
          <Text style={[globalStyles.subtitle, authStyles.subtitleContainer]}>
            Enter the code sent to {phoneNumber}
          </Text>
        </View>

        <View style={authStyles.phoneSection}>
          <Text style={authStyles.phoneLabel}>
            Verification Code
          </Text>
          <TextInput
            style={authStyles.phoneInput}
            placeholder="Enter 6-digit code"
            placeholderTextColor="#666"
            value={verificationCode}
            defaultValue='India'
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[buttonStyles.primary, authStyles.primaryButton]}
          onPress={handleConfirmCode}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={buttonStyles.text}>Verify Code</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[buttonStyles.secondary]}
          onPress={resetToPhoneInput}
          disabled={loading}
        >
          <Text style={[buttonStyles.text, authStyles.secondaryButtonText]}>
            Change Phone Number
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show phone input screen
  return (
    <View style={[globalStyles.container, authStyles.container]}>
      <View style={authStyles.headerContainer}>
        <Text style={[globalStyles.title, authStyles.titleContainer]}>
          Welcome to Cart Tracker
        </Text>
        <Text style={[globalStyles.subtitle, authStyles.subtitleContainer]}>
          Enter your phone number to get started
        </Text>
      </View>

      <PhoneInputComponent 
        onSubmit={handlePhoneSubmit}
        loading={loading}
      />

      <Text style={authStyles.termsText}>
        By continuing, you agree to our terms of service.
        {'\n'}This app is for riders only.
      </Text>
    </View>
  );
};
