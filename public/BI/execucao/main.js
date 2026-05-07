    /*
      BI TV - versão melhorada
      - Sem scroll
      - Gráficos em CSS/SVG, sem biblioteca externa
      - Animação de cards, ticker, ranking e gráfico
      - Troca automática de mês para ficar parado em TV
    */

    const CONFIG = {
      endpoint: "/resumo",
      acao: "gerarResumoBI",
      autoTrocarMes: false,
      segundosTrocaMes: 35,
      atualizarDadosAutomatico: true,
      segundosAtualizacaoDados: 300,
      segundosAlternanciaRanking: 12,
      maxRankingGeral: 4,
      maxRankingPorTipo: 3
    };

    let dadosBI = [];
    let mesAtualSelecionado = "";
    let timerTrocaMes = null;
    let timerAtualizacao = null;
    let timerAlternanciaRanking = null;
    let modoRanking = "top";

    /*
      CONTROLE DE/PARA DAS EQUIPES
      Coloque aqui exatamente as equipes que você quer classificar.
      O código normaliza maiúsculas, minúsculas, espaços e acentos.
    */

    const equipesPesadas = [
"ARAO008M",
"FIRO001M",
"FIRO002M",
"FIRO003M",
"FIRO009M",
"FIRO010M",
"FIRO011M",
"FIRO012M",
"FIRO017M",
"ITAO004M",
"ITAO005M",
"ITAO006M",
"ITAO007M",
"ITAO015M",
"ITAO016M",
"JUSO013M",
"JUSO014M"
    ];

    const equipesLeves = [
"ANIE001M",
"ANIE002M",
"ANIE003T",
"ANIE004M",
"ARAE001M",
"ARAE001T",
"ARAE002M",
"ARAE002T",
"ARAE003M",
"ARAE003T",
"ARAL021M",
"ARUE001M",
"ARUE002T",
"BRIE001M",
"BRIE002M",
"BRIE003T",
"FAIE00",
"FAIE001M",
"FAIE001T",
"FAZE001M",
"FAZE002T",
"FIRC001M",
"FIRC004M",
"FIRC005M",
"FIRE001M",
"FIRE002T",
"FIRE003M",
"FIRE004T",
"FIRE005M",
"FIRE005N",
"FIRE006M",
"FIRE007M",
"FIRE012M",
"FIRL001M",
"FIRL002M",
"FIRL020M",
"FIRP002M",
"FIRP003M",
"FIRT001M",
"FIRT002M",
"GOIE001M",
"GOIE001T",
"GOIE002M",
"GOIE002T",
"GOIE003M",
"GOIE003T",
"GOIE004M",
"GOIE004T",
"GOIL020M",
"GOIL021M",
"INDE001M",
"INDE002M",
"INDE003T",
"INDE004M",
"IPUE001M",
"IPUE001T",
"IPUE002M",
"IPUE002T",
"IPUE003M",
"IPUE003T",
"IPUL020M",
"IPUL021M",
"ITAE001M",
"ITAE001T",
"ITAE002M",
"ITAE002T",
"ITAE003M",
"ITAE003T",
"ITAL020M",
"ITAL021M",
"ITAP005M",
"ITAP006M",
"ITIE001M",
"ITIE001T",
"JUSC025T",
"JUSE015M",
"JUSE050M",
"JUSE051M",
"JUSE052M",
"JUSE053T",
"JUSE055T",
"JUSE056M",
"JUSL020M",
"JUSP004M",
"MATE001M",
"MATE002T",
"MONF001M",
"MONF002M",
"MONF003M",
"MONF004M",
"MONF005M",
"MONF006M",
"MONF007M",
"MONF008M",
"MONF009M",
"MONF010M",
"MONF011M",
"MOZE001M",
"MOZE001T",
"PALC025M",
"PALE001M",
"PALE002M",
"PALE003T",
"PALE004M",
"PARE001M",
"PARE002M",
"PARE003T",
"SANC025M",
"SANE001M",
"SANE001T",
"SANE002M",
"SANE003M",
"SANE004T",
"SANL020M",
"TAPE001M",
"TAPE002T"
    ];

    const equipesLinhaViva = [
"ARAV002M",
"FIRV004M",
"FIRV005M",
"FIRV007M",
"FIRV008M",
"FIRV009M",
"ITAV006M",
"ITAV010M",
"ITAV011M",
"JUSV001M"
    ];

    const CORES_TIPO = {
      "Pesada": "var(--blue)",
      "Leve": "var(--green)",
      "Linha Viva": "var(--purple)",
      "Não classificada": "rgba(100, 116, 139, 0.72)"
    };

    const HEX_TIPO = {
      "Pesada": "#38bdf8",
      "Leve": "#22c55e",
      "Linha Viva": "#a78bfa",
      "Não classificada": "#64748b"
    };

    const $ = seletor => document.querySelector(seletor);

    function normalizarTexto(texto) {
      return String(texto || "")
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }

    function obterTipoEquipe(equipe, tipoOriginal) {
      const nomeEquipe = normalizarTexto(equipe);

      const pesadas = equipesPesadas.map(normalizarTexto);
      const leves = equipesLeves.map(normalizarTexto);
      const linhaViva = equipesLinhaViva.map(normalizarTexto);

      if (pesadas.includes(nomeEquipe)) return "Pesada";
      if (leves.includes(nomeEquipe)) return "Leve";
      if (linhaViva.includes(nomeEquipe)) return "Linha Viva";

      const tipoBanco = normalizarTexto(tipoOriginal);

      if (tipoBanco.includes("PESADA")) return "Pesada";
      if (tipoBanco.includes("LEVE")) return "Leve";
      if (tipoBanco.includes("LINHA") || tipoBanco.includes("VIVA")) return "Linha Viva";

      return "Não classificada";
    }

    function moeda(valor) {
      return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 2
      });
    }

    function numero(valor) {
      return Number(valor || 0).toLocaleString("pt-BR");
    }

    function percentual(valor) {
      return `${Number(valor || 0).toLocaleString("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      })}%`;
    }

    function escaparHTML(valor) {
      return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function setStatus(texto, tipo = "online") {
      const status = $("#statusSistema");
      const dot = $("#statusDot");

      if (status) status.textContent = texto;

      if (dot) {
        if (tipo === "erro") {
          dot.style.background = "var(--red)";
          dot.style.boxShadow = "0 0 0 7px rgba(251, 113, 133, 0.12), 0 0 18px rgba(251, 113, 133, 0.45)";
        } else if (tipo === "carregando") {
          dot.style.background = "var(--yellow)";
          dot.style.boxShadow = "0 0 0 7px rgba(245, 158, 11, 0.12), 0 0 18px rgba(245, 158, 11, 0.45)";
        } else {
          dot.style.background = "var(--green)";
          dot.style.boxShadow = "0 0 0 7px rgba(34, 197, 94, 0.12), 0 0 18px rgba(34, 197, 94, 0.45)";
        }
      }
    }

    function mostrarLoading(mostrar) {
      const overlay = $("#loadingOverlay");
      if (!overlay) return;
      overlay.classList.toggle("hide", !mostrar);
    }

    async function carregarBI({ silencioso = false } = {}) {
      try {
        if (!silencioso) mostrarLoading(true);
        setStatus("Atualizando...", "carregando");

        const resposta = await fetch(CONFIG.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            acao: CONFIG.acao
          })
        });

        if (!resposta.ok) {
          throw new Error(`HTTP ${resposta.status}`);
        }

        const json = await resposta.json();

        if (!json.sucesso) {
          throw new Error(json.erro || "Erro ao gerar resumo");
        }

        dadosBI = Array.isArray(json.dados) ? json.dados : [];

        if (!dadosBI.length) {
          renderizarSemDados("Nenhum dado encontrado para exibir.");
          return;
        }

        carregarFiltroMes();

        const existeMesAnterior = dadosBI.some(item => item.mes === mesAtualSelecionado);
        const mesParaRenderizar = existeMesAnterior ? mesAtualSelecionado : ordenarMesesDesc(dadosBI)[0].mes;

        renderizarMes(mesParaRenderizar);
        iniciarRotinasAutomaticas();

        setStatus("Online", "online");
      } catch (error) {
        console.error("Erro ao carregar BI:", error);
        setStatus("Erro nos dados", "erro");
        renderizarErro(error);
      } finally {
        mostrarLoading(false);
      }
    }

    function carregarFiltroMes() {
      const select = $("#filtroMes");
      if (!select) return;

      const meses = ordenarMesesDesc(dadosBI);

      select.innerHTML = meses.map(item => `
        <option value="${escaparHTML(item.mes)}">${escaparHTML(formatarMes(item.mes))}</option>
      `).join("");

      select.onchange = () => {
        renderizarMes(select.value);
        reiniciarTrocaAutomatica();
      };
    }

    function ordenarMesesDesc(lista) {
      return [...lista].sort((a, b) => String(b.mes || "").localeCompare(String(a.mes || "")));
    }

    function ordenarMesesAsc(lista) {
      return [...lista].sort((a, b) => String(a.mes || "").localeCompare(String(b.mes || "")));
    }

    function renderizarMes(mesSelecionado) {
      const mes = dadosBI.find(item => item.mes === mesSelecionado);
      if (!mes) return;

      mesAtualSelecionado = mesSelecionado;

      const select = $("#filtroMes");
      if (select) select.value = mesSelecionado;

      const equipesClassificadas = classificarEquipes(mes.rankingGeralEquipes || []);
      const cards = calcularCardsDoMes(equipesClassificadas);
      const resumoTipo = calcularResumoPorTipo(equipesClassificadas);
      const comparativo = calcularComparativoMensal(mesSelecionado, cards.producaoTotal);

      animarTextoNumerico("producaoTotal", cards.producaoTotal, moeda);
      animarTextoNumerico("mediaProjeto", cards.mediaPorProjeto, moeda);
      animarTextoNumerico("mediaServico", cards.mediaPorServico, moeda);
      animarTextoNumerico("qtdServicos", cards.quantidadeServicos, numero);
      animarTextoNumerico("qtdProjetos", cards.quantidadeProjetos, numero);
      animarTextoNumerico("qtdEquipes", cards.quantidadeEquipes, numero);

      setTexto("subtitulo", `${formatarMes(mesSelecionado)} • ${numero(cards.quantidadeEquipes)} equipes • atualizado em tempo real`);
      setTexto("deltaProducao", comparativo.texto);
      setTexto("badgeEvolucao", `${ordenarMesesAsc(dadosBI).length} meses`);
      setTexto("badgeTop", `Top ${Math.min(CONFIG.maxRankingGeral, equipesClassificadas.length)}`);
      setTexto("badgeRankingTipo", `${Object.keys(resumoTipo).length} tipos`);

      renderizarTicker({
        mes,
        cards,
        equipes: equipesClassificadas
      });

      renderizarGraficoEvolucao();
      renderizarDonutTipos(resumoTipo, cards.producaoTotal);
      renderizarTopEquipes(equipesClassificadas);
      renderizarRankingPorTipo(equipesClassificadas, resumoTipo, cards.producaoTotal);
    }

    function classificarEquipes(equipes = []) {
      return equipes.map(eq => {
        const equipe = eq.equipe || "SEM EQUIPE";
        const tipoEquipe = obterTipoEquipe(equipe, eq.tipoEquipe);

        return {
          ...eq,
          equipe,
          tipoEquipe,
          producaoTotal: Number(eq.producaoTotal || 0),
          quantidadeServicos: Number(eq.quantidadeServicos || 0),
          quantidadeProjetos: Number(eq.quantidadeProjetos || 0)
        };
      });
    }

    function calcularCardsDoMes(equipes = []) {
      const producaoTotal = equipes.reduce((total, eq) => total + Number(eq.producaoTotal || 0), 0);
      const quantidadeServicos = equipes.reduce((total, eq) => total + Number(eq.quantidadeServicos || 0), 0);
      const quantidadeProjetos = equipes.reduce((total, eq) => total + Number(eq.quantidadeProjetos || 0), 0);
      const quantidadeEquipes = equipes.length;

      return {
        producaoTotal,
        quantidadeServicos,
        quantidadeProjetos,
        quantidadeEquipes,
        mediaPorProjeto: quantidadeProjetos > 0 ? producaoTotal / quantidadeProjetos : 0,
        mediaPorServico: quantidadeServicos > 0 ? producaoTotal / quantidadeServicos : 0
      };
    }

    function calcularResumoPorTipo(equipes = []) {
      const grupos = {
        "Pesada": { tipo: "Pesada", total: 0, equipes: 0, servicos: 0, projetos: 0 },
        "Leve": { tipo: "Leve", total: 0, equipes: 0, servicos: 0, projetos: 0 },
        "Linha Viva": { tipo: "Linha Viva", total: 0, equipes: 0, servicos: 0, projetos: 0 },
        "Não classificada": { tipo: "Não classificada", total: 0, equipes: 0, servicos: 0, projetos: 0 }
      };

      equipes.forEach(eq => {
        const tipo = eq.tipoEquipe || "Não classificada";

        if (!grupos[tipo]) {
          grupos[tipo] = { tipo, total: 0, equipes: 0, servicos: 0, projetos: 0 };
        }

        grupos[tipo].total += Number(eq.producaoTotal || 0);
        grupos[tipo].equipes += 1;
        grupos[tipo].servicos += Number(eq.quantidadeServicos || 0);
        grupos[tipo].projetos += Number(eq.quantidadeProjetos || 0);
      });

      return grupos;
    }

    function calcularComparativoMensal(mesSelecionado, totalAtual) {
      const meses = ordenarMesesAsc(dadosBI);
      const indice = meses.findIndex(item => item.mes === mesSelecionado);

      if (indice <= 0) {
        return { valor: 0, texto: "Primeiro mês da série" };
      }

      const mesAnterior = meses[indice - 1];
      const equipesAnterior = classificarEquipes(mesAnterior.rankingGeralEquipes || []);
      const totalAnterior = calcularCardsDoMes(equipesAnterior).producaoTotal;

      if (!totalAnterior) {
        return { valor: 0, texto: "Sem base no mês anterior" };
      }

      const variacao = ((totalAtual - totalAnterior) / totalAnterior) * 100;
      const sinal = variacao >= 0 ? "▲" : "▼";

      return {
        valor: variacao,
        texto: `${sinal} ${percentual(Math.abs(variacao))} vs. ${formatarMesCurto(mesAnterior.mes)}`
      };
    }

    function renderizarGraficoEvolucao() {
      const container = $("#chartEvolucao");
      if (!container) return;

      const meses = ordenarMesesAsc(dadosBI).map(item => {
        const equipes = classificarEquipes(item.rankingGeralEquipes || []);
        const cards = calcularCardsDoMes(equipes);

        return {
          mes: item.mes,
          total: cards.producaoTotal
        };
      });

      if (!meses.length) {
        container.innerHTML = `<div class="empty-state">Sem dados para o gráfico.</div>`;
        return;
      }

      const width = 680;
      const height = 250;
      const padding = { top: 26, right: 30, bottom: 42, left: 54 };
      const plotW = width - padding.left - padding.right;
      const plotH = height - padding.top - padding.bottom;

      const max = Math.max(...meses.map(item => item.total), 1);
      const min = Math.min(...meses.map(item => item.total), 0);
      const range = Math.max(max - min, 1);

      const pontos = meses.map((item, index) => {
        const x = meses.length === 1
          ? padding.left + plotW / 2
          : padding.left + (index / (meses.length - 1)) * plotW;

        const y = padding.top + plotH - ((item.total - min) / range) * plotH;

        return { ...item, x, y };
      });

      const linha = pontos.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
      const area = `${linha} L ${pontos[pontos.length - 1].x.toFixed(1)} ${padding.top + plotH} L ${pontos[0].x.toFixed(1)} ${padding.top + plotH} Z`;

      const linhasGrade = [0, 0.25, 0.5, 0.75, 1].map(fator => {
        const y = padding.top + plotH * fator;
        return `<line class="chart-grid-line" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" />`;
      }).join("");

      const labelsEixo = pontos.map((p, i) => {
        const deveExibir = pontos.length <= 8 || i === 0 || i === pontos.length - 1 || i % Math.ceil(pontos.length / 6) === 0;
        if (!deveExibir) return "";

        return `
          <text class="axis-label" x="${p.x}" y="${height - 14}" text-anchor="middle">${escaparHTML(formatarMesCurto(p.mes))}</text>
        `;
      }).join("");

      const labelsPontos = pontos.map((p, i) => {
        const deveExibir = pontos.length <= 5 || i === pontos.length - 1 || p.mes === mesAtualSelecionado;
        if (!deveExibir) return "";

        const yLabel = Math.max(16, p.y - 12);
        return `<text class="chart-label" x="${p.x}" y="${yLabel}" text-anchor="middle">${escaparHTML(formatarMoedaCompacta(p.total))}</text>`;
      }).join("");

      const dots = pontos.map(p => `
        <circle class="chart-dot" cx="${p.x}" cy="${p.y}" r="${p.mes === mesAtualSelecionado ? 6 : 4}" />
      `).join("");

      container.innerHTML = `
        <svg class="evolution-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="Gráfico de evolução mensal">
          <defs>
            <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.38" />
              <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.02" />
            </linearGradient>
          </defs>

          ${linhasGrade}
          <path class="chart-area-fill" d="${area}" />
          <path class="chart-line" d="${linha}" />
          ${dots}
          ${labelsPontos}
          ${labelsEixo}
        </svg>
      `;
    }

    function renderizarDonutTipos(resumoTipo = {}, totalGeral = 0) {
      const donut = $("#donutChart");
      const legend = $("#legendTipos");
      const center = $("#donutCenter");
      const badge = $("#badgeTipo");

      if (!donut || !legend || !center) return;

      const itens = Object.values(resumoTipo)
        .filter(item => item.total > 0 || item.equipes > 0)
        .sort((a, b) => b.total - a.total);

      if (!itens.length || !totalGeral) {
        donut.style.background = "conic-gradient(rgba(100, 116, 139, 0.4) 0 100%)";
        center.innerHTML = `0%<small>sem dados</small>`;
        legend.innerHTML = `<div class="empty-state">Sem produção por tipo.</div>`;
        setTexto("badgeTipo", "0%");
        return;
      }

      let acumulado = 0;
      const partes = itens.map(item => {
        const inicio = acumulado;
        const fatia = (item.total / totalGeral) * 100;
        const fim = acumulado + fatia;
        acumulado = fim;

        return `${HEX_TIPO[item.tipo] || "#64748b"} ${inicio.toFixed(2)}% ${fim.toFixed(2)}%`;
      });

      donut.style.background = `conic-gradient(${partes.join(", ")})`;

      const maior = itens[0];
      const maiorPercentual = (maior.total / totalGeral) * 100;

      center.innerHTML = `
        ${percentual(maiorPercentual)}
        <small>${escaparHTML(maior.tipo)}</small>
      `;

      if (badge) badge.textContent = `${escaparHTML(maior.tipo)} lidera`;

      legend.innerHTML = itens.map(item => {
        const perc = totalGeral ? (item.total / totalGeral) * 100 : 0;

        return `
          <div class="legend-item">
            <span class="legend-color" style="background:${HEX_TIPO[item.tipo] || "#64748b"}"></span>
            <span class="legend-title">${escaparHTML(item.tipo)}</span>
            <span class="legend-value">${percentual(perc)}</span>
          </div>
        `;
      }).join("");
    }

    function renderizarTopEquipes(equipes = []) {
      const container = $("#topEquipes");
      if (!container) return;

      container.classList.remove("modo-menores", "animando-troca");
      void container.offsetWidth;
      container.classList.add("animando-troca");
      if (modoRanking === "bottom") container.classList.add("modo-menores");

      const baseOrdenada = [...equipes]
        .filter(item => Number(item.producaoTotal || 0) > 0)
        .sort((a, b) => modoRanking === "top"
          ? b.producaoTotal - a.producaoTotal
          : a.producaoTotal - b.producaoTotal
        );

      const lista = baseOrdenada.slice(0, CONFIG.maxRankingGeral);

      const titulo = modoRanking === "top" ? "Maiores equipes" : "Menores equipes";
      const dica = modoRanking === "top"
        ? "Top produções do mês"
        : "Equipes com menor produção positiva no mês";

      setTexto("tituloTopEquipes", titulo);
      setTexto("hintTopEquipes", dica);
      setTexto("badgeTop", modoRanking === "top" ? `Top ${lista.length}` : `Menores ${lista.length}`);

      if (!lista.length) {
        container.innerHTML = `<div class="empty-state">Nenhuma equipe encontrada.</div>`;
        return;
      }

      const maior = Math.max(...lista.map(item => item.producaoTotal), 1);

      container.innerHTML = lista.map((item, index) => montarLinhaRanking(item, index, maior)).join("");
    }

    function montarLinhaRanking(item, index, maior) {
      const largura = Math.max(3, (Number(item.producaoTotal || 0) / maior) * 100);

      return `
        <div class="rank-row" style="animation-delay:${index * 0.05}s">
          <div class="rank-pos">${index + 1}</div>

          <div class="rank-info">
            <strong title="${escaparHTML(item.equipe)}">${escaparHTML(item.equipe || "SEM EQUIPE")}</strong>
            <small>${escaparHTML(item.tipoEquipe || "Não classificada")} • ${numero(item.quantidadeServicos)} serv. • ${numero(item.quantidadeProjetos)} proj.</small>
          </div>

          <div class="rank-value">${moeda(item.producaoTotal)}</div>

          <div class="bar-track">
            <div class="bar-fill" style="--w:${largura.toFixed(2)}%"></div>
          </div>
        </div>
      `;
    }

    function renderizarRankingPorTipo(equipes = [], resumoTipo = {}, totalGeral = 0) {
      const container = $("#rankingPorTipo");
      if (!container) return;

      if (!equipes.length) {
        container.innerHTML = `<div class="empty-state">Nenhuma equipe encontrada.</div>`;
        return;
      }

      const tiposOrdem = ["Pesada", "Leve", "Linha Viva", "Não classificada"];

      const maiorTipo = Math.max(...Object.values(resumoTipo).map(item => item.total || 0), 1);

      container.classList.remove("modo-menores", "animando-troca");
      void container.offsetWidth;
      container.classList.add("animando-troca");
      if (modoRanking === "bottom") container.classList.add("modo-menores");

      setTexto("tituloRankingTipo", modoRanking === "top" ? "Ranking por classificação" : "Menores por classificação");
      setTexto("hintRankingTipo", modoRanking === "top"
        ? "Maiores equipes por tipo, alternando automaticamente"
        : "Menores equipes positivas por tipo, alternando automaticamente"
      );

      container.innerHTML = tiposOrdem.map((tipo, indexTipo) => {
        const equipesTipo = equipes
          .filter(eq => (eq.tipoEquipe || "Não classificada") === tipo)
          .filter(eq => modoRanking === "top" || Number(eq.producaoTotal || 0) > 0)
          .sort((a, b) => modoRanking === "top"
            ? b.producaoTotal - a.producaoTotal
            : a.producaoTotal - b.producaoTotal
          );

        const resumo = resumoTipo[tipo] || { total: 0, equipes: 0, servicos: 0, projetos: 0 };
        const percentualTipo = totalGeral ? (resumo.total / totalGeral) * 100 : 0;
        const progresso = Math.max(0, (resumo.total / maiorTipo) * 100);
        const top = equipesTipo.slice(0, CONFIG.maxRankingPorTipo);
        const rotuloModo = modoRanking === "top" ? "Top" : "Menores";

        return `
          <div class="type-card" style="animation-delay:${indexTipo * 0.06}s">
            <div class="type-head">
              <div class="type-title">
                <h3>${escaparHTML(tipo)}</h3>
                <small><span class="troca-label">${rotuloModo} • ${numero(resumo.equipes)} equipes • ${percentual(percentualTipo)}</span></small>
              </div>

              <div class="type-total">${moeda(resumo.total)}</div>
            </div>

            <div class="mini-progress">
              <span style="--w:${progresso.toFixed(2)}%; background:linear-gradient(90deg, ${HEX_TIPO[tipo] || "#64748b"}, rgba(255,255,255,0.5));"></span>
            </div>

            <div class="mini-list">
              ${top.length ? top.map((item, index) => montarMiniLinha(item, index)).join("") : `
                <div class="empty-state">Sem equipes neste tipo.</div>
              `}
            </div>
          </div>
        `;
      }).join("");
    }

    function montarMiniLinha(item, index) {
      return `
        <div class="mini-row">
          <span class="mini-pos">${index + 1}</span>

          <span class="mini-name">
            <strong title="${escaparHTML(item.equipe)}">${escaparHTML(item.equipe || "SEM EQUIPE")}</strong>
            <small>${numero(item.quantidadeServicos)} serv. • ${numero(item.quantidadeProjetos)} proj.</small>
          </span>

          <span class="mini-value">${formatarMoedaCompacta(item.producaoTotal)}</span>
        </div>
      `;
    }

    function renderizarTicker({ mes, cards, equipes }) {
      const ticker = $("#ticker");
      if (!ticker) return;

      const melhores = [...equipes]
        .sort((a, b) => b.producaoTotal - a.producaoTotal)
        .slice(0, 5);

      const pontoAtencao = [...equipes]
        .filter(e => Number(e.producaoTotal) > 0)
        .sort((a, b) => a.producaoTotal - b.producaoTotal)[0];

      const itens = [
        tickerItem("📅", "Mês", formatarMes(mes.mes), "ticker-info"),
        tickerItem("💰", "Produção", moeda(cards.producaoTotal), "ticker-value"),
        tickerItem("📁", "Projetos", numero(cards.quantidadeProjetos), "ticker-info"),
        tickerItem("🧰", "Serviços", numero(cards.quantidadeServicos), "ticker-info"),
        tickerItem("👷", "Equipes", numero(cards.quantidadeEquipes), "ticker-info"),
        ...melhores.map(eq => tickerItem("🏆", `${eq.equipe} • ${eq.tipoEquipe}`, moeda(eq.producaoTotal), "ticker-value")),
        pontoAtencao ? tickerItem("⚠️", `${pontoAtencao.equipe} • menor produção`, moeda(pontoAtencao.producaoTotal), "ticker-danger") : ""
      ].filter(Boolean);

      const conteudo = itens.join("");
      ticker.innerHTML = conteudo + conteudo;
    }

    function tickerItem(icone, label, valor, classe) {
      return `
        <div class="ticker-item">
          <span>${icone}</span>
          <span class="ticker-label">${escaparHTML(label)}:</span>
          <span class="${classe}">${escaparHTML(valor)}</span>
        </div>
      `;
    }

    function renderizarSemDados(mensagem) {
      setStatus("Sem dados", "erro");

      const idsTexto = ["producaoTotal", "mediaProjeto", "mediaServico", "qtdServicos", "qtdProjetos", "qtdEquipes"];
      idsTexto.forEach(id => setTexto(id, id.startsWith("qtd") ? "0" : "R$ 0,00"));

      $("#chartEvolucao").innerHTML = `<div class="empty-state">${escaparHTML(mensagem)}</div>`;
      $("#legendTipos").innerHTML = `<div class="empty-state">${escaparHTML(mensagem)}</div>`;
      $("#topEquipes").innerHTML = `<div class="empty-state">${escaparHTML(mensagem)}</div>`;
      $("#rankingPorTipo").innerHTML = `<div class="empty-state">${escaparHTML(mensagem)}</div>`;
      $("#ticker").innerHTML = `<div class="ticker-item"><span class="ticker-label">${escaparHTML(mensagem)}</span></div>`;
    }

    function renderizarErro(error) {
      const mensagem = `Erro ao carregar dados: ${error.message || "verifique o backend"}`;
      renderizarSemDados(mensagem);
    }

    function animarTextoNumerico(id, valorFinal, formatador) {
      const elemento = document.getElementById(id);
      if (!elemento) return;

      const inicio = 0;
      const fim = Number(valorFinal || 0);
      const duracao = 650;
      const inicioTempo = performance.now();

      function atualizar(agora) {
        const progresso = Math.min((agora - inicioTempo) / duracao, 1);
        const suavizado = 1 - Math.pow(1 - progresso, 3);
        const valor = inicio + (fim - inicio) * suavizado;

        elemento.textContent = formatador(valor);

        if (progresso < 1) {
          requestAnimationFrame(atualizar);
        }
      }

      requestAnimationFrame(atualizar);
    }

    function setTexto(id, valor) {
      const elemento = document.getElementById(id);
      if (elemento) elemento.textContent = valor;
    }

    function formatarMes(mes) {
      if (!mes) return "";

      const [ano, numeroMes] = String(mes).split("-");
      const nomes = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];

      const indice = Number(numeroMes) - 1;
      return `${nomes[indice] || numeroMes} / ${ano}`;
    }

    function formatarMesCurto(mes) {
      if (!mes) return "";

      const [ano, numeroMes] = String(mes).split("-");
      const nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const indice = Number(numeroMes) - 1;

      return `${nomes[indice] || numeroMes}/${String(ano || "").slice(-2)}`;
    }

    function formatarMoedaCompacta(valor) {
      const numeroValor = Number(valor || 0);

      if (Math.abs(numeroValor) >= 1_000_000) {
        return `R$ ${(numeroValor / 1_000_000).toLocaleString("pt-BR", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        })} mi`;
      }

      if (Math.abs(numeroValor) >= 1_000) {
        return `R$ ${(numeroValor / 1_000).toLocaleString("pt-BR", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        })} mil`;
      }

      return moeda(numeroValor);
    }

    function atualizarRelogio() {
      const relogio = $("#relogio");
      if (!relogio) return;

      const agora = new Date();
      relogio.textContent = agora.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    }



    function obterResumoMesAtual() {
      const mes = dadosBI.find(item => item.mes === mesAtualSelecionado);
      if (!mes) return null;

      const equipes = classificarEquipes(mes.rankingGeralEquipes || []);
      const cards = calcularCardsDoMes(equipes);
      const resumoTipo = calcularResumoPorTipo(equipes);

      return { mes, equipes, cards, resumoTipo };
    }

    function alternarRankings() {
      const resumo = obterResumoMesAtual();
      if (!resumo) return;

      modoRanking = modoRanking === "top" ? "bottom" : "top";

      renderizarTopEquipes(resumo.equipes);
      renderizarRankingPorTipo(resumo.equipes, resumo.resumoTipo, resumo.cards.producaoTotal);
    }

    function iniciarRotinasAutomaticas() {
      reiniciarTrocaAutomatica();

      if (CONFIG.atualizarDadosAutomatico && !timerAtualizacao) {
        timerAtualizacao = setInterval(() => {
          carregarBI({ silencioso: true });
        }, CONFIG.segundosAtualizacaoDados * 1000);
      }

      if (!timerAlternanciaRanking) {
        timerAlternanciaRanking = setInterval(() => {
          alternarRankings();
        }, CONFIG.segundosAlternanciaRanking * 1000);
      }
    }

    function reiniciarTrocaAutomatica() {
      if (timerTrocaMes) {
        clearInterval(timerTrocaMes);
        timerTrocaMes = null;
      }

      if (!CONFIG.autoTrocarMes || dadosBI.length <= 1) return;

      timerTrocaMes = setInterval(() => {
        const meses = ordenarMesesDesc(dadosBI);
        const indiceAtual = meses.findIndex(item => item.mes === mesAtualSelecionado);
        const proximoIndice = indiceAtual >= 0 ? (indiceAtual + 1) % meses.length : 0;
        renderizarMes(meses[proximoIndice].mes);
      }, CONFIG.segundosTrocaMes * 1000);
    }

    atualizarRelogio();
    setInterval(atualizarRelogio, 1000);
    carregarBI();