document.addEventListener('DOMContentLoaded', () => {
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
  
    const errorMessage = document.getElementById("error-message")?.innerText; 
    if (errorMessage) {
        alert(errorMessage);
    }
});
