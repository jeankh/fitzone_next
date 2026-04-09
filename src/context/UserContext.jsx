'use client'
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const UserContext = createContext({ user: null, loading: true, refetch: () => {} })

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(() => {
    setLoading(true)
    fetch('/api/user/me').then(r => r.json()).then(data => {
      setUser(data.user || null)
    }).catch(() => setUser(null)).finally(() => setLoading(false))
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const value = useMemo(() => ({ user, loading, refetch }), [user, loading, refetch])

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
