'use client'

import { useSettings } from '@/context/SettingsContext'
import { Settings, Globe, Moon, Sun } from 'lucide-react'

export default function SettingsPage() {
  const { currency, setCurrency } = useSettings()

  const currencies = [
    { label: 'US Dollar ($)', value: '$' },
    { label: 'Euro (€)', value: '€' },
    { label: 'British Pound (£)', value: '£' },
    { label: 'Pakistani Rupee (Rs)', value: 'Rs' },
    { label: 'Indian Rupee (₹)', value: '₹' },
  ]

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-1">Manage your application preferences</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm divide-y divide-gray-100 dark:divide-zinc-800">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-gray-900 dark:text-white font-bold">
            <Globe className="w-5 h-5 text-blue-600" />
            Regional
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Primary Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full md:w-64 px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              {currencies.map((curr) => (
                <option key={curr.value} value={curr.value}>{curr.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-gray-900 dark:text-white font-bold">
            <Moon className="w-5 h-5 text-blue-600" />
            Appearance
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
              <p className="text-xs text-gray-500">Switch between light and dark themes</p>
            </div>
            <button className="p-2 bg-white dark:bg-zinc-700 rounded-lg shadow-sm">
              <Sun className="w-4 h-4 text-orange-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
