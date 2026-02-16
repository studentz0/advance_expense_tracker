'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Processes recurring transactions for the current user.
 * Checks for any recurring transaction where next_execution_date <= today.
 */
export async function processRecurringTransactions(shouldRevalidate = true) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const today = new Date().toISOString().split('T')[0]

  // Fetch active recurring transactions due for execution
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

    // Execute all missed occurrences up to today
    while (currentNextDate <= todayDate) {
      // 1. Insert the transaction
      await supabase.from('transactions').insert({
        user_id: user.id,
        category_id: item.category_id,
        amount: item.amount,
        description: `${item.description} (Recurring)`,
        type: item.type,
        date: currentNextDate.toISOString().split('T')[0]
      })

      // 2. Calculate next date based on frequency
      if (item.frequency === 'daily') {
        currentNextDate.setDate(currentNextDate.getDate() + 1)
      } else if (item.frequency === 'weekly') {
        currentNextDate.setDate(currentNextDate.getDate() + 7)
      } else if (item.frequency === 'monthly') {
        currentNextDate.setMonth(currentNextDate.getMonth() + 1)
      } else if (item.frequency === 'yearly') {
        currentNextDate.setFullYear(currentNextDate.getFullYear() + 1)
      }
    }

    // Update the recurring record with the new next_execution_date
    await supabase
      .from('recurring_transactions')
      .update({
        next_execution_date: currentNextDate.toISOString().split('T')[0],
        last_executed_at: new Date().toISOString()
      })
      .eq('id', item.id)
  }

  if (shouldRevalidate) {
    revalidatePath('/dashboard')
  }
  return { success: true }
}

/**
 * Fetches all transactions and formats them as a CSV string.
 */
export async function exportTransactionsToCSV() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('date, type, amount, description, categories(name)')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (error || !transactions) return { error: error?.message || 'Failed to fetch' }

  const headers = ['Date', 'Type', 'Amount', 'Description', 'Category']
  const rows = transactions.map(t => [
    t.date,
    t.type,
    t.amount,
    `"${t.description || ''}"`,
    `"${(t.categories as any)?.name || 'Uncategorized'}"`
  ])

  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
  return { success: true, csv: csvContent }
}

/**
 * Savings Goal CRUD
 */
export async function addSavingsGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = formData.get('name') as string
  const target_amount = Number(formData.get('target_amount'))
  const deadline = formData.get('deadline') as string

  const { error } = await supabase.from('savings_goals').insert({
    user_id: user.id,
    name,
    target_amount,
    deadline: deadline || null
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateGoalProgress(goalId: string, amount: number) {
  const supabase = await createClient()
  const { data: goal } = await supabase.from('savings_goals').select('current_amount').eq('id', goalId).single()
  if (goal) {
    const { error } = await supabase.from('savings_goals').update({ current_amount: (goal.current_amount || 0) + amount }).eq('id', goalId)
    if (error) return { error: error.message }
  }
  
  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Recurring Transaction CRUD
 */
export async function addRecurringTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const amount = Number(formData.get('amount'))
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string
  const type = formData.get('type') as 'income' | 'expense'
  const frequency = formData.get('frequency') as 'daily' | 'weekly' | 'monthly' | 'yearly'
  const start_date = formData.get('start_date') as string

  const { error } = await supabase.from('recurring_transactions').insert({
    user_id: user.id,
    category_id,
    amount,
    description,
    type,
    frequency,
    start_date,
    next_execution_date: start_date
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}
