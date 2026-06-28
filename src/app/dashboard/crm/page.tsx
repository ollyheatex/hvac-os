import { createSupabaseServerClient } from '@/lib/database/supabase-server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Plus, Search, Filter, Users } from 'lucide-react'

const STATUS_COLOURS: Record<string, string> = {
  new: 'bg-slate-500/20 text-slate-300',
  contacted: 'bg-blue-500/20 text-blue-300',
  survey_booked: 'bg-cyan-500/20 text-cyan-300',
  quote_sent: 'bg-yellow-500/20 text-yellow-300',
  accepted: 'bg-purple-500/20 text-purple-300',
  in_progress: 'bg-indigo-500/20 text-indigo-300',
  completed: 'bg-green-500/20 text-green-300',
  invoice_sent: 'bg-orange-500/20 text-orange-300',
  paid: 'bg-emerald-500/20 text-emerald-300',
  lost: 'bg-red-500/20 text-red-300',
}

export default async function CRMPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string }
}) {
  const supabase = createSupabaseServerClient()
  
  let query = supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (searchParams.status) {
    query = query.eq('lead_status', searchParams.status)
  }

  const { data: customers, error } = await query

  const filtered = customers?.filter(c => {
    if (!searchParams.search) return true
    const search = searchParams.search.toLowerCase()
    return (
      c.first_name?.toLowerCase().includes(search) ||
      c.last_name?.toLowerCase().includes(search) ||
      c.email?.toLowerCase().includes(search) ||
      c.phone?.includes(search) ||
      c.postcode?.toLowerCase().includes(search) ||
      c.company?.toLowerCase().includes(search)
    )
  }) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} customer{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/dashboard/crm/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <form className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            name="search"
            defaultValue={searchParams.search}
            placeholder="Search customers..."
            className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </form>
        <select
          name="status"
          defaultValue={searchParams.status}
          className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="quote_sent">Quote Sent</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No customers found</h3>
            <p className="text-slate-400 text-sm mb-4">
              {searchParams.search ? 'Try adjusting your search.' : 'Add your first customer to get started.'}
            </p>
            <Link href="/dashboard/crm/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors">
              <Plus className="w-4 h-4" />
              Add Customer
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Customer</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4 hidden md:table-cell">Contact</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4 hidden lg:table-cell">Location</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4 hidden xl:table-cell">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/crm/${customer.id}`} className="block">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-400 text-xs font-semibold">
                            {customer.first_name?.[0]}{customer.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white hover:text-blue-400 transition-colors">
                            {customer.first_name} {customer.last_name}
                          </div>
                          {customer.company && (
                            <div className="text-xs text-slate-500">{customer.company}</div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="text-sm text-slate-300">{customer.phone || customer.mobile || '—'}</div>
                    <div className="text-xs text-slate-500">{customer.email || '—'}</div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="text-sm text-slate-300">{customer.postcode || '—'}</div>
                    <div className="text-xs text-slate-500">{customer.city || ''}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOURS[customer.lead_status] || 'bg-slate-500/20 text-slate-300'}`}>
                      {customer.lead_status?.replace(/_/g, ' ') || 'new'}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden xl:table-cell">
                    <div className="text-sm text-slate-400">{formatDate(customer.created_at)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}