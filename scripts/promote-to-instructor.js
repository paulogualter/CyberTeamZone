const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function promoteToInstructor(email) {
  try {
    if (!email) {
      console.log('❌ Email é obrigatório');
      console.log('📖 Uso: node scripts/promote-to-instructor.js <email>');
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
        isActive: true,
        image: true
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
    console.log(`   Ativo: ${user.isActive}`);

    if (user.role === 'INSTRUCTOR') {
      console.log('✅ Usuário já é INSTRUCTOR');
      
      // Verificar se existe na tabela Instructor
      const instructor = await prisma.instructor.findUnique({
        where: { email: user.email }
      });

      if (instructor) {
        console.log('✅ Já existe na tabela Instructor');
      } else {
        console.log('⚠️  Não existe na tabela Instructor, criando...');
        
        await prisma.instructor.create({
          data: {
            name: user.name || 'Instrutor',
            email: user.email,
            bio: 'Instrutor do CyberTeam',
            avatar: user.image || null,
            expertise: JSON.stringify(['Cibersegurança']),
            socialLinks: JSON.stringify({}),
            isActive: user.isActive
          }
        });
        
        console.log('✅ Instrutor criado na tabela Instructor');
      }
      return;
    }

    // Promover para INSTRUCTOR
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        role: 'INSTRUCTOR',
        isActive: true
      }
    });

    console.log('✅ Usuário promovido para INSTRUCTOR');

    // Criar registro na tabela Instructor
    const instructor = await prisma.instructor.create({
      data: {
        name: user.name || 'Instrutor',
        email: user.email,
        bio: 'Instrutor do CyberTeam',
        avatar: user.image || null,
        expertise: JSON.stringify(['Cibersegurança']),
        socialLinks: JSON.stringify({}),
        isActive: true
      }
    });

    console.log('✅ Instrutor criado na tabela Instructor');
    
    console.log('\n🎉 Promoção concluída!');
    console.log('👤 Dados atualizados:');
    console.log(`   Nome: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Role: ${updatedUser.role}`);
    console.log(`   Ativo: ${updatedUser.isActive}`);
    
    console.log('\n👨‍🏫 Dados do instrutor:');
    console.log(`   Nome: ${instructor.name}`);
    console.log(`   Email: ${instructor.email}`);
    console.log(`   Ativo: ${instructor.isActive}`);

  } catch (error) {
    console.error('❌ Erro ao promover usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Obter email dos argumentos da linha de comando
const email = process.argv[2];
promoteToInstructor(email);
