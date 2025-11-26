/* ================================
   MENU LATERAL
================================ */
function toggleMenu() {
  const menu = document.getElementById("side-menu");
  menu.style.width = menu.style.width === "250px" ? "0" : "250px";
}

/* ================================
   USUÁRIOS DE TESTE
================================ */
const usuarios = [
  { matricula: "2024100737", senha: "1234", tipo: "comum", nome: "Giovana" },
  { matricula: "2025112501", senha: "admin", tipo: "admin", nome: "adm#giovana" }
];

/* ================================
   LOGIN
================================ */
function loginHandler(event) {
  event.preventDefault();

  const matricula = document.getElementById("matricula").value.trim();
  const senha = document.getElementById("senha").value;

  const user = usuarios.find(u => u.matricula === matricula && u.senha === senha);

  if (!user) {
    alert("Matrícula ou senha incorretas!");
    return;
  }

  sessionStorage.setItem("tipoUsuario", user.tipo);
  sessionStorage.setItem("matriculaUsuario", user.matricula);
  sessionStorage.setItem("nomeUsuario", user.nome);

  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const formLogin = document.getElementById("form-login");
  if (formLogin) formLogin.addEventListener("submit", loginHandler);
});

/* ================================
   CONTROLE DAS ABAS DO ADMIN
================================ */
document.addEventListener("DOMContentLoaded", () => {
  let tipoUsuario = sessionStorage.getItem("tipoUsuario");

  if (tipoUsuario !== "admin") {
    ["abaAdmin1", "abaAdmin2", "abaAdmin3"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
  }
});

/* ================================
   AGENDAMENTO (MODAL + LISTAGEM)
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const abrirBtn = document.getElementById("abrirModalBtn");
  const modal = document.getElementById("modalAgendar");
  const fecharBtn = document.getElementById("closeModal");
  const form = document.getElementById("formAgendar");

  const tipoEvento = document.getElementById("tipoEvento");
  const dataEvento = document.getElementById("dataEvento");
  const horaInicio = document.getElementById("horaInicio");
  const horaFim = document.getElementById("horaFim");

  const filtroData = document.getElementById("filtroData");
  const tabela = document.querySelector("#tabelaAgendamentos tbody");

  /* ================================
     CARREGAR AMBIENTES NO SELECT
  ================================= */
  function carregarAmbientesNoSelect() {
    const select = document.getElementById("tipoEvento");
    if (!select) return;

    const ambientes = JSON.parse(localStorage.getItem("ambientes") || "[]");

    select.innerHTML = `<option value="">Selecione um ambiente...</option>`;

    ambientes.forEach(nome => {
      const op = document.createElement("option");
      op.value = nome;
      op.textContent = nome;
      select.appendChild(op);
    });
  }

  // Carregar imediatamente ao entrar na página
  carregarAmbientesNoSelect();

  /* -----------------------------
     MODAL
  ----------------------------- */
  function abrirModal() {
    modal.classList.add("show");
    tipoEvento.focus();

    if (!dataEvento.value) {
      const hoje = new Date().toISOString().split("T")[0];
      dataEvento.value = hoje;
    }
  }

  function fecharModal() {
    modal.classList.remove("show");
    form.reset();
  }

  abrirBtn?.addEventListener("click", abrirModal);
  fecharBtn?.addEventListener("click", fecharModal);

  window.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) fecharModal();
  });

  /* -----------------------------
     AGENDAMENTO
  ----------------------------- */


  function toMinutes(t) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  function getAgendamentos() {
    return JSON.parse(localStorage.getItem("agendamentos") || "[]");
  }

  function salvarAgendamento(obj) {
    const lista = getAgendamentos();
    lista.push(obj);
    localStorage.setItem("agendamentos", JSON.stringify(lista));
  }

  form?.addEventListener("submit", (evt) => {
    evt.preventDefault();

    const tipo = tipoEvento.value;
    const data = dataEvento.value;
    const inicio = horaInicio.value;
    const fim = horaFim.value;

    // VERIFICAR SE A DATA ESTÁ BLOQUEADA
    const bloqueios = JSON.parse(localStorage.getItem("bloqueiosCalendario") || "[]");
    if (bloqueios.includes(data)) {
      alert("❌ Essa data está bloqueada e não pode ser agendada!");
      return;
    }

    if (!tipo || !data || !inicio || !fim) {
      alert("Preencha todos os campos!");
      return;
    }

    if (toMinutes(fim) <= toMinutes(inicio)) {
      alert("O horário de término deve ser depois do início.");
      return;
    }

    const agendamento = {
      tipo,
      data,
      inicio,
      fim,
      matricula: sessionStorage.getItem("matriculaUsuario")
    };

    salvarAgendamento(agendamento);
    fecharModal();
    atualizarTabela();

    alert("✅ Agendamento realizado com sucesso!");
  });



  /* -----------------------------
     LISTAGEM
  ----------------------------- */
  function atualizarTabela() {
    const agendamentos = getAgendamentos();
    const filtro = filtroData?.value;

    tabela.innerHTML = "";

    const filtrados = filtro ? agendamentos.filter(a => a.data === filtro) : agendamentos;

    if (filtrados.length === 0) {
      tabela.innerHTML = `<tr><td colspan="4">Nenhum agendamento encontrado.</td></tr>`;
      return;
    }

    filtrados.forEach(a => {
      const dataFormatada = new Date(a.data).toLocaleDateString("pt-BR");
      const linha = document.createElement("tr");
      linha.innerHTML = `
          <td>${a.tipo}</td>
          <td>${dataFormatada}</td>
          <td>${a.inicio}</td>
          <td>${a.fim}</td>
      `;
      tabela.appendChild(linha);
    });
  }

  filtroData?.addEventListener("change", atualizarTabela);

  if (tabela) atualizarTabela();
});

