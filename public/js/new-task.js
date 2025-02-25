document.addEventListener('DOMContentLoaded', () => {
    const mudar_tema = document.getElementById('mudar-tema');
    const Estilo = document.getElementById('Estilo');
  
    const temas = {
        normal: '/css/padrao/task.css',
        alternativo: '/css/alternativo/task-alternativo.css'
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
});
