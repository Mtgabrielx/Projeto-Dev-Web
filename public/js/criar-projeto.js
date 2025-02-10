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

  // Lógica de ativar a classe active no menu
  const menuItems = document.querySelectorAll('.Menu-Item');
  const currentPath = window.location.pathname;

  menuItems.forEach(item => {
      const itemPath = item.getAttribute('href');

      // Comparação com a URL correta
      if (itemPath === currentPath) {
          item.classList.add('active');
      } else {
          item.classList.remove('active');
      }
  });

  // Exibindo mensagem de erro, se houver
  const errorMessage = document.getElementById("error-message")?.innerText; // ou use innerHTML se necessário
  if (errorMessage) {
      alert(errorMessage);
  }
});