import { initializeApp } from "@firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  onAuthStateChanged,
} from "@firebase/auth";
import React, { useEffect, useState } from "react";
import AppNavigator from "./AppNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
 const firebaseConfig = {
  apiKey: "AIzaSyCFRTTAcWQQZVTDj5rzMBiR9nzZd8Hk6Ok",
  authDomain: "cseseminarhallbooking.firebaseapp.com",
  databaseURL:
    "https://cseseminarhallbooking-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cseseminarhallbooking",
  storageBucket: "cseseminarhallbooking.appspot.com",
  messagingSenderId: "49067733135",
  appId: "1:49067733135:web:8c800f7fa02bf6e427c0fa",
  measurementId: "G-Y92SK4P7D6",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const App = () => {
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Check if auth is already initialized
    if (!authInitialized) {
      try {
        // Wait for the auth state to change
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          // For simplicity, logging user status
          console.log(user ? "User is logged in" : "User is not logged in");

          // Mark auth as initialized
          setAuthInitialized(true);
        });

        // Clean up the subscription when the component unmounts
        return () => unsubscribe();
      } catch (error) {
        console.error("Error initializing Firebase authentication:", error);
      }
    }
  }, [authInitialized]);

  return <AppNavigator />;
};

export default App;
