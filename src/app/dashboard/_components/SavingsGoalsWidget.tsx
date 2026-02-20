'use client'

import { Target, Plus } from 'lucide-react'
import Link from 'next/link'

interface Goal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  color: string
  sync_status?: string
}

export default function SavingsGoalsWidget({ goals }: { goals: Goal[] }) {
  return (
    <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-red-600" />
          Savings Goals
        </h3>
        <Link href="/dashboard/goals" className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition">
          <Plus className="w-4 h-4 text-gray-400" />
        </Link>
      </div>

      <div className="space-y-6">
        {goals.length > 0 ? (
          goals.map((goal) => {
            const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <div className="flex flex-col">
                    <span className="text-gray-700 dark:text-zinc-300">{goal.name}</span>
                    {goal.sync_status === 'pending' && (
                      <span className="text-[8px] text-amber-500 font-bold uppercase tracking-tighter">Syncing...</span>
                    )}
                  </div>
                  <span className="text-gray-500">${goal.current_amount} / ${goal.target_amount}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-1000"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: goal.color || '#3b82f6'
                    }}
                  />
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-gray-500 italic">No active goals</p>
            <Link href="/dashboard/goals" className="text-xs text-red-600 font-medium hover:underline mt-2 inline-block">
              Set your first goal →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
