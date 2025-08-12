import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

export const Header: React.FC<{ title: string; subtitle?: string; onSignOut: () => void }> = ({ title, subtitle, onSignOut }) => (
  <View style={globalStyles.header}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <View>
        <Text style={globalStyles.title}>{title}</Text>
        {!!subtitle && <Text style={globalStyles.subtitle}>{subtitle}</Text>}
      </View>
      <TouchableOpacity onPress={onSignOut} style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 4 }}>
        <Text style={{ color: '#fff', fontSize: 12 }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  </View>
);