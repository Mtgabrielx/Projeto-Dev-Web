document.addEventListener('DOMContentLoaded', ()=>{
    const mudar_tema = document.getElementById('mudar-tema');
    // Link do tema atual
    const Estilo = document.getElementById('Estilo');

    // Arquivos de tema disponíveis
    const temas = {
        normal: 'css/padrao/sing-in-up.css',
        alternativo: 'css/alternativo/sing-in-up-alternativo.css'
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

window.onload = function () {
    const queryString = window.location.search  
    const urlParams = new URLSearchParams(queryString);
    const Message = urlParams.get('msg');
    if (Message === "not_logged_in"){
      alert("Faça login para acessar")
    }
    else if (Message === "black_list_token"){
      alert("Token Vencido")
    }
    else if (Message === "invalid_token"){
      alert("Token Inválido")
    }
    else if (Message === "Sucess"){
      alert("Usuário Criado com sucesso")
    }
    else if (Message){
      alert(Message);
    }
  };