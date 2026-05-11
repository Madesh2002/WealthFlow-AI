import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  processing: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Sync profile to Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              displayName: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              updatedAt: serverTimestamp()
            });
          }
        } catch (err) {
          console.error("Firestore sync error:", err);
        }
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const signInWithGoogle = async () => {
    if (processing) return;
    
    setProcessing(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    
    // Set custom parameters to force account selection if needed
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Auth error details:", err);
      if (err.code === 'auth/popup-blocked') {
        setError("Sign-in popup was blocked by your browser. Please enable popups for this site and try again.");
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError("A previous sign-in attempt was cancelled or is still in progress.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in was cancelled. Please try again.");
      } else {
        setError(err.message || "An error occurred during sign-in. Please try again.");
      }
    } finally {
      setProcessing(false);
    }
  };

  const logout = () => signOut(auth);

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setProcessing(true);
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(result.user, { displayName: name });
      // The onAuthStateChanged will handle the rest
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err.message || "An error occurred during registration.");
      throw err;
    } finally {
      setProcessing(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setProcessing(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.message || "An error occurred during sign-in.");
      throw err;
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      processing, 
      error, 
      signInWithGoogle, 
      signUpWithEmail,
      signInWithEmail,
      logout, 
      clearError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
