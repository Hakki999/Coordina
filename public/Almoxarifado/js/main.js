// =============================================
// VARIÁVEIS GLOBAIS E INICIALIZAÇÃO
// =============================================

// Elementos da interface
const optionNav = document.querySelectorAll(".optionNav");
const displayMain = document.getElementById("displayMain");
const menuSelect = document.querySelectorAll(".menuSelect");

// Dados da aplicação
let materiais, orcados = undefined;

// =============================================
// INICIALIZAÇÃO E EVENT LISTENERS
// =============================================

/**
 * Inicializa todos os event listeners da aplicação
 */
function initializeEventListeners() {
    // Navegação principal
    optionNav.forEach(option => {
        option.addEventListener("click", handleNavOptionClick);
    });

    // Menu de seleção
    menuSelect.forEach(ms => {
        ms.addEventListener('click', handleMenuSelectClick);
    });

    // Fechar modais
    document.querySelectorAll(".closeFather").forEach(close => {
        close.addEventListener("click", handleCloseModal);
    });

    // Prevenir submit padrão
    document.querySelector(".unSubmit").addEventListener("submit", preventDefaultSubmit);
    
    // Menu mobile
    initMobileMenu();
}

/**
 * Manipula clique nas opções de navegação
 */
function handleNavOptionClick(evt) {
    optionNav.forEach(opt => {
        opt.classList = "optionNav closeOption";
    });
    evt.currentTarget.classList = "optionNav openOption";
}

/**
 * Manipula clique no menu de seleção
 */
function handleMenuSelectClick(evt) {
    menuSelect.forEach(m => {
        m.classList.remove("menuSelected");
    });
    evt.target.classList.add("menuSelected");
}

/**
 * Fecha modais/popups
 */
function handleCloseModal(evt) {
    evt.target.parentElement.style.display = "none";
}

/**
 * Previne comportamento padrão do submit
 */
function preventDefaultSubmit(evt) {
    evt.preventDefault();
}

// =============================================
// GERENCIAMENTO DE MATERIAIS
// =============================================

/**
 * Renderiza a tela de solicitações de materiais
 */
function renderSolicitacoes() {
    const unicos = materiais.filter(
        (obj, index, self) =>
            index === self.findIndex(o => o.itemID === obj.itemID)
    );
    
    // Gerar opções de materiais
    const matOpcs = generateMaterialOptions(unicos);
    
    // Gerar linhas de entrada
    const opcs = generateInputRows(matOpcs);
    
    // Construir interface
    const materialsInterface = buildMaterialsInterface(opcs);
    
    displayMain.style.flexDirection = "collum";
    displayMain.innerHTML = buildMaterialsHeader() + materialsInterface;
    
    // Configurar eventos dos materiais
    setupMaterialEvents(materiais);
}

/**
 * Gera as opções do dropdown de materiais
 */
function generateMaterialOptions(materiaisUnicos) {
    let options = '<option value=""></option>';
    materiaisUnicos.forEach(material => {
        options += `<option value="${material.itemID}">${material.itemID}</option>`;
    });
    return options;
}

/**
 * Gera as linhas de entrada de materiais
 */
function generateInputRows(matOpcs) {
    const h = Math.floor(window.innerHeight / 22);
    let rows = "";
    
    for (let i = 0; i < h; i++) {
        rows += `
            <div class="op">
                <select class="mat materialsStyle">
                    ${matOpcs}
                </select>
                <input class="materialsStyle inputqtd" type="number">
            </div>
        `;
    }
    return rows;
}

/**
 * Constrói a interface de materiais
 */
function buildMaterialsInterface(opcs) {
    return `
        <div class="materials">
            ${opcs}
        </div>
        <div class="listMaterials">
            <table>
                <tbody>
                    <tr style="background-color: var(--primaryColor);">
                        <td>Descrição</td>
                        <td>Qtd.</td>
                    </tr>
                </tbody>
            </table>
            <button class="buttonNext unSubmit" onclick="openFormMaterials()">Próximo</button>
        </div>
    `;
}

