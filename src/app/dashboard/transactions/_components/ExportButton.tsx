'use client'

import { createClient } from '@/utils/supabase/client'
import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function ExportButton() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleExport = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('Not authenticated')
      setLoading(false)
      return
    }

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('date, type, amount, description, categories(name)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error || !transactions) {
      alert(error?.message || 'Failed to fetch')
      setLoading(false)
      return
    }

    const headers = ['Date', 'Type', 'Amount', 'Description', 'Category']
    const rows = transactions.map(t => [
      t.date,
      t.type,
      t.amount,
      `"${t.description || ''}"`,
      `"${(t.categories as any)?.name || 'Uncategorized'}"`
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setLoading(false)
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-semibold rounded-xl transition disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      <span>Export CSV</span>
    </button>
  )
}