/* ================================
   TODOS OS AGENDAMENTOS
================================ */
async function carregarTodosAgendamentos() {
  const tabela = document.querySelector("#tabelaAgendamentos tbody");
  tabela.innerHTML = "";

  try {
    const resposta = await fetch("http://localhost:8080/agenda/listarTodos");
    const lista = await resposta.json();

    if (lista.length === 0) {
      document.getElementById("msg").innerText = "Nenhum agendamento encontrado.";
      return;
    }

    lista.forEach(ag => {
      const linha = document.createElement("tr");

      linha.innerHTML = `
            <td>${ag.id}</td>
            <td>${ag.matricula}</td>
            <td>${ag.nome}</td>
            <td>${ag.data}</td>
            <td>${ag.inicio}</td>
            <td>${ag.fim}</td>
            <td>
                <button class="btn-cancelar" onclick="cancelarAgendamento(${ag.id})">Cancelar</button>
            </td>
        `;
      tabela.appendChild(linha);
    });

  } catch (e) {
    console.error("Erro ao carregar agendamentos:", e);
    document.getElementById("msg").innerText = "Erro ao carregar os agendamentos.";
  }
}

carregarTodosAgendamentos();

/* ================================
   AMBIENTES (ADICIONAR / REMOVER)
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const listaEl = document.getElementById("listaAmbientes");
  const inputNovo = document.getElementById("novoAmbiente");
  const btnAdicionar = document.getElementById("btnAdicionarAmbiente");

  function getAmbientes() {
    return JSON.parse(localStorage.getItem("ambientes") || "[]");
  }

  function salvarAmbientes(lista) {
    localStorage.setItem("ambientes", JSON.stringify(lista));
  }

  function atualizarLista() {
    const ambientes = getAmbientes();
    listaEl.innerHTML = "";

    if (ambientes.length === 0) {
      listaEl.innerHTML = `<tr><td colspan="2">Nenhum ambiente cadastrado.</td></tr>`;
      return;
    }

    ambientes.forEach((nome, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
            <td>${nome}</td>
            <td>
                <button class="btnExcluir" data-index="${index}">Excluir</button>
            </td>
        `;
      listaEl.appendChild(tr);
    });
  }

  // ADICIONAR
  btnAdicionar?.addEventListener("click", () => {
    const nome = inputNovo.value.trim();

    if (!nome) {
      alert("Digite o nome do ambiente!");
      return;
    }

    const ambientes = getAmbientes();

    if (ambientes.includes(nome)) {
      alert("Este ambiente já existe!");
      return;
    }

    ambientes.push(nome);
    salvarAmbientes(ambientes);

    inputNovo.value = "";
    atualizarLista();
    carregarAmbientesNoSelect(); // <<< ATUALIZA O SELECT AUTOMATICAMENTE
  });

  // EXCLUIR
  listaEl?.addEventListener("click", (e) => {
    if (!e.target.classList.contains("btnExcluir")) return;

    const index = e.target.getAttribute("data-index");
    const ambientes = getAmbientes();

    if (confirm(`Excluir o ambiente "${ambientes[index]}"?`)) {
      ambientes.splice(index, 1);
      salvarAmbientes(ambientes);
      atualizarLista();
      carregarAmbientesNoSelect(); // <<< ATUALIZA O SELECT AUTOMATICAMENTE
    }
  });

  atualizarLista();
});

/* ================================
   BLOQUEAR CALENDÁRIO (ADMIN)
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const formBloqueio = document.getElementById("formBloqueio");
  const tabelaBloqueios = document.querySelector("#tabelaBloqueios tbody");

  if (!formBloqueio) return; // só executa nessa página

  function getBloqueios() {
    return JSON.parse(localStorage.getItem("bloqueiosCalendario") || "[]");
  }

  function salvarBloqueio(data) {
    const lista = getBloqueios();
    if (lista.includes(data)) {
      alert("Essa data já está bloqueada!");
      return false;
    }
    lista.push(data);
    localStorage.setItem("bloqueiosCalendario", JSON.stringify(lista));
    return true;
  }

  function removerBloqueio(data) {
    let lista = getBloqueios();
    lista = lista.filter(d => d !== data);
    localStorage.setItem("bloqueiosCalendario", JSON.stringify(lista));
    atualizarTabelaBloqueios();
  }

  function atualizarTabelaBloqueios() {
    const bloqueios = getBloqueios();
    tabelaBloqueios.innerHTML = "";

    if (bloqueios.length === 0) {
      tabelaBloqueios.innerHTML = `<tr><td colspan="2">Nenhuma data bloqueada.</td></tr>`;
      return;
    }

    bloqueios.forEach(data => {
      const dataFormatada = new Date(data).toLocaleDateString("pt-BR");
      const linha = document.createElement("tr");
      linha.innerHTML = `
                <td>${dataFormatada}</td>
                <td>
                    <button onclick="removerBloqueio('${data}')" class="btn-delete">Desbloquear</button>
                </td>
            `;
      tabelaBloqueios.appendChild(linha);
    });
  }

  // Evento de bloqueio
  formBloqueio.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = document.getElementById("dataBloqueio").value;
    if (!data) return alert("Selecione uma data.");

    if (salvarBloqueio(data)) {
      atualizarTabelaBloqueios();
      formBloqueio.reset();
      alert("Data bloqueada com sucesso!");
    }
  });

  atualizarTabelaBloqueios();
});

// Torna a função global para o botão funcionar
function removerBloqueio(data) {
  let lista = JSON.parse(localStorage.getItem("bloqueiosCalendario") || "[]");
  lista = lista.filter(d => d !== data);
  localStorage.setItem("bloqueiosCalendario", JSON.stringify(lista));

  // Recarrega a página para atualizar tabela
  location.reload();
}
