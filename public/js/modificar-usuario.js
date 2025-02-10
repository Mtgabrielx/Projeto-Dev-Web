document.addEventListener('DOMContentLoaded', ()=>{
  const mudar_tema = document.getElementById('mudar-tema');
  const Estilo = document.getElementById('Estilo');

  const temas = {
    normal: '/css/padrao/modificar-usuario.css',
    alternativo: 'css/alternativo/modificar-usuario-alternativo.css' 
};


  mudar_tema.addEventListener('click', () => {
  const tema_atual = Estilo.getAttribute('href');
  const novo_tema = tema_atual === temas.normal ? temas.alternativo : temas.normal;

  Estilo.setAttribute('href', novo_tema);
  });
})

window.onload = function () {
    const errorMessage = document.getElementById("error-message")?.value;
    console.log(errorMessage)
    if (errorMessage) {
      alert(errorMessage);
    }
  };

// Função para buscar/filtrar usuários via POST
async function filtrarUsuarios() {
  // Captura o valor do select
  const role = document.getElementById('filterRole').value;

  // Monta o objeto de filtro
  const dadosFiltro = { role };

  try {
    // Faz requisição ao endpoint que retorna usuários filtrados
    const response = await fetch('/api/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosFiltro)
    });

    if (!response.ok) {
      throw new Error('Erro na requisição');
    }

    // Converte resposta em JSON (array de usuários)
    const users = await response.json();

    // Seleciona a div onde a tabela será exibida
    const resultadoDiv = document.getElementById('resultadoUsuarios');
    resultadoDiv.innerHTML = '';

    // Caso não haja usuários
    if (users.length === 0) {
      resultadoDiv.innerHTML = '<p>Nenhum usuário encontrado.</p>';
      return;
    }

    // Cria a tabela dinamicamente
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Cabeçalhos
    const headers = ['ID', 'Nome de Usuário', 'Nível de Acesso', 'Nova Senha', 'Alterar Nível', 'Ações'];
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Corpo da tabela
    const tbody = document.createElement('tbody');

    users.forEach(user => {
      const row = document.createElement('tr');

      // Coluna ID
      const idCell = document.createElement('td');
      idCell.textContent = user.id;
      row.appendChild(idCell);

      // Coluna Nome de Usuário
      const usernameCell = document.createElement('td');
      usernameCell.textContent = user.username;
      row.appendChild(usernameCell);

      // Coluna Nível de Acesso (atual)
      const roleCell = document.createElement('td');
      roleCell.textContent = user.role;
      row.appendChild(roleCell);

      // Coluna Nova Senha (input)
      const passwordCell = document.createElement('td');
      const passwordInput = document.createElement('input');
      passwordInput.type = 'password';
      passwordInput.name = 'newPassword';
      passwordInput.placeholder = 'Nova senha';
      passwordCell.appendChild(passwordInput);
      row.appendChild(passwordCell);

      // Coluna Alterar Nível (select)
      const roleSelectCell = document.createElement('td');
      const roleSelect = document.createElement('select');
      roleSelect.name = 'newRole';

      // Opções do select
      const optionColab = document.createElement('option');
      optionColab.value = 'Funcionário';
      optionColab.textContent = 'Funcionário';
      if (user.role === 'Funcionário') optionColab.selected = true;
      roleSelect.appendChild(optionColab);

      const optionGerente = document.createElement('option');
      optionGerente.value = 'Gerente';
      optionGerente.textContent = 'Gerente';
      if (user.role === 'Gerente') optionGerente.selected = true;
      roleSelect.appendChild(optionGerente);

      const optionAdmin = document.createElement('option');
      optionAdmin.value = 'Administrador';
      optionAdmin.textContent = 'Administrador';
      if (user.role === 'Administrador') optionAdmin.selected = true;
      roleSelect.appendChild(optionAdmin);

      roleSelectCell.appendChild(roleSelect);
      row.appendChild(roleSelectCell);

      // Coluna Ações (botão Salvar)
      const actionsCell = document.createElement('td');
      const saveButton = document.createElement('button');
      saveButton.textContent = 'Salvar';

      // Evento de clique para enviar dados de atualização
      saveButton.addEventListener('click', async () => {
        // Monta objeto para atualizar
        const payload = {
          id: user.id,
          newPassword: passwordInput.value,
          newRole: roleSelect.value
        };

        try {
          const updateResponse = await fetch('/update-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (!updateResponse.ok) {
            throw new Error('Erro ao atualizar usuário');
          }

          alert('Usuário atualizado com sucesso!');
        } catch (err) {
          console.error(err);
          alert('Erro ao atualizar usuário');
        }
      });

      actionsCell.appendChild(saveButton);
      row.appendChild(actionsCell);

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    resultadoDiv.appendChild(table);

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    document.getElementById('resultadoUsuarios').innerHTML =
      '<p>Erro ao carregar usuários.</p>';
  }
}