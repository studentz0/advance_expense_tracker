'use client'

import { useSettings } from '@/context/SettingsContext'
import { Calendar, ArrowUpCircle, ArrowDownCircle, Trash2, Search, Filter, X, FileText, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Transaction {
  id: string
  amount: number
  description: string | null
  date: string
  type: 'income' | 'expense'
  receipt_url?: string | null
  categories: {
    name: string
    color: string
  } | null
}

export default function TransactionList({ 
  transactions, 
  deleteAction 
}: { 
  transactions: Transaction[], 
  deleteAction: (formData: FormData) => void 
}) {
  const { currency } = useSettings()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showFullReceipt, setShowFullReceipt] = useState(false)
  
  const supabase = createClient()

  const filtered = transactions.filter(t => {
    const matchesSearch = (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
                          (t.categories?.name || '').toLowerCase().includes(search.toLowerCase())
    const matchesType = filterType === 'all' || t.type === filterType
    return matchesSearch && matchesType
  })

  const getReceiptUrl = (path: string) => {
    const { data } = supabase.storage.from('receipts').getPublicUrl(path)
    return data.publicUrl
  }

  return (
    <>
      <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white">Transaction History</h2>
          <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded-lg text-gray-500">
            {filtered.length} Shown
          </span>
        </div>
        
        {filtered.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {filtered.map((t) => (
              <div 
                key={t.id} 
                className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition group cursor-pointer"
                onClick={() => setSelectedTransaction(t)}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: t.categories?.color || '#3b82f6' }}
                >
                  {t.type === 'income' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {t.description || 'No description'}
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-500">
                      {t.categories?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span suppressHydrationWarning>{new Date(t.date).toLocaleDateString('en-US')}</span>
                    </div>
                    {t.receipt_url && (
                      <div className="flex items-center gap-1 text-xs text-blue-500 font-medium">
                        <FileText className="w-3 h-3" />
                        Has Receipt
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`text-sm font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{currency}{Number(t.amount).toLocaleString()}
                  </div>
                  <form action={deleteAction} onClick={(e) => e.stopPropagation()}>
                    <input type="hidden" name="id" value={t.id} />
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
        ) : (
          <div className="p-20 text-center">
            <h3 className="text-gray-900 dark:text-white font-semibold">No results</h3>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </div></div>

      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-zinc-800">
            <button 
              onClick={() => setSelectedTransaction(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Transaction Details</h3>
            
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-zinc-300">
                <span className="font-semibold">Description:</span> {selectedTransaction.description || 'N/A'}
              </p>
              <p className="text-gray-700 dark:text-zinc-300">
                <span className="font-semibold">Amount:</span> <span className={`font-bold ${selectedTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedTransaction.type === 'income' ? '+' : '-'}{currency}{Number(selectedTransaction.amount).toLocaleString()}
                </span>
              </p>
              <p className="text-gray-700 dark:text-zinc-300">
                <span className="font-semibold">Date:</span> <span suppressHydrationWarning>{new Date(selectedTransaction.date).toLocaleDateString('en-US')}</span>
              </p>
              <p className="text-gray-700 dark:text-zinc-300">
                <span className="font-semibold">Category:</span> {selectedTransaction.categories?.name || 'Uncategorized'}
              </p>
              <p className="text-gray-700 dark:text-zinc-300">
                <span className="font-semibold">Type:</span> <span className={`capitalize ${selectedTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{selectedTransaction.type}</span>
              </p>

              {selectedTransaction.receipt_url && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Receipt
                  </h4>
                  <div className="border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden group/receipt">
                    {selectedTransaction.receipt_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                      <div 
                        className="relative cursor-zoom-in"
                        onClick={() => setShowFullReceipt(true)}
                      >
                        <img 
                          src={getReceiptUrl(selectedTransaction.receipt_url)} 
                          alt="Receipt" 
                          className="w-full h-auto object-contain max-h-60 bg-gray-50 dark:bg-zinc-800 transition group-hover/receipt:opacity-90" 
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/receipt:opacity-100 transition bg-black/10">
                          <span className="bg-white/90 dark:bg-zinc-900/90 px-3 py-1.5 rounded-full text-xs font-bold text-gray-900 dark:text-white shadow-sm border border-gray-100 dark:border-zinc-800">
                            Click to expand
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 dark:bg-zinc-800 text-center">
                        <p className="text-gray-500 text-sm">Preview not available for this file type.</p>
                        <a 
                          href={getReceiptUrl(selectedTransaction.receipt_url)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                        >
                          View Receipt <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full-screen Receipt Overlay */}
      {showFullReceipt && selectedTransaction?.receipt_url && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 cursor-zoom-out animate-in fade-in zoom-in-95 duration-200"
          onClick={() => setShowFullReceipt(false)}
        >
          <button 
            onClick={() => setShowFullReceipt(false)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:scale-110 active:scale-95 z-[70]"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative flex items-center justify-center w-full h-full" onClick={(e) => e.stopPropagation()}>
            <img 
              src={getReceiptUrl(selectedTransaction.receipt_url)} 
              alt="Full Receipt" 
              className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl transition-transform duration-300" 
            />
          </div>
        </div>
      )}
    </>
  )
}
