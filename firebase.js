import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword,signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js';

    // Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyAOluooURyiYp6R-4BWdLwZNs9f3VZreaY",
      authDomain: "pkkdesasidomulyo.firebaseapp.com",
      projectId: "pkkdesasidomulyo",
      storageBucket: "pkkdesasidomulyo.firebasestorage.com",
      messagingSenderId: "647872499017",
      appId: "1:647872499017:web:6a12f09da5018a0c769e98",
      measurementId: "G-0T78MDY5ED",
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Initialize Analytics (optional, for web only)
    let analytics;
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }

    /**
     * Check user authentication and fetch user data.
     * @returns {Promise<{user: Object|null, userData: Object|null}>}
     */
    const checkAuthAndFetchUser = async () => {
      return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              const userDoc = doc(db, "users", user.uid); // Assuming "users" collection
              const userSnap = await getDoc(userDoc);

              if (userSnap.exists()) {
                console.log("User data fetched successfully:", userSnap.data());
                resolve({ user, userData: userSnap.data() });
              } else {
                console.warn(`No Firestore document found for user: ${user.uid}`);
                resolve({ user, userData: null });
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
              reject(error);
            }
          } else {
            console.log("No user is currently logged in");
            resolve({ user: null, userData: null });
          }
        });
      });
    };

    /**
     * Log out the current user.
     * @returns {Promise<void>}
     */
    const logoutUser = async () => {
      try {
        await signOut(auth);
        console.log("User logged out successfully");
      } catch (error) {
        console.error("Error during logout:", error);
        throw error;
      }
    };

    export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword};