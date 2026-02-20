'use client'

import { createClient } from '@/utils/supabase/client'
import { Plus, Loader2, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import TransactionList from './_components/TransactionList'
import ExportButton from './_components/ExportButton'
import { addTransactionClient, refreshAppData } from '@/utils/finance-client'
import { db } from '@/utils/db-local'
import { Network } from '@capacitor/network'

export default function TransactionsPage() {
  const supabase = createClient()
  const [transactions, setTransactions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  async function loadLocalData() {
    const trans = await db.transactions.orderBy('date').reverse().toArray()
    const cats = await db.categories.orderBy('name').toArray()
    setTransactions(trans)
    setCategories(cats)
    setLoading(false)
  }

  useEffect(() => {
    async function init() {
      const status = await Network.getStatus()
      setIsOnline(status.connected)
      
      await loadLocalData()
      
      if (status.connected) {
        await refreshAppData()
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

  async function handleAddTransaction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAdding(true)
    const formData = new FormData(e.currentTarget)
    
    const data = {
      amount: Number(formData.get('amount')),
      description: formData.get('description'),
      category_id: formData.get('category_id'),
      date: formData.get('date'),
      type: formData.get('type')
    }

    const res = await addTransactionClient(data)
    if (res.success) {
      loadLocalData()
      e.currentTarget.reset()
    }
    setAdding(false)
  }

  if (loading) return <div className="p-8 text-center">Loading transactions...</div>

  return (
    <div className="space-y-8">
      {!isOnline && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-3 rounded-xl flex items-center gap-3 text-amber-700 dark:text-amber-400 text-sm font-medium">
          <WifiOff className="w-4 h-4" />
          Offline: New transactions will sync when you're back online.
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">Detailed history of your finances</p>
        </div>
        <ExportButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm h-fit">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            New Transaction
          </h2>
          <form onSubmit={handleAddTransaction} className="space-y-4">
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
                  className="w-full pl-8 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Description</label>
              <input
                name="description"
                placeholder="e.g. Weekly Groceries"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Type</label>
                <select
                  name="type"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Category</label>
                <select
                  name="category_id"
                  required
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Date</label>
              <input
                name="date"
                type="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Transaction'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <TransactionList 
            transactions={transactions} 
            deleteAction={() => {}} 
          />
        </div>
      </div>
    </div>
  )
}
