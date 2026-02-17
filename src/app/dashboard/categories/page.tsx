'use client'

import { createClient } from '@/utils/supabase/client'
import { Plus, Tags, Trash2, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function CategoriesPage() {
  const supabase = createClient()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  async function fetchCategories() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      setCategories(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  async function handleAddCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAdding(true)
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const type = formData.get('type') as 'income' | 'expense'
    const color = formData.get('color') as string

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('categories').insert({
        name,
        type,
        color,
        user_id: user.id
      })
      fetchCategories()
      e.currentTarget.reset()
    }
    setAdding(false)
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) fetchCategories()
  }

  if (loading) return <div className="p-8 text-center">Loading categories...</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-1">Organize your income and expenses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm h-fit">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            New Category
          </h2>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Name</label>
              <input
                name="name"
                required
                placeholder="e.g. Groceries"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Color</label>
              <input
                name="color"
                type="color"
                defaultValue="#3b82f6"
                className="w-full h-10 p-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl cursor-pointer"
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Category'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="font-bold text-gray-900 dark:text-white">Your Categories</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition group">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: cat.color || '#3b82f6' }}
                    />
                    <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
                    <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-500">
                      {cat.type}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 text-gray-300 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
