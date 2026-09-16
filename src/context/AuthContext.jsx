/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { browserLocalPersistence, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { firebaseAuth, firestore } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [worker, setWorker] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    let active = true
    let unsubscribe

    async function restoreAuth() {
      try {
        await setPersistence(firebaseAuth, browserLocalPersistence)
        unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
          if (!active) return
          if (!user) {
            setWorker(null)
            setAuthLoading(false)
            return
          }

          try {
            const profileSnapshot = await getDoc(doc(firestore, 'users', user.uid))
            if (!profileSnapshot.exists()) throw new Error('Your Firebase user profile could not be found.')
            const profile = profileSnapshot.data()
            if (profile.status !== 'ACTIVE') throw new Error('This account is suspended.')
            
            let accountType = 'employee'
            if (profile.role === 'Organization Administrator') {
              accountType = 'admin'
            } else if (profile.role !== 'EMPLOYEE') {
              throw new Error('This account role is not supported.')
            }

            if (!profile.userId || !profile.organisationId || !profile.name || !profile.email) throw new Error('Your Firebase user profile is incomplete.')
            setWorker({ ...profile, id: profile.userId, firebaseUid: user.uid, accountType })
          } catch {
            await signOut(firebaseAuth)
            if (active) setWorker(null)
          } finally {
            if (active) setAuthLoading(false)
          }
        })
      } catch {
        if (active) {
          setWorker(null)
          setAuthLoading(false)
        }
      }
    }

    restoreAuth()
    return () => {
      active = false
      unsubscribe?.()
    }
  }, [])

  async function login(identifier, password, accountType) {
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, identifier.trim(), password)
      const profileSnapshot = await getDoc(doc(firestore, 'users', credential.user.uid))
      if (!profileSnapshot.exists()) throw new Error('Your Firebase user profile could not be found.')
      const profile = profileSnapshot.data()
      if (profile.status !== 'ACTIVE') throw new Error('This account is suspended.')
      
      if (accountType === 'admin') {
        if (profile.role !== 'Organization Administrator') throw new Error('This account is not authorized for the organization application.')
      } else {
        if (profile.role !== 'EMPLOYEE') throw new Error('This account is not authorized for the employee application.')
      }

      if (!profile.userId || !profile.organisationId || !profile.name || !profile.email) throw new Error('Your Firebase user profile is incomplete.')
      setWorker({ ...profile, id: profile.userId, firebaseUid: credential.user.uid, accountType })
      return { success: true }
    } catch (error) {
      await signOut(firebaseAuth).catch(() => {})
      return { success: false, error: error.code?.startsWith('auth/') ? 'The email or password is incorrect.' : error.message }
    }
  }

  async function logout() {
    await signOut(firebaseAuth).catch(() => {})
    setWorker(null)
  }

  return <AuthContext.Provider value={{ worker, authLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

