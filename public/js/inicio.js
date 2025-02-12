document.addEventListener('DOMContentLoaded', ()=>{
    const mudar_tema = document.getElementById('mudar-tema');
    const Estilo = document.getElementById('Estilo');

    const temas = {
        normal: '/css/padrao/inicio.css',
        alternativo: '/css/alternativo/inicio-alternativo.css'
    };

    mudar_tema.addEventListener('click', () => {
    const tema_atual = Estilo.getAttribute('href');
    const novo_tema = tema_atual === temas.normal ? temas.alternativo : temas.normal;

    Estilo.setAttribute('href', novo_tema);
    });
})