#!/usr/bin/env node

/**
 * Supabase .env.local Dosyası Otomatik Oluşturucu
 * 
 * Kullanım:
 * 1. Supabase Dashboard'dan aşağıdaki bilgileri alın
 * 2. Bu script'i çalıştırın: node scripts/setup-env.js
 * 3. Bilgileri sorulduğunda girin
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function parseConnectionString(connStr) {
  // postgres:// veya postgresql:// postgres.xxx:password@host:port/db?params
  // [YOUR-PASSWORD] placeholder'ını handle et
  if (connStr.includes('[YOUR-PASSWORD]')) {
    return null; // Şifre eksik
  }
  
  const match = connStr.match(/postgres(ql)?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)(\?.*)?/);
  if (!match) return null;
  
  const [, , user, password, host, port, database] = match;
  const projectRef = user.split('.')[1] || '';
  
  return { user, password, host, port, database, projectRef };
}

async function main() {
  console.log('\n🔧 Supabase .env.local Dosyası Oluşturucu\n');
  console.log('Supabase Dashboard\'dan aşağıdaki bilgileri hazırlayın:\n');

  // 1. Project URL
  const projectUrl = await question('1. Project URL (Settings > API > Project URL): ');
  
  // 2. Anon Key
  const anonKey = await question('2. Anon Public Key (Settings > API > anon public): ');
  
  // 3. Service Role Key
  const serviceRoleKey = await question('3. Service Role Key (Settings > API > service_role secret): ');
  
  // 4. JWT Secret
  const jwtSecret = await question('4. JWT Secret (Settings > API > JWT Secret): ');
  
  // 5. Connection String (Pooled)
  let pooledConnStr = await question('5. Connection String - Pooled (Settings > Database > Connection string > URI - Pooled): ');
  
  // 6. Connection String (Non-Pooled)
  let nonPooledConnStr = await question('6. Connection String - Non-Pooled (Settings > Database > Connection string > URI - Transaction): ');
  
  // Şifre eksikse sor
  if (pooledConnStr.includes('[YOUR-PASSWORD]') || nonPooledConnStr.includes('[YOUR-PASSWORD]')) {
    const password = await question('\n⚠️  Database Password (Settings > Database > Database password): ');
    pooledConnStr = pooledConnStr.replace('[YOUR-PASSWORD]', password);
    nonPooledConnStr = nonPooledConnStr.replace('[YOUR-PASSWORD]', password);
  }
  
  // postgresql:// formatını postgres://'e çevir (regex uyumluluğu için)
  pooledConnStr = pooledConnStr.replace('postgresql://', 'postgres://');
  nonPooledConnStr = nonPooledConnStr.replace('postgresql://', 'postgres://');
  
  // Parse connection strings
  const pooled = parseConnectionString(pooledConnStr);
  const nonPooled = parseConnectionString(nonPooledConnStr);
  
  if (!pooled || !nonPooled) {
    console.error('\n❌ Connection string formatı hatalı!');
    console.error('Örnek format: postgresql://postgres.xxx:password@host:port/db?params');
    process.exit(1);
  }
  
  // Extract project ref from URL
  const projectRef = projectUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || '';
  
  // Build POSTGRES_PRISMA_URL with pgbouncer=true
  let postgresPrismaUrl = pooledConnStr;
  if (!postgresPrismaUrl.includes('pgbouncer=true')) {
    postgresPrismaUrl += (postgresPrismaUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
  }
  
  // Build POSTGRES_URL with supa=base-pooler.x
  let postgresUrl = pooledConnStr;
  if (postgresUrl.includes('pgbouncer=true')) {
    postgresUrl = postgresUrl.replace('pgbouncer=true', 'supa=base-pooler.x');
  } else {
    postgresUrl += (postgresUrl.includes('?') ? '&' : '?') + 'supa=base-pooler.x';
  }
  
  // Build .env.local content
  const envContent = `NEXT_PUBLIC_SUPABASE_ANON_KEY="${anonKey}"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="${anonKey}"
NEXT_PUBLIC_SUPABASE_URL="${projectUrl}"
POSTGRES_DATABASE="${pooled.database}"
POSTGRES_HOST="db.${projectRef}.supabase.co"
POSTGRES_PASSWORD="${pooled.password}"
POSTGRES_PRISMA_URL="${postgresPrismaUrl}"
POSTGRES_URL="${postgresUrl}"
POSTGRES_URL_NON_POOLING="${nonPooledConnStr}"
POSTGRES_USER="${pooled.user.split('.')[0]}"
SUPABASE_JWT_SECRET="${jwtSecret}"
SUPABASE_PUBLISHABLE_KEY="${anonKey}"
SUPABASE_SECRET_KEY="${serviceRoleKey}"
SUPABASE_SERVICE_ROLE_KEY="${serviceRoleKey}"
SUPABASE_URL="${projectUrl}"
`;

  // Write to .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ .env.local dosyası başarıyla oluşturuldu!\n');
  console.log('📝 Dosya konumu:', envPath);
  console.log('\n⚠️  RESEND_API_KEY değerini manuel olarak eklemeyi unutmayın!');
  console.log('   E-posta kuyruğu (email_queue) için: RESEND_FROM (örn. "CodeCrafters <hello@notificationscodecrafters.xyz>"), RESEND_FROM_SUPPORT (destek mailleri için, örn. "CodeCrafters <support@notificationscodecrafters.xyz>"), CRON_SECRET (api/cron/send-email-queue koruması).\n');
  
  rl.close();
}

main().catch(console.error);
