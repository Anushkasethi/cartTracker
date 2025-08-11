import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { statusStyles, buttonStyles } from '../styles/componentStyles';

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  return (
    <View style={statusStyles.errorContainer}>
      <Text style={statusStyles.errorText}>{error}</Text>
      <TouchableOpacity style={buttonStyles.secondary} onPress={onRetry}>
        <Text style={buttonStyles.secondaryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

interface InfoDisplayProps {
  message: string;
}

export const InfoDisplay: React.FC<InfoDisplayProps> = ({ message }) => {
  return (
    <View style={statusStyles.infoContainer}>
      <Text style={statusStyles.infoText}>{message}</Text>
    </View>
  );
};
