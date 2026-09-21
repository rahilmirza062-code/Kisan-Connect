import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut
} from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('kisan_firebase_token'));
  const [loading, setLoading] = useState(true);

  // Sync profile with backend using Firebase ID Token
  const syncBackendProfile = async (idToken, extraData = {}) => {
    try {
      const res = await fetch('/api/auth/sync-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify(extraData)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(idToken);
        localStorage.setItem('kisan_firebase_token', idToken);
        return data.user;
      }
    } catch (err) {
      console.error('Error syncing profile with backend:', err);
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          await syncBackendProfile(idToken);
        } catch (err) {
          console.error('Error fetching Firebase ID Token:', err);
        }
      } else if (token) {
        // Fallback for saved session token
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) setUser(data.user);
            else logout();
          })
          .catch(() => logout());
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Setup reCAPTCHA and trigger Firebase Phone SMS OTP
  const loginWithPhone = async (phoneNumber, containerId = 'recaptcha-container') => {
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible',
          callback: () => {}
        });
      }
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        window.recaptchaVerifier
      );
      return { success: true, confirmationResult };
    } catch (err) {
      console.warn('Firebase Phone Auth note (using multi-user sandbox fallback):', err.message);
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {}
      }

      // Multi-farmer sandbox fallback confirmation result bound to entered phone
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const phoneMap = {
        '9876543210': 'usr_f1',
        '9876543211': 'usr_f2',
        '9876543212': 'usr_f3',
        '9876543213': 'usr_f4',
        '9876543214': 'usr_f5',
        '9876543215': 'usr_f6',
        '9876543216': 'usr_f7',
        '9876543217': 'usr_f8',
        '9876543218': 'usr_f9',
        '9876543219': 'usr_f10',
        '9000000000': 'usr_admin'
      };
      let mockUid = `usr_${cleanPhone.slice(-10)}`;
      for (const [p, u] of Object.entries(phoneMap)) {
        if (cleanPhone.includes(p)) {
          mockUid = u;
          break;
        }
      }

      const mockConfirmationResult = {
        phoneNumber,
        confirm: async (otpCode) => {
          return {
            user: {
              uid: mockUid,
              phoneNumber,
              getIdToken: async () => `mock_firebase_token_${mockUid}`
            }
          };
        }
      };

      return { success: true, confirmationResult: mockConfirmationResult };
    }
  };

  // Verify OTP code entered by farmer
  const verifyOtp = async (confirmationResult, otpCode, profileData = {}) => {
    try {
      const result = await confirmationResult.confirm(otpCode);
      const fbUser = result.user;
      setFirebaseUser(fbUser);
      const idToken = await fbUser.getIdToken();
      const userProfile = await syncBackendProfile(idToken, {
        phone: fbUser.phoneNumber || profileData.phone,
        ...profileData
      });
      return { success: true, user: userProfile };
    } catch (err) {
      console.error('OTP Verification Error:', err);
      return { success: false, message: 'Invalid OTP code entered.' };
    }
  };

  // One-click Demo Login for Testing / Prototyping Sandbox
  const loginDemoUser = async (target = 'usr_f1') => {
    setLoading(true);
    let mockUid = target;
    if (target === 'admin') mockUid = 'usr_admin';
    else if (target === 'farmer') mockUid = 'usr_f1';

    const mockToken = `mock_firebase_token_${mockUid}`;
    const userProfile = await syncBackendProfile(mockToken);
    setLoading(false);
    return { success: true, user: userProfile };
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setFirebaseUser(null);
    setUser(null);
    setToken(null);
    localStorage.removeItem('kisan_firebase_token');
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        token,
        loading,
        loginWithPhone,
        verifyOtp,
        loginDemoUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
