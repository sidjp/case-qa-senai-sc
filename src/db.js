require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const cfg = {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD
};

async function run() {
  const cmd = process.argv[2];
  const client = new Client(cfg);
  
  try {
    await client.connect();
    console.log('Conectado ao Postgres!');

    if (cmd === 'init') {
      const sql = fs.readFileSync(path.join(__dirname, 'queries.sql'), 'utf8');
      await client.query(sql);
      console.log('Tabela users criada (ou já existia).');
    } 
    
    else if (cmd === 'seed') {
      await client.query(
        'INSERT INTO users (name, email) VALUES ($1,$2) ON CONFLICT (email) DO NOTHING',
        ['Usuário Demo', 'demo@example.com']
      );
      console.log('Seed inserido: demo@example.com');
    } 
    
    else {
      console.log('Use: npm run db:init  ou  npm run db:seed');
    }
  } catch (err) {
    console.error('Erro:', err.message);
  } finally {
    await client.end();
  }
}

run();