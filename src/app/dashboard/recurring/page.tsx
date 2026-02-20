'use client'

import { createClient } from '@/utils/supabase/client'
import { Clock, Plus, Trash2, Calendar, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { addRecurringTransactionClient } from '@/utils/finance-client'

export default function RecurringPage() {
  const supabase = createClient()
  const [recurring, setRecurring] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: rec } = await supabase
        .from('recurring_transactions')
        .select('*, categories(name, icon, color)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      setRecurring(rec || [])
      setCategories(cats || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleAddSchedule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAdding(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      amount: Number(formData.get('amount')),
      description: formData.get('description'),
      category_id: formData.get('category_id'),
      type: formData.get('type'),
      frequency: formData.get('frequency'),
      start_date: formData.get('start_date')
    }

    const res = await addRecurringTransactionClient(data)
    if (res.success) {
      fetchData()
      e.currentTarget.reset()
    }
    setAdding(false)
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('recurring_transactions').delete().eq('id', id)
    if (!error) fetchData()
  }

  if (loading) return <div className="p-8 text-center">Loading schedules...</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recurring Schedules</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-1">Automate your regular financial movements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm h-fit">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-red-600" />
            New Schedule
          </h2>
          <form onSubmit={handleAddSchedule} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Description</label>
              <input
                name="description"
                required
                placeholder="e.g. Monthly Rent"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Type</label>
                <select
                  name="type"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Frequency</label>
                <select
                  name="frequency"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Category</label>
              <select
                name="category_id"
                required
                className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Start Date</label>
              <input
                name="start_date"
                type="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="w-full py-2.5 bg-red-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/20 transition flex items-center justify-center gap-2"
            >
              {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Schedule'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {recurring.length > 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
                <h2 className="font-bold text-gray-900 dark:text-white">Active Schedules</h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                {recurring.map((item) => (
                  <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition group">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: item.categories?.color || '#3b82f6' }}
                    >
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {item.description}
                        </p>
                        <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-900/20 text-red-600">
                          {item.frequency}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span suppressHydrationWarning>Next: {new Date(item.next_execution_date).toLocaleDateString('en-US')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`text-sm font-bold ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.type === 'income' ? '+' : '-'}${Number(item.amount).toLocaleString()}
                      </div>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-300 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-20 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-gray-900 dark:text-white font-semibold">No active schedules</h3>
              <p className="text-gray-500 text-sm mt-1">Automate your income or bills here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
