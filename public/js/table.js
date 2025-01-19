if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTableScript);
} else {
  initTableScript();
}

function initTableScript() {
  const table = document.querySelector("table");

  table.addEventListener("click", (event) => {
    const statusCell = event.target.closest("td:nth-child(7)");
    if (!statusCell) return;

    const statusText = statusCell.textContent.toLowerCase();

    updateCellClass(statusCell, statusText);
    showStatusPopup(statusCell);
  });

  function updateCellClass(cell, statusText) {
    cell.className = ""; 

    if (statusText.includes("em andamento")) {
      cell.classList.add("em-andamento");
    } else if (statusText.includes("não iniciado")) {
      cell.classList.add("nao-iniciado");
    } else if (statusText.includes("atrasado")) {
      cell.classList.add("atrasado");
    } else if (statusText.includes("finalizado no prazo")) {
      cell.classList.add("finalizado-no-prazo");
    } else if (statusText.includes("finalizado em atraso")) {
      cell.classList.add("finalizado-em-atraso");
    }
  }

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

    modal.querySelectorAll("button[data-status]").forEach((button) => {
      button.addEventListener("click", () => {
        const newStatus = button.getAttribute("data-status");
        cell.textContent = newStatus;
        updateCellClass(cell, newStatus.toLowerCase());
        document.body.removeChild(modal);
      });
    });

    modal.querySelector(".close-modal").addEventListener("click", () => {
      document.body.removeChild(modal);
    });
  }
}
