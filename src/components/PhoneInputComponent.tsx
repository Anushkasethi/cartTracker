import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { authStyles, buttonStyles } from '../styles/componentStyles';

interface PhoneInputComponentProps {
  onSubmit: (e164: string) => void;
  loading?: boolean;
}

export const PhoneInputComponent: React.FC<PhoneInputComponentProps> = ({ 
  onSubmit, 
  loading = false 
}) => {
  const phoneInput = useRef<PhoneInput>(null);
  const [value, setValue] = useState('');
  const [_formatted, setFormatted] = useState(''); // E.164 when valid
  const [error, setError] = useState<string | null>(null);

  const handleGetOtp = () => {
    const isValid = phoneInput.current?.isValidNumber(value);
    const e164 = phoneInput.current?.getNumberAfterPossiblyEliminatingZero();
    
    if (!isValid || !e164?.formattedNumber) {
      setError('Please enter a valid phone number');
      return;
    }
    
    setError(null);
    onSubmit(e164.formattedNumber); // e.g. +919876543210
  };

  return (
    <View style={authStyles.phoneSection}>
      <Text style={authStyles.phoneLabel}>Phone Number</Text>
      <PhoneInput
        ref={phoneInput}
        defaultCode="IN"             // default India; user can change
        layout="first"
        value={value}
        onChangeText={setValue}
        onChangeFormattedText={setFormatted} // often E.164 already
        withDarkTheme={false}
        withShadow={false}
        autoFocus
        containerStyle={authStyles.phoneInputContainer}
        textContainerStyle={authStyles.phoneInputTextContainer}
        textInputStyle={authStyles.phoneInputText}
        disabled={loading}
      />
      {error ? (
        <Text style={[authStyles.phoneLabel, { color: 'red', marginTop: 8 }]}>
          {error}
        </Text>
      ) : null}
      
      <View style={{ marginTop: 16 }}>
        <TouchableOpacity
          style={[buttonStyles.primary]}
          onPress={handleGetOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={buttonStyles.text}>Get OTP</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
