// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
   apiKey: "AIzaSyDIunY6uoGGkkRMvgRxKf00AjUll0TYiZE",
   authDomain: "the-middle-exam.firebaseapp.com",
   projectId: "the-middle-exam",
   storageBucket: "the-middle-exam.firebasestorage.app",
   messagingSenderId: "741409725175",
   appId: "1:741409725175:web:cdb03b95bb95c1bb00d1f2",
   measurementId: "G-RHQX34ZCQG",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {auth,db}