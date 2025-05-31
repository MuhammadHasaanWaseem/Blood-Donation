// firebase.config.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAeitXTHAHxP02OnRSLEijA9zpeZD40v08",
  authDomain: "medi-link-5c589.firebaseapp.com",
  projectId: "medi-link-5c589",
  storageBucket: "medi-link-5c589.appspot.com",
  messagingSenderId: "71550033753",
  appId: "1:71550033753:web:cc273e055cb601331bf648",
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth };
