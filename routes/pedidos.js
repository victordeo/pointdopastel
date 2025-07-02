const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Conexão direta (você pode reaproveitar pool do server.js, se preferir)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'point_pastel'
});

// Middleware de sessão (mesmo do server.js)
function verificarLogin(req, res, next) {
  if (req.session && req.session.usuario) return next();
  res.status(401).send('Não autorizado');
}

// GET /api/pedidos — lista todos
router.get('/', verificarLogin, (req, res) => {
  const sql = `
    SELECT 
      p.id, p.total, p.telefone, p.endereco, p.status, p.criado_em,
      COUNT(i.id) AS itens_count
    FROM pedidos p
    LEFT JOIN itens_pedido i ON p.id = i.pedido_id
    GROUP BY p.id
    ORDER BY p.criado_em DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send('Erro ao buscar pedidos');
    res.json(results);
  });
});

// POST /api/pedidos — cria pedido + itens
router.post('/', async (req, res) => {
  const { cliente_id = null, telefone, endereco, itens, taxa_entrega = 0, total } = req.body;

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).send('Itens do pedido são obrigatórios');
  }

  const sqlPedido = `
    INSERT INTO pedidos (cliente_id, tipo, total, status, criado_em, telefone, endereco)
    VALUES (?, 'delivery', ?, 'recebido', NOW(), ?, ?)
  `;

  db.query(sqlPedido, [cliente_id, total, telefone, endereco], (err, result) => {
    if (err) {
      console.error('Erro ao salvar pedido:', err);
      return res.status(500).send('Erro ao salvar pedido');
    }

    const pedidoId = result.insertId;

    const valores = itens.map(i => [
      pedidoId,
      i.id,
      i.quantidade,
      i.preco
    ]);

    db.query(
      'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES ?',
      [valores],
      err2 => {
        if (err2) {
          console.error('Erro ao salvar itens do pedido:', err2);
          return res.status(500).send('Erro ao salvar itens do pedido');
        }
        res.status(201).json({ pedidoId });
      }
    );
  });
});


// PUT /api/pedidos/:id — atualiza status
router.put('/:id', verificarLogin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.query('UPDATE pedidos SET status = ? WHERE id = ?', [status, id], err => {
    if (err) return res.status(500).send('Erro ao atualizar status');
    res.send('Status atualizado');
  });
});

// DELETE /api/pedidos/:id — marca cancelado
router.delete('/:id', verificarLogin, (req, res) => {
  const { id } = req.params;
  db.query('UPDATE pedidos SET status = "cancelado" WHERE id = ?', [id], err => {
    if (err) return res.status(500).send('Erro ao cancelar pedido');
    res.send('Pedido cancelado');
  });
});

module.exports = router;
