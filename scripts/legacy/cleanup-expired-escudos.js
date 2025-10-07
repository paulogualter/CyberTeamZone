const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function cleanupExpiredEscudos() {
  try {
    console.log('🧹 Limpando escudos expirados...')
    
    const expiredEscudos = await prisma.userEscudo.findMany({
      where: {
        expiresAt: {
          lte: new Date()
        },
        isUsed: false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log(`\n📊 Encontrados ${expiredEscudos.length} escudos expirados:`)
    console.log('=' .repeat(80))

    if (expiredEscudos.length > 0) {
      // Agrupar por usuário para mostrar resumo
      const userSummary = {}
      expiredEscudos.forEach(escudo => {
        const userId = escudo.userId
        if (!userSummary[userId]) {
          userSummary[userId] = {
            user: escudo.user,
            totalAmount: 0,
            count: 0
          }
        }
        userSummary[userId].totalAmount += escudo.amount
        userSummary[userId].count++
      })

      // Mostrar resumo por usuário
      Object.values(userSummary).forEach(({ user, totalAmount, count }) => {
        console.log(`👤 ${user.name || 'Sem nome'} (${user.email})`)
        console.log(`   ${count} escudos expirados: ${totalAmount} escudos`)
      })

      // Marcar como usados (para manter histórico)
      await prisma.userEscudo.updateMany({
        where: {
          id: {
            in: expiredEscudos.map(e => e.id)
          }
        },
        data: {
          isUsed: true,
          usedAt: new Date()
        }
      })

      // Atualizar totais de todos os usuários afetados
      const affectedUserIds = [...new Set(expiredEscudos.map(e => e.userId))]
      for (const userId of affectedUserIds) {
        // Recalcular escudos válidos
        const validEscudos = await prisma.userEscudo.findMany({
          where: {
            userId,
            isUsed: false,
            expiresAt: {
              gt: new Date()
            }
          }
        })

        const totalValidEscudos = validEscudos.reduce((total, escudo) => total + escudo.amount, 0)

        await prisma.user.update({
          where: { id: userId },
          data: { escudos: totalValidEscudos }
        })
      }

      console.log(`\n✅ ${expiredEscudos.length} escudos expirados foram removidos`)
      console.log(`👥 ${affectedUserIds.length} usuários tiveram seus totais atualizados`)
    } else {
      console.log('\n✅ Nenhum escudo expirado encontrado!')
    }

    // Mostrar estatísticas atuais
    const totalValidEscudos = await prisma.userEscudo.count({
      where: {
        isUsed: false,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    const totalExpiredEscudos = await prisma.userEscudo.count({
      where: {
        isUsed: true
      }
    })

    console.log('\n📊 ESTATÍSTICAS ATUAIS:')
    console.log(`- Escudos válidos: ${totalValidEscudos}`)
    console.log(`- Escudos expirados/usados: ${totalExpiredEscudos}`)

  } catch (error) {
    console.error('❌ Erro na limpeza:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupExpiredEscudos()
