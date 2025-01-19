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

                // const html = await response.text();
                const data = await response.json();
                contentDiv.innerHTML = data.html; // Insere o novo conteúdo no div principal
                // console.log(data.html)
                
                if (data.css) {
                    const existingStyles = Array.from(document.querySelectorAll('link[data-dynamic-style]'));
                    existingStyles.forEach(style => style.remove()); // Remove estilos antigos se necessário

                    const styleTag = document.createElement('link');
                    styleTag.setAttribute('rel', 'stylesheet');
                    styleTag.setAttribute('href', data.css);
                    styleTag.setAttribute('data-dynamic-style', ''); // Marcador para estilos dinâmicos
                    document.head.appendChild(styleTag);
                }
                
                // Adiciona o JS dinamicamente
                if (data.js) {
                    const existingscript = Array.from(document.querySelectorAll('script[data-dynamic-script]'));
                    existingscript.forEach(script => script.remove());
                    
                    const scriptTag = document.createElement('script');
                    scriptTag.setAttribute('src', data.js);
                    scriptTag.setAttribute('data-dynamic-script', ''); // Marcador para scripts dinâmicos
                    document.body.appendChild(scriptTag);
                }
            } catch (error) {
                contentDiv.innerHTML = '<p>Erro ao carregar o conteúdo.</p>';
                console.log(error);
            }
        });
    });
});
