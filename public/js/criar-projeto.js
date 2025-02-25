document.addEventListener('DOMContentLoaded', () => {
    const mudar_tema = document.getElementById('mudar-tema');
    const Estilo = document.getElementById('Estilo');

    const temas = {
        normal: '/css/padrao/criar-projeto.css',
        alternativo: '/css/alternativo/criar-projeto-alternativo.css'
    };

    // Carregar o tema salvo no localStorage ou definir o padrão
    let temaSalvo = localStorage.getItem('tema');

    if (!temaSalvo || !Object.values(temas).includes(temaSalvo)) {
        temaSalvo = temas.normal; // Se inválido, define o tema padrão
        localStorage.setItem('tema', temaSalvo);
    }

    Estilo.setAttribute('href', temaSalvo); // Aplica o tema correto ao carregar a página

    mudar_tema.addEventListener('click', () => {
        const temaAtual = Estilo.getAttribute('href');
        const novoTema = temaAtual.includes(temas.normal) ? temas.alternativo : temas.normal;
        Estilo.setAttribute('href', novoTema);

        // Salvar a escolha do tema no localStorage
        localStorage.setItem('tema', novoTema);
    });

    const menuItems = document.querySelectorAll('.Menu-Item');
    const currentPath = window.location.pathname;

    menuItems.forEach(item => {
        if (item.getAttribute('href') === currentPath) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    const errorMessage = document.getElementById("error-message")?.innerText;
    if (errorMessage) {
        alert(errorMessage);
    }
});