const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateSubscriptionPlans() {
  try {
    console.log('Atualizando planos de assinatura...')

    // Buscar planos existentes
    const existingPlans = await prisma.subscription.findMany()
    console.log('Planos existentes:', existingPlans.map(p => ({ name: p.name, price: p.price, escudos: p.escudos })))

    // Atualizar ou criar plano Basic
    const basicPlan = existingPlans.find(p => p.name === 'Basic')
    if (basicPlan) {
      await prisma.subscription.update({
        where: { id: basicPlan.id },
        data: {
          price: 49.90,
          escudos: 50,
          duration: 30
        }
      })
    } else {
      await prisma.subscription.create({
        data: {
          name: 'Basic',
          price: 49.90,
          escudos: 50,
          duration: 30,
          isActive: true
        }
      })
    }

    // Atualizar ou criar plano Gold
    const goldPlan = existingPlans.find(p => p.name === 'Gold')
    if (goldPlan) {
      await prisma.subscription.update({
        where: { id: goldPlan.id },
        data: {
          price: 79.90,
          escudos: 80,
          duration: 30
        }
      })
    } else {
      await prisma.subscription.create({
        data: {
          name: 'Gold',
          price: 79.90,
          escudos: 80,
          duration: 30,
          isActive: true
        }
      })
    }

    // Atualizar ou criar plano Diamond
    const diamondPlan = existingPlans.find(p => p.name === 'Diamond')
    if (diamondPlan) {
      await prisma.subscription.update({
        where: { id: diamondPlan.id },
        data: {
          price: 129.90,
          escudos: 130,
          duration: 30
        }
      })
    } else {
      await prisma.subscription.create({
        data: {
          name: 'Diamond',
          price: 129.90,
          escudos: 130,
          duration: 30,
          isActive: true
        }
      })
    }

    console.log('✅ Planos de assinatura atualizados com sucesso!')
    console.log('📊 Nova tabela de valores:')
    console.log('   Basic: R$ 49,90 → 50 escudos')
    console.log('   Gold: R$ 79,90 → 80 escudos')
    console.log('   Diamond: R$ 129,90 → 130 escudos')

  } catch (error) {
    console.error('❌ Erro ao atualizar planos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateSubscriptionPlans()
