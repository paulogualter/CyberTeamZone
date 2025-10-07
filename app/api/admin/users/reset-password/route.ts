import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
// Updated: Migrated from Prisma to Supabase


// POST - Redefinir senha de usuário
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: currentUser, error: currentUserErr } = await supabaseAdmin
      .from('User')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()
    if (currentUserErr) throw currentUserErr

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId, newPassword } = await req.json()

    if (!userId || !newPassword) {
      return NextResponse.json({ 
        error: 'User ID and new password are required' 
      }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ 
        error: 'Password must be at least 6 characters long' 
      }, { status: 400 })
    }

    // Verificar se o usuário existe
    const { data: user, error: userErr } = await supabaseAdmin
      .from('User')
      .select('id, email, name')
      .eq('id', userId)
      .maybeSingle()
    if (userErr) throw userErr

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Atualizar senha
    const { error: updErr } = await supabaseAdmin
      .from('User')
      .update({ password: hashedPassword })
      .eq('id', userId)
    if (updErr) throw updErr

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
