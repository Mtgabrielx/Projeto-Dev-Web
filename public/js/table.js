if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", initTableScript);
} else {
  initTableScript();
}

function initTableScript() {
  const table = document.querySelector("table"); // Seleciona a tabela inteira

  // Delegação de eventos: Ouve os cliques nas células de status
  table.addEventListener("click", (event) => {
    // Verifica se o clique foi na célula de status
    const statusCell = event.target.closest("td:nth-child(7)"); // A célula de status está na 7ª coluna
    if (!statusCell) return; // Sai se não for uma célula de status

    const statusText = statusCell.textContent.toLowerCase();

    updateCellStyle(statusCell, statusText);
    showStatusPopup(statusCell); // Exibe o modal para mudar o status
  });

  // Função para aplicar estilos com base no status
  function updateCellStyle(cell, statusText) {
    if (statusText.includes("em andamento")) {
      cell.style.backgroundColor = "#fff4e5"; // Fundo laranja claro
      cell.style.color = "#ff8c00"; // Letra laranja escura
    } else if (statusText.includes("não iniciado")) {
      cell.style.backgroundColor = "#e5f0ff"; // Fundo azul claro
      cell.style.color = "#0056b3"; // Letra azul escura
    } else if (statusText.includes("atrasado")) {
      cell.style.backgroundColor = "#ffe5e5"; // Fundo vermelho claro
      cell.style.color = "#b30000"; // Letra vermelha escura
    } else if (statusText.includes("finalizado no prazo")) {
      cell.style.backgroundColor = "#e5ffe5"; // Fundo verde claro
      cell.style.color = "#007f00"; // Letra verde escura
    } else if (statusText.includes("finalizado em atraso")) {
      cell.style.backgroundColor = "#ffe5f0"; // Fundo rosa claro
      cell.style.color = "#800040"; // Letra vinho
    }
  }

  // Função para exibir o pop-up de status
  function showStatusPopup(cell) {
    const modal = document.createElement("div");
    modal.classList.add("status-modal");
    modal.innerHTML = `
      <div class="status-modal-content">
        <p>Selecione o novo status:</p>
        <button data-status="Em andamento">Em andamento</button>
        <button data-status="Não iniciado">Não iniciado</button>
        <button data-status="Finalizado no prazo">Finalizado no prazo</button>
        <button data-status="Atrasado">Atrasado</button>
        <button data-status="Finalizado em atraso">Finalizado em atraso</button>
        <button class="close-modal">Cancelar</button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelectorAll("button[data-status]").forEach(button => {
      button.addEventListener("click", () => {
        const newStatus = button.getAttribute("data-status");
        cell.textContent = newStatus;
        updateCellStyle(cell, newStatus.toLowerCase());
        document.body.removeChild(modal);
      });
    });

    modal.querySelector(".close-modal").addEventListener("click", () => {
      document.body.removeChild(modal);
    });
  }
}
