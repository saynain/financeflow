'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { 
  LayoutDashboard, 
  CreditCard, 
  BarChart3, 
  Briefcase, 
  PiggyBank,
  TrendingUp,
  Settings,
  Menu,
  X,
  LogOut,
  Home
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Transactions v2', href: '/transactions2', icon: CreditCard },
  { name: 'Budgets', href: '/budget', icon: BarChart3 },
  { name: 'Budgets v2', href: '/budget2', icon: BarChart3 },
  { name: 'Portfolios', href: '/portfolios', icon: Briefcase, isDemo: true },
  { name: 'Savings', href: '/savings', icon: PiggyBank, isDemo: true },
  { name: 'Investments', href: '/investments', icon: TrendingUp, isDemo: true },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const userInitial = session?.user?.name?.charAt(0).toUpperCase() || 'U'

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden bg-white shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 bg-slate-800 transition-transform",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FinanceFlow</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "group flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-indigo-600/20 text-indigo-400 border-l-4 border-indigo-400"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                  {item.isDemo && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      DEMO
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-slate-700 p-4">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-semibold">
                {userInitial}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{session?.user?.name || 'User'}</p>
                <p className="text-xs text-slate-400">{session?.user?.email || 'user@example.com'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                className="flex-1 justify-start text-slate-300 hover:text-white hover:bg-slate-700"
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
