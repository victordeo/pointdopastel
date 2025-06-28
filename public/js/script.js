const categoriaMap = {
  'Queijo': 'produtos-queijo',
  'Frango': 'produtos-frango',
  'Calabresa': 'produtos-calabresa',
  'Presunto': 'produtos-presunto',
  'Carne': 'produtos-carne',
  'Light': 'produtos-light',
  'Point Kids': 'produtos-kids',
  'Doces': 'produtos-doces',
  'Bebidas': 'produtos-bebidas'
};

let carrinho = [];

async function carregarProdutos() {
  try {
    const res = await fetch('/public/produtos');
    if (!res.ok) throw new Error('Erro ao buscar produtos');
    const produtos = await res.json();

    // Limpa containers
    Object.values(categoriaMap).forEach(id => {
      const container = document.getElementById(id);
      if (container) container.innerHTML = '';
    });

    produtos.forEach(produto => {
      const containerId = categoriaMap[produto.categoria_nome];
      if (!containerId) return;

      const container = document.getElementById(containerId);
      if (!container) return;

      const card = document.createElement('div');
      card.className = "border rounded-md p-4 shadow hover:shadow-lg transition cursor-pointer flex gap-4";

      card.innerHTML = `
        <div class="w-24 h-24 flex-shrink-0">
          ${produto.imagem ? `<img src="/assets/images/${produto.imagem}" alt="${produto.nome}" class="object-cover w-full h-full rounded-md">` : `<div class="bg-gray-200 w-full h-full rounded-md flex items-center justify-center text-gray-400">Sem imagem</div>`}
        </div>
        <div class="flex flex-col justify-between flex-grow">
          <h3 class="font-semibold text-lg text-gray-800">${produto.nome}</h3>
          <p class="text-sm text-gray-600">${produto.descricao || ''}</p>
          <div class="flex justify-between items-center mt-2">
            <span class="font-bold text-red-600">R$ ${Number(produto.preco).toFixed(2)}</span>
            <button class="add-to-cart px-3 py-1 bg-green-600 text-white rounded-md text-sm" data-id="${produto.id}" data-nome="${produto.nome}" data-preco="${produto.preco}">+ Carrinho</button>
          </div>
        </div>
      `;

      container.appendChild(card);
    });

    // Adiciona eventos aos botões
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        const nome = e.currentTarget.dataset.nome;
        const preco = parseFloat(e.currentTarget.dataset.preco);
        adicionarAoCarrinho({ id, nome, preco, quantidade: 1 });
      });
    });
  } catch (error) {
    console.error(error);
  }
}

function adicionarAoCarrinho(item) {
  const index = carrinho.findIndex(i => i.id === item.id);
  if (index !== -1) {
    carrinho[index].quantidade++;
  } else {
    carrinho.push(item);
  }
  atualizarContadorCarrinho();
  Toastify({
  text: `"${item.nome}" adicionado ao carrinho`,
  duration: 2000,
  gravity: "top",
  position: "right",
  style: {
    background: "linear-gradient(to right, #00b09b, #96c93d)",
  },
}).showToast();

}

function atualizarContadorCarrinho() {
  const count = carrinho.reduce((total, item) => total + item.quantidade, 0);
  document.getElementById('cart-count').textContent = count;
}

const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalSpan = document.getElementById('cart-total');

cartBtn.addEventListener('click', () => {
  renderCartItems();
  cartModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
  cartModal.classList.add('hidden');
});

function renderCartItems() {
  if (carrinho.length === 0) {
    cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
    cartTotalSpan.textContent = 'R$ 0,00';
    return;
  }

  let html = '';
  let total = 0;
  carrinho.forEach(item => {
    const itemTotal = item.preco * item.quantidade;
    total += itemTotal;

    html += `
      <div class="flex justify-between mb-2">
        <span>${item.nome} x ${item.quantidade}</span>
        <span>R$ ${itemTotal.toFixed(2)}</span>
      </div>
    `;
  });

  cartItemsContainer.innerHTML = html;
  cartTotalSpan.textContent = `R$ ${total.toFixed(2)}`;
}

window.addEventListener('DOMContentLoaded', carregarProdutos);
