import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export interface User {
  uid: string;
  phoneNumber: string;
  displayName?: string;
  userType: 'rider' | 'operator';
  createdAt: Date;
  isActive: boolean;
  hasSelectedRole?: boolean;
}

export interface RideRequest {
  id?: string;
  riderId: string;
  riderInfo: {
    displayName?: string;
    phoneNumber?: string;
  };
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: 'pending' | 'accepted' | 'on_way' | 'arrived' | 'completed' | 'cancelled';
  operatorId?: string;
  operatorInfo?: {
    displayName?: string;
    phoneNumber?: string;
  };
  requestedAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  estimatedArrival?: Date;
}

class FirebaseService {
  private phoneConfirmation: FirebaseAuthTypes.ConfirmationResult | null = null;

  /** Step 1: send the OTP */
  async startPhoneSignIn(phoneNumber: string): Promise<void> {
    try {
      this.phoneConfirmation = await auth().signInWithPhoneNumber(phoneNumber);
    } catch (error: any) {
      if (error.code === 'auth/invalid-phone-number') {
        throw new Error('Invalid phone number format.');
      }
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many attempts. Try again later.');
      }
      console.error('startPhoneSignIn error:', error);
      throw error;
    }
  }

  /** Step 2: confirm the OTP and ensure the profile exists */
  async confirmPhoneCode(code: string): Promise<User> {
    if (!this.phoneConfirmation) throw new Error('No pending phone sign-in. Start again.');
    try {
      const cred = await this.phoneConfirmation.confirm(code);
      this.phoneConfirmation = null;

      if (!cred || !cred.user) {
        throw new Error('Failed to confirm code or retrieve user.');
      }
      await this.ensureProfile(cred.user);

      const appUser = await this.getCurrentUser();
      if (!appUser) throw new Error('Profile not found after sign-in.');
      return appUser;
    } catch (error: any) {
      if (error.code === 'auth/invalid-verification-code' || error.code === 'auth/code-expired') {
        throw new Error('Invalid or expired code.');
      }
      console.error('confirmPhoneCode error:', error);
      throw error;
    }
  }

  /** Create/merge /users/{uid} with phone number required */
  private async ensureProfile(firebaseUser: FirebaseAuthTypes.User): Promise<void> {
    const ref = firestore().collection('users').doc(firebaseUser.uid);
    const snap = await ref.get();

    const base: any = {
      uid: firebaseUser.uid,
      phoneNumber: firebaseUser.phoneNumber!, // Phone number is required
      isActive: true,
      displayName: firebaseUser.displayName,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };
    
    if (!snap.exists) {
      base.createdAt = firestore.FieldValue.serverTimestamp();
      // Don't set userType on first creation - let user choose
      base.hasSelectedRole = false;
    }

    await ref.set(base, { merge: true });
  }

  async getCurrentUser(): Promise<User | null> {
    const currentUser = auth().currentUser;
    if (!currentUser) return null;

    try {
      const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
      if (!userDoc.exists) return null;
      const data = userDoc.data() || {};

      return {
        uid: currentUser.uid,
        phoneNumber: data.phoneNumber || currentUser.phoneNumber || '',
        displayName: data.displayName,
        userType: data.userType ?? 'rider',
        createdAt: data?.createdAt?.toDate?.() || new Date(),
        isActive: data.isActive ?? true,
        hasSelectedRole: data.hasSelectedRole ?? false,
      } as User;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
  async updateUserRole(uid: string, userType: 'rider' | 'operator'): Promise<void> {
  try {
    await firestore().collection('users').doc(uid).update({
      userType,
      hasSelectedRole: true,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Role "${userType}" saved for user ${uid}`);
  } catch (error) {
    console.error('Error updating role:', error);
    throw error;
  }
}

  async signOut(): Promise<void> {
    try {
      this.phoneConfirmation = null;
      await auth().signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }

  // Ride Request Methods
  async createRideRequest(
    riderId: string, 
    location: { latitude: number; longitude: number; address?: string }
  ): Promise<string> {
    try {
      console.log('🔄 Creating ride request for rider:', riderId);
      console.log('📍 Location data:', location);
      
      // Get rider info
      const riderDoc = await firestore()
        .collection('users')
        .doc(riderId)
        .get();
      
      if (!riderDoc.exists()) {
        throw new Error('Rider document not found');
      }
      
      const riderData = riderDoc.data() as User;
      console.log('👤 Rider data:', riderData);
      
      // Filter out undefined values for Firestore
      const riderInfo: { displayName?: string; phoneNumber?: string } = {};
      if (riderData?.displayName) riderInfo.displayName = riderData.displayName;
      if (riderData?.phoneNumber) riderInfo.phoneNumber = riderData.phoneNumber;
      
      const rideRequest: RideRequest = {
        riderId,
        riderInfo,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          ...(location.address && { address: location.address }),
        },
        status: 'pending',
        requestedAt: new Date(),
      };

      console.log('📝 Final ride request data:', rideRequest);

      const docRef = await firestore()
        .collection('rideRequests')
        .add({
          ...rideRequest,
          requestedAt: firestore.Timestamp.fromDate(rideRequest.requestedAt),
        });

      console.log('✅ Ride request created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating ride request:', error);
      throw error;
    }
  }

  async getRideRequest(requestId: string): Promise<RideRequest | null> {
    try {
      const doc = await firestore()
        .collection('rideRequests')
        .doc(requestId)
        .get();
      
      if (doc.exists()) {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          requestedAt: data?.requestedAt?.toDate() || new Date(),
          acceptedAt: data?.acceptedAt?.toDate(),
          completedAt: data?.completedAt?.toDate(),
          estimatedArrival: data?.estimatedArrival?.toDate(),
        } as RideRequest;
      }
      return null;
    } catch (error) {
      console.error('Error getting ride request:', error);
      return null;
    }
  }

  async updateRideRequestStatus(
    requestId: string, 
    status: RideRequest['status'],
    operatorInfo?: { operatorId: string; displayName?: string; phoneNumber?: string }
  ): Promise<void> {
    try {
      const updateData: any = { status };
      
      if (status === 'accepted' && operatorInfo) {
        updateData.operatorId = operatorInfo.operatorId;
        updateData.operatorInfo = {
          displayName: operatorInfo.displayName,
          phoneNumber: operatorInfo.phoneNumber,
        };
        updateData.acceptedAt = firestore.Timestamp.now();
      }
      
      if (status === 'completed') {
        updateData.completedAt = firestore.Timestamp.now();
      }

      await firestore()
        .collection('rideRequests')
        .doc(requestId)
        .update(updateData);
    } catch (error) {
      console.error('Error updating ride request status:', error);
      throw error;
    }
  }

  // Listen to ride request status changes
  listenToRideRequest(
    requestId: string, 
    callback: (rideRequest: RideRequest | null) => void
  ): () => void {
    const unsubscribe = firestore()
      .collection('rideRequests')
      .doc(requestId)
      .onSnapshot(
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            const rideRequest: RideRequest = {
              id: doc.id,
              ...data,
              requestedAt: data?.requestedAt?.toDate() || new Date(),
              acceptedAt: data?.acceptedAt?.toDate(),
              completedAt: data?.completedAt?.toDate(),
              estimatedArrival: data?.estimatedArrival?.toDate(),
            } as RideRequest;
            callback(rideRequest);
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error('Error listening to ride request:', error);
          callback(null);
        }
      );

    return unsubscribe;
  }

  // Get pending ride requests for operators
  async getPendingRideRequests(): Promise<RideRequest[]> {
    try {
      const snapshot = await firestore()
        .collection('rideRequests')
        .where('status', '==', 'pending')
        .orderBy('requestedAt', 'desc')
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          requestedAt: data?.requestedAt?.toDate() || new Date(),
          acceptedAt: data?.acceptedAt?.toDate(),
          completedAt: data?.completedAt?.toDate(),
          estimatedArrival: data?.estimatedArrival?.toDate(),
        } as RideRequest;
      });
    } catch (error) {
      console.error('Error getting pending ride requests:', error);
      return [];
    }
  }

  // Get rider's current/recent ride requests
  async getRiderRequests(riderId: string): Promise<RideRequest[]> {
    try {
      const snapshot = await firestore()
        .collection('rideRequests')
        .where('riderId', '==', riderId)
        .orderBy('requestedAt', 'desc')
        .limit(10)
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          requestedAt: data?.requestedAt?.toDate() || new Date(),
          acceptedAt: data?.acceptedAt?.toDate(),
          completedAt: data?.completedAt?.toDate(),
          estimatedArrival: data?.estimatedArrival?.toDate(),
        } as RideRequest;
      });
    } catch (error) {
      console.error('Error getting rider requests:', error);
      return [];
    }
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService;
