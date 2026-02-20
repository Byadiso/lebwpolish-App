import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/config"; // Ensure your firebase.js is updated (see below)
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Context & Custom Hook
export const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged works perfectly in React Native!
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (authUser) {
          setUser(authUser);
          
          // Fetch additional profile data from Firestore
          const userRef = doc(db, "users", authUser.uid);
          const snap = await getDoc(userRef);
          
          if (snap.exists()) {
            setProfile(snap.data());
          } else {
            setProfile(null);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("AuthContext Error:", err);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {/* In Mobile, we usually show a loading screen 
        instead of just hiding the children. 
      */}
      {children}
    </AuthContext.Provider>
  );
};