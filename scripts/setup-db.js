import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const backendEnvPath = path.join(rootDir, 'backend', '.env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('========================================================');
console.log('       Farm Intellect - Supabase Database Setup Helper   ');
console.log('========================================================\n');

rl.question('Please enter your Supabase Database Password (for project: dkluatvkswqufrggwqoi): ', (password) => {
  if (!password || password.trim() === '') {
    console.error('❌ Error: Password cannot be empty.');
    rl.close();
    process.exit(1);
  }

  const cleanPassword = encodeURIComponent(password.trim());

  // 1. Update backend/.env
  try {
    if (!fs.existsSync(backendEnvPath)) {
      console.error(`❌ Error: Backend .env file not found at ${backendEnvPath}`);
      rl.close();
      process.exit(1);
    }

    let envContent = fs.readFileSync(backendEnvPath, 'utf8');

    // Replace [YOUR-PASSWORD] placeholder with the actual password
    const updatedContent = envContent.replace(
      /DATABASE_URL_LOCAL=postgresql:\/\/postgres:\[YOUR-PASSWORD\]@db\.dkluatvkswqufrggwqoi\.supabase\.co:5432\/postgres/g,
      `DATABASE_URL_LOCAL=postgresql://postgres:${cleanPassword}@db.dkluatvkswqufrggwqoi.supabase.co:5432/postgres`
    ).replace(
      /DATABASE_URL_LOCAL=postgresql:\/\/postgres:[^@\s]+@db\.dkluatvkswqufrggwqoi\.supabase\.co:5432\/postgres/g,
      `DATABASE_URL_LOCAL=postgresql://postgres:${cleanPassword}@db.dkluatvkswqufrggwqoi.supabase.co:5432/postgres`
    );

    fs.writeFileSync(backendEnvPath, updatedContent, 'utf8');
    console.log('🟢 Success: Updated database connection password in backend/.env');

  } catch (err) {
    console.error('❌ Failed to update backend/.env:', err.message);
    rl.close();
    process.exit(1);
  }

  // 2. Deploy Prisma Schema
  try {
    console.log('\n🚀 Pushing Prisma models to Supabase...');
    execSync('npx prisma db push', {
      cwd: path.join(rootDir, 'backend'),
      stdio: 'inherit'
    });
    console.log('🟢 Success: Prisma models successfully created on Supabase!');
  } catch (err) {
    console.error('\n❌ Error: Failed to push schema via Prisma. Make sure your database password is correct.');
    rl.close();
    process.exit(1);
  }

  console.log('\n========================================================');
  console.log('           🎉 Database Implementation Ready!           ');
  console.log('========================================================');
  console.log('\nTo complete the setup of custom database functions and triggers:');
  console.log('1. Go to your Supabase Dashboard: https://supabase.com');
  console.log('2. Navigate to SQL Editor > New Query.');
  console.log('3. Copy and run the contents of unified_schema.sql:');
  console.log(`   👉 File location: ${path.join(rootDir, 'sql', 'unified_schema.sql')}`);
  console.log('4. Copy and run the contents of rls-security-setup.sql:');
  console.log(`   👉 File location: ${path.join(rootDir, 'sql', 'rls-security-setup.sql')}`);
  console.log('\nAll done! You are ready to start launching the application.');
  
  rl.close();
});
