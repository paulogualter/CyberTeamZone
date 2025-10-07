import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
// Updated: Migrated from Prisma to Supabase


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Verificando pagamentos pendentes...')

    // Buscar pagamentos completos com courseId definido
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('Payment')
      .select('id, userId, courseId, status, amount')
      .eq('status', 'COMPLETED')
      .not('courseId', 'is', null)

    if (paymentsError) {
      throw paymentsError
    }

    let processedCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const payment of payments || []) {
      try {
        // Verificar se já existe matrícula
        const { data: existingEnrollment, error: findEnrollErr } = await supabaseAdmin
          .from('Enrollment')
          .select('id')
          .eq('userId', payment.userId)
          .eq('courseId', payment.courseId as string)
          .maybeSingle()

        if (findEnrollErr) throw findEnrollErr

        if (existingEnrollment) {
          continue
        }

        // Verificar se o curso está ativo e publicado
        const { data: course, error: courseErr } = await supabaseAdmin
          .from('Course')
          .select('id, isPublished, status')
          .eq('id', payment.courseId as string)
          .maybeSingle()
        if (courseErr) throw courseErr
        if (!course || !course.isPublished || course.status !== 'ACTIVE') continue

        // Criar matrícula
        const { error: createEnrollErr } = await supabaseAdmin
          .from('Enrollment')
          .insert({
            userId: payment.userId,
            courseId: payment.courseId as string,
            isActive: true,
            progress: 0
          })
        if (createEnrollErr) throw createEnrollErr

        // Verificar se escudos já foram adicionados
        const { data: existingEscudos, error: escudosFindErr } = await supabaseAdmin
          .from('UserEscudo')
          .select('id')
          .eq('userId', payment.userId)
          .eq('paymentId', payment.id)
          .eq('source', 'COURSE_PURCHASE')
          .maybeSingle()
        if (escudosFindErr) throw escudosFindErr

        if (!existingEscudos && (payment.amount || 0) > 0) {
          const escudosToAdd = Math.floor(payment.amount as number)
          const expiresAt = new Date()
          expiresAt.setFullYear(expiresAt.getFullYear() + 1) // 12 meses

          const { error: createEscudoErr } = await supabaseAdmin
            .from('UserEscudo')
            .insert({
              userId: payment.userId,
              amount: escudosToAdd,
              source: 'COURSE_PURCHASE',
              expiresAt: expiresAt.toISOString(),
              paymentId: payment.id,
              courseId: payment.courseId as string
            })
          if (createEscudoErr) throw createEscudoErr

          // Atualizar total de escudos do usuário
          const { data: sumRows, error: sumErr } = await supabaseAdmin
            .from('UserEscudo')
            .select('amount')
            .eq('userId', payment.userId)
            .eq('isUsed', false)
            .gt('expiresAt', new Date().toISOString())
          if (sumErr) throw sumErr
          const totalAmount = (sumRows || []).reduce((acc, r: any) => acc + (Number(r.amount) || 0), 0)

          const { error: updateUserErr } = await supabaseAdmin
            .from('User')
            .update({ escudos: totalAmount })
            .eq('id', payment.userId)
          if (updateUserErr) throw updateUserErr
        }

        processedCount++

      } catch (error) {
        errorCount++
        const message = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Erro no pagamento ${payment.id}: ${message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Verificação concluída',
      data: {
        totalFound: (payments || []).length,
        processed: processedCount,
        errors: errorCount,
        errorDetails: errors
      }
    })

  } catch (error) {
    console.error('Error checking pending payments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
