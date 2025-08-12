// src/components/RiderLiveMap.tsx
import React, { useMemo } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { haversine, etaMinutes } from '../utils/geo';

export const RiderLiveMap = ({
  riderLocation,
  cartLocation,
}: {
  riderLocation: { latitude: number; longitude: number };
  cartLocation: { latitude: number; longitude: number } | null;
}) => {
  const region = useMemo(() => ({
    latitude: riderLocation.latitude,
    longitude: riderLocation.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }), [riderLocation]);

  const etaText = useMemo(() => {
    if (!cartLocation) return '';
    const d = haversine(
      { lat: cartLocation.latitude, lng: cartLocation.longitude },
      { lat: riderLocation.latitude, lng: riderLocation.longitude }
    );
    return `${etaMinutes(d)} min`;
  }, [cartLocation, riderLocation]);

  return (
    <>
      <MapView style={{ height: 280, borderRadius: 12, overflow: 'hidden' }} initialRegion={region}>
        <Marker coordinate={riderLocation} title="You" />
        {cartLocation && (
          <>
            <Marker coordinate={cartLocation} pinColor="green" title={`Cart ${etaText}`} />
            <Polyline
              coordinates={[cartLocation, riderLocation]}
              strokeWidth={4}
            />
          </>
        )}
      </MapView>
      {cartLocation && <></>}
    </>
  );
};
