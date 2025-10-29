require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // serve o front

const client = new Client({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD
});

async function start() {
  await client.connect();
  console.log('Banco conectado!');

  // Garante a tabela (caso rode sem db:init)
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `);

  // LISTAR
  app.get('/api/users', async (req, res) => {
    const { rows } = await client.query(
      'SELECT id, name, email, created_at FROM users ORDER BY id DESC'
    );
    res.json(rows);
  });

  // CRIAR
  app.post('/api/users', async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ error: 'name e email são obrigatórios' });

    try {
      const { rows } = await client.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at',
        [name.trim(), email.trim().toLowerCase()]
      );
      res.status(201).json(rows[0]);
    } catch (e) {
      if (e.code === '23505')
        return res.status(409).json({ error: 'email já cadastrado' });
      console.error(e);
      res.status(500).json({ error: 'erro interno' });
    }
  });

  // DELETAR
  app.delete('/api/users/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ error: 'id inválido' });

    const { rowCount } = await client.query('DELETE FROM users WHERE id = $1', [id]);
    if (rowCount === 0)
      return res.status(404).json({ error: 'usuário não encontrado' });

    res.status(204).end();
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Acesse a UI: http://localhost:${port}`);
  });
}

start().catch(err => {
  console.error('Falha ao iniciar:', err);
  process.exit(1);
});