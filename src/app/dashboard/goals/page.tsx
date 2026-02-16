import { createClient } from '@/utils/supabase/server'
import { Target, Plus, TrendingUp } from 'lucide-react'
import { addSavingsGoal, updateGoalProgress } from '@/app/actions/finance'

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: goals } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Savings Goals</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-1">Track your progress towards financial freedom</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm h-fit">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            New Goal
          </h2>
          <form action={async (formData) => {
            'use server'
            await addSavingsGoal(formData)
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Goal Name</label>
              <input
                name="name"
                required
                placeholder="e.g. Emergency Fund"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Target Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  name="target_amount"
                  type="number"
                  required
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Deadline (Optional)</label>
              <input
                name="deadline"
                type="date"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition"
            >
              Create Goal
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {goals && goals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((goal) => {
                const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
                return (
                  <div key={goal.id} className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                          style={{ backgroundColor: goal.color || '#3b82f6' }}
                        >
                          <Target className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {Math.round(progress)}%
                          </p>
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{goal.name}</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        ${goal.current_amount.toLocaleString()} of ${goal.target_amount.toLocaleString()}
                      </p>
                      
                      <div className="w-full h-3 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-6">
                        <div 
                          className="h-full transition-all duration-1000"
                          style={{ width: `${progress}%`, backgroundColor: goal.color || '#3b82f6' }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <form action={async () => {
                        'use server'
                        await updateGoalProgress(goal.id, 10)
                      }} className="flex-1">
                        <button className="w-full py-2 bg-gray-50 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-zinc-400 hover:text-blue-600 font-semibold rounded-lg text-xs transition border border-gray-100 dark:border-zinc-700">
                          Add $10
                        </button>
                      </form>
                      <form action={async () => {
                        'use server'
                        await updateGoalProgress(goal.id, 100)
                      }} className="flex-1">
                        <button className="w-full py-2 bg-gray-50 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-zinc-400 hover:text-blue-600 font-semibold rounded-lg text-xs transition border border-gray-100 dark:border-zinc-700">
                          Add $100
                        </button>
                      </form>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-20 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-gray-900 dark:text-white font-semibold">No goals yet</h3>
              <p className="text-gray-500 text-sm mt-1">Start by setting a target for your savings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
