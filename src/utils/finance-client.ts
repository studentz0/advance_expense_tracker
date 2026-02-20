import { createClient } from './supabase/client'
import { db, type LocalTransaction, type LocalGoal } from './db-local'
import { flushSyncQueue, syncFromSupabase } from './sync-engine'
import { Network } from '@capacitor/network'

const supabase = createClient()

export async function processRecurringTransactionsClient() {
  const status = await Network.getStatus()
  if (!status.connected) return { error: 'Offline' }

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
      const transId = crypto.randomUUID()
      const transData = {
        id: transId,
        user_id: user.id,
        category_id: item.category_id,
        amount: item.amount,
        description: `${item.description} (Recurring)`,
        type: item.type,
        date: currentNextDate.toISOString().split('T')[0]
      }

      // Add locally then sync
      await db.transactions.add({ ...transData, sync_status: 'synced' } as any)
      await supabase.from('transactions').insert(transData)

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

export async function addTransactionClient(data: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const id = crypto.randomUUID()
  const trans = {
    id,
    user_id: user.id,
    ...data,
    sync_status: 'pending'
  }

  // 1. Save to local DB
  await db.transactions.add(trans)

  // 2. Add to sync queue
  await db.syncQueue.add({
    table: 'transactions',
    action: 'insert',
    data: { id, user_id: user.id, ...data },
    timestamp: Date.now()
  })

  // 3. Try to flush immediately if online
  flushSyncQueue()

  return { success: true, data: trans }
}

export async function addSavingsGoalClient(name: string, target_amount: number, deadline: string | null) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const id = crypto.randomUUID()
  const goal = {
    id,
    user_id: user.id,
    name,
    target_amount,
    current_amount: 0,
    deadline,
    color: '#3b82f6',
    sync_status: 'pending'
  }

  await db.goals.add(goal as any)
  await db.syncQueue.add({
    table: 'savings_goals',
    action: 'insert',
    data: { id, user_id: user.id, name, target_amount, deadline },
    timestamp: Date.now()
  })

  flushSyncQueue()
  return { success: true }
}

export async function updateGoalProgressClient(goalId: string, amount: number) {
  const goal = await db.goals.get(goalId)
  if (goal) {
    const newAmount = (goal.current_amount || 0) + amount
    await db.goals.update(goalId, { current_amount: newAmount, sync_status: 'pending' })
    
    await db.syncQueue.add({
      table: 'savings_goals',
      action: 'update',
      data: { id: goalId, current_amount: newAmount },
      timestamp: Date.now()
    })

    flushSyncQueue()
  }
  return { success: true }
}

export async function addRecurringTransactionClient(data: any) {
  // Recurring management still requires online for now to keep it simple,
  // but we could make it local-first too if needed.
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

export async function refreshAppData() {
  await syncFromSupabase()
  await flushSyncQueue()
}
