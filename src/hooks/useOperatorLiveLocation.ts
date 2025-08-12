// src/hooks/useOperatorLiveLocation.ts
import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';

export function useOperatorLiveLocation(operatorId?: string) {
  const [loc, setLoc] = useState<{ latitude: number, longitude: number } | null>(null);
  useEffect(() => {
    if (!operatorId) return;
    const unsub = firestore().collection('operators').doc(operatorId)
      .onSnapshot(snap => {
        const d = snap.data();
        if (d?.location) setLoc(d.location);
      });
    return unsub;
  }, [operatorId]);
  return loc;
}
