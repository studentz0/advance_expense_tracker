'use client'

import { useSettings } from '@/context/SettingsContext'
import { Settings as SettingsIcon, Bell, Moon, Sun, Globe, Shield, Wallet, CloudDownload, Info } from 'lucide-react'
import { useState, useEffect } from 'react'
import { CapacitorUpdater } from '@capgo/capacitor-updater'

export default function SettingsPage() {
  const { currency, setCurrency } = useSettings()
  const [version, setVersion] = useState('1.0.0')
  const [checkingUpdate, setCheckingUpdate] = useState(false)

  useEffect(() => {
    async function getVersion() {
      const info = await CapacitorUpdater.getLatest()
      if (info?.version) setVersion(info.version)
    }
    getVersion()
  }, [])

  const handleManualUpdate = async () => {
    setCheckingUpdate(true)
    try {
      // This will trigger the auto-update logic manually
      await CapacitorUpdater.download({
        url: 'https://api.capgo.app/download', // You would replace this with your actual bundle URL
        version: 'next'
      })
      alert('Update downloaded! It will be applied on next restart.')
    } catch (e) {
      alert('No updates found or error checking for updates.')
    }
    setCheckingUpdate(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-1">Manage your account and app preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              Currency & Region
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Primary Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  <option value="$">USD ($)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                  <option value="¥">JPY (¥)</option>
                  <option value="₹">INR (₹)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-600" />
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">Budget Alerts</p>
                  <p className="text-xs text-gray-500">Notify me when I exceed my limits</p>
                </div>
                <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">Recurring Reminders</p>
                  <p className="text-xs text-gray-500">Reminder before a bill is due</p>
                </div>
                <div className="w-10 h-6 bg-gray-200 dark:bg-zinc-700 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Security
            </h2>
            <div className="space-y-4">
              <button className="w-full py-2.5 px-4 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-semibold rounded-xl border border-gray-200 dark:border-zinc-700 transition text-left text-sm">
                Change Password
              </button>
              <button className="w-full py-2.5 px-4 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-semibold rounded-xl border border-gray-200 dark:border-zinc-700 transition text-left text-sm">
                Enable Two-Factor Authentication
              </button>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              App Version
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">Current Version</p>
                  <p className="text-xs text-gray-500">v{version}</p>
                </div>
                <button 
                  onClick={handleManualUpdate}
                  disabled={checkingUpdate}
                  className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <CloudDownload className={`w-3 h-3 ${checkingUpdate ? 'animate-bounce' : ''}`} />
                  {checkingUpdate ? 'Checking...' : 'Check for Updates'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-orange-600" />
              Language
            </h2>
            <select
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option>English (US)</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
