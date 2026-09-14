/**
 * Crestline Realty Group — Firebase Configuration
 * 
 * HOW TO CONNECT YOUR REAL FIREBASE PROJECT:
 * 1. Go to https://console.firebase.google.com/ and create a project (e.g. "crestline-realty").
 * 2. In Firebase Console > Authentication > Sign-in method:
 *    - Enable "Email/Password"
 *    - Enable "Google" (add your support email)
 *    - In "Authorized domains", ensure "localhost" and your production domain are listed.
 * 3. In Project Settings > General > "Your apps" > Add Web App (`</>`).
 * 4. Copy the `firebaseConfig` object and paste your keys below!
 */

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyDemoCrestlineRealtyKey1234567890abcdef",
  authDomain: "crestline-realty-prod.firebaseapp.com",
  projectId: "crestline-realty-prod",
  storageBucket: "crestline-realty-prod.appspot.com",
  messagingSenderId: "109876543210",
  appId: "1:109876543210:web:abcdef1234567890abcdef"
};

// Check if live production keys are active
window.FIREBASE_IS_CONFIGURED = function () {
  return (
    window.FIREBASE_CONFIG &&
    window.FIREBASE_CONFIG.apiKey &&
    !window.FIREBASE_CONFIG.apiKey.startsWith("AIzaSyDemo") &&
    window.FIREBASE_CONFIG.projectId !== "crestline-realty-prod"
  );
};
