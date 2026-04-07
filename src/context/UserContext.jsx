'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext({ user: null, loading: true, refetch: () => {} })

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refetch = () => {
    setLoading(true)
    fetch('/api/user/me').then(r => r.json()).then(data => {
      setUser(data.user || null)
    }).catch(() => setUser(null)).finally(() => setLoading(false))
  }

  useEffect(() => { refetch() }, [])

  return (
    <UserContext.Provider value={{ user, loading, refetch }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
