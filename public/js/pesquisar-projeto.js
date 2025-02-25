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

async function filtrarProjetos() {
    // Capturar os valores dos filtros
    const status = document.getElementById('status').value;
    const prioridade = document.getElementById('prioridade').value;
    const Titulo = document.getElementById('Titulo').value;
    // Criar objeto com os dados para enviar
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
            // Renderizar resultados
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

                // Coluna ID (apenas exibe o id do projeto)
                const tdId = document.createElement('td');
                tdId.textContent = projeto.id;
                row.appendChild(tdId);

                // Coluna Título (contém o link com destino baseado no id do projeto)
                const tdTitulo = document.createElement('td');
                const linkTitulo = document.createElement('a');
                linkTitulo.href = `/projeto/${projeto.id}`; // O destino é o id do projeto
                linkTitulo.textContent = projeto.Titulo;       // O texto do link é o título do projeto
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

            // Cria a área de paginação
            const paginationDiv = document.createElement('div');
            paginationDiv.classList.add('pagination');

            // Botão "Anterior" (só aparece se não for a primeira página)
            if (currentPage > 0) {
                const prevButton = document.createElement('button');
                prevButton.textContent = 'Anterior';
                prevButton.addEventListener('click', () => {
                    currentPage--;
                    renderPage();
                });
                paginationDiv.appendChild(prevButton);
            }

            // Botão "Próximo" (só aparece se houver mais itens)
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

        // Renderiza a primeira página
        renderPage();

    } catch (error) {
        console.error('Erro ao pesquisar projetos:', error);
        document.getElementById('resultadoProjetos').innerHTML =
            '<p>Erro ao carregar projetos.</p>';
    }
}