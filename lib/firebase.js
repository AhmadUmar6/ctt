import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcIA93ki-vzIH3qA3pumngf7fBAErqTes",
  authDomain: "ctpredictor.firebaseapp.com",
  projectId: "ctpredictor",
  storageBucket: "ctpredictor.firebasestorage.app",
  messagingSenderId: "291991256427",
  appId: "1:291991256427:web:8f65e2410a687d785ae02e",
  measurementId: "G-1EEDRD68TR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);