/**
 * Constrói o cabeçalho da seção de materiais
 */
function buildMaterialsHeader() {
    return `
        <div style="width: 40%; display: flex; align-items: center; justify-content: space-around; padding: 10px 0px;">
            <h2>Material</h2>
            <h2>Qtd.</h2>
        </div>
    `;
}

/**
 * Configura eventos para os campos de materiais
 */
function setupMaterialEvents(materiaisData) {
    document.querySelectorAll('.op').forEach(mt => {
        mt.addEventListener("change", () => {
            updateOrcadosList(materiaisData);
        });
    });
}

/**
 * Atualiza a lista de materiais orçados
 */
function updateOrcadosList(materiaisData) {
    orcados = [];
    
    document.querySelectorAll('.mat').forEach((select, index) => {
        materiaisData.forEach(m => {
            if (m.itemID == select.value) {
                const quantidade = document.querySelectorAll(".inputqtd")[index].value;
                orcados.push({
                    item: m.item,
                    qtd: m.qtd * quantidade
                });
            }
        });
    });
    
    orcados = agruparItensSeguro(orcados);
    renderListaMateriais(orcados);
}

/**
 * Renderiza a lista de materiais na tabela
 */
function renderListaMateriais(materiaisLista) {
    const tableRows = generateMaterialTableRows(materiaisLista);
    const tableContent = buildMaterialTable(tableRows);
    
    document.querySelector('.listMaterials').innerHTML = tableContent;
    setupTableRowEvents();
}

/**
 * Gera as linhas da tabela de materiais
 */
function generateMaterialTableRows(materiaisLista) {
    return materiaisLista.map(mate => `
        <tr class="tableRowOrcados">
            <td>${mate.item}</td>
            <td>${mate.qtd}</td>
        </tr>
    `).join('');
}

/**
 * Constrói a tabela de materiais
 */
function buildMaterialTable(rows) {
    return `
        <table>
            <tbody>
                <tr style="background-color: var(--primaryColor);">
                    <td>Descrição</td>
                    <td>Qtd.</td>
                </tr>
                ${rows}
            </tbody>
        </table>
        <button class="buttonNext unSubmit" onclick="openFormMaterials()">Próximo</button>
    `;
}

/**
 * Configura eventos de edição nas linhas da tabela
 */
function setupTableRowEvents() {
    let tableRowOrcados = document.querySelectorAll('.tableRowOrcados');

    tableRowOrcados.forEach(row => {
        row.addEventListener('dblclick', handleTableRowDoubleClick);
    });
}

/**
 * Manipula duplo clique para edição de linha
 */
function handleTableRowDoubleClick(evt) {
    const editInput = `
        <input type="text" class="materialChangeInput" value="${evt.target.innerHTML}" placeholder="Digite o material desenjado..." />
    `;
    
    evt.target.innerHTML = editInput;
    const materialChangeInput = evt.target.querySelector('.materialChangeInput');
    materialChangeInput.focus();
    
    materialChangeInput.addEventListener('blur', handleMaterialInputBlur);
}

/**
 * Manipula perda de foco no input de material
 */
function handleMaterialInputBlur(evt) {
    evt.target.parentElement.innerHTML = evt.target.value;
}

// =============================================
// FUNÇÕES DE AGRUPAMENTO E UTILITÁRIOS
// =============================================

/**
 * Agrupa itens repetidos de forma segura
 */
function agruparItensSeguro(itens) {
    try {
        if (!Array.isArray(itens)) return [];

        const mapa = new Map();

        itens.forEach(item => {
            if (!item?.item) return;

            const nome = item.item.toString().trim();
            const quantidade = Math.max(0, parseInt(item.qtd) || 0);

            if (!nome) return;

            if (mapa.has(nome)) {
                const existente = mapa.get(nome);
                existente.qtd = (parseInt(existente.qtd) + quantidade).toString();
            } else {
                mapa.set(nome, {
                    item: nome,
                    qtd: quantidade.toString()
                });
            }
        });

        return Array.from(mapa.values()).filter(item => parseInt(item.qtd) > 0);

    } catch (error) {
        console.error('Erro ao agrupar itens:', error);
        return [];
    }
}

