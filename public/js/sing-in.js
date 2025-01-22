document.addEventListener('DOMContentLoaded', ()=>{
    const mudar_tema = document.getElementById('mudar-tema');
    // Link do tema atual
    const Estilo = document.getElementById('Estilo');

    // Arquivos de tema disponíveis
    const temas = {
        normal: 'css/sing-in-up.css',
        alternativo: 'css/sing-in-up-alternativo.css'
    };

    // Alternar tema
    mudar_tema.addEventListener('click', () => {
    // Verifica o tema atual e alterna para o outro
    const tema_atual = Estilo.getAttribute('href');
    const novo_tema = tema_atual === temas.normal ? temas.alternativo : temas.normal;

    // Define o novo tema
    Estilo.setAttribute('href', novo_tema);
    });
})