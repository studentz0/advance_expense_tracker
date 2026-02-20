'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  Plus,
  ArrowRight,
  Receipt,
  Clock,
  WifiOff
} from 'lucide-react'
import Link from 'next/link'
import { useSettings } from '@/context/SettingsContext'
import OverviewChart from './_components/OverviewChart'
import TrendChart from './_components/TrendChart'
import SavingsGoalsWidget from './_components/SavingsGoalsWidget'
import { processRecurringTransactionsClient, refreshAppData } from '@/utils/finance-client'
import { db } from '@/utils/db-local'
import { Network } from '@capacitor/network'
import { sendBudgetAlert } from '@/utils/notifications'

export default function DashboardPage() {
  const { budgetAlerts } = useSettings()
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [isOnline, setIsOnline] = useState(true)

  async function loadLocalData() {
    const transactions = await db.transactions.orderBy('date').reverse().limit(5).toArray()
    const allTransactions = await db.transactions.toArray()
    const goals = await db.goals.limit(2).toArray()
    
    // Fetch real budget status from local DB or simulate
    const { data: budgetStatus } = await supabase.from('budget_status').select('*')
    
    // Trigger notifications if needed
    if (budgetAlerts && budgetStatus) {
      budgetStatus.forEach((budget: any) => {
        if (budget.spent_amount > budget.limit_amount) {
          sendBudgetAlert(budget.category_name, budget.spent_amount, budget.limit_amount)
        }
      })
    }
    
    const income = allTransactions
      ?.filter((t: any) => t.type === 'income')
      .reduce((acc: number, t: any) => acc + Number(t.amount), 0) || 0
      
    const expenses = allTransactions
      ?.filter((t: any) => t.type === 'expense')
      .reduce((acc: number, t: any) => acc + Number(t.amount), 0) || 0

    // Aggregate category data
    const categoryDataMap: any = {}
    allTransactions
      ?.filter((t: any) => t.type === 'expense')
      .forEach((t: any) => {
        const name = 'Expense' // simplified for offline local
        if (!categoryDataMap[name]) {
          categoryDataMap[name] = { name, value: 0, color: '#94a3b8' }
        }
        categoryDataMap[name].value += Number(t.amount)
      })
    const chartData = Object.values(categoryDataMap).sort((a: any, b: any) => b.value - a.value).slice(0, 5)

    // Aggregate monthly data
    const monthlyDataMap: any = {}
    allTransactions?.forEach((t: any) => {
      const month = new Date(t.date).toLocaleString('en-US', { month: 'short' })
      if (!monthlyDataMap[month]) monthlyDataMap[month] = { month, income: 0, expenses: 0 }
      if (t.type === 'income') monthlyDataMap[month].income += Number(t.amount)
      else monthlyDataMap[month].expenses += Number(t.amount)
    })
    const trendData = Object.values(monthlyDataMap).slice(-6)

    setData({
      transactions,
      goals,
      income,
      expenses,
      balance: income - expenses,
      chartData,
      trendData,
      budgetStatus: [] // Simplified for now
    })
    setLoading(false)
  }

  useEffect(() => {
    async function init() {
      const status = await Network.getStatus()
      setIsOnline(status.connected)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 1. Load what we have locally first (Instant)
      await loadLocalData()

      // 2. If online, sync from Supabase then reload local
      if (status.connected) {
        await refreshAppData()
        await processRecurringTransactionsClient()
        await loadLocalData()
      }
    }

    init()

    let listener: any = null
    const setupListener = async () => {
      listener = await Network.addListener('networkStatusChange', status => {
        setIsOnline(status.connected)
        if (status.connected) refreshAppData().then(loadLocalData)
      })
    }
    setupListener()

    return () => { 
      if (listener) listener.remove() 
    }
  }, [])

  if (loading) return <div className="p-8 text-center">Loading...</div>

  const stats = [
    { label: 'Total Balance', amount: data.balance, icon: Wallet, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Total Income', amount: data.income, icon: ArrowUpCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Total Expenses', amount: data.expenses, icon: ArrowDownCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  ]

  return (
    <div className="space-y-8">
      {!isOnline && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-3 rounded-xl flex items-center gap-3 text-amber-700 dark:text-amber-400 text-sm font-medium animate-pulse">
          <WifiOff className="w-4 h-4" />
          Offline Mode: Using local data. Changes will sync when online.
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Overview</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">Your financial health at a glance</p>
        </div>
        <Link 
          href="/dashboard/transactions" 
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/20 transition w-fit"
        >
          <Plus className="w-5 h-5" />
          <span>Add Transaction</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${stat.amount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Income vs Expenses</h3>
            <TrendChart data={data.trendData} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
              <Link href="/dashboard/transactions" className="text-sm font-medium text-red-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
              {data.transactions && data.transactions.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {data.transactions.map((t: any) => (
                    <div key={t.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600">
                        {t.type === 'income' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {t.description || 'No description'}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString('en-US')}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className={`text-sm font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.type === 'income' ? '+' : '-'}${Number(t.amount).toLocaleString()}
                        </div>
                        {t.sync_status === 'pending' && (
                          <span className="text-[8px] font-bold text-amber-500 uppercase tracking-tighter">Pending Sync</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Receipt className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-gray-900 dark:text-white font-semibold">No transactions yet</h3>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Top Spending</h3>
            {data.chartData.length > 0 ? (
              <OverviewChart data={data.chartData} />
            ) : (
              <div className="text-center py-12 text-gray-500 text-sm italic">
                No data to display
              </div>
            )}
          </div>

          <SavingsGoalsWidget goals={data.goals} />

          <div className="p-6 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl shadow-lg shadow-red-500/20 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold">Recurring</h3>
            </div>
            <p className="text-sm text-red-100 mb-4">Automate your regular bills and income.</p>
            <Link 
              href="/dashboard/recurring" 
              className="block w-full py-2 bg-white text-red-600 text-center font-bold rounded-xl text-sm hover:bg-red-50 transition"
            >
              Manage Schedules
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
