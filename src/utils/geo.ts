// src/utils/geo.ts
export function haversine(a: {lat:number,lng:number}, b:{lat:number,lng:number}) {
  const R = 6371e3; // meters
  const toRad = (x:number)=> x*Math.PI/180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat/2)**2 +
            Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;
  const d = 2*R*Math.asin(Math.sqrt(s));
  return d; // meters
}
export function etaMinutes(distanceMeters: number, avgSpeedKmh = 15) {
  const mPerMin = (avgSpeedKmh * 1000) / 60;
  return Math.max(1, Math.round(distanceMeters / mPerMin));
}
