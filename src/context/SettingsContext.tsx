'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type SettingsContextType = {
  currency: string
  setCurrency: (currency: string) => void
  budgetAlerts: boolean
  setBudgetAlerts: (val: boolean) => void
  recurringReminders: boolean
  setRecurringReminders: (val: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState('$')
  const [budgetAlerts, setBudgetAlerts] = useState(true)
  const [recurringReminders, setRecurringReminders] = useState(true)

  useEffect(() => {
    const savedCurrency = localStorage.getItem('app-currency')
    if (savedCurrency) setCurrency(savedCurrency)

    const savedAlerts = localStorage.getItem('app-budget-alerts')
    if (savedAlerts !== null) setBudgetAlerts(savedAlerts === 'true')

    const savedReminders = localStorage.getItem('app-recurring-reminders')
    if (savedReminders !== null) setRecurringReminders(savedReminders === 'true')
  }, [])

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

  return (
    <SettingsContext.Provider value={{ 
      currency, 
      setCurrency: handleSetCurrency,
      budgetAlerts,
      setBudgetAlerts: handleSetBudgetAlerts,
      recurringReminders,
      setRecurringReminders: handleSetRecurringReminders
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
