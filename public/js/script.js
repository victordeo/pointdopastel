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
let taxaEntrega = 0;

const accessToken = 'pk.eyJ1IjoiMHJpb24iLCJhIjoiY21hdjZxcG0wMDFjODJwcHV2aWt6a2dzaCJ9.zE4zdJTkK6IVvEBseIVVxw';
const enderecoLoja = 'Rua Raimundo Brito de Oliveira, 579, Nova Iguaçu - RJ';

function formatCurrency(value) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

async function carregarProdutos() {
  try {
    const resp = await fetch('/public/produtos');
    if (!resp.ok) throw new Error('Erro ao carregar produtos');
    const produtos = await resp.json();

    produtos.forEach(prod => {
      const categoriaId = categoriaMap[prod.categoria_nome];
      const container = document.getElementById(categoriaId);
      if (!container) return;

      const card = document.createElement('div');
      card.className = 'card flex gap-2 p-4 border-b';
      card.innerHTML = `
        <img src="/assets/images/${prod.imagem}" alt="${prod.nome}" class="w-28 h-28 rounded-md">
        <div class="w-full">
            <p class="font-semibold text-gray-700">${prod.nome}</p>
            <p class="text-sm font-light text-gray-500">${prod.descricao || ''}</p>
            <div class="flex items-center gap-2 justify-between mt-3">
                <p class="font-medium text-gray-700">R$ ${parseFloat(prod.preco).toFixed(2).replace('.', ',')}</p>
                <button class="bg-primary px-5 rounded add-to-cart-btn hover:bg-orange-300 duration-300"
                  onclick="adicionarAoCarrinho({ id: ${prod.id}, nome: '${prod.nome}', preco: ${prod.preco}, quantidade: 1 })">
                    <i class="fa fa-cart-plus text-lg text-white"></i>
                </button>
            </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Erro ao carregar produtos:', err);
    alert('Erro ao exibir os produtos.');
  }
}

function removerDoCarrinho(id) {
  carrinho = carrinho.filter(item => item.id !== id);
  renderCartItems();
  atualizarContadorCarrinho();
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
    style: { background: "linear-gradient(to right, #00b09b, #96c93d)" }
  }).showToast();
}

function atualizarContadorCarrinho() {
  const count = carrinho.reduce((total, item) => total + item.quantidade, 0);
  document.getElementById('cart-count').textContent = count;
}

function renderCartItems() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalSpan = document.getElementById('cart-total');

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
      <div class="flex justify-between items-center mb-1">
        <span>${item.nome} x ${item.quantidade}</span>
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold">R$ ${itemTotal.toFixed(2).replace('.', ',')}</span>
          <button onclick="removerDoCarrinho(${item.id})"
            class="text-red-600 hover:text-red-800 text-sm" title="Remover item">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </div>
      <input type="text" placeholder="Observação"
        class="mb-4 mt-1 p-2 border border-gray-200 w-full rounded text-sm font-light text-gray-500"
        value="${item.observacao || ''}"
        oninput="carrinho.find(p => p.id == '${item.id}').observacao = this.value"
      />
    `;
  });

  const totalComFrete = total + taxaEntrega;
  cartItemsContainer.innerHTML = html;
  cartTotalSpan.textContent = `R$ ${totalComFrete.toFixed(2).replace('.', ',')}`;
}

async function geocodificar(endereco) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(endereco)}.json?access_token=${accessToken}`;
  const resp = await fetch(url);
  const dados = await resp.json();
  return dados.features[0]?.center;
}

async function calcularTaxaEntrega(enderecoCliente) {
  const origem = await geocodificar(enderecoLoja);
  const destino = await geocodificar(enderecoCliente);
  if (!origem || !destino) throw new Error("Endereço inválido");

  const rotaUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${origem[0]},${origem[1]};${destino[0]},${destino[1]}?access_token=${accessToken}`;
  const rotaResp = await fetch(rotaUrl);
  const rotaDados = await rotaResp.json();

  const rota = rotaDados.routes[0];
  const distanciaKm = rota.distance / 1000;
  const tempoMin = rota.duration / 60;

  let taxa = 0;
  if (distanciaKm <= 0.5) taxa = 3.00;
  else if (distanciaKm <= 3) taxa = 4.00;
  else if (distanciaKm <= 4.5) taxa = 5.00;
  else if (distanciaKm <= 5) taxa = 6.00;
  else throw new Error("Fora da área de entrega (máx. 5km)");

  return {
    distanciaKm: distanciaKm.toFixed(2),
    tempoMin: tempoMin.toFixed(0),
    taxa: parseFloat(taxa.toFixed(2))
  };
}

