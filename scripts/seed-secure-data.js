const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function seedSecureData() {
  try {
    console.log('🌱 Seeding secure data...');

    // Create categories with secure IDs
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { name: 'Penetration Testing' },
        update: {},
        create: {
          name: 'Penetration Testing',
          description: 'Ethical hacking and penetration testing courses',
          icon: '🎯',
          color: '#EF4444'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Network Security' },
        update: {},
        create: {
          name: 'Network Security',
          description: 'Network defense and monitoring courses',
          icon: '🛡️',
          color: '#10B981'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Web Application Security' },
        update: {},
        create: {
          name: 'Web Application Security',
          description: 'Web application security and OWASP courses',
          icon: '🌐',
          color: '#F59E0B'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Incident Response' },
        update: {},
        create: {
          name: 'Incident Response',
          description: 'Incident response and forensics courses',
          icon: '🚨',
          color: '#8B5CF6'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Social Engineering' },
        update: {},
        create: {
          name: 'Social Engineering',
          description: 'Social engineering awareness and prevention',
          icon: '👥',
          color: '#EC4899'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Malware Analysis' },
        update: {},
        create: {
          name: 'Malware Analysis',
          description: 'Malware analysis and reverse engineering',
          icon: '🦠',
          color: '#F97316'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Digital Forensics' },
        update: {},
        create: {
          name: 'Digital Forensics',
          description: 'Digital forensics and evidence collection',
          icon: '🔍',
          color: '#06B6D4'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Cryptography' },
        update: {},
        create: {
          name: 'Cryptography',
          description: 'Cryptography and encryption techniques',
          icon: '🔐',
          color: '#84CC16'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Red Team Operations' },
        update: {},
        create: {
          name: 'Red Team Operations',
          description: 'Red team exercises and attack simulation',
          icon: '🔴',
          color: '#DC2626'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Blue Team Defense' },
        update: {},
        create: {
          name: 'Blue Team Defense',
          description: 'Blue team defense and monitoring',
          icon: '🔵',
          color: '#2563EB'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Cloud Security' },
        update: {},
        create: {
          name: 'Cloud Security',
          description: 'Cloud security and infrastructure protection',
          icon: '☁️',
          color: '#7C3AED'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Threat Intelligence' },
        update: {},
        create: {
          name: 'Threat Intelligence',
          description: 'Threat intelligence and analysis',
          icon: '📊',
          color: '#059669'
        }
      }),
      prisma.category.upsert({
        where: { name: 'IoT Security' },
        update: {},
        create: {
          name: 'IoT Security',
          description: 'Internet of Things security',
          icon: '🌐',
          color: '#10B981'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Mobile Security' },
        update: {},
        create: {
          name: 'Mobile Security',
          description: 'Mobile device and application security',
          icon: '📱',
          color: '#F59E0B'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Compliance & Governance' },
        update: {},
        create: {
          name: 'Compliance & Governance',
          description: 'Security compliance and governance frameworks',
          icon: '📋',
          color: '#6B7280'
        }
      })
    ]);

    console.log('✅ Categories created:', categories.length);

    // Create instructors with secure IDs
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

    console.log('✅ Instructors created:', instructors.length);

    // Create courses with secure IDs
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
          categoryId: categories[0].id, // Penetration Testing
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
          categoryId: categories[1].id, // Network Security
          instructorId: instructors[1].id,
          coverImage: '/images/network-defense.jpg',
          isPublished: true,
          status: 'ACTIVE',
          courseType: 'ONLINE',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias a partir de agora
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
          categoryId: categories[2].id, // Web Application Security
          instructorId: instructors[2].id,
          coverImage: '/images/web-app-security.jpg',
          isPublished: true,
          status: 'ACTIVE',
          courseType: 'HYBRID',
          startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 dias a partir de agora
        }
      })
    ]);

    console.log('✅ Courses created:', courses.length);

    // Create subscription plans
    const subscriptions = await Promise.all([
      prisma.subscription.upsert({
        where: { id: 'basic' },
        update: {},
        create: {
          id: 'basic',
          name: 'Basic',
          price: 49.90,
          escudos: 50,
          duration: 30,
          isActive: true
        }
      }),
      prisma.subscription.upsert({
        where: { id: 'gold' },
        update: {},
        create: {
          id: 'gold',
          name: 'Gold',
          price: 79.90,
          escudos: 200,
          duration: 30,
          isActive: true
        }
      }),
      prisma.subscription.upsert({
        where: { id: 'diamond' },
        update: {},
        create: {
          id: 'diamond',
          name: 'Diamond',
          price: 129.90,
          escudos: 500,
          duration: 30,
          isActive: true
        }
      })
    ]);

    console.log('✅ Subscription plans created:', subscriptions.length);

    console.log('🎉 Secure data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Instructors: ${instructors.length}`);
    console.log(`- Courses: ${courses.length}`);
    console.log(`- Subscriptions: ${subscriptions.length}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSecureData();
