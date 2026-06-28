'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createSupabaseBrowserClient } from '@/lib/database/supabase-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

const customerSchema = z.object({
  title: z.string().optional(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  customer_type: z.enum(['residential', 'commercial', 'landlord', 'letting_agent']).default('residential'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  postcode: z.string().optional(),
  lead_source: z.string().optional(),
  notes: z.string().optional(),
  gdpr_consent: z.boolean().default(false),
})

type CustomerForm = z.infer<typeof customerSchema>

export default function NewCustomerPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const { register, handleSubmit, formState: { errors } } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: { customer_type: 'residential', gdpr_consent: false },
  })

  async function onSubmit(data: CustomerForm) {
    setLoading(true)
    setError(null)
    
    // Get organisation_id from the current user's profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setLoading(false); return }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('organisation_id')
      .eq('id', user.id)
      .single()

    if (!profile) { setError('Profile not found'); setLoading(false); return }

    const { data: customer, error: err } = await supabase
      .from('customers')
      .insert({
        ...data,
        organisation_id: profile.organisation_id,
        lead_status: 'new',
        email: data.email || null,
      })
      .select()
      .single()

    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      router.push(`/dashboard/crm/${customer.id}`)
    }
  }

  const inputClass = "w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  const labelClass = "block text-sm font-medium text-slate-300 mb-1.5"

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/crm" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Add Customer</h1>
          <p className="text-slate-400 text-sm">Create a new customer record</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Title</label>
              <select {...register('title')} className={inputClass}>
                <option value="">—</option>
                <option>Mr</option><option>Mrs</option><option>Ms</option><option>Miss</option><option>Dr</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>First Name *</label>
              <input {...register('first_name')} className={inputClass} placeholder="John" />
              {errors.first_name && <p className="mt-1 text-xs text-red-400">{errors.first_name.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <input {...register('last_name')} className={inputClass} placeholder="Smith" />
              {errors.last_name && <p className="mt-1 text-xs text-red-400">{errors.last_name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Company</label>
              <input {...register('company')} className={inputClass} placeholder="Company name" />
            </div>
            <div>
              <label className={labelClass}>Customer Type</label>
              <select {...register('customer_type')} className={inputClass}>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="landlord">Landlord</option>
                <option value="letting_agent">Letting Agent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">Contact Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Email</label>
              <input {...register('email')} type="email" className={inputClass} placeholder="john@email.com" />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input {...register('phone')} className={inputClass} placeholder="01234 567890" />
            </div>
            <div>
              <label className={labelClass}>Mobile</label>
              <input {...register('mobile')} className={inputClass} placeholder="07700 900000" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">Property Address</h2>
          <div>
            <label className={labelClass}>Address Line 1</label>
            <input {...register('address_line1')} className={inputClass} placeholder="123 High Street" />
          </div>
          <div>
            <label className={labelClass}>Address Line 2</label>
            <input {...register('address_line2')} className={inputClass} placeholder="Flat 4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>City / Town</label>
              <input {...register('city')} className={inputClass} placeholder="London" />
            </div>
            <div>
              <label className={labelClass}>County</label>
              <input {...register('county')} className={inputClass} placeholder="Greater London" />
            </div>
            <div>
              <label className={labelClass}>Postcode</label>
              <input {...register('postcode')} className={inputClass} placeholder="SW1A 1AA" />
            </div>
          </div>
        </div>

        {/* Lead Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">Lead Information</h2>
          <div>
            <label className={labelClass}>Lead Source</label>
            <select {...register('lead_source')} className={inputClass}>
              <option value="">Unknown</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="google">Google</option>
              <option value="facebook">Facebook</option>
              <option value="checkatrade">Checkatrade</option>
              <option value="phone">Phone</option>
              <option value="returning">Returning Customer</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea {...register('notes')} rows={3} className={inputClass} placeholder="Any additional notes..." />
          </div>
          <div className="flex items-center gap-3">
            <input {...register('gdpr_consent')} type="checkbox" id="gdpr" className="w-4 h-4 text-blue-600 rounded border-slate-600" />
            <label htmlFor="gdpr" className="text-sm text-slate-300">Customer has given GDPR consent</label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/crm" className="px-6 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg px-6 py-2.5 text-sm transition-colors">
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </form>
    </div>
  )
}