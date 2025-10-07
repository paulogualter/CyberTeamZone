import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Verificando pagamentos pendentes...')

    // Buscar pagamentos completos sem matrícula
    const completedPaymentsWithoutEnrollment = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        courseId: {
          not: null
        }
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            isPublished: true,
            status: true,
            price: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    let processedCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const payment of completedPaymentsWithoutEnrollment) {
      try {
        // Verificar se já existe matrícula
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: payment.userId,
              courseId: (payment.courseId as string)
            }
          }
        })

        if (existingEnrollment) {
          continue
        }

        // Verificar se o curso está ativo e publicado
        if (!payment.course || !payment.course.isPublished || payment.course.status !== 'ACTIVE') {
          continue
        }

        // Criar matrícula
        const enrollment = await prisma.enrollment.create({
          data: {
            userId: payment.userId,
            courseId: (payment.courseId as string),
            isActive: true,
            progress: 0
          }
        })

        // Verificar se escudos já foram adicionados
        const existingEscudos = await prisma.userEscudo.findFirst({
          where: {
            userId: payment.userId,
            paymentId: payment.id,
            source: 'COURSE_PURCHASE'
          }
        })

        if (!existingEscudos && payment.amount > 0) {
          const escudosToAdd = Math.floor(payment.amount)
          const expiresAt = new Date()
          expiresAt.setFullYear(expiresAt.getFullYear() + 1) // 12 meses

          await prisma.userEscudo.create({
            data: {
              userId: payment.userId,
              amount: escudosToAdd,
              source: 'COURSE_PURCHASE',
              expiresAt,
              paymentId: payment.id,
              courseId: (payment.courseId as string)
            }
          })

          // Atualizar total de escudos do usuário
          const totalEscudos = await prisma.userEscudo.aggregate({
            where: {
              userId: payment.userId,
              isUsed: false,
              expiresAt: {
                gt: new Date()
              }
            },
            _sum: {
              amount: true
            }
          })

          await prisma.user.update({
            where: { id: payment.userId },
            data: { escudos: totalEscudos._sum.amount || 0 }
          })
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
        totalFound: completedPaymentsWithoutEnrollment.length,
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
