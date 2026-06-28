'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/database/supabase-client'

export default function SetupPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    async function setup() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      
      // Get the Heatex organisation
      const { data: org } = await supabase
        .from('organisations')
        .select('id')
        .eq('slug', 'heatex-climate-solutions')
        .single()
      
      if (org) {
        // Create profile
        await supabase.from('profiles').upsert({
          id: user.id,
          organisation_id: org.id,
          role: 'admin',
          first_name: user.user_metadata?.first_name || 'Admin',
          last_name: user.user_metadata?.last_name || 'User',
          email: user.email!,
        })
        router.push('/dashboard')
      }
    }
    setup()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Setting up your account...</p>
      </div>
    </div>
  )
}