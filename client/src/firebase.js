// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";

const provider = new GoogleAuthProvider();
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDIq28gokgnwWDjp9WfWkcfNTWlgAUjwng",
  authDomain: "fitbuddy-a37df.firebaseapp.com",
  projectId: "fitbuddy-a37df",
  storageBucket: "fitbuddy-a37df.firebasestorage.app",
  messagingSenderId: "572601960845",
  appId: "1:572601960845:web:ed1a15714a2afa356cd5c4",
  measurementId: "G-GSJ5K0663F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth, provider };