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
  Clock
} from 'lucide-react'
import Link from 'next/link'
import OverviewChart from './_components/OverviewChart'
import TrendChart from './_components/TrendChart'
import SavingsGoalsWidget from './_components/SavingsGoalsWidget'
import { processRecurringTransactionsClient } from '@/utils/finance-client'

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Process recurring
      await processRecurringTransactionsClient()

      // Fetch summary data
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*, categories(name, icon, color)')
        .order('date', { ascending: false })
        .limit(5)

      const { data: budgetStatus } = await supabase
        .from('budget_status')
        .select('*')
        .limit(3)

      const { data: goals } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .limit(2)

      const { data: allTransactionsRaw } = await supabase
        .from('transactions')
        .select('amount, type, date, categories(name, color)')

      const allTransactions = allTransactionsRaw || []
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
          const name = t.categories?.name || 'Uncategorized'
          if (!categoryDataMap[name]) {
            categoryDataMap[name] = { name, value: 0, color: t.categories?.color || '#94a3b8' }
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
        budgetStatus,
        goals,
        income,
        expenses,
        balance: income - expenses,
        chartData,
        trendData
      })
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>

  const stats = [
    { label: 'Total Balance', amount: data.balance, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Total Income', amount: data.income, icon: ArrowUpCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Total Expenses', amount: data.expenses, icon: ArrowDownCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Overview</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">Your financial health at a glance</p>
        </div>
        <Link 
          href="/dashboard/transactions" 
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition w-fit"
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
              <Link href="/dashboard/transactions" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
              {data.transactions && data.transactions.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {data.transactions.map((t: any) => (
                    <div key={t.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                        style={{ backgroundColor: t.categories?.color || '#3b82f6' }}
                      >
                        {t.type === 'income' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {t.description || t.categories?.name || 'No description'}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString('en-US')}</p>
                      </div>
                      <div className={`text-sm font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'}${Number(t.amount).toLocaleString()}
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

          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Budget Status</h3>
            <div className="space-y-4">
              {data.budgetStatus && data.budgetStatus.length > 0 ? (
                data.budgetStatus.map((budget: any) => (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-700 dark:text-zinc-300">{budget.category_name}</span>
                      <span className="text-gray-500">${Math.round(budget.spent_amount)} / ${Math.round(budget.limit_amount)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${budget.progress_percentage > 100 ? 'bg-red-500' : 'bg-blue-600'}`}
                        style={{ width: `${Math.min(budget.progress_percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Link href="/dashboard/budgets" className="text-xs text-blue-600 font-medium hover:underline">
                    Set up your first budget limit →
                  </Link>
                </div>
              )}
            </div>
          </div>

          <SavingsGoalsWidget goals={data.goals} />

          <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold">Recurring</h3>
            </div>
            <p className="text-sm text-blue-100 mb-4">Automate your regular bills and income.</p>
            <Link 
              href="/dashboard/recurring" 
              className="block w-full py-2 bg-white text-blue-600 text-center font-bold rounded-xl text-sm hover:bg-blue-50 transition"
            >
              Manage Schedules
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
