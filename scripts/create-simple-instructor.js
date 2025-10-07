const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kgokgtepegykzxjrvqkm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnb2tndGVwZWd5a3p4anJ2cWttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTczODQ3OSwiZXhwIjoyMDc1MzE0NDc5fQ.PWhZPkViOEsMwvQ57Y6WnssAqns-LDq5Z_3UR2E_IWM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createSimpleInstructor() {
  try {
    console.log('Criando instrutor simples...')

    const now = new Date().toISOString()
    const instructor = {
      id: 'instructor_simple_1',
      name: 'Paulo Gualter',
      email: 'paulogualter@gmail.com',
      bio: 'Especialista em cibersegurança',
      expertise: JSON.stringify(['Penetration Testing', 'Ethical Hacking']),
      socialLinks: JSON.stringify({}),
      isActive: true,
      createdAt: now,
      updatedAt: now
    }

    const { data, error } = await supabase
      .from('Instructor')
      .insert(instructor)
      .select()

    if (error) {
      console.error('Erro ao criar instrutor:', error)
      throw error
    }

    console.log('✅ Instrutor criado com sucesso!')
    console.log('📊 Instrutor:', data)

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createSimpleInstructor()
