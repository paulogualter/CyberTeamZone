#!/usr/bin/env node

/**
 * Script para configurar o banco de dados Supabase
 * Execute: node scripts/setup-supabase.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Configurando banco de dados Supabase...')
  
  try {
    // Testar conexão
    await prisma.$connect()
    console.log('✅ Conexão com Supabase estabelecida!')
    
    // Verificar se as tabelas existem
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `
    
    console.log(`📊 Encontradas ${tables.length} tabelas no banco`)
    
    if (tables.length === 0) {
      console.log('⚠️  Nenhuma tabela encontrada. Execute: npx prisma db push')
    } else {
      console.log('✅ Tabelas encontradas:')
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`)
      })
    }
    
    // Testar operações básicas
    const userCount = await prisma.user.count()
    console.log(`👥 Usuários cadastrados: ${userCount}`)
    
    const courseCount = await prisma.course.count()
    console.log(`📚 Cursos cadastrados: ${courseCount}`)
    
  } catch (error) {
    console.error('❌ Erro ao configurar Supabase:', error.message)
    
    if (error.message.includes('P1001')) {
      console.log('\n💡 Dicas para resolver:')
      console.log('1. Verifique se a DATABASE_URL está correta')
      console.log('2. Certifique-se de que o projeto Supabase está ativo')
      console.log('3. Verifique se a senha do banco está correta')
      console.log('4. Execute: npx prisma db push')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
