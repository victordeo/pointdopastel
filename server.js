const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

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

// Middleware para sessão
app.use(session({
  secret: 'chave_super_secreta_123!', // coloque algo seguro aqui
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hora
}));

// Permitir leitura de formulários (POST)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Servir arquivos públicos (HTML, CSS, JS, etc)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para proteger rotas privadas
function verificarLogin(req, res, next) {
  if (req.session.usuario) {
    next();
  } else {
    res.redirect('/login.html');
  }
}

// Rotas públicas
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log('Erro ao destruir sessão:', err);
      return res.status(500).send('Erro ao sair.');
    }
    res.redirect('/login.html');
  });
});

// Login POST
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

    // Salvar usuário na sessão
    req.session.usuario = usuario;

    console.log(`✅ Login autorizado: ${usuario}`);

    // Redirecionar conforme usuário
    if (usuario === 'admin') {
      res.redirect('/admin.html');
    } else {
      res.redirect('/pdv.html');
    }
  });
});

// Rotas protegidas (acesso só com login)
app.get('/admin.html', verificarLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'private', 'admin.html'));
});

app.get('/pdv.html', verificarLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'private', 'pdv.html'));
});

// Rota segura para criar primeiro admin (opcional)
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
});
