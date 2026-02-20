import Dexie, { type Table } from 'dexie';

export interface LocalCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
}

export interface LocalTransaction {
  id: string;
  user_id: string;
  category_id?: string;
  amount: number;
  description?: string;
  date: string;
  type: 'income' | 'expense';
  receipt_url?: string | null;
  sync_status: 'synced' | 'pending' | 'deleted';
}

export interface LocalGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string | null;
  color: string;
  sync_status: 'synced' | 'pending';
}

export interface SyncItem {
  id?: number;
  table: 'transactions' | 'savings_goals' | 'categories';
  action: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

export class FinanceDB extends Dexie {
  categories!: Table<LocalCategory>;
  transactions!: Table<LocalTransaction>;
  goals!: Table<LocalGoal>;
  syncQueue!: Table<SyncItem>;

  constructor() {
    super('FinanceDB');
    this.version(1).stores({
      categories: 'id, name, type',
      transactions: 'id, user_id, date, type, sync_status',
      goals: 'id, user_id, sync_status',
      syncQueue: '++id, table, action, timestamp'
    });
  }
}

export const db = new FinanceDB();
