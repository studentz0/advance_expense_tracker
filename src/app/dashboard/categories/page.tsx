import { createClient } from '@/utils/supabase/server'
import { Plus, Tags, Trash2 } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function CategoriesPage() {
  const supabase = await createClient()
  await supabase.auth.getUser()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  async function addCategory(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const type = formData.get('type') as 'income' | 'expense'
    const color = formData.get('color') as string
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase.from('categories').insert({
        name,
        type,
        color,
        user_id: user.id,
        icon: 'Tag' // Default icon for new categories
      })
      revalidatePath('/dashboard/categories')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">Manage your spending and income categories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Add Category Form */}
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm h-fit">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            New Category
          </h2>
          <form action={addCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Name</label>
              <input
                name="name"
                required
                placeholder="e.g. Subscriptions"
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
                className="w-full h-10 p-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none transition cursor-pointer"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition"
            >
              Create Category
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories?.map((category) => (
              <div 
                key={category.id} 
                className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: category.color || '#3b82f6' }}
                  >
                    <Tags className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{category.name}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{category.type}</p>
                  </div>
                </div>
                {category.user_id && (
                  <button className="p-2 text-gray-400 hover:text-red-600 transition opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
