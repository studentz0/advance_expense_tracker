'use client'

import { createClient } from '@/utils/supabase/client'
import { Wallet, Target, AlertCircle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function BudgetsPage() {
  const supabase = createClient()
  const [budgets, setBudgets] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: b } = await supabase
        .from('budget_status')
        .select('*')

      const { data: c } = await supabase
        .from('categories')
        .select('*')
        .eq('type', 'expense')
        .order('name')

      setBudgets(b || [])
      setCategories(c || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleSetBudget(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const category_id = formData.get('category_id') as string
    const limit_amount = Number(formData.get('limit_amount'))
    
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase.from('budgets').upsert({
        user_id: user.id,
        category_id,
        limit_amount,
        period: 'monthly'
      }, { onConflict: 'user_id,category_id,period' })
      
      fetchData()
    }
    setSaving(false)
  }

  if (loading) return <div className="p-8 text-center">Loading budgets...</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budgets</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-1">Plan your monthly spending limits</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm h-fit">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-red-600" />
            Set Budget
          </h2>
          <form onSubmit={handleSetBudget} className="space-y-4">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Monthly Limit</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  name="limit_amount"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-red-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/20 transition flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Budget'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {budgets.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {budgets.map((budget) => {
                const isOver = budget.spent_amount > budget.limit_amount
                return (
                  <div key={budget.id} className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                          style={{ backgroundColor: budget.category_color || '#3b82f6' }}
                        >
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{budget.category_name}</h3>
                          <p className="text-xs text-gray-500">Monthly Budget</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          ${Number(budget.spent_amount).toLocaleString()} / ${Number(budget.limit_amount).toLocaleString()}
                        </p>
                        <p className={`text-xs font-medium ${isOver ? 'text-red-500' : 'text-gray-500'}`}>
                          {isOver ? 'Exceeded by' : 'Remaining'}: ${Math.abs(Number(budget.remaining_amount)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="w-full h-3 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-red-600'}`}
                        style={{ width: `${Math.min(budget.progress_percentage, 100)}%` }}
                      />
                    </div>
                    
                    {isOver && (
                      <div className="mt-4 flex items-center gap-2 text-red-500 text-xs font-medium">
                        <AlertCircle className="w-4 h-4" />
                        You have exceeded your budget for this category.
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-20 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <Target className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-gray-900 dark:text-white font-semibold">No budgets set</h3>
              <p className="text-gray-500 text-sm mt-1">Set your first budget limit to start tracking.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
