import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({ status: 'ok', app: 'HVAC OS', company: 'Heatex Climate Solutions' })
}