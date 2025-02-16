document.addEventListener('DOMContentLoaded', ()=>{
    const mudar_tema = document.getElementById('mudar-tema');
    const Estilo = document.getElementById('Estilo');

    const temas = {
        normal: '/css/padrao/pesquisar-projeto.css',
        alternativo: '/css/alternativo/pesquisar-projeto-alternativo.css'
    };

    mudar_tema.addEventListener('click', () => {
        const tema_atual = Estilo.getAttribute('href');
        const novo_tema = tema_atual === temas.normal ? temas.alternativo : temas.normal;
        Estilo.setAttribute('href', novo_tema);
    });
    
    const menuItems = document.querySelectorAll('.Menu-Item');
    const currentPath = window.location.pathname;

    menuItems.forEach(item => {
        const itemPath = item.getAttribute('href');
        if (itemPath === currentPath) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
});

async function filtrarTarefas() {
    const status = document.getElementById('status').value;
    const responsavel = document.getElementById('responsavel').value;
    const queryParams = new URLSearchParams({ status, responsavel }).toString();

    try {
        const response = await fetch(`/api/tarefas?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        if (!response.ok) {
            throw new Error('Erro na requisição');
        }

        // Recebe os dados no formato: [[id1, [lista de tarefas]], [id2, [lista de tarefas2]]]
        const data = await response.json();

        // "Achatando" a estrutura para obter uma única lista de tarefas
        let allTarefas = [];
        data.forEach(([id, tarefas]) => {
            // Opcional: se precisar associar o id do projeto à tarefa, você pode fazer:
            tarefas = tarefas.map(tarefa => ({ ...tarefa, projectId: id }));
            allTarefas.push(...tarefas);
        });
        console.log(allTarefas)
        const itemsPerPage = 5;
        let currentPage = 0;

        function renderPage() {
            const resultadoDiv = document.getElementById('resultadoTarefa');
            resultadoDiv.innerHTML = '';

            if (allTarefas.length === 0) {
                resultadoDiv.innerHTML = '<p>Nenhuma tarefa encontrada.</p>';
                return;
            }

            const table = document.createElement('table');
            table.classList.add('cards-table');

            // Cabeçalho da tabela
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            const headers = ['Responsável', 'title', 'deadline', 'status'];

            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            const startIndex = currentPage * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, allTarefas.length);
            const tarefasToRender = allTarefas.slice(startIndex, endIndex);

            tarefasToRender.forEach(tarefa => {
                const row = document.createElement('tr');

                // Coluna ID
                const tdRep = document.createElement('Responsável');
                const truncatedResponsavel = tarefa.responsible.length > 20 
                    ? tarefa.responsible.slice(0, 20) + '...' 
                    : tarefa.responsible;
                tdRep.textContent = truncatedResponsavel;
                row.appendChild(tdRep);

                // Coluna title com truncamento para 20 caracteres
                const tdtitle = document.createElement('td');
                const linktitle = document.createElement('a');
                linktitle.href = `/projeto/${tarefa.projectId}/edit/${tarefa.id}`;
                const truncatedTitle = tarefa.title.length > 20 
                    ? tarefa.title.slice(0, 20) + '...' 
                    : tarefa.title;
                linktitle.textContent = truncatedTitle;
                tdtitle.appendChild(linktitle);
                row.appendChild(tdtitle);

                // Coluna deadline
                const tddeadline = document.createElement('td');
                tddeadline.textContent = tarefa.deadline;
                row.appendChild(tddeadline);

                // Coluna status
                const tdstatus = document.createElement('td');
                tdstatus.textContent = tarefa.status;
                row.appendChild(tdstatus);

                tbody.appendChild(row);
            });

            table.appendChild(tbody);
            resultadoDiv.appendChild(table);

            // Criação da paginação
            const paginationDiv = document.createElement('div');
            paginationDiv.classList.add('pagination');

            if (currentPage > 0) {
                const prevButton = document.createElement('button');
                prevButton.textContent = 'Anterior';
                prevButton.addEventListener('click', () => {
                    currentPage--;
                    renderPage();
                });
                paginationDiv.appendChild(prevButton);
            }

            if (endIndex < allTarefas.length) {
                const nextButton = document.createElement('button');
                nextButton.textContent = 'Próximo';
                nextButton.addEventListener('click', () => {
                    currentPage++;
                    renderPage();
                });
                paginationDiv.appendChild(nextButton);
            }

            resultadoDiv.appendChild(paginationDiv);
        }

        renderPage();

    } catch (error) {
        console.error('Erro ao pesquisar Tarefa:', error);
        document.getElementById('resultadoTarefa').innerHTML =
            '<p>Erro ao carregar Tarefa.</p>';
    }
}