// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB5njjeJzVsQbOwPHPCv246bqavSz0ZpjU",
  authDomain: "internlink-defe9.firebaseapp.com",
  databaseURL: "https://internlink-defe9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "internlink-defe9",
  storageBucket: "internlink-defe9.firebasestorage.app",
  messagingSenderId: "1028110501477",
  appId: "1:1028110501477:web:bea8c64bda08326235a88c",
  measurementId: "G-50SGHKR860"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);