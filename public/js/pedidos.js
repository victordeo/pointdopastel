const colunas = {
  recebido: document.getElementById('coluna-recebido'),
  preparando: document.getElementById('coluna-preparo'),
  pronto: document.getElementById('coluna-pronto'),
  saiu: document.getElementById('coluna-saiu'),
  finalizado: document.getElementById('coluna-finalizado'),
  cancelado: document.getElementById('coluna-cancelado'),
};

const statusOrdem = ['recebido', 'preparando', 'pronto', 'saiu', 'finalizado'];

function carregarPedidos() {
  fetch('/api/pedidos')
    .then(res => {
      if (!res.ok) throw new Error('Erro ao buscar pedidos');
      return res.json();
    })
    .then(pedidos => {
      // Limpa todas as colunas
      Object.values(colunas).forEach(col => col.innerHTML = '');

      pedidos.forEach(pedido => {
        if (colunas[pedido.status]) {
          const card = criarCardPedido(pedido);
          colunas[pedido.status].appendChild(card);
        } else {
          console.warn('Status desconhecido:', pedido.status);
        }
      });
    })
    .catch(err => console.error('Erro ao carregar pedidos:', err));
}

function criarCardPedido(pedido) {
  const div = document.createElement('div');
  div.className = 'bg-white border rounded shadow-sm p-3 text-sm';

  const totalFormatado = parseFloat(pedido.total).toFixed(2).replace('.', ',');

  div.innerHTML = `
    <p><strong>#${pedido.id}</strong> — ${pedido.telefone}</p>
    <p class="text-xs text-gray-500 mb-1">Endereço: ${pedido.endereco || 'N/A'}</p>
    <p>Itens: ${pedido.itens_count || 0}</p>
    <p>Total: R$ ${totalFormatado}</p>
    <div class="flex gap-2 mt-2">
      ${gerarBotoes(pedido)}
    </div>
  `;
  return div;
}

function gerarBotoes(pedido) {
  if (pedido.status === 'finalizado' || pedido.status === 'cancelado') return '';

  const idx = statusOrdem.indexOf(pedido.status);
  const proximo = statusOrdem[idx + 1];

  let html = '';

  if (proximo) {
    html += `<button onclick="atualizarStatus(${pedido.id}, '${proximo}', '${pedido.telefone}')"
      class="text-xs px-2 py-1 bg-blue-500 text-white rounded">Avançar</button>`;
  }

  html += `<button onclick="atualizarStatus(${pedido.id}, 'cancelado', '${pedido.telefone}')"
    class="text-xs px-2 py-1 bg-red-500 text-white rounded">Cancelar</button>`;

  return html;
}

function atualizarStatus(id, novoStatus, telefone) {
  fetch(`/api/pedidos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: novoStatus })
  })
    .then(res => {
      if (!res.ok) throw new Error('Erro ao atualizar status');
      enviarMensagemWhatsApp(novoStatus, telefone);
      carregarPedidos();
    })
    .catch(err => console.error('Erro ao atualizar status:', err));
}

function enviarMensagemWhatsApp(status, telefone) {
  const mensagens = {
  recebido: 'Seu pedido foi recebido com sucesso! 🍽️',
  preparando: 'Seu pedido está sendo preparado! 🍳',
  pronto: 'Seu pedido está pronto para retirada ou entrega! 📦',
  saiu: 'Saiu para entrega! 🛵',
  finalizado: 'Pedido entregue! Obrigado pela preferência. ✅',
  cancelado: 'Seu pedido foi cancelado. Se tiver dúvidas, entre em contato. ❌',
};
  const texto = mensagens[status] || 'Seu pedido foi atualizado.';
  window.open(`https://wa.me/55${telefone}?text=${encodeURIComponent(texto)}`, '_blank');
}

// Inicialização
carregarPedidos();
setInterval(carregarPedidos, 15000);
