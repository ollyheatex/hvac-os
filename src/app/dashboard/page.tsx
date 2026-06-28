import { createSupabaseServerClient } from '@/lib/database/supabase-server'
import { formatCurrency } from '@/lib/utils'
import { Users, Briefcase, FileText, PoundSterling, TrendingUp, Clock, AlertCircle, CheckCircle } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient()

  // Fetch stats
  const [customersRes, leadsRes] = await Promise.all([
    supabase.from('customers').select('id, lead_status, total_spend, outstanding_balance', { count: 'exact' }),
    supabase.from('customers').select('id').eq('lead_status', 'new'),
  ])

  const customers = customersRes.data || []
  const totalCustomers = customersRes.count || 0
  const newLeads = leadsRes.count || 0
  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spend || 0), 0)
  const outstanding = customers.reduce((sum, c) => sum + (c.outstanding_balance || 0), 0)

  const stats = [
    { label: 'Total Customers', value: totalCustomers.toString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', change: '+12%' },
    { label: 'New Leads', value: newLeads.toString(), icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10', change: '+5 this week' },
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: PoundSterling, color: 'text-purple-400', bg: 'bg-purple-400/10', change: '+8%' },
    { label: 'Outstanding', value: formatCurrency(outstanding), icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-400/10', change: 'Needs attention' },
  ]

  const pipeline = [
    { status: 'New', count: customers.filter(c => c.lead_status === 'new').length, color: 'bg-slate-500' },
    { status: 'Contacted', count: customers.filter(c => c.lead_status === 'contacted').length, color: 'bg-blue-500' },
    { status: 'Quote Sent', count: customers.filter(c => c.lead_status === 'quote_sent').length, color: 'bg-yellow-500' },
    { status: 'In Progress', count: customers.filter(c => c.lead_status === 'in_progress').length, color: 'bg-purple-500' },
    { status: 'Completed', count: customers.filter(c => c.lead_status === 'completed').length, color: 'bg-green-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-2.5 rounded-lg`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-xs text-slate-500">{stat.change}</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pipeline */}
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5">Lead Pipeline</h2>
          <div className="space-y-3">
            {pipeline.map((stage) => (
              <div key={stage.status} className="flex items-center gap-4">
                <div className="w-28 text-sm text-slate-400">{stage.status}</div>
                <div className="flex-1 bg-slate-800 rounded-full h-2">
                  <div
                    className={`${stage.color} h-2 rounded-full transition-all`}
                    style={{ width: totalCustomers > 0 ? `${Math.max((stage.count / totalCustomers) * 100, 2)}%` : '2%' }}
                  />
                </div>
                <div className="w-8 text-right text-sm font-medium text-white">{stage.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: 'Add Customer', href: '/dashboard/crm/new', icon: Users, color: 'text-blue-400' },
              { label: 'Create Quote', href: '/dashboard/quotes/new', icon: FileText, color: 'text-green-400' },
              { label: 'Schedule Job', href: '/dashboard/calendar', icon: Clock, color: 'text-purple-400' },
              { label: 'New Invoice', href: '/dashboard/invoices/new', icon: PoundSterling, color: 'text-orange-400' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors group"
              >
                <action.icon className={`w-4 h-4 ${action.color}`} />
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Customers */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Recent Customers</h2>
          <a href="/dashboard/crm" className="text-sm text-blue-400 hover:text-blue-300">View all</a>
        </div>
        {customers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No customers yet.</p>
            <a href="/dashboard/crm/new" className="inline-block mt-3 text-sm text-blue-400 hover:text-blue-300">Add your first customer</a>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">Customer list loads here.</p>
        )}
      </div>
    </div>
  )
}