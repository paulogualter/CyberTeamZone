import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    console.log('🔍 Debug: Handling OAuth login for user:', session.user.email)
    console.log('👤 User data:', { email: session.user.email, name: session.user.name })

    // 1. Verificar se o usuário já existe
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', session.user.email)
      .single()

    console.log('🔍 Debug: Existing user check:', { existingUser, fetchError })

    let userId: string

    if (!existingUser) {
      console.log('➕ Creating new OAuth user...')
      const now = new Date().toISOString()
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('User')
        .insert({
          id: userId,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          role: 'STUDENT',
          escudos: 0,
          subscriptionStatus: 'INACTIVE',
          emailVerified: now,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single()

      if (insertError) {
        console.error('❌ Error creating OAuth user:', insertError)
        return NextResponse.json(
          { success: false, error: 'Failed to create user', details: insertError },
          { status: 500 }
        )
      }

      console.log('✅ OAuth user created successfully:', newUser)
    } else {
      userId = existingUser.id
      console.log('🔄 Updating existing OAuth user...')
      const { error: updateError } = await supabaseAdmin
        .from('User')
        .update({
          name: session.user.name,
          image: session.user.image,
        })
        .eq('email', session.user.email)

      if (updateError) {
        console.error('❌ Error updating OAuth user:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to update user', details: updateError },
          { status: 500 }
        )
      }

      console.log('✅ OAuth user updated successfully')
    }

    // 2. Criar/atualizar conta OAuth na tabela Account
    console.log('🔐 Creating/updating OAuth account...')
    const accountId = `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Dados mockados para teste (em produção, você teria acesso aos dados reais do OAuth)
    const mockAccountData = {
      id: accountId,
      userId: userId,
      type: 'oauth',
      provider: 'google',
      providerAccountId: '113836513617138225324', // ID do Google do usuário
      refresh_token: 'mock_refresh_token',
      access_token: 'mock_access_token',
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hora
      token_type: 'Bearer',
      scope: 'openid email profile',
      id_token: 'mock_id_token',
      session_state: null,
    }

    const { data: existingAccount, error: accountFetchError } = await supabaseAdmin
      .from('Account')
      .select('id')
      .eq('provider', 'google')
      .eq('providerAccountId', '113836513617138225324')
      .single()

    if (!existingAccount) {
      console.log('➕ Creating new OAuth account...')
      const { data: newAccount, error: accountInsertError } = await supabaseAdmin
        .from('Account')
        .insert(mockAccountData)
        .select()
        .single()

      if (accountInsertError) {
        console.error('❌ Error creating OAuth account:', accountInsertError)
        return NextResponse.json(
          { success: false, error: 'Failed to create OAuth account', details: accountInsertError },
          { status: 500 }
        )
      }

      console.log('✅ OAuth account created successfully:', newAccount)
    } else {
      console.log('🔄 Updating existing OAuth account...')
      const { error: accountUpdateError } = await supabaseAdmin
        .from('Account')
        .update({
          refresh_token: mockAccountData.refresh_token,
          access_token: mockAccountData.access_token,
          expires_at: mockAccountData.expires_at,
          token_type: mockAccountData.token_type,
          scope: mockAccountData.scope,
          id_token: mockAccountData.id_token,
          session_state: mockAccountData.session_state,
        })
        .eq('provider', 'google')
        .eq('providerAccountId', '113836513617138225324')

      if (accountUpdateError) {
        console.error('❌ Error updating OAuth account:', accountUpdateError)
        return NextResponse.json(
          { success: false, error: 'Failed to update OAuth account', details: accountUpdateError },
          { status: 500 }
        )
      }

      console.log('✅ OAuth account updated successfully')
    }

    return NextResponse.json({
      success: true,
      message: 'OAuth login handled successfully',
      userId: userId
    })

  } catch (error) {
    console.error('Error handling OAuth login:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
