import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
// Import analytics only in browser
let analytics: any = null

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string) || undefined,
}

let app: FirebaseApp | null = null

export const getFirebaseApp = (): FirebaseApp | null => {
  try {
    if (!firebaseConfig.apiKey) return null
    if (!getApps().length) {
      app = initializeApp(firebaseConfig)
    }
    if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
      // Lazy import analytics to avoid SSR and size issues
      import('firebase/analytics')
        .then(m => {
          try { analytics = m.getAnalytics(app!) } catch {}
        })
        .catch(() => {})
    }
    return app
  } catch {
    return null
  }
}

export const getFirebaseAnalytics = () => analytics

