import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser 
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Add specific login hint for sinha.raj638@gmail.com
googleProvider.setCustomParameters({
  login_hint: 'sinha.raj638@gmail.com',
  prompt: 'select_account'
});

// List of verified admin emails
export const ADMIN_EMAILS = [
  'sinha.raj638@gmail.com'
];

// Check if user has admin privileges
export const isAdminUser = (user: FirebaseUser | null) => {
  if (!user) return false;
  return ADMIN_EMAILS.includes(user.email || '');
};

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Check if the user signing in is one of our special admin users
    if (result.user && ADMIN_EMAILS.includes(result.user.email || '')) {
      console.log('Admin user logged in:', result.user.email);
      
      // We could set custom user claims or give special privileges here
      try {
        await fetch('/api/admin/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: result.user.email,
            uid: result.user.uid,
          }),
        });
      } catch (e) {
        // Non-blocking error - just log it
        console.warn('Could not register admin privileges', e);
      }
    }
    
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    throw error;
  }
};

// Sign out
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};

// Auth state listener
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};
