document.addEventListener('DOMContentLoaded', ()=>{
    const mudar_tema = document.getElementById('mudar-tema');
    const Estilo = document.getElementById('Estilo');

    const temas = {
        normal: '/css/padrao/criar-projeto.css',
        alternativo: '/css/alternativo/criar-projeto-alternativo.css'
    };

    mudar_tema.addEventListener('click', () => {
    const tema_atual = Estilo.getAttribute('href');
    const novo_tema = tema_atual === temas.normal ? temas.alternativo : temas.normal;

    Estilo.setAttribute('href', novo_tema);
    });
})

window.onload = function () {
    const errorMessage = document.getElementById("error-message")?.value;
    console.log(errorMessage)
    if (errorMessage) {
      alert(errorMessage);
    }
  };