import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { provider, providerAccountId, type, accessToken, refreshToken, expiresIn, scope, idToken, sessionState } = await request.json()

    console.log('🔍 Debug: Saving OAuth account data')
    console.log('👤 User ID:', session.user.id)
    console.log('🔑 Account data:', { provider, providerAccountId, type })

    // Verificar se já existe uma conta OAuth para este provider
    const { data: existingAccount, error: accountFetchError } = await supabaseAdmin
      .from('Account')
      .select('id')
      .eq('provider', provider)
      .eq('providerAccountId', providerAccountId)
      .single()

    if (existingAccount) {
      console.log('🔄 Updating existing OAuth account...')
      const { error: accountUpdateError } = await supabaseAdmin
        .from('Account')
        .update({
          refresh_token: refreshToken,
          access_token: accessToken,
          expires_at: expiresIn,
          token_type: 'Bearer',
          scope: scope,
          id_token: idToken,
          session_state: sessionState,
        })
        .eq('provider', provider)
        .eq('providerAccountId', providerAccountId)

      if (accountUpdateError) {
        console.error('❌ Error updating OAuth account:', accountUpdateError)
        return NextResponse.json(
          { success: false, error: 'Failed to update OAuth account', details: accountUpdateError },
          { status: 500 }
        )
      }

      console.log('✅ OAuth account updated successfully')
      return NextResponse.json({
        success: true,
        message: 'OAuth account updated successfully'
      })
    } else {
      console.log('➕ Creating new OAuth account...')
      const accountId = `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const { data: newAccount, error: accountInsertError } = await supabaseAdmin
        .from('Account')
        .insert({
          id: accountId,
          userId: session.user.id,
          type: type,
          provider: provider,
          providerAccountId: providerAccountId,
          refresh_token: refreshToken,
          access_token: accessToken,
          expires_at: expiresIn,
          token_type: 'Bearer',
          scope: scope,
          id_token: idToken,
          session_state: sessionState,
        })
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
      return NextResponse.json({
        success: true,
        message: 'OAuth account created successfully',
        account: newAccount
      })
    }

  } catch (error) {
    console.error('Error saving OAuth account:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
