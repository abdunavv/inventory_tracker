// Import the functions you need from the SDKs you need
import{initializeApp} from 'firebase/app'
import {getFirestore} from 'firebase/firestore' 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDLSCT1KKdKWiuGF10zMYbCol76suZxz8I",
  authDomain: "inventory-management-26b4c.firebaseapp.com",
  projectId: "inventory-management-26b4c",
  storageBucket: "inventory-management-26b4c.appspot.com",
  messagingSenderId: "329399768463",
  appId: "1:329399768463:web:8fb4f9beb9fd9f828267fa",
  measurementId: "G-BZQCH1FV0E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const firestore = getFirestore(app)


export{firestore}