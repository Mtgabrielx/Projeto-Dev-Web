document.addEventListener('DOMContentLoaded', () => {
  const menuItems = document.querySelectorAll('.Menu-Item');
  const contentDiv = document.getElementById('Conteudo-Principal');

  menuItems.forEach(item => {
    item.addEventListener('click', async (event) => {
      event.preventDefault(); // Evita o recarregamento da página

      const route = item.getAttribute('data-route'); // Obtém a rota do link

      try {
        const response = await fetch(route);
        if (!response.ok) throw new Error('Erro ao carregar o conteúdo.');

        const contentType = response.headers.get('Content-Type');

        // Se for JSON, analisa o JSON
        if (contentType.includes('application/json')) {
          const data = await response.json();
          contentDiv.innerHTML = data.html;

          if (data.css) {
            const styleTag = document.createElement('link');
            styleTag.rel = 'stylesheet';
            styleTag.href = data.css;
            document.head.appendChild(styleTag);
          }

          if (data.js) {
            const scriptTag = document.createElement('script');
            scriptTag.src = data.js;
            document.body.appendChild(scriptTag);
          }
        } else {
          // Caso seja HTML puro
          const html = await response.text();
          contentDiv.innerHTML = html;
        }
      } catch (error) {
        console.error(error);
        contentDiv.innerHTML = '<p>Erro ao carregar o conteúdo.</p>';
      }
    });
  });
});