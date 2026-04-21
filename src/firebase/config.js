// Import Firebase core
import { initializeApp } from "firebase/app";

// ✅ Import services you need
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your config (this is correct 👍)
const firebaseConfig = {
  apiKey: "AIzaSyCuiu1qNSv2j_DfPiFF2yvxUwF5eWTqaB4",
  authDomain: "smart-intern-project.firebaseapp.com",
  projectId: "smart-intern-project",
  storageBucket: "smart-intern-project.firebasestorage.app",
  messagingSenderId: "173737637208",
  appId: "1:173737637208:web:8f652fdb9f6f455034a12d"
};

// Initialize app
const app = initializeApp(firebaseConfig);

// ✅ EXPORT THESE (VERY IMPORTANT)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);