const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function makeUserAdmin(email) {
  try {
    if (!email) {
      console.log('❌ Email é obrigatório');
      console.log('📖 Uso: node scripts/make-user-admin.js <email>');
      return;
    }

    console.log(`🔍 Procurando usuário: ${email}`);
    
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        escudos: true
      }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log('👤 Usuário encontrado:');
    console.log(`   Nome: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role atual: ${user.role}`);
    console.log(`   Status: ${user.subscriptionStatus}`);
    console.log(`   Plano: ${user.subscriptionPlan || 'Nenhum'}`);
    console.log(`   Escudos: ${user.escudos}`);

    if (user.role === 'ADMIN') {
      console.log('✅ Usuário já é ADMIN');
      return;
    }

    // Promover para ADMIN
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        role: 'ADMIN',
        subscriptionStatus: 'ACTIVE',
        subscriptionPlan: 'DIAMOND',
        escudos: 999999, // Escudos ilimitados para admin
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        escudos: true
      }
    });

    console.log('\n🎉 Usuário promovido para ADMIN com sucesso!');
    console.log('👤 Dados atualizados:');
    console.log(`   Nome: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Role: ${updatedUser.role}`);
    console.log(`   Status: ${updatedUser.subscriptionStatus}`);
    console.log(`   Plano: ${updatedUser.subscriptionPlan}`);
    console.log(`   Escudos: ${updatedUser.escudos}`);
    
    console.log('\n🔐 Privilégios de ADMIN:');
    console.log('   ✅ Acesso total sem restrições');
    console.log('   ✅ Não precisa de planos de assinatura');
    console.log('   ✅ Escudos ilimitados');
    console.log('   ✅ Acesso ao painel administrativo (/admin)');
    console.log('   ✅ Pode comprar cursos gratuitamente');

  } catch (error) {
    console.error('❌ Erro ao promover usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Obter email dos argumentos da linha de comando
const email = process.argv[2];
makeUserAdmin(email);
