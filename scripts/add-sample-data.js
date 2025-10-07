const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function addSampleData() {
  try {
    console.log('Adding sample data...');

    // Add instructors
    const instructors = await Promise.all([
      prisma.instructor.upsert({
        where: { email: 'ana.silva@cyberteam.com' },
        update: {},
        create: {
          name: 'Dr. Ana Silva',
          email: 'ana.silva@cyberteam.com',
          bio: 'Especialista em Penetration Testing com 10+ anos de experiência',
          avatar: '/images/instructors/ana-silva.jpg',
          expertise: JSON.stringify(['Penetration Testing', 'Ethical Hacking', 'Vulnerability Assessment']),
          socialLinks: JSON.stringify({
            linkedin: 'https://linkedin.com/in/ana-silva',
            twitter: 'https://twitter.com/ana_silva_sec'
          }),
          isActive: true
        }
      }),
      prisma.instructor.upsert({
        where: { email: 'carlos.mendes@cyberteam.com' },
        update: {},
        create: {
          name: 'Carlos Mendes',
          email: 'carlos.mendes@cyberteam.com',
          bio: 'Especialista em Network Security e Incident Response',
          avatar: '/images/instructors/carlos-mendes.jpg',
          expertise: JSON.stringify(['Network Security', 'Incident Response', 'Forensics']),
          socialLinks: JSON.stringify({
            linkedin: 'https://linkedin.com/in/carlos-mendes',
            github: 'https://github.com/carlos-mendes'
          }),
          isActive: true
        }
      }),
      prisma.instructor.upsert({
        where: { email: 'maria.santos@cyberteam.com' },
        update: {},
        create: {
          name: 'Maria Santos',
          email: 'maria.santos@cyberteam.com',
          bio: 'Especialista em Web Application Security e OWASP',
          avatar: '/images/instructors/maria-santos.jpg',
          expertise: JSON.stringify(['Web Security', 'OWASP', 'Secure Coding']),
          socialLinks: JSON.stringify({
            linkedin: 'https://linkedin.com/in/maria-santos',
            twitter: 'https://twitter.com/maria_santos_sec'
          }),
          isActive: true
        }
      })
    ]);

    console.log('Instructors created:', instructors.length);

    // Add sample courses
    const courses = await Promise.all([
      prisma.course.create({
        data: {
          title: 'Fundamentos de Cibersegurança',
          shortDescription: 'Curso introdutório para iniciantes em cibersegurança',
          description: 'Este curso abrange os conceitos fundamentais de cibersegurança, incluindo ameaças, vulnerabilidades, e medidas de proteção básicas.',
          price: 299.90,
          escudosPrice: 150,
          difficulty: 'BEGINNER',
          duration: 20,
          categoryId: 'clx1234567890abcde1',
          instructorId: instructors[0].id,
          coverImage: '/images/curso-basico.jpg',
          isPublished: true,
          status: 'ACTIVE',
          courseType: 'RECORDED'
        }
      }),
      prisma.course.create({
        data: {
          title: 'Network Defense Avançado',
          shortDescription: 'Técnicas avançadas de defesa de rede',
          description: 'Aprenda técnicas avançadas de defesa de rede, monitoramento de tráfego, e resposta a incidentes de segurança.',
          price: 599.90,
          escudosPrice: 300,
          difficulty: 'INTERMEDIATE',
          duration: 40,
          categoryId: 'clx1234567890abcde2',
          instructorId: instructors[1].id,
          coverImage: '/images/network-defense.jpg',
          isPublished: true,
          status: 'ACTIVE',
          courseType: 'ONLINE'
        }
      }),
      prisma.course.create({
        data: {
          title: 'Web Application Security',
          shortDescription: 'Segurança em aplicações web modernas',
          description: 'Curso completo sobre segurança em aplicações web, incluindo OWASP Top 10, testes de penetração, e correção de vulnerabilidades.',
          price: 799.90,
          escudosPrice: 400,
          difficulty: 'ADVANCED',
          duration: 60,
          categoryId: 'clx1234567890abcde3',
          instructorId: instructors[2].id,
          coverImage: '/images/web-app-security.jpg',
          isPublished: true,
          status: 'ACTIVE',
          courseType: 'HYBRID'
        }
      })
    ]);

    console.log('Courses created:', courses.length);
    console.log('Sample data added successfully!');

  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleData();