window.addEventListener('DOMContentLoaded', () => {
  carregarProdutos();

  const addressInput = document.getElementById("address");
  const deliveryInfo = document.getElementById("delivery-info");
  const addressError = document.getElementById("address-error");
  const checkoutBtn = document.getElementById("checkout-btn");
  const nameInput = document.getElementById("client-name");
  const phoneInput = document.getElementById("client-phone");

  let typingTimer;
  addressInput.addEventListener("input", () => {
    clearTimeout(typingTimer);
    if (addressInput.value.length < 5) {
      deliveryInfo.textContent = "";
      addressError.classList.add("hidden");
      checkoutBtn.disabled = true;
      return;
    }

    typingTimer = setTimeout(async () => {
      try {
        deliveryInfo.textContent = "Calculando taxa de entrega...";
        const { taxa } = await calcularTaxaEntrega(addressInput.value);
        taxaEntrega = taxa;
        deliveryInfo.innerHTML = `Taxa de entrega: ${formatCurrency(taxa)}`;
        addressError.classList.add("hidden");
        checkoutBtn.disabled = false;
        renderCartItems();
      } catch (err) {
        taxaEntrega = 0;
        deliveryInfo.textContent = "";
        addressError.textContent = err.message;
        addressError.classList.remove("hidden");
        checkoutBtn.disabled = true;
        renderCartItems();
      }
    }, 1000);
  });

  document.getElementById('cart-btn').addEventListener('click', () => {
    renderCartItems();
    document.getElementById('cart-modal').classList.remove('hidden');
  });

  document.getElementById('close-modal-btn').addEventListener('click', () => {
    document.getElementById('cart-modal').classList.add('hidden');
  });

  checkoutBtn.addEventListener("click", () => {
    const endereco = addressInput.value.trim();
    if (!endereco) return alert("Digite o endereço");

    const nome = nameInput.value.trim() || "Não informado";
    const telefone = phoneInput.value.trim();
    if (!telefone) return alert("Digite seu telefone (WhatsApp)");

    let texto = `*Cliente:* ${nome}\n`;
    texto += `*WhatsApp:* ${telefone}\n\n`;
    texto += `*Pedido*\n\n`;

    let subtotal = 0;

    carrinho.forEach(item => {
      texto += `${item.nome} ${item.quantidade}x ${formatCurrency(item.preco)}\n`;
      texto += `Obs: ${item.observacao || "Sem observação"}\n\n`;
      subtotal += item.preco * item.quantidade;
    });

    const total = subtotal + taxaEntrega;

    texto += `*Endereço:* ${endereco}\n`;
    texto += `*Taxa de entrega:* ${formatCurrency(taxaEntrega)}\n`;
    texto += `*Total:* ${formatCurrency(total)}`;

    fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cliente: nome,
        telefone: telefone,
        endereco,
        itens: carrinho,
        taxa_entrega: taxaEntrega,
        total: total
      })
    })
    .then(res => res.ok ? res.json() : Promise.reject('Erro ao registrar pedido'))
    .then(data => {
      const link = `https://wa.me/5521965667947?text=${encodeURIComponent(texto)}`;
      window.open(link, '_blank');

      carrinho = [];
      taxaEntrega = 0;
      document.getElementById('cart-modal').classList.add('hidden');
      addressInput.value = '';
      nameInput.value = '';
      phoneInput.value = '';
      deliveryInfo.textContent = '';
      atualizarContadorCarrinho();
    })
    .catch(err => {
      console.error(err);
      alert("Erro ao finalizar pedido.");
    });
  });
});
