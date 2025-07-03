document.addEventListener('DOMContentLoaded', () => {
  const categoryButtons = document.querySelectorAll('.category-button');
  const containerProdutos = document.getElementById('produtos-container'); // container dos produtos no HTML
  const initialCategory = 'queijo';

  // Buscar produtos da API pública
  fetch('/public/produtos')
    .then(res => res.json())
    .then(produtos => {
      containerProdutos.innerHTML = ''; // Limpa o container antes de preencher

      produtos.forEach(prod => {
        // Criar card do produto respeitando a estrutura e classes que seu HTML espera
        const div = document.createElement('div');
        div.className = 'flex flex-col p-2 produto'; // ajuste o padding se quiser, para ficar parecido
        const mapCategoria = {
            'point kids': 'kids',
            'doces': 'doce',
            'bebidas': 'bebida'
            };

const catLower = prod.categoria_nome.toLowerCase();
div.dataset.category = mapCategoria[catLower] || catLower;


        div.innerHTML = `
          <div class="flex justify-between gap-2">
            <img src="/assets/images/${prod.imagem}" alt="${prod.nome}" class="w-20 h-20 rounded-t-md" />
            <div class="w-full">
              <p class="font-semibold text-gray-700">${prod.nome}</p>
              <p class="text-xs font-light text-gray-500">${prod.descricao || ''}</p>
            </div>
          </div>
          <div class="w-full">
            <button 
              class="bg-primary w-full rounded-b-md p-1 add-to-cart-btn hover:bg-orange-300 duration-300"
              data-name="${prod.nome}" 
              data-price="${prod.preco}">
                <p class="font-medium text-white text-sm">R$ ${Number(prod.preco).toFixed(2).replace('.', ',')}</p>
            </button>
          </div>
        `;

        containerProdutos.appendChild(div);
      });

      aplicarFiltroCategoria(initialCategory);
      configurarFiltroCategorias();
      configurarBotoesCarrinho();
    })
    .catch(err => {
      console.error('Erro ao carregar produtos:', err);
    });

  function aplicarFiltroCategoria(categoriaSelecionada) {
    const produtos = document.querySelectorAll('.produto');

    produtos.forEach(produto => {
      const catProduto = produto.dataset.category.toLowerCase();
      if (categoriaSelecionada === 'todos' || catProduto === categoriaSelecionada) {
        produto.style.display = 'flex';
      } else {
        produto.style.display = 'none';
      }
    });

    categoryButtons.forEach(btn => {
      if (btn.dataset.category === categoriaSelecionada) {
        btn.classList.add('scale-105', 'shadow-lg');
      } else {
        btn.classList.remove('scale-105', 'shadow-lg');
      }
    });
  }

  function configurarFiltroCategorias() {
    categoryButtons.forEach(button => {
      button.addEventListener('click', e => {
        e.preventDefault();
        const categoria = button.dataset.category.toLowerCase();
        aplicarFiltroCategoria(categoria);
      });
    });
  }

  const carrinho = [];

  function formatarPreco(valor) {
    return valor.toFixed(2).replace('.', ',');
  }

  function atualizarCarrinho() {
    const descricaoContainer = document.getElementById('carrinho-descricao');
    const quantidadeContainer = document.getElementById('carrinho-quantidade');
    const totalContainer = document.getElementById('carrinho-total');
    const removerContainer = document.getElementById('carrinho-remover');
    const totalGeralSpan = document.getElementById('total-geral');

    descricaoContainer.innerHTML = '';
    quantidadeContainer.innerHTML = '';
    totalContainer.innerHTML = '';
    removerContainer.innerHTML = '';

    let totalGeral = 0;

    carrinho.forEach((item, index) => {
      const subtotal = item.preco * item.quantidade;
      totalGeral += subtotal;

      descricaoContainer.innerHTML += `<span class="text-sm font-light text-gray-500 truncate block">${item.nome}</span>`;
      quantidadeContainer.innerHTML += `<span class="text-sm font-light text-gray-500 block">${item.quantidade}</span>`;
      totalContainer.innerHTML += `<span class="text-sm font-light text-gray-500 block">R$ ${formatarPreco(subtotal)}</span>`;
      removerContainer.innerHTML += `<span class="text-sm font-light text-red-600 block cursor-pointer" onclick="removerItem(${index})">X</span>`;
    });

    totalGeralSpan.textContent = formatarPreco(totalGeral);
  }

  function configurarBotoesCarrinho() {
    const botoesAdicionar = document.querySelectorAll('.add-to-cart-btn');
    botoesAdicionar.forEach(botao => {
      botao.addEventListener('click', () => {
        const nome = botao.getAttribute('data-name');
        const preco = parseFloat(botao.getAttribute('data-price'));

        const itemExistente = carrinho.find(item => item.nome === nome);

        if (itemExistente) {
          itemExistente.quantidade++;
        } else {
          carrinho.push({ nome, preco, quantidade: 1 });
        }
        atualizarCarrinho();
      });
    });
  }

  // Função global para remover item (funciona no onclick inline)
  window.removerItem = function (index) {
    if (carrinho[index].quantidade > 1) {
      carrinho[index].quantidade--;
    } else {
      carrinho.splice(index, 1);
    }
    atualizarCarrinho();
  };
});
