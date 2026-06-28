'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, TrendingUp, FileText, Briefcase,
  Calendar, Wrench, DollarSign, Package, Receipt, BarChart3,
  Bot, Zap, Settings, LogOut, ChevronRight
} from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/database/supabase-client'
import { useRouter } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'CRM', href: '/dashboard/crm', icon: Users },
  { label: 'Leads', href: '/dashboard/leads', icon: TrendingUp },
  { label: 'Quotes', href: '/dashboard/quotes', icon: FileText },
  { label: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { label: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
  { label: 'Engineers', href: '/dashboard/engineers', icon: Wrench },
  { label: 'Job Costing', href: '/dashboard/costing', icon: DollarSign },
  { label: 'Stock', href: '/dashboard/stock', icon: Package },
  { label: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
  { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { label: 'AI Assistant', href: '/dashboard/ai', icon: Bot },
  { label: 'Automations', href: '/dashboard/automations', icon: Zap },
]

interface SidebarProps {
  user: { email?: string } | null
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-white truncate">HVAC OS</div>
          <div className="text-xs text-slate-500 truncate">Heatex Climate Solutions</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group',
                isActive
                  ? 'bg-blue-600/20 text-blue-400 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <item.icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300')} />
              <span className="truncate">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 ml-auto text-blue-400" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-800 p-3 space-y-0.5">
        <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <Settings className="w-4 h-4 text-slate-500" />
          <span>Settings</span>
        </Link>
        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors">
          <LogOut className="w-4 h-4 text-slate-500" />
          <span>Sign out</span>
        </button>
        {user?.email && (
          <div className="px-3 py-2 mt-1">
            <p className="text-xs text-slate-600 truncate">{user.email}</p>
          </div>
        )}
      </div>
    </aside>
  )
}