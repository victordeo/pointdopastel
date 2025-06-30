const btnNovoProduto = document.getElementById('btnNovoProduto');
const modalProduto = document.getElementById('modalProduto');
const btnCancelar = document.getElementById('btnCancelar');
const form = document.getElementById('formNovoProduto');
const tbodyProdutos = document.querySelector('#produtos tbody');
const selectCategoria = document.getElementById('selectCategoria');
const produtosAtivosCount = document.getElementById('produtos-ativos');

// Abrir modal novo produto
btnNovoProduto.addEventListener('click', () => {
  limparFormulario();
  modalProduto.classList.remove('hidden');
});

// Cancelar modal
btnCancelar.addEventListener('click', () => {
  modalProduto.classList.add('hidden');
  limparFormulario();
});

// Fechar modal clicando fora
modalProduto.addEventListener('click', (e) => {
  if (e.target === modalProduto) {
    modalProduto.classList.add('hidden');
    limparFormulario();
  }
});

// Limpa formulário e remove flag edição
function limparFormulario() {
  form.reset();
  delete form.dataset.editando;
}

// Carregar categorias para select
async function carregarCategorias() {
  try {
    const resp = await fetch('/api/categorias');
    if (!resp.ok) throw new Error('Erro ao carregar categorias');
    const categorias = await resp.json();

    selectCategoria.innerHTML = '';
    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.nome;
      selectCategoria.appendChild(option);
    });
  } catch (err) {
    alert(err.message);
  }
}

// Carregar produtos na tabela
async function carregarProdutos() {
  try {
    const resp = await fetch('/api/produtos');
    if (!resp.ok) throw new Error('Erro ao carregar produtos');
    const produtos = await resp.json();

    tbodyProdutos.innerHTML = '';
    let ativos = 0;

    produtos.forEach(prod => {
      if (prod.ativo == 1) ativos++;

      const tr = document.createElement('tr');
      tr.className = 'border-b hover:bg-gray-50';

      const precoFormatado = parseFloat(prod.preco).toFixed(2).replace('.', ',');

      tr.innerHTML = `
        <td class="py-2">${prod.categoria_nome || ''}</td>
        <td class="py-2">${prod.nome}</td>
        <td class="py-2">R$ ${precoFormatado}</td>
        <td class="py-2 text-center">
            <label class="switch">
                <input type="checkbox" class="toggle-disponibilidade" data-id="${prod.id}" ${prod.ativo ? 'checked' : ''} />
                <span class="slider round"></span>
            </label>
        </td>
        <td class="py-2">
          <button class="text-blue-600 btn-editar" data-id="${prod.id}">Editar</button>
          <button class="text-red-600 ml-2 btn-excluir" data-id="${prod.id}">Excluir</button>
        </td>
      `;

      tbodyProdutos.appendChild(tr);
    });

    produtosAtivosCount.textContent = ativos;

    // Eventos de edição
    document.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', () => abrirModalEdicao(btn.dataset.id));
    });

    // Eventos de exclusão
    document.querySelectorAll('.btn-excluir').forEach(btn => {
      btn.addEventListener('click', () => excluirProduto(btn.dataset.id));
    });

    // Eventos de toggle
    document.querySelectorAll('.toggle-disponibilidade').forEach(toggle => {
  toggle.addEventListener('change', async () => {
    const id = toggle.dataset.id;
    const ativo = toggle.checked;

    try {
      const resp = await fetch(`/api/produtos/${id}/disponibilidade`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ativo })
      });

      if (!resp.ok) throw new Error('Erro ao atualizar disponibilidade');

    } catch (err) {
      alert(err.message);
      console.error(err);
      toggle.checked = !ativo; // Reverter o toggle se falhar
    }
  });
});

  } catch (err) {
    alert(err.message);
    console.error(err);
  }
}

// Abrir modal para editar produto
async function abrirModalEdicao(id) {
  try {
    const resp = await fetch('/api/produtos');
    if (!resp.ok) throw new Error('Erro ao buscar produtos');
    const produtos = await resp.json();
    const produto = produtos.find(p => p.id == id);
    if (!produto) throw new Error('Produto não encontrado');

    form.nome.value = produto.nome;
    form.descricao.value = produto.descricao || '';
    form.preco.value = produto.preco;
    form.categoria_id.value = produto.categoria_id;
    form.ativo.checked = produto.ativo == 1;

    form.dataset.editando = id;
    modalProduto.classList.remove('hidden');
  } catch (err) {
    alert(err.message);
  }
}

// Enviar formulário para criar ou editar produto
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  formData.set('ativo', form.ativo.checked ? '1' : '0');

  const idEditando = form.dataset.editando;
  let url = '/api/produtos';
  let method = 'POST';

  if (idEditando) {
    url += '/' + idEditando;
    method = 'PUT';
  }

  try {
    const resp = await fetch(url, {
      method,
      body: formData
    });

    if (!resp.ok) throw new Error('Erro ao salvar produto');
    alert(idEditando ? 'Produto atualizado!' : 'Produto cadastrado!');
    modalProduto.classList.add('hidden');
    limparFormulario();
    carregarProdutos();
  } catch (err) {
    alert(err.message);
  }
});

// Excluir produto
async function excluirProduto(id) {
  if (!confirm('Confirma exclusão do produto?')) return;

  try {
    const resp = await fetch('/api/produtos/' + id, { method: 'DELETE' });
    if (!resp.ok) throw new Error('Erro ao excluir produto');
    alert('Produto excluído!');
    carregarProdutos();
  } catch (err) {
    alert(err.message);
  }
}

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
  carregarCategorias();
  carregarProdutos();
});
