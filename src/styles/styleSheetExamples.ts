// React Native StyleSheet Reference & Examples

import { StyleSheet } from 'react-native';

// 📱 REACT NATIVE STYLES vs 🌐 WEB CSS

export const exampleStyles = StyleSheet.create({
  // LAYOUT STYLES
  container: {
    flex: 1,                    // 📱 RN: flex (no flexbox exactly like web)
    flexDirection: 'column',    // 📱 RN: 'row' | 'column' | 'row-reverse' | 'column-reverse'
    justifyContent: 'center',   // 📱 Same as CSS
    alignItems: 'center',       // 📱 Same as CSS
    width: '100%',              // 📱 RN: number | percentage string
    height: 200,                // 📱 RN: numbers are in density-independent pixels
  },

  // TEXT STYLES
  text: {
    fontSize: 16,               // 📱 RN: number (no 'px', 'em', 'rem')
    fontWeight: 'bold',         // 📱 RN: 'normal' | 'bold' | '100'-'900'
    color: '#333333',           // 📱 Same as CSS
    textAlign: 'center',        // 📱 Same as CSS
    lineHeight: 24,             // 📱 RN: number only
    // fontFamily: 'Arial',     // 📱 RN: Must be installed/registered
  },

  // BACKGROUND & BORDERS
  card: {
    backgroundColor: '#ffffff', // 📱 Same as CSS
    borderRadius: 8,            // 📱 RN: number (applies to all corners)
    borderWidth: 1,             // 📱 RN: number (no border-style needed)
    borderColor: '#dddddd',     // 📱 Same as CSS
    // 🌐 CSS: border: '1px solid #ddd' 
    // 📱 RN: Needs separate borderWidth + borderColor
  },

  // SPACING
  spacing: {
    padding: 20,                // 📱 Same as CSS
    paddingHorizontal: 15,      // 📱 RN: left + right padding
    paddingVertical: 10,        // 📱 RN: top + bottom padding
    margin: 10,                 // 📱 Same as CSS
    marginTop: 5,               // 📱 Same as CSS
  },

  // SHADOWS (PLATFORM SPECIFIC)
  shadow: {
    // iOS Shadow
    shadowColor: '#000',        // 📱 iOS only
    shadowOffset: {             // 📱 iOS only
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,        // 📱 iOS only
    shadowRadius: 3.84,         // 📱 iOS only
    
    // Android Shadow
    elevation: 5,               // 📱 Android only
  },

  // POSITIONING
  positioned: {
    position: 'absolute',       // 📱 RN: 'relative' | 'absolute'
    top: 10,                    // 📱 Same as CSS
    left: 10,                   // 📱 Same as CSS
    zIndex: 1,                  // 📱 Same as CSS
  },

  // WHAT'S NOT AVAILABLE (compared to CSS)
  // ❌ display: 'block' | 'inline' (everything is 'flex' by default)
  // ❌ float: 'left'
  // ❌ clear: 'both'
  // ❌ box-sizing: 'border-box'
  // ❌ cursor: 'pointer'
  // ❌ transition animations (use Animated API instead)
  // ❌ @media queries (use Dimensions API)
  // ❌ :hover, :focus pseudo-classes
});

// 🎨 ADVANCED STYLING TECHNIQUES

// 1. CONDITIONAL STYLES
export const getButtonStyle = (isPressed: boolean) => [
  exampleStyles.card,
  {
    backgroundColor: isPressed ? '#0066cc' : '#0088ff',
    transform: [{ scale: isPressed ? 0.95 : 1 }],
  }
];

// 2. RESPONSIVE STYLES
import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

export const responsiveStyles = StyleSheet.create({
  container: {
    width: width > 768 ? '50%' : '100%',  // Tablet vs Phone
  },
});

// 3. PLATFORM-SPECIFIC STYLES
import { Platform } from 'react-native';

export const platformStyles = StyleSheet.create({
  text: {
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    fontFamily: Platform.select({
      ios: 'Helvetica',
      android: 'Roboto',
    }),
  },
});

// 4. STYLE COMPOSITION
const baseButtonStyle = {
  padding: 10,
  borderRadius: 5,
  alignItems: 'center' as const,
};

export const composedStyles = StyleSheet.create({
  baseButton: baseButtonStyle,
  primaryButton: {
    ...baseButtonStyle,           // ✅ Correct way
    backgroundColor: '#007AFF',
  },
});

// ✅ Correct way to compose styles
export const correctComposition = StyleSheet.create({
  baseButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
});

// Usage: style={[correctComposition.baseButton, correctComposition.primaryButton]}
