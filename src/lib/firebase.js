import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const requiredEnvironmentVariables = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const missingEnvironmentVariables = Object.entries(requiredEnvironmentVariables)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missingEnvironmentVariables.length) {
  throw new Error(`Missing Firebase environment variables: ${missingEnvironmentVariables.join(', ')}`)
}

const firebaseConfig = requiredEnvironmentVariables
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const firebaseApp = app
export const firebaseAuth = getAuth(app)
export const firestore = getFirestore(app)
