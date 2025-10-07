const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kgokgtepegykzxjrvqkm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnb2tndGVwZWd5a3p4anJ2cWttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTczODQ3OSwiZXhwIjoyMDc1MzE0NDc5fQ.4lWdtQPquOcniAMY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addSampleInstructors() {
  try {
    console.log('Adicionando instrutores de exemplo...')

    // Verificar se já existem instrutores
    const { data: existingInstructors, error: fetchError } = await supabase
      .from('Instructor')
      .select('id')

    if (fetchError) {
      console.error('Erro ao buscar instrutores existentes:', fetchError)
      throw fetchError
    }

    if (existingInstructors && existingInstructors.length > 0) {
      console.log('Instrutores já existem, pulando inserção...')
      return
    }

    const now = new Date().toISOString()
    const instructors = [
      {
        id: 'instructor_1',
        name: 'Paulo Gualter',
        email: 'paulogualter@gmail.com',
        bio: 'Especialista em cibersegurança com mais de 10 anos de experiência em penetration testing e análise de vulnerabilidades.',
        avatar: 'https://lh3.googleusercontent.com/a/ACg8ocLEoxUwB1AAkEUilv0WoHdSwCAtRZr-aO1ZO1aHh97y1nMSoUC-=s96-c',
        expertise: JSON.stringify(['Penetration Testing', 'Ethical Hacking', 'Network Security', 'Web Application Security']),
        socialLinks: JSON.stringify({
          linkedin: 'https://linkedin.com/in/paulogualter',
          twitter: 'https://twitter.com/paulogualter',
          github: 'https://github.com/paulogualter'
        }),
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'instructor_2',
        name: 'Maria Silva',
        email: 'maria.silva@cyberteam.zone',
        bio: 'Especialista em análise forense digital e resposta a incidentes de segurança.',
        avatar: null,
        expertise: JSON.stringify(['Digital Forensics', 'Incident Response', 'Malware Analysis', 'Threat Hunting']),
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
        bio: 'Especialista em segurança de aplicações web e mobile, com foco em OWASP Top 10.',
        avatar: null,
        expertise: JSON.stringify(['Web Security', 'Mobile Security', 'API Security', 'Secure Coding']),
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
        bio: 'Especialista em governança de segurança da informação e compliance.',
        avatar: null,
        expertise: JSON.stringify(['Security Governance', 'Risk Management', 'Compliance', 'ISO 27001']),
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

    if (error) {
      console.error('Erro ao inserir instrutores:', error)
      throw error
    }

    console.log('✅ Instrutores de exemplo adicionados com sucesso!')
    console.log('📊 Instrutores criados:')
    instructors.forEach(i => console.log(`   ${i.name} (${i.email})`))

  } catch (error) {
    console.error('❌ Erro geral ao adicionar instrutores:', error)
  }
}

addSampleInstructors()