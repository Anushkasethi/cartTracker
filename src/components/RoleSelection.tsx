import React from 'react';
import { View, Text, Button } from 'react-native';
import firebaseService from '../services/FirebaseService'; // adjust path
interface User {
  uid: string;
  // Add other user properties if needed
}

export default function RoleSelectionScreen({ 
  User, 
  onRoleSelected 
}: { 
  User: User;
  onRoleSelected?: () => void;
}) {
  const { uid } = User;

  const handleSelectRole = async (role: 'rider' | 'operator') => {
    try {
      await firebaseService.updateUserRole(uid, role);
      // Call the callback to refresh user data
      if (onRoleSelected) {
        onRoleSelected();
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Select Your Role</Text>
      <Button title="Rider" onPress={() => handleSelectRole('rider')} />
      <Button title="Cart Operator" onPress={() => handleSelectRole('operator')} />
    </View>
  );
}
