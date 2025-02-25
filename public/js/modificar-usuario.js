document.addEventListener('DOMContentLoaded', () => {
  const mudar_tema = document.getElementById('mudar-tema');
  const Estilo = document.getElementById('Estilo');

  const temas = {
    normal: '/css/padrao/modificar-usuario.css',
    alternativo: '/css/alternativo/modificar-usuario-alternativo.css'
  };

  function applyStoredTheme() {
    const storedTheme = localStorage.getItem('theme-modificar-usuario');
    if (storedTheme && temas[storedTheme]) {
      Estilo.setAttribute('href', temas[storedTheme]);
    } else {
      Estilo.setAttribute('href', temas.normal);
    }
  }

  mudar_tema.addEventListener('click', () => {
    const tema_atual = Estilo.getAttribute('href');
    const novo_tema = tema_atual === temas.normal ? temas.alternativo : temas.normal;

    Estilo.setAttribute('href', novo_tema);
    localStorage.setItem('theme-modificar-usuario', novo_tema === temas.normal ? 'normal' : 'alternativo');
  });

  applyStoredTheme();
});

window.onload = function () {
  const errorMessage = document.getElementById("error-message")?.value;
  if (errorMessage) {
    alert(errorMessage);
  }
};

async function filtrarUsuarios() {
  const role = document.getElementById('filterRole').value;
  const dadosFiltro = { role };

  try {
    const response = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosFiltro)
    });

    if (!response.ok) throw new Error('Erro na requisição');

    const users = await response.json();
    const resultadoDiv = document.getElementById('resultadoUsuarios');
    resultadoDiv.innerHTML = users.length === 0 ? '<p>Nenhum usuário encontrado.</p>' : '';

    if (users.length > 0) {
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      ['ID', 'Nome de Usuário', 'Nível de Acesso', 'Nova Senha', 'Alterar Nível', 'Ações'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      users.forEach(user => {
        const row = document.createElement('tr');

        [['td', user.id], ['td', user.username], ['td', user.role]].forEach(([tag, content]) => {
          const cell = document.createElement(tag);
          cell.textContent = content;
          row.appendChild(cell);
        });

        const passwordCell = document.createElement('td');
        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = 'Nova senha';
        passwordCell.appendChild(passwordInput);
        row.appendChild(passwordCell);

        const roleSelectCell = document.createElement('td');
        const roleSelect = document.createElement('select');
        ['Funcionário', 'Gerente', 'Administrador'].forEach(role => {
          const option = document.createElement('option');
          option.value = role;
          option.textContent = role;
          if (user.role === role) option.selected = true;
          roleSelect.appendChild(option);
        });
        roleSelectCell.appendChild(roleSelect);
        row.appendChild(roleSelectCell);

        const actionsCell = document.createElement('td');
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Salvar';
        saveButton.addEventListener('click', async () => {
          const payload = { id: user.id, newPassword: passwordInput.value, newRole: roleSelect.value };

          try {
            const updateResponse = await fetch('/update-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            if (!updateResponse.ok) throw new Error('Erro ao atualizar usuário');
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
    }
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    document.getElementById('resultadoUsuarios').innerHTML = '<p>Erro ao carregar usuários.</p>';
  }
}
