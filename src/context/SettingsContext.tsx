'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type SettingsContextType = {
  currency: string
  setCurrency: (currency: string) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState('$')

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('app-currency')
    if (saved) setCurrency(saved)
  }, [])

  const handleSetCurrency = (val: string) => {
    setCurrency(val)
    localStorage.setItem('app-currency', val)
  }

  return (
    <SettingsContext.Provider value={{ currency, setCurrency: handleSetCurrency }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
