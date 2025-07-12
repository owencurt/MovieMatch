// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAkenWFOF-8kxft0GEhhjdXxi_8d1Ym2lc",
  authDomain: "movierecproject-c1ce7.firebaseapp.com",
  projectId: "movierecproject-c1ce7",
  storageBucket: "movierecproject-c1ce7.firebasestorage.app",
  messagingSenderId: "1074368368651",
  appId: "1:1074368368651:web:478511fad6ea85ad1ef70e",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
