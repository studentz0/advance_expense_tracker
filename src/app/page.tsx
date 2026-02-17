'use client'

import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  ArrowRight, 
  BarChart3, 
  ShieldCheck, 
  Smartphone, 
  Zap,
  Github,
  Twitter,
  Mail
} from 'lucide-react'

export default function Home() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  if (loading) return null

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950">
      <header className="px-4 lg:px-6 h-20 flex items-center border-b border-gray-100 dark:border-zinc-900 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-50">
        <Link className="flex items-center justify-center gap-2.5" href="#">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">FinanceApp</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-8">
          <Link className="text-sm font-semibold text-gray-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors" href="/login">
            Sign In
          </Link>
          <Link 
            className="text-sm font-bold px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20" 
            href="/login"
          >
            Get Started
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-24 lg:py-32 xl:py-48 overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 dark:opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 blur-[120px] rounded-full" />
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-400 blur-[100px] rounded-full" />
          </div>
          
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <Zap className="w-3 h-3" />
                Next Generation Finance Tracking
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 dark:text-white max-w-4xl leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                Master your money with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">precision</span>
              </h1>
              <p className="max-w-[700px] text-gray-500 dark:text-zinc-400 text-lg md:text-xl leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
                Professional-grade expense tracking, automated recurring bills, and smart savings goals in one beautiful dashboard. Built for people who take their finances seriously.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
                <Link 
                  href="/login"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-500/25 hover:-translate-y-0.5 active:scale-95"
                >
                  Start Tracking Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="https://github.com"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white font-bold rounded-2xl border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition shadow-sm hover:-translate-y-0.5 active:scale-95"
                >
                  <Github className="w-5 h-5" />
                  View Source
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-24 bg-gray-50 dark:bg-zinc-900/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Smartphone className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Mobile Native</h3>
                <p className="text-gray-500 dark:text-zinc-400 leading-relaxed">
                  Access your data anywhere. Fully responsive design that works perfectly on desktop and mobile devices.
                </p>
              </div>
              <div className="group p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Bank-Grade Security</h3>
                <p className="text-gray-500 dark:text-zinc-400 leading-relaxed">
                  Your data is encrypted and secured by Supabase. We never sell your personal information or transaction history.
                </p>
              </div>
              <div className="group p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Smart Analytics</h3>
                <p className="text-gray-500 dark:text-zinc-400 leading-relaxed">
                  Visualize your spending habits with interactive charts and real-time budget tracking across all categories.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-12 border-t border-gray-100 dark:border-zinc-900 bg-white dark:bg-zinc-950">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">FinanceApp</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-zinc-500">
              © 2026 FinanceApp Inc. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Twitter className="w-5 h-5 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              <Github className="w-5 h-5 text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors" />
              <Mail className="w-5 h-5 text-gray-400 hover:text-red-400 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
