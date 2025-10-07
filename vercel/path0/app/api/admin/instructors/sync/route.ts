import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    // Auth: allow either NextAuth ADMIN session or X-Admin-Token header
    let isAdmin = false
    const adminTokenHeader = req.headers.get('x-admin-token') || req.headers.get('X-Admin-Token')
    if (adminTokenHeader && process.env.ADMIN_SYNC_TOKEN && adminTokenHeader === process.env.ADMIN_SYNC_TOKEN) {
      isAdmin = true
    } else {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { data: currentUser, error: currentUserError } = await supabaseAdmin
        .from('User')
        .select('role')
        .eq('id', session.user.id)
        .single()
      if (!currentUserError && currentUser?.role === 'ADMIN') {
        isAdmin = true
      }
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { email, name } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Fetch user by email
    const { data: user, error: userErr } = await supabaseAdmin
      .from('User')
      .select('id, name, email, role, isActive')
      .eq('email', email)
      .single()
    if (userErr || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Promote to INSTRUCTOR if needed
    if (user.role !== 'INSTRUCTOR') {
      const { error: roleErr } = await supabaseAdmin
        .from('User')
        .update({ role: 'INSTRUCTOR' })
        .eq('id', user.id)
      if (roleErr) {
        return NextResponse.json({ error: 'Failed to promote user to INSTRUCTOR' }, { status: 500 })
      }
    }

    // Ensure Instructor row exists
    const { data: existingInstructor } = await supabaseAdmin
      .from('Instructor')
      .select('id, name, isActive')
      .eq('email', user.email)
      .maybeSingle()

    if (!existingInstructor) {
      const { error: insErr } = await supabaseAdmin
        .from('Instructor')
        .insert({
          name: name || user.name || 'Instrutor',
          email: user.email,
          bio: 'Instrutor do CyberTeam',
          avatar: null,
          expertise: JSON.stringify(['Cibersegurança']),
          socialLinks: JSON.stringify({}),
          isActive: true,
        })
      if (insErr) {
        return NextResponse.json({ error: 'Failed to create instructor' }, { status: 500 })
      }
    } else {
      const { error: updErr } = await supabaseAdmin
        .from('Instructor')
        .update({
          name: name || user.name || existingInstructor.name,
          isActive: true,
        })
        .eq('email', user.email)
      if (updErr) {
        return NextResponse.json({ error: 'Failed to update instructor' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error syncing instructor:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


