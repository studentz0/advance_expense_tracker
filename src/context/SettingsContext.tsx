'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { syncFromSupabase, flushSyncQueue } from '@/utils/sync-engine'

type SettingsContextType = {
  currency: string
  setCurrency: (currency: string) => void
  budgetAlerts: boolean
  setBudgetAlerts: (val: boolean) => void
  recurringReminders: boolean
  setRecurringReminders: (val: boolean) => void
  darkMode: boolean
  setDarkMode: (val: boolean) => void
  language: string
  setLanguage: (val: string) => void
  triggerSync: () => Promise<void>
  syncing: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState('$')
  const [budgetAlerts, setBudgetAlerts] = useState(true)
  const [recurringReminders, setRecurringReminders] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState('English')
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const savedCurrency = localStorage.getItem('app-currency')
    if (savedCurrency) setCurrency(savedCurrency)

    const savedAlerts = localStorage.getItem('app-budget-alerts')
    if (savedAlerts !== null) setBudgetAlerts(savedAlerts === 'true')

    const savedReminders = localStorage.getItem('app-recurring-reminders')
    if (savedReminders !== null) setRecurringReminders(savedReminders === 'true')

    const savedLang = localStorage.getItem('app-language')
    if (savedLang) setLanguage(savedLang)

    const savedDarkMode = localStorage.getItem('app-dark-mode')
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true')
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true)
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('app-dark-mode', String(darkMode))
  }, [darkMode])

  const handleSetCurrency = (val: string) => {
    setCurrency(val)
    localStorage.setItem('app-currency', val)
  }

  const handleSetBudgetAlerts = (val: boolean) => {
    setBudgetAlerts(val)
    localStorage.setItem('app-budget-alerts', String(val))
  }

  const handleSetRecurringReminders = (val: boolean) => {
    setRecurringReminders(val)
    localStorage.setItem('app-recurring-reminders', String(val))
  }

  const handleSetLanguage = (val: string) => {
    setLanguage(val)
    localStorage.setItem('app-language', val)
  }

  const triggerSync = async () => {
    setSyncing(true)
    try {
      await syncFromSupabase()
      await flushSyncQueue()
    } catch (e) {
      console.error('Manual sync failed:', e)
    }
    setSyncing(false)
  }

  return (
    <SettingsContext.Provider value={{ 
      currency, 
      setCurrency: handleSetCurrency,
      budgetAlerts, 
      setBudgetAlerts: handleSetBudgetAlerts,
      recurringReminders,
      setRecurringReminders: handleSetRecurringReminders,
      darkMode,
      setDarkMode,
      language,
      setLanguage: handleSetLanguage,
      triggerSync,
      syncing
    }}>
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
