const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Conexão com o banco MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // ajuste se houver senha
  database: 'point_pastel'
});

db.connect(err => {
  if (err) console.error('Erro ao conectar no banco:', err);
  else console.log('✅ Banco conectado com sucesso!');
});

// Permitir leitura de formulários (POST)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// SERVIR PÚBLICO: HTML, CSS, JS, etc.
app.use(express.static(path.join(__dirname, 'public')));

// BLOQUEAR ACESSO DIRETO A PÁGINAS PROTEGIDAS
app.get('/pdv.html', (req, res) => {
  res.redirect('/login.html');
});
app.get('/admin.html', (req, res) => {
  res.redirect('/login.html');
});

// ROTA RAIZ → redireciona para login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// ROTA DE LOGIN
app.post('/login', (req, res) => {
  const { usuario, password } = req.body;

  db.query('SELECT * FROM admin WHERE usuario = ?', [usuario], async (err, results) => {
    if (err || results.length === 0) {
      console.log('❌ Usuário não encontrado');
      return res.status(401).send('Usuário inválido.');
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.senha_hash);

    if (!match) {
      console.log('❌ Senha incorreta');
      return res.status(401).send('Senha incorreta.');
    }

    console.log(`✅ Login autorizado: ${usuario}`);

    // 🔐 Redirecionamento para a página correta
    if (usuario === 'admin') {
      res.sendFile(path.join(__dirname, 'private', 'admin.html'));
    } else {
      res.sendFile(path.join(__dirname, 'private', 'pdv.html'));
    }
  });
});

// ROTA SEGURA PARA CRIAR O PRIMEIRO ADMIN
app.post('/criar-admin', async (req, res) => {
  const { usuario, senha } = req.body;

  db.query('SELECT COUNT(*) as total FROM admin', async (err, results) => {
    if (err) return res.status(500).send('Erro ao acessar o banco.');
    
    if (results[0].total > 0) {
      return res.status(403).send('Já existe um administrador. Criação bloqueada.');
    }

    try {
      const hash = await bcrypt.hash(senha, 10);
      db.query('INSERT INTO admin (usuario, senha_hash) VALUES (?, ?)', [usuario, hash], (err) => {
        if (err) return res.status(500).send('Erro ao criar administrador.');
        res.send('✅ Administrador criado com sucesso.');
      });
    } catch (error) {
      res.status(500).send('Erro ao gerar hash da senha.');
    }
  });
});


// INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
});
