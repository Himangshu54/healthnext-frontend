/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'

const AUTH_KEY = 'healthnext.auth'
const demoWorker = {
  id: 'WORKER001',
  name: 'Sunita Kumari',
  email: 'sunita.kumari@healthnext.org',
  role: 'Field Health Worker',
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [worker, setWorker] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEY))
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (worker) localStorage.setItem(AUTH_KEY, JSON.stringify(worker))
    else localStorage.removeItem(AUTH_KEY)
  }, [worker])

  function login(identifier, password) {
    const normalized = identifier.trim().toUpperCase()
    if ((normalized === demoWorker.id || identifier.trim().toLowerCase() === demoWorker.email) && password === 'worker123') {
      setWorker(demoWorker)
      return { success: true }
    }
    return { success: false, error: 'The Worker ID or password is incorrect.' }
  }

  function logout() {
    setWorker(null)
  }

  return <AuthContext.Provider value={{ worker, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

export { demoWorker }
