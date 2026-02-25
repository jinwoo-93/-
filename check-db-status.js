#!/usr/bin/env node

const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres.hpguqmeiajcbkjwbnioe:Qk5IIX7CuKhnG2Gu@aws-1-ap-south-1.pooler.supabase.com:5432/postgres';

async function checkDatabaseStatus() {
  console.log('━'.repeat(70));
  console.log('🔍 Supabase Database Status Checker');
  console.log('━'.repeat(70));
  console.log('');
  console.log('📋 Connection Details:');
  console.log('   Project ID: hpguqmeiajcbkjwbnioe');
  console.log('   Region: ap-south-1 (Mumbai)');
  console.log('   Connection: Session Pooler (port 5432)');
  console.log('');

  const client = new Client({
    connectionString: DATABASE_URL,
    connectionTimeoutMillis: 15000,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Attempting to connect...');
    await client.connect();
    console.log('✅ Connection successful!');
    console.log('');

    // Test basic query
    console.log('📊 Running test queries...');
    const timeResult = await client.query('SELECT NOW() as current_time');
    console.log(`   Current time: ${timeResult.rows[0].current_time}`);

    const versionResult = await client.query('SELECT version() as version');
    const versionShort = versionResult.rows[0].version.split(',')[0];
    console.log(`   PostgreSQL: ${versionShort}`);

    // Check tables
    const tablesResult = await client.query(`
      SELECT COUNT(*) as table_count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log(`   Public tables: ${tablesResult.rows[0].table_count}`);

    console.log('');
    console.log('━'.repeat(70));
    console.log('✅ DATABASE IS ACTIVE AND READY');
    console.log('━'.repeat(70));
    console.log('');
    console.log('Next steps:');
    console.log('  1. Run: npx prisma db push');
    console.log('  2. Run: npm run dev');
    console.log('  3. Test: curl http://localhost:3000/api/auth/session');
    console.log('');

    await client.end();
    process.exit(0);

  } catch (error) {
    console.log('');
    console.log('━'.repeat(70));
    console.log('❌ DATABASE CONNECTION FAILED');
    console.log('━'.repeat(70));
    console.log('');
    console.log(`Error: ${error.message}`);
    console.log(`Code: ${error.code}`);
    console.log('');

    if (error.message.includes('Circuit breaker')) {
      console.log('🔴 DIAGNOSIS: Supabase project is PAUSED');
      console.log('');
      console.log('📝 Action Required:');
      console.log('   1. Visit: https://supabase.com/dashboard');
      console.log('   2. Select project: hpguqmeiajcbkjwbnioe');
      console.log('   3. Click "Resume" or "Restore" button');
      console.log('   4. Wait 2-5 minutes for database to start');
      console.log('   5. Run this script again to verify');
      console.log('');
      console.log('💡 Why this happens:');
      console.log('   - Free tier projects pause after 7 days of inactivity');
      console.log('   - This is normal Supabase behavior');
      console.log('');
      console.log('🛡️ Prevention:');
      console.log('   - Set up a weekly cron job to ping the database');
      console.log('   - Or upgrade to Pro plan (no auto-pause)');
    } else if (error.message.includes('certificate')) {
      console.log('🔴 DIAGNOSIS: SSL Certificate Issue');
      console.log('');
      console.log('This should not happen with current settings.');
      console.log('Please check the connection string in .env.local');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      console.log('🔴 DIAGNOSIS: Network Connectivity Issue');
      console.log('');
      console.log('   - Check your internet connection');
      console.log('   - Check if you are behind a firewall');
      console.log('   - Try from a different network');
    } else {
      console.log('🔴 DIAGNOSIS: Unknown Error');
      console.log('');
      console.log('Please check:');
      console.log('   - Database credentials in .env.local');
      console.log('   - Supabase dashboard for errors');
      console.log('   - Supabase status page: https://status.supabase.com');
    }

    console.log('');
    await client.end().catch(() => {});
    process.exit(1);
  }
}

// Run the check
checkDatabaseStatus();
