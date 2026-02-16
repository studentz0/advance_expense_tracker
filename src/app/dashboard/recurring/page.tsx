import { createClient } from '@/utils/supabase/server'
import { Clock, Plus, Trash2, Calendar } from 'lucide-react'
import { addRecurringTransaction } from '@/app/actions/finance'
import { revalidatePath } from 'next/cache'

export default async function RecurringPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: recurring } = await supabase
    .from('recurring_transactions')
    .select('*, categories(name, icon, color)')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  async function deleteRecurring(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const supabase = await createClient()
    await supabase.from('recurring_transactions').delete().eq('id', id)
    revalidatePath('/dashboard/recurring')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recurring Schedules</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-1">Automate your regular financial movements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm h-fit">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            New Schedule
          </h2>
          <form action={async (formData) => {
            'use server'
            await addRecurringTransaction(formData)
          }} className="space-y-4">
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
                required
                placeholder="e.g. Monthly Rent"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Frequency</label>
                <select
                  name="frequency"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                {categories?.map((cat) => (
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
                className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition"
            >
              Start Schedule
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {recurring && recurring.length > 0 ? (
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
                        <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                          {item.frequency}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Next: {new Date(item.next_execution_date).toLocaleDateString('en-US')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`text-sm font-bold ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.type === 'income' ? '+' : '-'}${Number(item.amount).toLocaleString()}
                      </div>
                      <form action={deleteRecurring}>
                        <input type="hidden" name="id" value={item.id} />
                        <button 
                          type="submit"
                          className="p-2 text-gray-300 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
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
