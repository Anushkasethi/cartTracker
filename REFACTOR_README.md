# Cart Tracker - Refactored Structure

## Overview
This React Native app has been refactored to improve code organization and maintainability by separating concerns into dedicated service files.

## Project Structure

```
CartTracker/
├── src/
│   ├── components/
│   │   ├── LocationDisplay.tsx    # Location data display component
│   │   ├── LocationButton.tsx     # Reusable location button
│   │   └── StatusDisplay.tsx      # Error & info display components
│   ├── hooks/
│   │   └── useLocation.ts         # Custom location hook
│   ├── services/
│   │   └── LocationService.ts     # Location business logic
│   └── styles/
│       └── globalStyles.ts        # Centralized styles & theme
├── App.tsx                        # Main app (ultra-clean, 45 lines!)
├── package.json
└── README.md
```

## Key Improvements

### 1. **LocationService.ts** - Business Logic
- All geolocation functionality in dedicated service
- Handles permissions, fallback strategies, and error formatting
- Provides utility methods for formatting and calculations

### 2. **Components** - Reusable UI Pieces
- `LocationDisplay.tsx` - Shows location data (reusable)
- `LocationButton.tsx` - Button with loading states
- `StatusDisplay.tsx` - Error and info messages

### 3. **Custom Hook** - State Management
- `useLocation.ts` - Encapsulates all location state logic
- Provides clean API: `{ location, loading, error, getCurrentPosition }`

### 4. **Global Styles** - Design System
- Centralized colors, spacing, and common styles
- Consistent theme across components

### 5. **App.tsx** - Ultra Clean (45 lines!)
- Now only handles app structure and composition
- No business logic, no styles, no state management
- Pure presentation layer

## LocationService Features

### Core Methods
- `getCurrentPosition()` - Get current location with fallback strategy
- `watchPosition()` - Continuous location tracking
- `clearWatch()` - Stop location tracking
- `requestLocationPermission()` - Handle Android permissions

### Utility Methods
- `formatCoordinate()` - Format lat/lng for display
- `formatTimestamp()` - Format time for display  
- `calculateDistance()` - Calculate distance between coordinates

### Smart Location Strategy
1. **Quick attempt**: Cache/network location (5 sec timeout)
2. **Fallback**: High-accuracy GPS (15 sec timeout)
3. **Error handling**: User-friendly error messages

## Benefits of This Structure

✅ **Separation of Concerns**: UI logic separate from location logic
✅ **Reusability**: LocationService can be used by other components  
✅ **Testability**: Service can be unit tested independently
✅ **Maintainability**: Changes to location logic don't affect UI
✅ **Scalability**: Easy to add new location features
✅ **Type Safety**: Full TypeScript support with proper interfaces

## Usage Examples

### Basic Location Retrieval
```typescript
import { LocationService } from './src/services/LocationService';

const getLocation = async () => {
  try {
    const location = await LocationService.getCurrentPosition();
    console.log(`Lat: ${location.latitude}, Lng: ${location.longitude}`);
  } catch (error) {
    console.error('Location error:', error.message);
  }
};
```

### Continuous Tracking
```typescript
const watchId = LocationService.watchPosition(
  (location) => {
    console.log('New location:', location);
  },
  (error) => {
    console.error('Location error:', error.message);
  },
  { distanceFilter: 10 } // Update every 10 meters
);

// Stop tracking
LocationService.clearWatch(watchId);
```

## Next Steps for Further Organization

Consider adding these additional service files as the app grows:

- `src/services/StorageService.ts` - Handle data persistence
- `src/services/CartService.ts` - Business logic for cart tracking
- `src/components/LocationDisplay.tsx` - Reusable location UI component
- `src/hooks/useLocation.ts` - Custom React hook for location state
- `src/types/index.ts` - Centralized type definitions

## Running the App

```bash
# Install dependencies
npm install

# Run on Android
npm run android

# Run on iOS  
npm run ios
```

The refactored app maintains the same functionality while being much more organized and maintainable!
