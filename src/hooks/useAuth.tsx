import { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { firebaseService, User } from '../services/FirebaseService';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      console.log('🔔 Auth state changed:', firebaseUser ? 'User exists' : 'No user');
      
      if (firebaseUser) {
        try {
          const user = await firebaseService.getCurrentUser();
          console.log('👤 Found existing user:', user);
          setAuthState({
            user,
            loading: false,
            isAuthenticated: true,
          });
        } catch (error: any) {
          console.error('Error getting user data:', error);
          setAuthState({
            user: null,
            loading: false,
            isAuthenticated: false,
          });
        }
      } else {
        console.log('🚪 No authenticated user found');
        setAuthState({
          user: null,
          loading: false,
          isAuthenticated: false,
        });
        setOtpSent(false);
      }
    });

    return unsubscribe;
  }, []);

  const startPhoneSignIn = async (phoneNumber: string): Promise<void> => {
    setAuthState(s => ({ ...s, loading: true }));
    try {
      await firebaseService.startPhoneSignIn(phoneNumber);
      setOtpSent(true);
    } finally {
      setAuthState(s => ({ ...s, loading: false }));
    }
  };

  const confirmCode = async (code: string): Promise<User> => {
    setAuthState(s => ({ ...s, loading: true }));
    try {
      const user = await firebaseService.confirmPhoneCode(code);
      setOtpSent(false);
      return user;
    } finally {
      setAuthState(s => ({ ...s, loading: false }));
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      setOtpSent(false);
      await firebaseService.signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  return {
    ...authState,
    otpSent,
    startPhoneSignIn,
    confirmCode,
    signOut,
  };
};