// =============================================
// FORMULÁRIOS E ENVIO DE DADOS
// =============================================

/**
 * Abre o formulário de materiais
 */
function openFormMaterials() {
    document.getElementById("formMaterials").style.display = "block";
}

/**
 * Envia o formulário de orçamento
 */
function sendForm() {
    // Coletar dados do formulário
    const formData = collectFormData();
    
    // Atualizar nomes dos materiais editados
    updateEditedMaterialNames();
    
    // Enviar para o backend
    submitBudgetData(formData);
}

/**
 * Coleta dados do formulário
 */
function collectFormData() {
    const projeto = document.getElementById("projeto").value;
    const cidade = document.getElementById("cidade").value;
    const tensao = document.getElementById("tensaoRede").value;
    const dataExe = document.getElementById("dataexe").value;
    const equipe = document.getElementById("equipe").value;
    const tipo = document.getElementById("tipoServ").value;
    const obs = document.getElementById("Obs").value;

    const listaNomes = Array.from(document.querySelectorAll('.mat')).map(x => x.value);

    return {
        projeto,
        cidade,
        tensao,
        dataExe,
        equipe,
        tipo,
        obs,
        materiais: orcados,
        listaNomes: listaNomes,
        solicitante: localStorage.getItem('nome'),
        datasolic: new Date().toISOString()
    };
}

/**
 * Atualiza nomes dos materiais que foram editados
 */
function updateEditedMaterialNames() {
    const materialChangeInputs = document.querySelectorAll('.materialChangeInput');
    materialChangeInputs.forEach((input, index) => {
        if (orcados[index]) {
            orcados[index].item = input.value;
        }
    });
}

/**
 * Submete dados do orçamento para o backend
 */
function submitBudgetData(formData) {
    fetch('/enviarOrcamento', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(handleBudgetResponse)
    .catch(handleBudgetError);
}

/**
 * Manipula resposta do envio de orçamento
 */
function handleBudgetResponse(response) {
    if (response.ok) {
        alert("Orçamento enviado com sucesso!");
    } else {
        alert("Erro no envio do orçamento. Verifique os dados e tente novamente.");
    }
}

/**
 * Manipula erros no envio de orçamento
 */
function handleBudgetError(error) {
    console.error(error);
    alert("Erro ao enviar o orçamento. Tente novamente mais tarde.");
}

// =============================================
// LISTAGEM E FILTROS DE SOLICITAÇÕES
// =============================================

/**
 * Renderiza solicitações recebidas com filtros
 */
function renderRecebidos(filtro = "/solicitacoesRecentes", valor = 100) {
    fetchSolicitacoes(filtro, valor)
        .then(data => {
            console.log('📦 Dados recebidos:', data);
            renderizarTabelaComFiltros(data.data || data);
        })
        .catch(error => {
            console.error('❌ Erro ao buscar solicitações:', error);
        });
}

/**
 * Busca solicitações do backend
 */
async function fetchSolicitacoes(endpoint, valor) {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ valor: valor })
    });
    
    if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    return await response.json();
}

/**
 * Renderiza tabela com sistema de filtros
 */
function renderizarTabelaComFiltros(dados) {
    console.log('🎨 Renderizando tabela com filtros:', dados);

    // Gerar dados únicos para filtros
    const filterData = generateFilterData(dados);
    
    // Gerar conteúdo da tabela
    const tabelaBody = generateSolicitacoesTableBody(dados);
    
    // Construir interface completa
    const interfaceCompleta = buildSolicitacoesInterface(filterData, tabelaBody);
    
    displayMain.style.flexDirection = "column";
    displayMain.innerHTML = interfaceCompleta;
    
    // Configurar eventos
    setupFilterEvents();
    configurarDuploClique(dados);
}

