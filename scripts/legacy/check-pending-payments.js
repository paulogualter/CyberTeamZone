#!/usr/bin/env node

/**
 * Script para verificar e processar pagamentos pendentes
 * Este script deve ser executado periodicamente para garantir que todos os pagamentos sejam processados
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkPendingPayments() {
  console.log('🔍 Verificando pagamentos pendentes...\n')

  try {
    // 1. Buscar pagamentos completos sem matrícula
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

    console.log(`📋 Encontrados ${completedPaymentsWithoutEnrollment.length} pagamentos completos sem matrícula`)

    let processedCount = 0
    let errorCount = 0

    for (const payment of completedPaymentsWithoutEnrollment) {
      console.log(`\n🔍 Processando pagamento ${payment.id}:`)
      console.log(`   Curso: ${payment.course.title}`)
      console.log(`   Usuário: ${payment.user.name} (${payment.user.email})`)
      console.log(`   Valor: R$ ${payment.amount}`)

      try {
        // Verificar se já existe matrícula
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: payment.userId,
              courseId: payment.courseId
            }
          }
        })

        if (existingEnrollment) {
          console.log(`   ✅ Já matriculado - pulando`)
          continue
        }

        // Verificar se o curso está ativo e publicado
        if (!payment.course.isPublished || payment.course.status !== 'ACTIVE') {
          console.log(`   ⚠️  Curso não está ativo ou publicado - pulando`)
          continue
        }

        // Criar matrícula
        const enrollment = await prisma.enrollment.create({
          data: {
            userId: payment.userId,
            courseId: payment.courseId,
            isActive: true,
            progress: 0
          }
        })

        console.log(`   ✅ Matrícula criada: ${enrollment.id}`)

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
              courseId: payment.courseId
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

          console.log(`   ✅ Escudos adicionados: ${escudosToAdd}`)
        } else {
          console.log(`   ✅ Escudos já existem`)
        }

        processedCount++

      } catch (error) {
        console.log(`   ❌ Erro ao processar: ${error.message}`)
        errorCount++
      }
    }

    // 2. Verificar pagamentos pendentes antigos (mais de 1 hora)
    const oldPendingPayments = await prisma.payment.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: new Date(Date.now() - 60 * 60 * 1000) // Mais de 1 hora
        }
      },
      include: {
        course: {
          select: {
            title: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (oldPendingPayments.length > 0) {
      console.log(`\n⚠️  Encontrados ${oldPendingPayments.length} pagamentos pendentes antigos:`)
      oldPendingPayments.forEach((payment, index) => {
        console.log(`   ${index + 1}. ${payment.course.title} - ${payment.user.name} (${payment.createdAt})`)
      })
    }

    // 3. Resumo
    console.log(`\n📊 Resumo da verificação:`)
    console.log(`   Pagamentos processados: ${processedCount}`)
    console.log(`   Erros encontrados: ${errorCount}`)
    console.log(`   Pagamentos pendentes antigos: ${oldPendingPayments.length}`)

    if (processedCount > 0) {
      console.log(`\n✅ ${processedCount} pagamento(s) processado(s) com sucesso!`)
    }

    if (errorCount > 0) {
      console.log(`\n❌ ${errorCount} erro(s) encontrado(s). Verifique os logs acima.`)
    }

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar a verificação
checkPendingPayments()
