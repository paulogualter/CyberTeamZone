const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  let connection;
  
  try {
    // Try with 'adroot' password first
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 8889,
      user: 'root',
      password: 'adroot',
    });
    console.log('Connected with password "adroot"');
  } catch (error) {
    console.log('Failed with "adroot", trying "root"...');
    try {
      // Try with 'root' password
      connection = await mysql.createConnection({
        host: 'localhost',
        port: 8889,
        user: 'root',
        password: 'root',
      });
      console.log('Connected with password "root"');
    } catch (error2) {
      console.error('Failed to connect with both passwords:', error2.message);
      throw error2;
    }
  }

  try {
    console.log('Connecting to MySQL...');
    
    // Create database
    await connection.execute('CREATE DATABASE IF NOT EXISTS cyberteam_lms');
    console.log('Database cyberteam_lms created successfully');
    
    // Use the database
    await connection.query('USE cyberteam_lms');
    console.log('Using database cyberteam_lms');
    
    // Create subscriptions table with initial data
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id VARCHAR(191) PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        escudos INT NOT NULL,
        duration INT NOT NULL,
        isActive BOOLEAN DEFAULT true,
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      )
    `);
    
    // Insert subscription plans
    await connection.execute(`
      INSERT IGNORE INTO subscriptions (id, name, price, escudos, duration) VALUES
      ('basic', 'Basic', 49.90, 50, 30),
      ('gold', 'Gold', 79.90, 200, 30),
      ('diamond', 'Diamond', 129.90, 500, 30)
    `);
    
    console.log('Subscription plans inserted successfully');
    
    // Create categories table with initial data
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(191) PRIMARY KEY,
        name VARCHAR(191) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(191),
        color VARCHAR(191),
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      )
    `);
    
    // Insert categories with secure CUIDs
    await connection.execute(`
      INSERT IGNORE INTO categories (id, name, description, icon, color) VALUES
      ('clx1234567890abcdef', 'All Categories', 'All available courses', '📚', '#3B82F6'),
      ('clx1234567890abcde1', 'Penetration Testing', 'Ethical hacking and penetration testing courses', '🎯', '#EF4444'),
      ('clx1234567890abcde2', 'Network Security', 'Network defense and monitoring courses', '🛡️', '#10B981'),
      ('clx1234567890abcde3', 'Web Application Security', 'Web application security and OWASP courses', '🌐', '#F59E0B'),
      ('clx1234567890abcde4', 'Incident Response', 'Incident response and forensics courses', '🚨', '#8B5CF6'),
      ('clx1234567890abcde5', 'Social Engineering', 'Social engineering awareness and prevention', '👥', '#EC4899'),
      ('clx1234567890abcde6', 'Malware Analysis', 'Malware analysis and reverse engineering', '🦠', '#F97316'),
      ('clx1234567890abcde7', 'Digital Forensics', 'Digital forensics and evidence collection', '🔍', '#06B6D4'),
      ('clx1234567890abcde8', 'Cryptography', 'Cryptography and encryption techniques', '🔐', '#84CC16'),
      ('clx1234567890abcde9', 'Red Team Operations', 'Red team exercises and attack simulation', '🔴', '#DC2626'),
      ('clx1234567890abcdea', 'Blue Team Defense', 'Blue team defense and monitoring', '🔵', '#2563EB'),
      ('clx1234567890abcdeb', 'Cloud Security', 'Cloud security and infrastructure protection', '☁️', '#7C3AED'),
      ('clx1234567890abcdec', 'Threat Intelligence', 'Threat intelligence and analysis', '📊', '#059669'),
      ('clx1234567890abcded', 'IoT Security', 'Internet of Things security', '🌐', '#10B981'),
      ('clx1234567890abcdee', 'Mobile Security', 'Mobile device and application security', '📱', '#F59E0B'),
      ('clx1234567890abcdef', 'Compliance & Governance', 'Security compliance and governance frameworks', '📋', '#6B7280')
    `);
    
    console.log('Categories inserted successfully');
    
    // Create badges table with initial data
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS badges (
        id VARCHAR(191) PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        description TEXT,
        icon VARCHAR(191),
        color VARCHAR(191),
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
      )
    `);
    
    // Insert badges
    await connection.execute(`
      INSERT IGNORE INTO badges (id, name, description, icon, color) VALUES
      ('first-course', 'First Course', 'Completed your first course', '🎓', '#10B981'),
      ('ctf-master', 'CTF Master', 'Solved 10 CTF challenges', '🏆', '#F59E0B'),
      ('forum-helper', 'Forum Helper', 'Helped 5 users in the forum', '🤝', '#3B82F6'),
      ('certified-expert', 'Certified Expert', 'Earned 5 certificates', '⭐', '#8B5CF6'),
      ('early-adopter', 'Early Adopter', 'Joined in the first month', '🚀', '#EC4899')
    `);
    
    console.log('Badges inserted successfully');
    
    console.log('Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: npx prisma generate');
    console.log('2. Run: npx prisma db push');
    console.log('3. Start the development server: npm run dev');
    
  } catch (error) {
    console.error('Error setting up database:', error);
    
    // Try with 'root' password if 'adroot' failed
    if (error.message.includes('Access denied') && error.message.includes('adroot')) {
      console.log('\nTrying with password "root"...');
      const connection2 = await mysql.createConnection({
        host: 'localhost',
        port: 8889,
        user: 'root',
        password: 'root',
      });
      
      try {
        await connection2.execute('CREATE DATABASE IF NOT EXISTS cyberteam_lms');
        console.log('Database created with "root" password');
        await connection2.end();
      } catch (error2) {
        console.error('Failed with both passwords:', error2);
      }
    }
  } finally {
    await connection.end();
  }
}

setupDatabase();
