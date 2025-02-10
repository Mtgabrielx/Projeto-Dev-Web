document.addEventListener('DOMContentLoaded', () => {
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
    
    // Logica de ativar a classe active no menu
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

async function filtrarProjetos() {
    const status = document.getElementById('status').value;
    const prioridade = document.getElementById('prioridade').value;
    const Titulo = document.getElementById('Titulo').value;
    const dadosFiltro = {
        status: status,
        prioridade: prioridade,
        Titulo: Titulo,
    };

    try {
        const response = await fetch('/api/projetos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosFiltro)
        });
        if (!response.ok) {
            throw new Error('Erro na requisição');
        }

        const projetos = await response.json();

        const itemsPerPage = 5;
        let currentPage = 0;

        function renderPage() {
            const resultadoDiv = document.getElementById('resultadoProjetos');
            console.log(resultadoDiv);
            resultadoDiv.innerHTML = '';
            if (projetos.length === 0) {
                resultadoDiv.innerHTML = '<p>Nenhum projeto encontrado.</p>';
                return;
            }
            const table = document.createElement('table');
            table.classList.add('cards-table');

            // Criar cabeçalho da tabela
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            const headers = ['ID', 'Titulo', 'Prazo', 'Status'];

            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            const startIndex = currentPage * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, projetos.length);
            const projetosToRender = projetos.slice(startIndex, endIndex);

            projetosToRender.forEach(projeto => {
                const row = document.createElement('tr');

                const tdId = document.createElement('td');
                tdId.textContent = projeto.id;
                row.appendChild(tdId);

                const tdTitulo = document.createElement('td');
                const linkTitulo = document.createElement('a');
                linkTitulo.href = `/projeto/${projeto.id}`;
                linkTitulo.textContent = projeto.Titulo;       
                tdTitulo.appendChild(linkTitulo);
                row.appendChild(tdTitulo);

                // Coluna Prazo
                const tdPrazo = document.createElement('td');
                tdPrazo.textContent = projeto.Prazo;
                row.appendChild(tdPrazo);

                // Coluna Status
                const tdStatus = document.createElement('td');
                tdStatus.textContent = projeto.Status;
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

            if (endIndex < projetos.length) {
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
        console.error('Erro ao pesquisar projetos:', error);
        document.getElementById('resultadoProjetos').innerHTML =
            '<p>Erro ao carregar projetos.</p>';
    }
}
