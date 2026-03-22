require('dotenv').config({ path: './server/.env' });
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('DB Connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Database connected\n');
  
  // Query the user
  db.query('SELECT id, username, password FROM users WHERE username = ?', ['pavani_23'], async (err, results) => {
    if (err) {
      console.error('❌ Query error:', err.message);
      process.exit(1);
    }
    
    if (!results || results.length === 0) {
      console.error('❌ User "pavani_23" not found in database');
      process.exit(1);
    }
    
    const user = results[0];
    console.log('User found:');
    console.log('  ID:', user.id);
    console.log('  Username:', user.username);
    console.log('  Password hash (first 50 chars):', user.password.substring(0, 50));
    console.log('  Password hash length:', user.password.length);
    console.log('  Password format:', user.password.startsWith('$2') ? 'bcrypt' : 'plain text');
    
    // Test with a password
    const testPassword = '112233';
    console.log('\n--- Testing password comparison ---');
    console.log('Test password:', testPassword);
    
    try {
      if (user.password.startsWith('$2')) {
        const isMatch = await bcrypt.compare(testPassword, user.password);
        console.log('Bcrypt comparison result:', isMatch ? '✅ MATCH' : '❌ NO MATCH');
      } else {
        const isMatch = (testPassword === user.password);
        console.log('Plain text comparison result:', isMatch ? '✅ MATCH' : '❌ NO MATCH');
      }
    } catch (err) {
      console.error('❌ Comparison error:', err.message);
    }
    
    db.end();
  });
});
