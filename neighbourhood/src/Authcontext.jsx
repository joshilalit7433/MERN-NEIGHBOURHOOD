// src/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "./firebaseConfig"; // Import auth from firebaseConfig.js
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "./firebaseConfig"; // Import firestore from firebaseConfig.js

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(firestore, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("AuthContext user data:", userData);
            setUser({ ...currentUser, role: userData.role });
          } else {
            console.log("No user doc found, setting user without role");
            setUser(currentUser); // Fallback without role
          }
        } catch (err) {
          console.error("Error fetching user role in AuthContext:", err);
          setUser(currentUser); // Fallback to user without role
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const value = { user, loading, setUser };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
