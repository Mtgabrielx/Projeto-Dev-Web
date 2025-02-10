document.addEventListener('DOMContentLoaded', () => {
    const mudar_tema = document.getElementById('mudar-tema');
    const Estilo = document.getElementById('Estilo');

    const temas = {
        normal: '/css/padrao/inicio.css',
        alternativo: '/css/alternativo/inicio-alternativo.css'
    };

    // Alterna entre os temas ao clicar no botão
    mudar_tema.addEventListener('click', () => {
        const currentTheme = Estilo.getAttribute('href');
        Estilo.setAttribute('href', currentTheme === temas.normal ? temas.alternativo : temas.normal);
    });

    // Função para alterar o tamanho da fonte e armazenar no localStorage
    function fontchange(n) {
        const content = document.getElementById('Conteudo');
        const leftSection = document.querySelector('.left-section');
        const parrafo = document.querySelector('.left-section p');

        // Aplica o novo tamanho de fonte
        content.style.fontSize = `${n}px`;
        leftSection.style.fontSize = `${n}px`;
        parrafo.style.fontSize = `${n}px`;

        // Salva o tamanho da fonte no localStorage
        localStorage.setItem('fontSize', n);

        updateActiveButton(n);
    }

    // Aplica o tamanho de fonte armazenado no localStorage
    function applyStoredFontSize() {
        const storedFontSize = localStorage.getItem('fontSize');
        if (storedFontSize) {
            const content = document.getElementById('Conteudo');
            const leftSection = document.querySelector('.left-section');
            const parrafo = document.querySelector('.left-section p');

            content.style.fontSize = `${storedFontSize}px`;
            leftSection.style.fontSize = `${storedFontSize}px`;
            parrafo.style.fontSize = `${storedFontSize}px`;

            updateActiveButton(parseInt(storedFontSize));
        }
    }

    // Atualiza a classe do botão ativo
    function updateActiveButton(fontSize) {
        const buttons = document.querySelectorAll(".font-size-controls .button");
        buttons.forEach(button => {
            button.classList.toggle("active", parseInt(button.textContent) === fontSize);
        });
    }

    // Aplica a configuração de fonte armazenada ao carregar a página
    window.onload = applyStoredFontSize;
});
