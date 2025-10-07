const mysql = require('mysql2/promise')
require('dotenv').config({ path: '.env.local' })

async function createAdmin() {
  let connection
  
  try {
    // Conectar ao MySQL
    console.log('Conectando ao MySQL...')
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 8889,
      user: 'root',
      password: 'root', // Tenta 'root' primeiro
      database: 'cyberteam_lms'
    })

    console.log('Conectado ao MySQL com sucesso!')

    // Verificar se já existe um admin
    const [existingAdmin] = await connection.execute(
      'SELECT id FROM User WHERE role = "ADMIN" LIMIT 1'
    )

    if (existingAdmin.length > 0) {
      console.log('✅ Já existe um administrador no sistema')
      return
    }

    // Criar usuário administrador
    const adminData = {
      email: 'admin@cyberteam.com',
      name: 'Administrador CyberTeam',
      role: 'ADMIN',
      escudos: 999999, // Escudos ilimitados para admin
      subscriptionStatus: 'ACTIVE',
      subscriptionPlan: 'diamond' // Usar um plano válido
    }

    // Gerar ID único
    const userId = 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

    const [result] = await connection.execute(
      `INSERT INTO User (id, email, name, role, escudos, subscriptionStatus, subscriptionPlan, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        userId,
        adminData.email,
        adminData.name,
        adminData.role,
        adminData.escudos,
        adminData.subscriptionStatus,
        adminData.subscriptionPlan
      ]
    )

    console.log('✅ Usuário administrador criado com sucesso!')
    console.log('📧 Email: admin@cyberteam.com')
    console.log('🔑 Role: ADMIN')
    console.log('💰 Escudos: 999,999')
    console.log('')
    console.log('⚠️  IMPORTANTE: Configure o Google OAuth para este email ou crie uma conta Google com este email para fazer login como administrador.')

  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error.message)
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Dica: Verifique se a senha do MySQL está correta (tentou "root")')
    }
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

createAdmin()
