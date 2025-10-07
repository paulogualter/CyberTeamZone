const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function syncInstructors() {
  try {
    console.log('🔄 Sincronizando usuários INSTRUCTOR com tabela Instructor...');

    // Buscar todos os usuários com role INSTRUCTOR
    const instructorUsers = await prisma.user.findMany({
      where: { role: 'INSTRUCTOR' },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isActive: true
      }
    });

    console.log(`📊 Encontrados ${instructorUsers.length} usuários com role INSTRUCTOR`);

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const user of instructorUsers) {
      try {
        // Verificar se já existe instrutor com este email
        const existingInstructor = await prisma.instructor.findUnique({
          where: { email: user.email }
        });

        if (!existingInstructor) {
          // Criar novo instrutor
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
          console.log(`✅ Criado instrutor para: ${user.email}`);
          created++;
        } else {
          // Atualizar instrutor existente
          await prisma.instructor.update({
            where: { email: user.email },
            data: {
              name: user.name || existingInstructor.name,
              isActive: user.isActive
            }
          });
          console.log(`🔄 Atualizado instrutor para: ${user.email}`);
          updated++;
        }
      } catch (error) {
        console.error(`❌ Erro ao processar ${user.email}:`, error.message);
        errors++;
      }
    }

    console.log('\n🎉 Sincronização concluída!');
    console.log(`📊 Resumo:`);
    console.log(`   ✅ Criados: ${created}`);
    console.log(`   🔄 Atualizados: ${updated}`);
    console.log(`   ❌ Erros: ${errors}`);

  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncInstructors();
