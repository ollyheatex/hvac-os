import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/database/supabase-server'

export default async function HomePage() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/auth/login')
  }
}