const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Conecta ao banco
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', //a senha do MySql está vazia por padrão, mudar depois
  database: 'point_pastel'
});

db.connect(err => {
  if (err) console.error('Erro ao conectar no banco:', err);
  else console.log('Banco conectado!');
});

app.use(bodyParser.urlencoded({ extended: true }));

// Envia a página de login
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rota de login (formulário POST)
app.post('/login', (req, res) => {
  const { usuario, password } = req.body;

  db.query('SELECT * FROM admin WHERE usuario = ?', [usuario], async (err, results) => {
    if (err || results.length === 0) return res.status(401).send('Usuário inválido.');

    const user = results[0];
    const match = await bcrypt.compare(password, user.senha_hash);

    if (match) {
      // Redireciona para pdv.html ou admin.html
      res.sendFile(path.join(__dirname, 'public', 'pdv.html'));
    } else {
      res.status(401).send('Senha incorreta.');
    }
  });
});

// Rodar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando: http://localhost:${PORT}/login.html`);
});
