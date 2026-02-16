import { createClient } from '@/utils/supabase/server'
import { Plus } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import TransactionList from './_components/TransactionList'
import ExportButton from './_components/ExportButton'

export default async function TransactionsPage() {
  const supabase = await createClient()
  await supabase.auth.getUser()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, categories(name, icon, color)')
    .order('date', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  async function addTransaction(formData: FormData) {
    'use server'
    const amount = formData.get('amount')
    const description = formData.get('description') as string
    const category_id = formData.get('category_id') as string
    const date = formData.get('date') as string
    const type = formData.get('type') as 'income' | 'expense'
    const receiptFile = formData.get('receipt') as File
    
    if (!amount || Number(amount) <= 0) return

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      let receipt_url = null

      if (receiptFile && receiptFile.size > 0) {
        const fileExt = receiptFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, receiptFile)

        if (!uploadError) {
          receipt_url = fileName
        }
      }

      const { error } = await supabase.from('transactions').insert({
        amount: Number(amount),
        description,
        category_id,
        date,
        type,
        user_id: user.id,
        receipt_url
      })
      
      if (!error) {
        revalidatePath('/dashboard/transactions')
        revalidatePath('/dashboard')
      }
    }
  }

  async function deleteTransaction(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (!error) {
      revalidatePath('/dashboard/transactions')
      revalidatePath('/dashboard')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">Detailed history of your finances</p>
        </div>
        <ExportButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Transaction Form */}
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm h-fit">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            New Transaction
          </h2>
          <form action={addTransaction} className="space-y-4">
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
                  {categories?.map((cat) => (
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Receipt (Optional)</label>
              <input
                name="receipt"
                type="file"
                accept="image/*,application/pdf"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition"
            >
              Add Transaction
            </button>
          </form>
        </div>

        {/* Transactions List */}
        <div className="lg:col-span-2">
          <TransactionList 
            transactions={transactions || []} 
            deleteAction={deleteTransaction} 
          />
        </div>
      </div>
    </div>
  )
}
