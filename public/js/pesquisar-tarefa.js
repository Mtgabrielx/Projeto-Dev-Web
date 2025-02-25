document.addEventListener('DOMContentLoaded', () => {
    const mudar_tema = document.getElementById('mudar-tema');
    const Estilo = document.getElementById('Estilo');

    const temas = {
        normal: '/css/padrao/pesquisar-projeto.css',
        alternativo: '/css/alternativo/pesquisar-projeto-alternativo.css'
    };

    const temaSalvo = localStorage.getItem('temaSelecionado');
    if (temaSalvo && Object.values(temas).includes(temaSalvo)) {
        Estilo.setAttribute('href', temaSalvo);
    }

    mudar_tema.addEventListener('click', () => {
        const tema_atual = Estilo.getAttribute('href');
        const novo_tema = tema_atual === temas.normal ? temas.alternativo : temas.normal;
        Estilo.setAttribute('href', novo_tema);
        localStorage.setItem('temaSelecionado', novo_tema);
    });

    const menuItems = document.querySelectorAll('.Menu-Item');
    const currentPath = window.location.pathname;

    menuItems.forEach(item => {
        const itemPath = item.getAttribute('href');
        item.classList.toggle('active', itemPath === currentPath);
    });
});

async function filtrarTarefas() {
    const status = document.getElementById('status').value;
    const responsavel = document.getElementById('responsavel').value;
    const queryParams = new URLSearchParams({ status, responsavel }).toString();

    try {
        const response = await fetch(`/api/tarefas?${queryParams}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
        if (!response.ok) throw new Error('Erro na requisição');

        const data = await response.json();
        let allTarefas = [];
        data.forEach(([id, tarefas]) => {
            tarefas = tarefas.map(tarefa => ({ ...tarefa, projectId: id }));
            allTarefas.push(...tarefas);
        });

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

            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            ['Responsável', 'Título', 'Prazo', 'Status'].forEach(headerText => {
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

                const tdResponsavel = document.createElement('td');
                tdResponsavel.textContent = tarefa.responsible.length > 20 ? tarefa.responsible.slice(0, 20) + '...' : tarefa.responsible;
                row.appendChild(tdResponsavel);

                const tdTitulo = document.createElement('td');
                const linkTitulo = document.createElement('a');
                linkTitulo.href = `/projeto/${tarefa.projectId}/edit/${tarefa.id}`;
                linkTitulo.textContent = tarefa.title.length > 20 ? tarefa.title.slice(0, 20) + '...' : tarefa.title;
                tdTitulo.appendChild(linkTitulo);
                row.appendChild(tdTitulo);

                const tdPrazo = document.createElement('td');
                tdPrazo.textContent = tarefa.deadline;
                row.appendChild(tdPrazo);

                const tdStatus = document.createElement('td');
                tdStatus.textContent = tarefa.status;
                row.appendChild(tdStatus);

                tbody.appendChild(row);
            });

            table.appendChild(tbody);
            resultadoDiv.appendChild(table);

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
        console.error('Erro ao pesquisar tarefas:', error);
        document.getElementById('resultadoTarefa').innerHTML = '<p>Erro ao carregar tarefas.</p>';
    }
}
