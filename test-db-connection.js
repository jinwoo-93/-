const { Client } = require('pg');

const connectionStrings = [
  {
    name: 'Session Pooler - No SSL Verify',
    url: 'postgresql://postgres.hpguqmeiajcbkjwbnioe:Qk5IIX7CuKhnG2Gu@aws-1-ap-south-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Session Pooler - SSL Disabled',
    url: 'postgresql://postgres.hpguqmeiajcbkjwbnioe:Qk5IIX7CuKhnG2Gu@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=disable',
    ssl: false
  },
  {
    name: 'Transaction Pooler - No SSL Verify',
    url: 'postgresql://postgres.hpguqmeiajcbkjwbnioe:Qk5IIX7CuKhnG2Gu@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Session Pooler - SSL Require',
    url: 'postgresql://postgres.hpguqmeiajcbkjwbnioe:Qk5IIX7CuKhnG2Gu@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require',
    ssl: { rejectUnauthorized: false }
  }
];

async function testConnection(name, connectionString, sslConfig) {
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 10000,
    ssl: sslConfig
  });

  try {
    console.log(`\n[${name}]`);
    console.log('Connecting...');
    await client.connect();
    console.log('✅ Connected successfully!');

    const result = await client.query('SELECT NOW() as time, version() as version');
    console.log('✅ Query executed:', result.rows[0]);

    await client.end();
    return true;
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('Error code:', error.code);
    return false;
  }
}

async function main() {
  console.log('Testing Supabase PostgreSQL Connections...\n');
  console.log('Project ID: hpguqmeiajcbkjwbnioe');
  console.log('Region: ap-south-1 (Mumbai)');
  console.log('='.repeat(60));

  for (const config of connectionStrings) {
    await testConnection(config.name, config.url, config.ssl);
  }
}

main();
