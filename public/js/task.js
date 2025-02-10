function filtrarTarefas(){
  const searchForm = document.getElementById('searchForm');

  if (searchForm) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault(); // Evita o envio do formulário para o servidor

      // Obtém os valores dos campos e converte para minúsculas para comparação
      const titleQuery = document.getElementById('Titulo').value.trim().toLowerCase();
      const statusQuery = document.getElementById('status').value.trim().toLowerCase();
      const responsibleQuery = document.getElementById('responsavel').value.trim().toLowerCase();

      // Seleciona todas as linhas da tabela de tarefas
      const rows = document.querySelectorAll('.task-table tbody tr');
      rows.forEach(row => {
        // Considerando que:
        // - Coluna 0: Título
        // - Coluna 2: Responsável
        // - Coluna 4: Status
        
        const titleText = row.cells[0].textContent.toLowerCase();
        const responsibleText = row.cells[2].textContent.toLowerCase();
        const statusText = row.cells[4].textContent.toLowerCase().replace(/[\r\n\t ]+/g, ' ').trim();;
        const matchesTitle = titleText.includes(titleQuery);
        // Se o status selecionado for vazio (opção "Todas"), ignora o filtro de status.
        const matchesStatus = statusQuery === '' || statusText === statusQuery;
        const matchesResponsible = responsibleText.includes(responsibleQuery);

        // Exibe a linha somente se todos os filtros forem satisfeitos
        if (matchesTitle && matchesStatus && matchesResponsible) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  const mudar_tema = document.getElementById('mudar-tema');
  const Estilo = document.getElementById('Estilo');

  const temas = {
      normal: '/css/padrao/task.css',
      alternativo: '/css/alternativo/task-alternativo.css'
  };

  mudar_tema.addEventListener('click', () => {
  const tema_atual = Estilo.getAttribute('href');
  const novo_tema = tema_atual === temas.normal ? temas.alternativo : temas.normal;

  Estilo.setAttribute('href', novo_tema);
  });
})