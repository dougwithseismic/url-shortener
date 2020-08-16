import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'url-shortener-39794.firebaseapp.com',
  databaseURL: 'https://url-shortener-39794.firebaseio.com',
  projectId: 'url-shortener-39794',
  storageBucket: 'url-shortener-39794.appspot.com',
  messagingSenderId: '1029482123860',
  appId: '1:1029482123860:web:9d8203c235252a648593c1'
}

// Initialize Firebase
const initFirebase = () => {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig)
  }
  return firebase.firestore()
}



export const FirebaseManager = {
  initFirebase
}
