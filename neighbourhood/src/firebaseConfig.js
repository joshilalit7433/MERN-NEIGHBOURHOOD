// src/lib/FirebaseConfig.js
// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // For Authentication
import { getFirestore } from "firebase/firestore"; // For Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMVUDlJbMii3Gbm6fgCQUihZkhG0Ql_y4",
  authDomain: "neighbourhood-a42cc.firebaseapp.com",
  projectId: "neighbourhood-a42cc",
  storageBucket: "neighbourhood-a42cc.firebasestorage.app",
  messagingSenderId: "660704945594",
  appId: "1:660704945594:web:3d44fd21373b3195196983",
  measurementId: "G-0N8X50WDM7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Initialize Analytics (optional, if you need it)
const auth = getAuth(app); // Export Firebase Authentication
export const firestore = getFirestore(app); // Export Firestore
export { app, analytics, auth }; // Export the app and analytics for potential future use