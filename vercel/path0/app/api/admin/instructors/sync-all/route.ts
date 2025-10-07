import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const adminToken = process.env.ADMIN_SYNC_TOKEN
  const headerToken = request.headers.get('x-admin-token') || request.headers.get('X-Admin-Token')

  if (!adminToken || !headerToken || headerToken !== adminToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: users, error: usersError } = await supabaseAdmin
      .from('User')
      .select('id, name, email, role, isActive')
      .eq('role', 'INSTRUCTOR')

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ synced: 0, created: 0, updated: 0, skipped: 0, message: 'No INSTRUCTOR users found' })
    }

    let created = 0
    let updated = 0
    let skipped = 0

    for (const user of users) {
      if (!user.email) { skipped++; continue }

      const { data: existingInstructor, error: fetchInstrErr } = await supabaseAdmin
        .from('Instructor')
        .select('id, email')
        .eq('email', user.email)
        .maybeSingle()

      if (fetchInstrErr) { skipped++; continue }

      const payload = {
        name: user.name || user.email.split('@')[0],
        email: user.email,
        isActive: user.isActive ?? true,
        userId: user.id,
        updatedAt: new Date().toISOString()
      }

      if (!existingInstructor) {
        const insertPayload = { ...payload, id: `instructor_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`, createdAt: new Date().toISOString() }
        const { error: insertErr } = await supabaseAdmin.from('Instructor').insert(insertPayload)
        if (insertErr) { skipped++; continue }
        created++
      } else {
        const { error: updateErr } = await supabaseAdmin
          .from('Instructor')
          .update(payload)
          .eq('id', existingInstructor.id)
        if (updateErr) { skipped++; continue }
        updated++
      }
    }

    return NextResponse.json({ synced: users.length, created, updated, skipped })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}


