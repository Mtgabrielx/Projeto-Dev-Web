document.addEventListener('DOMContentLoaded', () => {
    const mudar_tema = document.getElementById('mudar-tema');
    const Estilo = document.getElementById('Estilo');

    const temas = {
        criarProjeto: {
            normal: '/css/padrao/criar-projeto.css',
            alternativo: '/css/alternativo/criar-projeto-alternativo.css'
        },
        inicio: {
            normal: '/css/padrao/inicio.css',
            alternativo: '/css/alternativo/inicio-alternativo.css'
        }
    };

    // Detecta qual tema deve ser aplicado com base no href atual
    function getTemaAtual() {
        if (Estilo.getAttribute('href').includes('criar-projeto')) {
            return 'criarProjeto';
        }
        return 'inicio';
    }

    // Aplica o tema salvo no localStorage
    function applyStoredTheme() {
        const temaAtual = getTemaAtual();
        const storedTheme = localStorage.getItem(`theme-${temaAtual}`);
        if (storedTheme && temas[temaAtual][storedTheme]) {
            Estilo.setAttribute('href', temas[temaAtual][storedTheme]);
        } else {
            Estilo.setAttribute('href', temas[temaAtual].normal);
        }
    }

    // Alterna entre os temas ao clicar no botão
    mudar_tema.addEventListener('click', () => {
        const temaAtual = getTemaAtual();
        const currentTheme = Estilo.getAttribute('href');
        const newTheme = currentTheme === temas[temaAtual].normal ? temas[temaAtual].alternativo : temas[temaAtual].normal;

        Estilo.setAttribute('href', newTheme);

        const themeKey = newTheme === temas[temaAtual].normal ? 'normal' : 'alternativo';
        localStorage.setItem(`theme-${temaAtual}`, themeKey);
    });

    // Altera o tamanho da fonte e salva no localStorage
    function fontchange(n) {
        const content = document.getElementById('Conteudo');
        const leftSection = document.querySelector('.left-section');
        const parrafo = document.querySelector('.left-section p');

        content.style.fontSize = `${n}px`;
        leftSection.style.fontSize = `${n}px`;
        parrafo.style.fontSize = `${n}px`;

        localStorage.setItem('fontSize', n);
        updateActiveButton(n);
    }

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

    // Aplica o tema e o tamanho da fonte armazenado ao carregar a página
    window.onload = () => {
        applyStoredTheme();
        applyStoredFontSize();
    };
});
