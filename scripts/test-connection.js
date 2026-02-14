#!/usr/bin/env node

/**
 * Supabase ve PostgreSQL Bağlantı Test Scripti
 * 
 * Kullanım: node scripts/test-connection.js
 */

// .env.local dosyasını manuel olarak yükle
const fs = require('fs');
const path = require('path');

// .env.local dosyasını oku ve parse et
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    
    // KEY="VALUE" formatını parse et
    const match = line.match(/^([A-Z_]+)=["']?([^"']+)["']?\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      const extra = (match[3] || '').trim();
      
      // "tamamlandı" gibi ekstra metinleri temizle
      if (extra && !extra.startsWith('"') && !extra.startsWith("'")) {
        // Sadece değer kısmını al
      }
      
      // Değerin sonundaki "tamamlandı" gibi kelimeleri temizle
      value = value.replace(/\s+tamamlandı\s*$/i, '').trim();
      
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const { createClient } = require('@supabase/supabase-js');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvVar(name) {
  const value = process.env[name];
  if (!value) {
    log(`❌ ${name} tanımlı değil!`, 'red');
    return false;
  }
  if (value.includes('tamamlandı')) {
    log(`⚠️  ${name} değeri "tamamlandı" içeriyor - muhtemelen yanlış!`, 'yellow');
    return false;
  }
  log(`✅ ${name} tanımlı`, 'green');
  return true;
}

async function testSupabaseConnection() {
  log('\n📡 Supabase API Bağlantısı Test Ediliyor...', 'cyan');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    log('❌ Supabase URL veya Key eksik!', 'red');
    return false;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Basit bir sorgu yaparak bağlantıyı test et
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      // Tablo yoksa bile bağlantı çalışıyor demektir
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        log('✅ Supabase API bağlantısı başarılı! (Tablo henüz oluşturulmamış, bu normal)', 'green');
        return true;
      }
      log(`❌ Supabase API hatası: ${error.message}`, 'red');
      return false;
    }
    
    log('✅ Supabase API bağlantısı başarılı!', 'green');
    return true;
  } catch (error) {
    log(`❌ Supabase bağlantı hatası: ${error.message}`, 'red');
    return false;
  }
}

async function testServiceRoleKey() {
  log('\n🔐 Service Role Key Test Ediliyor...', 'cyan');
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    log('❌ Service Role Key eksik!', 'red');
    return false;
  }
  
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Service role key ile bir sorgu yap
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        log('✅ Service Role Key çalışıyor! (Tablo henüz oluşturulmamış, bu normal)', 'green');
        return true;
      }
      log(`⚠️  Service Role Key hatası: ${error.message}`, 'yellow');
      return false;
    }
    
    log('✅ Service Role Key çalışıyor!', 'green');
    return true;
  } catch (error) {
    log(`❌ Service Role Key hatası: ${error.message}`, 'red');
    return false;
  }
}

async function testPostgresConnection() {
  log('\n🗄️  PostgreSQL Bağlantı String\'leri Kontrol Ediliyor...', 'cyan');
  
  const checks = [
    { name: 'POSTGRES_PRISMA_URL', value: process.env.POSTGRES_PRISMA_URL },
    { name: 'POSTGRES_URL', value: process.env.POSTGRES_URL },
    { name: 'POSTGRES_URL_NON_POOLING', value: process.env.POSTGRES_URL_NON_POOLING },
  ];
  
  let allValid = true;
  
  for (const check of checks) {
    if (!check.value) {
      log(`❌ ${check.name} tanımlı değil!`, 'red');
      allValid = false;
    } else if (check.value.includes('[YOUR-PASSWORD]')) {
      log(`❌ ${check.name} şifre placeholder içeriyor!`, 'red');
      allValid = false;
    } else if (check.value.includes('tamamlandı')) {
      log(`⚠️  ${check.name} değeri "tamamlandı" içeriyor - muhtemelen yanlış!`, 'yellow');
      allValid = false;
    } else {
      // Connection string formatını kontrol et
      const isValidFormat = /postgres(ql)?:\/\/[^:]+:[^@]+@[^:]+:\d+\/[^?]+/.test(check.value);
      if (isValidFormat) {
        log(`✅ ${check.name} formatı doğru`, 'green');
      } else {
        log(`⚠️  ${check.name} formatı şüpheli`, 'yellow');
        allValid = false;
      }
    }
  }
  
  // PostgreSQL bağlantısını gerçekten test etmek için pg paketi gerekli
  // Şimdilik sadece format kontrolü yapıyoruz
  log('\n💡 Not: PostgreSQL bağlantısını gerçekten test etmek için `pg` paketi gerekli.', 'yellow');
  log('   Format kontrolü yapıldı. Gerçek bağlantı testi için: npm install pg', 'yellow');
  
  return allValid;
}

async function main() {
  log('\n🧪 Supabase Bağlantı Testi Başlatılıyor...\n', 'blue');
  
  // 1. Environment değişkenlerini kontrol et
  log('📋 Environment Değişkenleri Kontrol Ediliyor...', 'cyan');
  
  const envChecks = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_JWT_SECRET',
    'POSTGRES_DATABASE',
    'POSTGRES_HOST',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
  ];
  
  const envResults = envChecks.map(name => checkEnvVar(name));
  const envValid = envResults.every(r => r);
  
  // 2. Supabase API bağlantısını test et
  const supabaseTest = await testSupabaseConnection();
  
  // 3. Service Role Key'i test et
  const serviceRoleTest = await testServiceRoleKey();
  
  // 4. PostgreSQL connection string'lerini kontrol et
  const postgresTest = await testPostgresConnection();
  
  // Özet
  log('\n' + '='.repeat(50), 'cyan');
  log('📊 TEST ÖZETİ', 'blue');
  log('='.repeat(50), 'cyan');
  
  log(`\nEnvironment Değişkenleri: ${envValid ? '✅' : '❌'}`, envValid ? 'green' : 'red');
  log(`Supabase API Bağlantısı: ${supabaseTest ? '✅' : '❌'}`, supabaseTest ? 'green' : 'red');
  log(`Service Role Key: ${serviceRoleTest ? '✅' : '❌'}`, serviceRoleTest ? 'green' : 'red');
  log(`PostgreSQL Connection Strings: ${postgresTest ? '✅' : '⚠️'}`, postgresTest ? 'green' : 'yellow');
  
  const allTestsPassed = envValid && supabaseTest && serviceRoleTest && postgresTest;
  
  if (allTestsPassed) {
    log('\n🎉 Tüm testler başarılı! Bağlantılar çalışıyor.', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Bazı testler başarısız. Lütfen .env.local dosyasını kontrol edin.', 'yellow');
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n❌ Beklenmeyen hata: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
