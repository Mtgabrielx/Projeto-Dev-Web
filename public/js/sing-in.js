document.addEventListener('DOMContentLoaded', () => {
  const mudar_tema = document.getElementById('mudar-tema');
  const Estilo = document.getElementById('Estilo');

  const temas = {
      normal: 'css/padrao/sing-in-up.css',
      alternativo: 'css/alternativo/sing-in-up-alternativo.css'
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

window.onload = function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const Message = urlParams.get('msg');
  if (Message === "not_logged_in") {
      alert("Faça login para acessar");
  } else if (Message === "black_list_token") {
      alert("Token Vencido");
  } else if (Message === "invalid_token") {
      alert("Token Inválido");
  } else if (Message === "Sucess") {
      alert("Usuário Criado com sucesso");
  } else if (Message) {
      alert("Algo deu errado");
  }
};
