import Link from 'next/link'
import { 
  LayoutDashboard, 
  Receipt, 
  Tags, 
  Wallet, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Transactions', href: '/dashboard/transactions', icon: Receipt },
    { label: 'Categories', href: '/dashboard/categories', icon: Tags },
    { label: 'Budgets', href: '/dashboard/budgets', icon: Wallet },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col fixed inset-y-0">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <div className="p-1.5 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span>FinanceApp</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition group"
            >
              <item.icon className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition" />
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
              {user.email?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition group"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64 flex-1">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
