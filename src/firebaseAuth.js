import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'scriptomatics-key-manager.firebaseapp.com',
  databaseURL: 'https://scriptomatics-key-manager.firebaseio.com',
  projectId: 'scriptomatics-key-manager',
  storageBucket: 'scriptomatics-key-manager.appspot.com',
  messagingSenderId: '767796716389',
  appId: '1:767796716389:web:bb0fb776a9307406c9f78c',
  measurementId: 'G-Z47MX7JPS7'
}

// Initialize Firebase
export const initFirebase = () => {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig)
  }
  return firebase.firestore()
}
