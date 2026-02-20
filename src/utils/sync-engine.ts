import { db, type SyncItem } from './db-local';
import { createClient } from './supabase/client';
import { Network } from '@capacitor/network';

const supabase = createClient();

/**
 * Pushes all pending changes from local DB to Supabase
 */
export async function flushSyncQueue() {
  const status = await Network.getStatus();
  if (!status.connected) return;

  const queue = await db.syncQueue.orderBy('timestamp').toArray();
  if (queue.length === 0) return;

  console.log(`Syncing ${queue.length} items to Supabase...`);

  for (const item of queue) {
    try {
      let error = null;

      if (item.action === 'insert') {
        const { error: err } = await supabase.from(item.table).insert(item.data);
        error = err;
      } else if (item.action === 'update') {
        const { id, ...updateData } = item.data;
        const { error: err } = await supabase.from(item.table).update(updateData).eq('id', id);
        error = err;
      } else if (item.action === 'delete') {
        const { error: err } = await supabase.from(item.table).delete().eq('id', item.data.id);
        error = err;
      }

      if (!error) {
        await db.syncQueue.delete(item.id!);
        // Update local status to synced if it's still there
        if (item.table === 'transactions' && item.action !== 'delete') {
          await db.transactions.update(item.data.id, { sync_status: 'synced' });
        } else if (item.table === 'savings_goals' && item.action !== 'delete') {
          await db.goals.update(item.data.id, { sync_status: 'synced' });
        }
      } else {
        console.error(`Failed to sync item ${item.id}:`, error.message);
      }
    } catch (e) {
      console.error(`Sync error for item ${item.id}:`, e);
    }
  }
}

/**
 * Pulls latest data from Supabase and updates local cache
 */
export async function syncFromSupabase() {
  const status = await Network.getStatus();
  if (!status.connected) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Sync Categories
  const { data: categories } = await supabase.from('categories').select('*');
  if (categories) {
    await db.categories.clear();
    await db.categories.bulkPut(categories);
  }

  // Sync Transactions (Last 100 for offline view)
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(100);
  
  if (transactions) {
    const localTrans = transactions.map(t => ({ ...t, sync_status: 'synced' }));
    await db.transactions.bulkPut(localTrans);
  }

  // Sync Goals
  const { data: goals } = await supabase.from('savings_goals').select('*').eq('user_id', user.id);
  if (goals) {
    const localGoals = goals.map(g => ({ ...g, sync_status: 'synced' }));
    await db.goals.bulkPut(localGoals);
  }
}

// Initialize listener
Network.addListener('networkStatusChange', status => {
  if (status.connected) {
    flushSyncQueue();
  }
});
