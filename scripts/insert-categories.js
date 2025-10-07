const { createClient } = require('@supabase/supabase-js')

// Use the correct Supabase credentials
const supabaseUrl = 'https://kgokgtepegykzxjrvqkm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnb2tndGVwZWd5a3p4anJ2cWttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTczODQ3OSwiZXhwIjoyMDc1MzE0NDc5fQ.4lWdtQPquOcniAMY'

const supabase = createClient(supabaseUrl, supabaseKey)

const categories = [
  { name: 'Penetration Testing', description: 'Ethical hacking and penetration testing courses', icon: '🎯', color: '#EF4444' },
  { name: 'Network Security', description: 'Network defense and monitoring courses', icon: '🛡️', color: '#10B981' },
  { name: 'Web Application Security', description: 'Web application security and OWASP courses', icon: '🌐', color: '#F59E0B' },
  { name: 'Incident Response', description: 'Incident response and forensics courses', icon: '🚨', color: '#8B5CF6' },
  { name: 'Social Engineering', description: 'Social engineering awareness and prevention', icon: '👥', color: '#EC4899' },
  { name: 'Malware Analysis', description: 'Malware analysis and reverse engineering', icon: '🦠', color: '#F97316' },
  { name: 'Digital Forensics', description: 'Digital forensics and evidence collection', icon: '🔍', color: '#06B6D4' },
  { name: 'Cryptography', description: 'Cryptography and encryption techniques', icon: '🔐', color: '#84CC16' },
  { name: 'Red Team Operations', description: 'Red team exercises and attack simulation', icon: '🔴', color: '#DC2626' },
  { name: 'Blue Team Defense', description: 'Blue team defense and monitoring', icon: '🔵', color: '#2563EB' },
  { name: 'Cloud Security', description: 'Cloud security and infrastructure protection', icon: '☁️', color: '#7C3AED' },
  { name: 'Threat Intelligence', description: 'Threat intelligence and analysis', icon: '📊', color: '#059669' },
  { name: 'IoT Security', description: 'Internet of Things security', icon: '🌐', color: '#10B981' },
  { name: 'Mobile Security', description: 'Mobile device and application security', icon: '📱', color: '#F59E0B' },
  { name: 'Compliance & Governance', description: 'Security compliance and governance frameworks', icon: '📋', color: '#6B7280' }
]

async function insertCategories() {
  try {
    console.log('🌱 Inserting categories into Supabase...')

    // First, check if categories already exist
    const { data: existingCategories, error: checkError } = await supabase
      .from('Category')
      .select('name')

    if (checkError) {
      console.error('❌ Error checking existing categories:', checkError)
      return
    }

    if (existingCategories && existingCategories.length > 0) {
      console.log(`✅ Found ${existingCategories.length} existing categories. Skipping insert.`)
      console.log('Existing categories:', existingCategories.map(c => c.name))
      return
    }

    // Insert categories one by one to avoid conflicts
    for (const category of categories) {
      const { data, error } = await supabase
        .from('Category')
        .insert([category])
        .select()

      if (error) {
        console.error(`❌ Error inserting ${category.name}:`, error)
      } else {
        console.log(`✅ Inserted: ${category.name}`)
      }
    }

    console.log('✅ Categories insertion completed.')

  } catch (error) {
    console.error('❌ Error inserting categories:', error)
  }
}

insertCategories()