/**
 * Gera dados únicos para os filtros
 */
function generateFilterData(dados) {
    return {
        solicitantes: [...new Set(dados.map(item => item.Solicitante).filter(Boolean))],
        equipes: [...new Set(dados.map(item => item.equipe).filter(Boolean))],
        projetos: [...new Set(dados.map(item => item.Projeto).filter(Boolean))],
        tensoes: [...new Set(dados.map(item => item.Tensao).filter(Boolean))],
        tipos: [...new Set(dados.map(item => item.tipo).filter(Boolean))]
    };
}

/**
 * Gera o corpo da tabela de solicitações
 */
function generateSolicitacoesTableBody(dados) {
    return dados.map(item => `
        <tr class="tableRowRecebidos" id="row-${item.id}">
            <td>${item.Solicitante || 'N/A'}</td>
            <td>${item.equipe || 'N/A'}</td>
            <td>${item.Projeto || 'N/A'}</td>
            <td>${item.Tensao || 'N/A'}</td>
            <td>${item.Cidade || 'N/A'}</td>
            <td>${formatarData(item.DataExe) || 'N/A'}</td>
            <td>${item.tipo || 'N/A'}</td>
            <td>${item.obs || 'N/A'}</td>
        </tr>
    `).join('');
}

/**
 * Constrói a interface completa de solicitações
 */
function buildSolicitacoesInterface(filterData, tabelaBody) {
    return `
        <div class="filtro">
            <div class="filtro-container">
                ${buildFilterGroups(filterData)}
                
                <div class="filtro-botoes">
                    <button class="btn-filtro" onclick="limparFiltros()">Limpar</button>
                    <button class="btn-filtro primario" onclick="aplicarFiltros()">Filtrar</button>
                </div>
            </div>
        </div>
        <table id="tabelaResposta">
            <thead>
                <tr>
                    <th>Solicitante</th>
                    <th>Equipe</th>
                    <th>Projeto</th>
                    <th>Tensão</th>
                    <th>Cidade</th>
                    <th>Data Exe.</th>
                    <th>Tipo</th>
                    <th>Obs.</th>
                </tr>
            </thead>
            <tbody>
                ${tabelaBody}
            </tbody>
        </table>
    `;
}

/**
 * Constrói os grupos de filtros
 */
function buildFilterGroups(filterData) {
    return `
        <div class="filtro-grupo">
            <label class="filtro-label">Solicitante</label>
            <select id="filtroSolicitante" class="filtro-select">
                <option value="">Todos</option>
                ${filterData.solicitantes.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
        </div>
        
        <div class="filtro-grupo">
            <label class="filtro-label">Equipe</label>
            <select id="filtroEquipe" class="filtro-select">
                <option value="">Todas</option>
                ${filterData.equipes.map(e => `<option value="${e}">${e}</option>`).join('')}
            </select>
        </div>
        
        <div class="filtro-grupo">
            <label class="filtro-label">Projeto</label>
            <select id="filtroProjeto" class="filtro-select">
                <option value="">Todos</option>
                ${filterData.projetos.map(p => `<option value="${p}">${p}</option>`).join('')}
            </select>
        </div>
        
        <div class="filtro-grupo">
            <label class="filtro-label">Tensão</label>
            <select id="filtroTensao" class="filtro-select">
                <option value="">Todas</option>
                ${filterData.tensoes.map(t => `<option value="${t}">${t}</option>`).join('')}
            </select>
        </div>
        
        <div class="filtro-grupo">
            <label class="filtro-label">Tipo</label>
            <select id="filtroTipo" class="filtro-select">
                <option value="">Todos</option>
                ${filterData.tipos.map(t => `<option value="${t}">${t}</option>`).join('')}
            </select>
        </div>
        
        <div class="filtro-grupo">
            <label class="filtro-label">Data Execução</label>
            <input type="date" id="filtroData" class="filtro-input">
        </div>
    `;
}

