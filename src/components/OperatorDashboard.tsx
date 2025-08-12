import React from 'react';
import { Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import firestore from '@react-native-firebase/firestore';
import { useOperatorTracking } from '../hooks/useOperatorTracking';
import { OperatorMap } from '../components/OperatorMap';
type User = {
  uid: string;
  displayName?: string;
  phoneNumber?: string;
  // Add other fields as needed
};

export const OperatorDashboard: React.FC<{ user: User; onSignOut: () => void }> = ({ user, onSignOut }) => {
  console.log('🚀 OperatorDashboard rendered with user:', user);
  
  const [pending, setPending] = React.useState<any[]>([]);
  const { lastLocation } = useOperatorTracking(user.uid, true);
  console.log('📍 OperatorDashboard - Last Location:', lastLocation, 'User ID:', user.uid);  
  const [accepted, setAccepted] = React.useState<any[]>([]);

  React.useEffect(() => {
    const q1 = firestore().collection('rideRequests').where('status', '==', 'pending');
    const q2 = firestore().collection('rideRequests')
      .where('status', '==', 'accepted')
      .where('operatorId', '==', user.uid);

    const u1 = q1.onSnapshot(s => setPending(s.docs.map(d=>({ id:d.id, ...d.data() } as any))));
    const u2 = q2.onSnapshot(s => setAccepted(s.docs.map(d=>({ id:d.id, ...d.data() } as any))));
    return () => { u1(); u2(); };
  }, [user.uid]);

  const acceptRide = async (rideId: string) => {
    await firestore().collection('rideRequests').doc(rideId).update({
      status: 'accepted',
      operatorId: user.uid,
      operatorInfo: { displayName: user.displayName || '', phoneNumber: user.phoneNumber || '' },
      acceptedAt: firestore.FieldValue.serverTimestamp(),
    });
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text style={globalStyles.title}>Operator Dashboard</Text>
          <TouchableOpacity 
            onPress={onSignOut}
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
      
      <OperatorMap
        myLocation={lastLocation}
        pending={pending.map(r => ({ id: r.id, location: r.location }))}
        accepted={accepted.map(r => ({ id: r.id, location: r.location }))}
        onAccept={acceptRide}
      />
    </SafeAreaView>
  );
};