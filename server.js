const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'public/assets/images');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const nomeArquivo = Date.now() + '-' + file.originalname;
    cb(null, nomeArquivo);
  }
});
const upload = multer({ storage });

// Configuração da conexão MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Ajuste conforme sua senha
  database: 'point_pastel'
});

db.connect(err => {
  if (err) {
    console.error('Erro ao conectar no banco:', err);
  } else {
    console.log('✅ Banco conectado com sucesso!');
  }
});

// --- Middleware: ordem importante ---

// Sessão deve ser carregada antes das rotas que a usam
app.use(session({
  secret: 'chave_super_secreta_123!',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hora
}));

// Para ler bodies das requisições POST (formulários e JSON)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para proteger rotas privadas
function verificarLogin(req, res, next) {
  if (req.session && req.session.usuario) {
    next();
  } else {
    res.redirect('/login.html');
  }
}

// Rotas públicas

// ROTA PÚBLICA: para o delivery listar produtos sem login
app.get('/public/produtos', (req, res) => {
  const sql = `
    SELECT 
      produtos.id, produtos.nome, produtos.descricao, produtos.preco, produtos.ativo, produtos.imagem,
      categorias.nome AS categoria_nome
    FROM produtos
    JOIN categorias ON produtos.categoria_id = categorias.id
    WHERE produtos.ativo = 1
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar produtos:', err);
      return res.status(500).send('Erro ao buscar produtos');
    }
    res.json(results);
  });
});


app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
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

// Rotas protegidas (só acessível com login)
app.get('/admin.html', verificarLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'private', 'admin.html'));
});

app.get('/pdv.html', verificarLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'private', 'pdv.html'));
});

// API Produtos

// Listar produtos
app.get('/api/produtos', verificarLogin, (req, res) => {
  const sql = `
    SELECT 
      produtos.id, produtos.nome, produtos.descricao, produtos.preco, produtos.ativo, produtos.imagem,
      categorias.nome AS categoria_nome
    FROM produtos
    JOIN categorias ON produtos.categoria_id = categorias.id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar produtos:', err);
      return res.status(500).send('Erro ao buscar produtos');
    }
    res.json(results);
  });
});

// Criar produto
app.post('/api/produtos', verificarLogin, upload.single('imagem'), (req, res) => {
  const { nome, descricao, preco, categoria_id, ativo } = req.body;
  const imagem = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO produtos (nome, descricao, preco, ativo, categoria_id, imagem)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [nome, descricao, preco, ativo ? 1 : 0, categoria_id, imagem], (err) => {
    if (err) {
      console.error('Erro ao inserir produto:', err);
      return res.status(500).send('Erro ao cadastrar produto');
    }
    res.status(201).send('Produto cadastrado com sucesso');
  });
});

// Atualizar produto (exemplo simples, adaptar conforme necessário)
app.put('/api/produtos/:id', verificarLogin, upload.single('imagem'), (req, res) => {
  const id = req.params.id;
  const { nome, descricao, preco, categoria_id, ativo } = req.body;
  const imagem = req.file ? req.file.filename : null;

  let sql;
  let params;

  if (imagem) {
    sql = `UPDATE produtos SET nome = ?, descricao = ?, preco = ?, ativo = ?, categoria_id = ?, imagem = ? WHERE id = ?`;
    params = [nome, descricao, preco, ativo ? 1 : 0, categoria_id, imagem, id];
  } else {
    sql = `UPDATE produtos SET nome = ?, descricao = ?, preco = ?, ativo = ?, categoria_id = ? WHERE id = ?`;
    params = [nome, descricao, preco, ativo ? 1 : 0, categoria_id, id];
  }

  db.query(sql, params, (err) => {
    if (err) {
      console.error('Erro ao atualizar produto:', err);
      return res.status(500).send('Erro ao atualizar produto');
    }
    res.send('Produto atualizado com sucesso');
  });
});

// Deletar produto
app.delete('/api/produtos/:id', verificarLogin, (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM produtos WHERE id = ?`;
  db.query(sql, [id], (err) => {
    if (err) {
      console.error('Erro ao deletar produto:', err);
      return res.status(500).send('Erro ao deletar produto');
    }
    res.send('Produto deletado com sucesso');
  });
});

// Categorias API (listar)
app.get('/api/categorias', verificarLogin, (req, res) => {
  db.query('SELECT id, nome FROM categorias', (err, results) => {
    if (err) {
      console.error('Erro ao buscar categorias:', err);
      return res.status(500).send('Erro ao buscar categorias');
    }
    res.json(results);
  });
});

// Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
});