// =============================================
// FILTROS E BUSCA
// =============================================

/**
 * Configura eventos dos filtros
 */
function setupFilterEvents() {
    document.querySelectorAll('.filtro-select, .filtro-input').forEach(element => {
        element.addEventListener('change', aplicarFiltros);
    });
}

/**
 * Aplica filtros nas solicitações
 */
function aplicarFiltros() {
    const filtros = getCurrentFilters();
    
    fetch('/solicitacoesRecentes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ valor: 100 })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const dadosCompletos = data.data || data;
        const dadosFiltrados = filterSolicitacoes(dadosCompletos, filtros);
        console.log(`🎯 ${dadosFiltrados.length} solicitações após filtro`);
        renderizarTabelaComFiltros(dadosFiltrados);
    })
    .catch(error => {
        console.error('❌ Erro ao buscar solicitações:', error);
    });
}

/**
 * Obtém valores atuais dos filtros
 */
function getCurrentFilters() {
    return {
        solicitante: document.getElementById('filtroSolicitante').value.toLowerCase(),
        equipe: document.getElementById('filtroEquipe').value.toLowerCase(),
        projeto: document.getElementById('filtroProjeto').value.toLowerCase(),
        data: document.getElementById('filtroData').value,
        tensao: document.getElementById('filtroTensao').value,
        tipo: document.getElementById('filtroTipo').value
    };
}

/**
 * Filtra solicitações baseado nos critérios
 */
function filterSolicitacoes(dados, filtros) {
    return dados.filter(item => {
        // Filtro por Solicitante
        if (filtros.solicitante && !item.Solicitante?.toLowerCase().includes(filtros.solicitante)) {
            return false;
        }

        // Filtro por Equipe
        if (filtros.equipe && !item.equipe?.toLowerCase().includes(filtros.equipe)) {
            return false;
        }

        // Filtro por Projeto
        if (filtros.projeto && !item.Projeto?.toLowerCase().includes(filtros.projeto)) {
            return false;
        }

        // Filtro por Data
        if (filtros.data && item.DataExe !== filtros.data) {
            return false;
        }

        // Filtro por Tensão
        if (filtros.tensao && item.Tensao !== filtros.tensao) {
            return false;
        }

        // Filtro por Tipo
        if (filtros.tipo && item.tipo !== filtros.tipo) {
            return false;
        }

        return true;
    });
}

/**
 * Limpa todos os filtros
 */
function limparFiltros() {
    document.getElementById('filtroSolicitante').value = '';
    document.getElementById('filtroEquipe').value = '';
    document.getElementById('filtroProjeto').value = '';
    document.getElementById('filtroData').value = '';
    document.getElementById('filtroTensao').value = '';
    document.getElementById('filtroTipo').value = '';

    renderRecebidos();
}

// =============================================
// MODAL DE DETALHES DE MATERIAIS
// =============================================

/**
 * Configura duplo clique nas linhas da tabela
 */
function configurarDuploClique(dados) {
    const listamateriais = document.getElementById("listamateriais");

    document.querySelectorAll('.tableRowRecebidos').forEach(row => {
        row.addEventListener('dblclick', (evt) => {
            const rowId = row.id.split('-')[1];
            const itemData = dados.find(d => d.id == rowId);

            if (!itemData) {
                console.error('❌ Dados não encontrados para o ID:', rowId);
                return;
            }

            preencherModalDetalhes(itemData);
            listamateriais.style.display = "block";
        });
    });
}

/**
 * Preenche modal com detalhes da solicitação
 */
