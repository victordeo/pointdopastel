document.addEventListener('DOMContentLoaded', () => {
const categoryButtons = document.querySelectorAll('.category-button');
const produtos = document.querySelectorAll('.produto');

const initialCategory = 'queijo';

produtos.forEach(produto => {
    produto.style.display = produto.dataset.category === initialCategory ? 'flex' : 'none';
});

categoryButtons.forEach(button => {
    if (button.dataset.category === initialCategory) {
    button.classList.add('scale-105', 'shadow-lg');
    } else {
    button.classList.remove('scale-105', 'shadow-lg');
    }
});

categoryButtons.forEach(button => {
    button.addEventListener('click', (e) => {
    e.preventDefault();
    const selectedCategory = button.dataset.category;

    produtos.forEach(produto => {
        produto.style.display = (produto.dataset.category === selectedCategory || selectedCategory === 'todos') ? 'flex' : 'none';
    });

    categoryButtons.forEach(btn => btn.classList.remove('scale-105', 'shadow-lg'));
    button.classList.add('scale-105', 'shadow-lg');
    });
});
});

//visor de compras

 // Array que armazena os itens do carrinho
const carrinho = [];

// Função para formatar valores monetários
function formatarPreco(valor) {
    return valor.toFixed(2).replace('.', ',');
}

// Atualizar o conteúdo do carrinho na interface
function atualizarCarrinho() {
    const descricaoContainer = document.getElementById('carrinho-descricao');
    const quantidadeContainer = document.getElementById('carrinho-quantidade');
    const totalContainer = document.getElementById('carrinho-total');
    const removerContainer = document.getElementById('carrinho-remover');
    const totalGeralSpan = document.getElementById('total-geral');

    // Limpa os containers
    descricaoContainer.innerHTML = '';
    quantidadeContainer.innerHTML = '';
    totalContainer.innerHTML = '';
    removerContainer.innerHTML = '';

    let totalGeral = 0;

    carrinho.forEach((item, index) => {
        const subtotal = item.preco * item.quantidade;
        totalGeral += subtotal;

        descricaoContainer.innerHTML += `
            <span class="text-sm font-light text-gray-500 truncate block">${item.nome}</span>
        `;

        quantidadeContainer.innerHTML += `
            <span class="text-sm font-light text-gray-500 block">${item.quantidade}</span>
        `;

        totalContainer.innerHTML += `
            <span class="text-sm font-light text-gray-500 block">R$ ${formatarPreco(subtotal)}</span>
        `;

        removerContainer.innerHTML += `
            <span class="text-sm font-light text-red-600 block cursor-pointer" onclick="removerItem(${index})">X</span>
        `;
    });

    totalGeralSpan.textContent = `${formatarPreco(totalGeral)}`;
}

// Adiciona um item ao carrinho
const botoesAdicionar = document.querySelectorAll('.add-to-cart-btn');
botoesAdicionar.forEach(botao => {
    botao.addEventListener('click', () => {
        const nome = botao.getAttribute('data-name');
        const preco = parseFloat(botao.getAttribute('data-price'));

        const itemExistente = carrinho.find(item => item.nome === nome);

        if (itemExistente) {
            itemExistente.quantidade += 1;
        } else {
            carrinho.push({ nome, preco, quantidade: 1 });
        }

        atualizarCarrinho();
    });
});

// Remove um item do carrinho
function removerItem(index) {
    if (carrinho[index].quantidade > 1) {
        carrinho[index].quantidade -= 1;
    } else {
        carrinho.splice(index, 1); // Remove o item completamente
    }
    atualizarCarrinho();
}


// Inicializa o carrinho vazio ao carregar a página
atualizarCarrinho();