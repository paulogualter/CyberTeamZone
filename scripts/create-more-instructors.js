const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kgokgtepegykzxjrvqkm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnb2tndGVwZWd5a3p4anJ2cWttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTczODQ3OSwiZXhwIjoyMDc1MzE0NDc5fQ.PWhZPkViOEsMwvQ57Y6WnssAqns-LDq5Z_3UR2E_IWM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createMoreInstructors() {
  try {
    console.log('Criando mais instrutores...')

    const now = new Date().toISOString()
    const instructors = [
      {
        id: 'instructor_2',
        name: 'Maria Silva',
        email: 'maria.silva@cyberteam.zone',
        bio: 'Especialista em análise forense digital e resposta a incidentes de segurança.',
        expertise: JSON.stringify(['Digital Forensics', 'Incident Response', 'Malware Analysis']),
        socialLinks: JSON.stringify({
          linkedin: 'https://linkedin.com/in/mariasilva'
        }),
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'instructor_3',
        name: 'João Santos',
        email: 'joao.santos@cyberteam.zone',
        bio: 'Especialista em segurança de aplicações web e mobile.',
        expertise: JSON.stringify(['Web Security', 'Mobile Security', 'API Security']),
        socialLinks: JSON.stringify({
          linkedin: 'https://linkedin.com/in/joaosantos',
          github: 'https://github.com/joaosantos'
        }),
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'instructor_4',
        name: 'Ana Costa',
        email: 'ana.costa@cyberteam.zone',
        bio: 'Especialista em governança de segurança da informação.',
        expertise: JSON.stringify(['Security Governance', 'Risk Management', 'Compliance']),
        socialLinks: JSON.stringify({
          linkedin: 'https://linkedin.com/in/anacosta'
        }),
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ]

    const { data, error } = await supabase
      .from('Instructor')
      .insert(instructors)
      .select()

    if (error) {
      console.error('Erro ao criar instrutores:', error)
      throw error
    }

    console.log('✅ Instrutores criados com sucesso!')
    console.log('📊 Instrutores:', data.length)

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createMoreInstructors()