function preencherModalDetalhes(itemData) {
    // Preencher dados básicos
    document.getElementById("lmSolicitante").innerText = itemData.Solicitante || 'N/A';
    document.getElementById("lmProjeto").innerText = itemData.Projeto || 'N/A';
    document.getElementById("lmCidade").innerText = itemData.Cidade || 'N/A';
    document.getElementById("lmTensao").innerText = itemData.Tensao || 'N/A';
    document.getElementById("lmEquipe").innerText = itemData.equipe || 'N/A';
    document.getElementById("lmDataSol").innerText = formatarData(itemData.DataSol) || 'N/A';
    document.getElementById("lmDataExe").innerText = formatarData(itemData.DataExe) || 'N/A';
    document.getElementById("lmObs").innerText = itemData.obs || 'N/A';

    // Preencher tabela de materiais
    const materialListBody = document.querySelector('#listamateriais tbody');
    if (!materialListBody) {
        console.error('❌ Elemento materialListBody não encontrado');
        return;
    }

    materialListBody.innerHTML = buildMaterialDetailsTable(itemData.Materiais);
}

/**
 * Constrói tabela de detalhes de materiais
 */
function buildMaterialDetailsTable(materiais) {
    let materialListBodyContent = "";

    if (materiais && Array.isArray(materiais)) {
        materialListBodyContent = materiais.map(mate => `
            <tr>
                <td>${mate.item || 'N/A'}</td>
                <td>${mate.orcado || mate.qtd || '0'}</td>
                <td>${mate.liberado || '0'}</td>
                <td>${mate.devolvido || '0'}</td>
            </tr>
        `).join('');
    } else {
        materialListBodyContent = `
            <tr>
                <td colspan="4" style="text-align: center; color: #999;">
                    Nenhum material encontrado
                </td>
            </tr>
        `;
    }

    return `
        <tr>
            <th>Material</th>
            <th>Orçado</th>
            <th>Liberado</th>
            <th>Devolvido</th>
        </tr>
        ${materialListBodyContent}
    `;
}

// =============================================
// FUNÇÕES DE COMUNICAÇÃO COM BACKEND
// =============================================

/**
 * Lista materiais do backend
 */
async function listarMateriais() {
    try {
        console.log('🔍 Fazendo requisição...');
        const response = await fetch('/listarMateriais');
        console.log('📨 Response object:', response);

        const data = await response.json();
        console.log('📦 Dados extraídos:');
        console.log(data);

        materiais = data;
        renderSolicitacoes(data);

    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

// =============================================
// FUNÇÕES AUXILIARES
// =============================================

/**
 * Formata data para formato brasileiro
 */
function formatarData(dataString) {
    if (!dataString) return 'N/A';
    try {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    } catch {
        return dataString;
    }
}

/**
 * Inicializa menu mobile
 */
function initMobileMenu() {
    const navBar = document.getElementById('navBar');
    const menu = document.querySelector('.menu');

    // Criar botão hamburger
    const hamburger = document.createElement('button');
    hamburger.className = 'mobile-menu-toggle';
    hamburger.innerHTML = '☰';
    hamburger.addEventListener('click', toggleMobileMenu);

    navBar.insertBefore(hamburger, navBar.firstChild);

    function toggleMobileMenu() {
        menu.classList.toggle('mobile-open');
        hamburger.innerHTML = menu.classList.contains('mobile-open') ? '✕' : '☰';
    }

    // Fechar menu ao clicar em um item
    document.querySelectorAll('.menuSelect').forEach(item => {
        item.addEventListener('click', () => {
            menu.classList.remove('mobile-open');
            hamburger.innerHTML = '☰';
        });
    });
}

// =============================================
// FUNÇÕES DE RENDERIZAÇÃO (COMPATIBILIDADE)
// =============================================

// Mantidas para compatibilidade com código existente
function renderizarTabela(dados) {
    renderizarTabelaComFiltros(dados);
}

// =============================================
// INICIALIZAÇÃO DA APLICAÇÃO
// =============================================

// Inicializar quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    listarMateriais();
});

// Configurar evento do formulário de materiais
document.getElementById("formMaterials").addEventListener("submit", function(evt) {
    evt.preventDefault();
    sendForm();
});

// Configurar evento de PDF na lista de materiais
document.getElementById("listamateriais").addEventListener("dblclick", function(evt) {
    gerarPDFListaMateriais();
});