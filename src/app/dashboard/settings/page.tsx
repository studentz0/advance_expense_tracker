'use client'

import { useSettings } from '@/context/SettingsContext'
import { 
  Settings as SettingsIcon, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Shield, 
  Wallet, 
  CloudDownload, 
  Info,
  RefreshCw,
  Lock,
  Smartphone
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { CapacitorUpdater } from '@capgo/capacitor-updater'
import { createClient } from '@/utils/supabase/client'

export default function SettingsPage() {
  const { 
    currency, 
    setCurrency, 
    budgetAlerts, 
    setBudgetAlerts, 
    recurringReminders, 
    setRecurringReminders,
    darkMode,
    setDarkMode,
    language,
    setLanguage,
    triggerSync,
    syncing
  } = useSettings()
  
  const [version, setVersion] = useState('1.0.0')
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function getVersion() {
      try {
        const info = await CapacitorUpdater.getLatest()
        if (info?.version) setVersion(info.version)
      } catch (e) {}
    }
    getVersion()
  }, [])

  const handleManualUpdate = async () => {
    setCheckingUpdate(true)
    try {
      const update = await CapacitorUpdater.getLatest()
      if (update && update.version) {
        if (update.version === version) {
          alert('You are already on the latest version.')
        } else {
          await CapacitorUpdater.download({
            url: update.url || '',
            version: update.version
          })
          alert(`Update v${update.version} downloaded! It will be applied on next restart.`)
        }
      } else {
        alert('No updates found.')
      }
    } catch (e) {
      alert('Error checking for updates. Ensure you are online.')
    }
    setCheckingUpdate(false)
  }

  const handlePasswordReset = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/dashboard/settings`
      })
      if (error) alert(error.message)
      else alert('Password reset email sent!')
    }
  }

  const handleToggle2FA = () => {
    alert('Two-Factor Authentication requires a Pro plan and additional configuration in Supabase Dashboard.')
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">Manage your account and app preferences</p>
        </div>
        <button 
          onClick={triggerSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-semibold rounded-xl transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Currency */}
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-red-600" />
              Currency & Region
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Primary Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition"
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

          {/* Notifications */}
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
                <button 
                  onClick={() => setBudgetAlerts(!budgetAlerts)}
                  className={`w-10 h-6 rounded-full relative transition-colors ${budgetAlerts ? 'bg-red-600' : 'bg-gray-200 dark:bg-zinc-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${budgetAlerts ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">Recurring Reminders</p>
                  <p className="text-xs text-gray-500">Reminder before a bill is due</p>
                </div>
                <button 
                  onClick={() => setRecurringReminders(!recurringReminders)}
                  className={`w-10 h-6 rounded-full relative transition-colors ${recurringReminders ? 'bg-red-600' : 'bg-gray-200 dark:bg-zinc-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${recurringReminders ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-600" />
              Appearance
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">Dark Mode</p>
                  <p className="text-xs text-gray-500">Enable high-contrast dark theme</p>
                </div>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-10 h-6 rounded-full relative transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-zinc-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${darkMode ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Security */}
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-600" />
              Security
            </h2>
            <div className="space-y-4">
              <button 
                onClick={handlePasswordReset}
                className="w-full py-2.5 px-4 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-semibold rounded-xl border border-gray-200 dark:border-zinc-700 transition text-left text-sm flex items-center justify-between"
              >
                <span>Reset Password via Email</span>
                <RefreshCw className="w-4 h-4 opacity-50" />
              </button>
              <button 
                onClick={handleToggle2FA}
                className="w-full py-2.5 px-4 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-semibold rounded-xl border border-gray-200 dark:border-zinc-700 transition text-left text-sm flex items-center justify-between"
              >
                <span>Enable Two-Factor (2FA)</span>
                <Shield className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </div>

          {/* App Version */}
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-red-600" />
              App Version & Updates
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">Current Build</p>
                  <p className="text-xs text-gray-500">v{version}</p>
                </div>
                <button 
                  onClick={handleManualUpdate}
                  disabled={checkingUpdate}
                  className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <CloudDownload className={`w-3 h-3 ${checkingUpdate ? 'animate-bounce' : ''}`} />
                  {checkingUpdate ? 'Checking...' : 'Update Now'}
                </button>
              </div>
            </div>
          </div>

          {/* Language */}
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-orange-600" />
              Language
            </h2>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition"
            >
              <option value="English">English (US)</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
