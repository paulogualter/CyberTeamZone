const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kgokgtepegykzxjrvqkm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnb2tndGVwZWd5a3p4anJ2cWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3Mzg0NzksImV4cCI6MjA3NTMxNDQ3OX0.q40V1bI4MGAT2y9FGpvRaxYf_w5wtm-XSpzvgH9_AsI'

const supabase = createClient(supabaseUrl, supabaseKey)

async function insertSubscriptionPlans() {
  try {
    console.log('Inserindo planos de assinatura no Supabase...')

    // Verificar planos existentes
    const { data: existingPlans } = await supabase
      .from('Subscription')
      .select('*')

    console.log('Planos existentes:', existingPlans?.length || 0)

    if (existingPlans && existingPlans.length > 0) {
      console.log('Planos já existem, pulando inserção...')
      return
    }

    // Inserir planos de assinatura
    const now = new Date().toISOString()
    const plans = [
      {
        id: 'cmgezmc6b0009to5st8b3fbbq-basic',
        name: 'Basic',
        price: 49.90,
        escudos: 50,
        duration: 30,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'cmgezmc6b0009to5st8b3fbbq-gold',
        name: 'Gold',
        price: 79.90,
        escudos: 80,
        duration: 30,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'cmgezmc6b0009to5st8b3fbbq-diamond',
        name: 'Diamond',
        price: 129.90,
        escudos: 130,
        duration: 30,
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ]

    const { data, error } = await supabase
      .from('Subscription')
      .insert(plans)

    if (error) {
      console.error('Erro ao inserir planos:', error)
      return
    }

    console.log('✅ Planos de assinatura inseridos com sucesso!')
    console.log('📊 Planos criados:')
    plans.forEach(plan => {
      console.log(`   ${plan.name}: R$ ${plan.price} → ${plan.escudos} escudos`)
    })

  } catch (error) {
    console.error('❌ Erro ao inserir planos:', error)
  }
}

insertSubscriptionPlans()
