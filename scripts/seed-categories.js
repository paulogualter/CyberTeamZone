const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: '.env.local' })

const prisma = new PrismaClient()

async function seedCategories() {
  const items = [
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
    { name: 'Compliance & Governance', description: 'Security compliance and governance frameworks', icon: '📋', color: '#6B7280' },
  ]

  try {
    console.log('🌱 Seeding categories...')
    for (const c of items) {
      await prisma.category.upsert({
        where: { name: c.name },
        update: { description: c.description, icon: c.icon, color: c.color },
        create: c,
      })
    }
    console.log(`✅ Seeded ${items.length} categories.`)
  } catch (err) {
    console.error('❌ Failed to seed categories:', err)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

seedCategories()
