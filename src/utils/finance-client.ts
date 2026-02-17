import { createClient } from './supabase/client'

/**
 * Client-side version of finance actions for static/mobile deployment.
 */

export async function processRecurringTransactionsClient() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const today = new Date().toISOString().split('T')[0]

  const { data: recurring, error: fetchError } = await supabase
    .from('recurring_transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .lte('next_execution_date', today)

  if (fetchError || !recurring) return { error: fetchError?.message || 'No recurring found' }

  for (const item of recurring) {
    let currentNextDate = new Date(item.next_execution_date)
    const todayDate = new Date(today)

    while (currentNextDate <= todayDate) {
      await supabase.from('transactions').insert({
        user_id: user.id,
        category_id: item.category_id,
        amount: item.amount,
        description: `${item.description} (Recurring)`,
        type: item.type,
        date: currentNextDate.toISOString().split('T')[0]
      })

      if (item.frequency === 'daily') currentNextDate.setDate(currentNextDate.getDate() + 1)
      else if (item.frequency === 'weekly') currentNextDate.setDate(currentNextDate.getDate() + 7)
      else if (item.frequency === 'monthly') currentNextDate.setMonth(currentNextDate.getMonth() + 1)
      else if (item.frequency === 'yearly') currentNextDate.setFullYear(currentNextDate.getFullYear() + 1)
    }

    await supabase
      .from('recurring_transactions')
      .update({
        next_execution_date: currentNextDate.toISOString().split('T')[0],
        last_executed_at: new Date().toISOString()
      })
      .eq('id', item.id)
  }

  return { success: true }
}

export async function addSavingsGoalClient(name: string, target_amount: number, deadline: string | null) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('savings_goals').insert({
    user_id: user.id,
    name,
    target_amount,
    deadline: deadline || null
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateGoalProgressClient(goalId: string, amount: number) {
  const supabase = createClient()
  const { data: goal } = await supabase.from('savings_goals').select('current_amount').eq('id', goalId).single()
  if (goal) {
    const { error } = await supabase.from('savings_goals').update({ current_amount: (goal.current_amount || 0) + amount }).eq('id', goalId)
    if (error) return { error: error.message }
  }
  return { success: true }
}

export async function addRecurringTransactionClient(data: any) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('recurring_transactions').insert({
    user_id: user.id,
    ...data,
    next_execution_date: data.start_date
  })

  if (error) return { error: error.message }
  return { success: true }
}
