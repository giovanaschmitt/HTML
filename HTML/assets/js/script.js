/*menu*/
function toggleMenu() {
    const menu = document.getElementById("side-menu");
    if (menu.style.width === "250px") {
        menu.style.width = "0";
    } else {
        menu.style.width = "250px";
    }
}

/*Login */




/*Consulta_ambiente*/
// ======== JS DO MODAL DE AGENDAMENTO ========
document.addEventListener("DOMContentLoaded", () => {
  const abrirBtn = document.getElementById('abrirModalBtn');
  const modal = document.getElementById('modalAgendar');
  const fecharBtn = document.getElementById('closeModal');
  const form = document.getElementById('formAgendar');

  const tipoEvento = document.getElementById('tipoEvento');
  const dataEvento = document.getElementById('dataEvento');
  const horaInicio = document.getElementById('horaInicio');
  const horaFim = document.getElementById('horaFim');

  function abrirModal() {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    tipoEvento.focus();
    if (!dataEvento.value) {
      const hoje = new Date().toISOString().split('T')[0];
      dataEvento.value = hoje;
    }
  }

  function fecharModal() {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    form.reset();
  }

  abrirBtn?.addEventListener('click', abrirModal);
  fecharBtn?.addEventListener('click', fecharModal);

  window.addEventListener('click', (e) => {
    if (e.target === modal) fecharModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) fecharModal();
  });

  form.addEventListener('submit', (evt) => {
    evt.preventDefault();

    const tipo = tipoEvento.value;
    const data = dataEvento.value;
    const inicio = horaInicio.value;
    const fim = horaFim.value;

    if (!tipo || !data || !inicio || !fim) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const inicioMin = toMinutes(inicio);
    const fimMin = toMinutes(fim);
    if (fimMin <= inicioMin) {
      alert('O horário de término deve ser depois do início.');
      return;
    }

    const dataFormatada = new Date(data).toLocaleDateString('pt-BR');

    alert(`✅ Agendamento confirmado!\n\nEspaço: ${tipo}\nData: ${dataFormatada}\nHorário: ${inicio} → ${fim}`);
    fecharModal();
  });

  function toMinutes(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }
});


// ======== MODAL DE AGENDAMENTO + LISTAGEM ========
document.addEventListener("DOMContentLoaded", () => {
  const abrirBtn = document.getElementById('abrirModalBtn');
  const modal = document.getElementById('modalAgendar');
  const fecharBtn = document.getElementById('closeModal');
  const form = document.getElementById('formAgendar');
  const tipoEvento = document.getElementById('tipoEvento');
  const dataEvento = document.getElementById('dataEvento');
  const horaInicio = document.getElementById('horaInicio');
  const horaFim = document.getElementById('horaFim');

  const filtroData = document.getElementById('filtroData');
  const tabela = document.getElementById('tabelaAgendamentos').querySelector('tbody');

  // ================= MODAL ==================
  function abrirModal() {
    modal.classList.add('show');
    tipoEvento.focus();
    if (!dataEvento.value) {
      const hoje = new Date().toISOString().split('T')[0];
      dataEvento.value = hoje;
    }
  }

  function fecharModal() {
    modal.classList.remove('show');
    form.reset();
  }

  abrirBtn?.addEventListener('click', abrirModal);
  fecharBtn?.addEventListener('click', fecharModal);
  window.addEventListener('click', (e) => { if (e.target === modal) fecharModal(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharModal(); });

  // ================= AGENDAMENTO ==================
  form.addEventListener('submit', (evt) => {
    evt.preventDefault();

    const tipo = tipoEvento.value;
    const data = dataEvento.value;
    const inicio = horaInicio.value;
    const fim = horaFim.value;

    if (!tipo || !data || !inicio || !fim) {
      alert('Preencha todos os campos!');
      return;
    }

    const inicioMin = toMinutes(inicio);
    const fimMin = toMinutes(fim);
    if (fimMin <= inicioMin) {
      alert('O horário de término deve ser depois do início.');
      return;
    }

    // cria objeto do agendamento
    const novo = { tipo, data, inicio, fim };

    // salva no localStorage
    const agendamentos = getAgendamentos();
    agendamentos.push(novo);
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

    alert('✅ Agendamento salvo com sucesso!');
    fecharModal();
    atualizarTabela();
  });

  function toMinutes(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  // ================= FUNÇÕES DE LISTAGEM ==================
  function getAgendamentos() {
    return JSON.parse(localStorage.getItem('agendamentos') || '[]');
  }

  function atualizarTabela() {
    const agendamentos = getAgendamentos();
    const dataFiltro = filtroData.value;
    tabela.innerHTML = "";

    const filtrados = dataFiltro
      ? agendamentos.filter(a => a.data === dataFiltro)
      : agendamentos;

    if (filtrados.length === 0) {
      tabela.innerHTML = `<tr><td colspan="4">Nenhum agendamento encontrado.</td></tr>`;
      return;
    }

    filtrados.forEach(a => {
      const linha = document.createElement('tr');
      const dataFormatada = new Date(a.data).toLocaleDateString('pt-BR');
      linha.innerHTML = `
        <td>${a.tipo}</td>
        <td>${dataFormatada}</td>
        <td>${a.inicio}</td>
        <td>${a.fim}</td>
      `;
      tabela.appendChild(linha);
    });
  }

  filtroData.addEventListener('change', atualizarTabela);

  // inicializa tabela ao abrir
  atualizarTabela();
});
