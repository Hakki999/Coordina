const acess = JSON.parse(localStorage.getItem('acesso'));
console.log(acess);
let dadosTable = "";

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
        options += `<option value="${material.itemID.replace(/"/g, '&quot;')}">${material.itemID}</option>`;
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
                    qtd: m.qtd * quantidade,
                    lib: 0,
                    dev: 0
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
 * Configura eventos de edição nas linhas da liberado e devolvido
 */


function setupTableRowEventsLibDev() {
    let tableRowOrcados = document.querySelectorAll('.modlibdev');

    tableRowOrcados.forEach(row => {
        if (acess.editlibdev) row.addEventListener('click', handleTableRowDoubleClick);
        if (acess.editlibdev) row.addEventListener('change', changeLiberadoDevolvido);
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
                    qtd: quantidade.toString(),
                    lib: 0,
                    dev: 0
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

    const listaNomes = [];

    document.querySelectorAll('.mat').forEach((select, index) => {

        listaNomes.push([
            document.querySelectorAll('.mat')[index].value,
            document.querySelectorAll('.inputqtd')[index].value
        ])
    });

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
        datasolic: new Date().toISOString(),
        tel: localStorage.getItem('tel')
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
        body: JSON.stringify(formData),
        credentials: 'include'
    })
        .then(handleBudgetResponse)
        .catch(handleBudgetError);
}

/**
 * Manipula resposta do envio de orçamento
 */
function handleBudgetResponse(response) {
    console.warn(response);
    (response)
    if (response.status === 200) {
        criarMensagem(true, 'Sucesso ao enviar o orçamento!');
    } else {
        criarMensagem(false, 'Erro ao enviar o orçamento.');
    }
}

/**
 * Manipula erros no envio de orçamento
 */
function handleBudgetError(error) {
    console.error(error);
    criarMensagem(false, 'Erro ao enviar o orçamento. . Tente novamente mais tarde.');
}
/** Atualiza os valores de liberado e devolvido no backend */

async function changeLiberadoDevolvido(evt) {
    // Força uma atualização síncrona dos valores antes de processar
    await forceValueUpdate();

    let dataTemp = [];
    document.querySelectorAll('.changeLibDevAlmox').forEach(row => {
        // Para inputs, pega o value diretamente
        const children = row.children;
        dataTemp.push({
            item: getValue(children[0]),
            qtd: getValue(children[1]),
            lib: getValue(children[2]),
            dev: getValue(children[3])
        });
    });

    fetch('/changeLibDev', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            dataTemp: dataTemp,
            id: document.querySelector("#listamateriais").getAttribute('data-id')
        }),
        credentials: 'include'
    });
}

// Função auxiliar para pegar valores de inputs ou textContent
function getValue(element) {
    if (!element) return '';

    // Se for input, select ou textarea, pega o value
    if (element.tagName === 'INPUT' ||
        element.tagName === 'SELECT' ||
        element.tagName === 'TEXTAREA') {
        return element.value || '';
    }

    // Se não, pega o textContent
    return element.textContent?.trim() || '';
}

// Força a atualização dos valores dos inputs
function forceValueUpdate() {
    return new Promise(resolve => {
        // Dispara eventos de input para forçar atualização
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });

        // Pequeno delay para garantir processamento
        setTimeout(resolve, 50);
    });
}

// =============================================
// LISTAGEM E FILTROS DE SOLICITAÇÕES
// =============================================

/**
 * Renderiza solicitações recebidas com filtros
 */
function renderRecebidos(filtro = "/solicitacoesRecentes", valor = 9999) {
    fetchSolicitacoes(filtro, valor)
        .then(data => {
            dadosTable = data.data;
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
        body: JSON.stringify({ valor: valor }),
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
    }
    return await response.json();
}

/**
 * Renderiza tabela com sistema de filtros
 */
/**
 * Renderiza tabela com sistema de filtros - VERSÃO CORRIGIDA
 */
function renderizarTabelaComFiltros(dadoss) {
    console.log('🎨 Renderizando tabela com:', dadoss.length, 'registros');
    console.log('📊 Dados recebidos:', dadoss);

    // Verifica se há dados
    if (!dadoss || dadoss.length === 0) {
        console.warn('⚠️ Nenhum dado para renderizar');
        displayMain.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #666;">
                <h3>Nenhum registro encontrado</h3>
                <p>Não há dados para o filtro aplicado.</p>
            </div>
        `;
        return;
    }

    // Gerar dados únicos para filtros
    const filterData = generateFilterData(dadoss);

    // Gerar conteúdo da tabela
    const tabelaBody = generateSolicitacoesTableBody(dadoss);

    // Construir interface completa
    const interfaceCompleta = buildSolicitacoesInterface(filterData, tabelaBody);

    // LIMPA completamente o displayMain antes de adicionar novo conteúdo
    displayMain.innerHTML = "";
    displayMain.style.flexDirection = "column";

    // Adiciona o novo conteúdo
    displayMain.innerHTML = interfaceCompleta;

    console.log('✅ Tabela renderizada. Linhas:', document.querySelectorAll('#tabelaResposta tbody tr').length);

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
/**
 * Gera o corpo da tabela de solicitações - VERSÃO CORRIGIDA
 */
function generateSolicitacoesTableBody(dados) {
    console.log('📝 Gerando corpo da tabela com', dados.length, 'itens');

    if (!dados || !Array.isArray(dados)) {
        console.error('❌ Dados inválidos para gerar tabela');
        return '<tr><td colspan="8" style="text-align: center; color: red;">Erro: Dados inválidos</td></tr>';
    }

    const tableRows = dados.map((item, index) => {
        // Debug: log do primeiro item para ver a estrutura
        if (index === 0) {
            console.log('🔍 Estrutura do primeiro item:', item);
        }

        return `
            <tr class="tableRowRecebidos" ondblclick="dbclickRow(${item.id || index})" id="row-${item.id || index}">
                <td>${item.Solicitante || 'N/A'}</td>
                <td>${item.equipe || 'N/A'}</td>
                <td>${item.Projeto || 'N/A'}</td>
                <td>${item.Tensao || 'N/A'}</td>
                <td>${item.Cidade || 'N/A'}</td>
                <td>${formatarData(item.DataExe) || 'N/A'}</td>
                <td>${item.tipo || 'N/A'}</td>
                <td>${item.obs || 'N/A'}</td>
            </tr>
        `;
    }).join('');

    console.log('📋 HTML gerado para tabela (primeiros 500 chars):', tableRows.substring(0, 500));

    return tableRows;
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
                    <button class="btn-filtro" onclick="exportTab(dadosTable, 'tabela_orcamento.csv')">CSV</button>
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
            <tbody id="tabelaRespostaBody">
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
            <input type="text" id="filtroProjeto" class="filtro-select" placeholder="Digite o numero do projeto"/>
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

        <div class="filtro-grupo">
            <label class="filtro-label">Intervalo Data</label>
            <button class="filtro-input" onclick="renderInputIntervalo()">Aplicar</button>
        </div>
    `;
}

// =============================================
// FILTROS E BUSCA
// =============================================

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
        body: JSON.stringify({ valor: 9999 }),
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("dados = filtro");
            
            const dadosFiltrados = filterSolicitacoes(dadosTable, filtros);
            dadosTable = dadosFiltrados;
            console.log(`🎯 ${dadosFiltrados.length} solicitações após filtro`);
            criarMensagem(true, `${dadosFiltrados.length} solicitações após filtro`);
            renderizarTabelaComFiltros(dadosFiltrados);
        })
        .catch(error => {
            console.error('❌ Erro ao buscar solicitações:', error);
            criarMensagem(false, 'Erro ao buscar solicitações.');
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

function dbclickRow(rowId) {
    const itemData = dadosTable.find(d => d.id == rowId);

    if (!itemData) {
        console.error('❌ Dados não encontrados para o ID:', rowId);
        return;
    }

    preencherModalDetalhes(itemData);
    listamateriais.style.display = "block";
    listamateriais.setAttribute('data-id', rowId);

    setupTableRowEventsLibDev();
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
        console.log(materiais);

        materialListBodyContent = materiais.map(mate => `
            <tr class="changeLibDevAlmox" >
                <td>${mate.item || 'N/A'}</td>
                <td>${mate.orcado || mate.qtd || '0'}</td>
                <td class="modlibdev">${mate.lib || '0'}</td>
                <td class="modlibdev">${mate.dev || '0'}</td>
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
        console.warn('-------');
        
        const data = await response.json();
        console.log('📦 Dados extraídos:');
        console.log(data);
        dadosTable = data;
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
    let dataTemp = dataString.split('T')[0] || dataString;
    dataTemp = dataTemp.split('-');
    return `${dataTemp[2]}/${dataTemp[1]}/${dataTemp[0]}`;
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
document.addEventListener('DOMContentLoaded', function () {
    initializeEventListeners();
    listarMateriais();
});

// Configurar evento do formulário de materiais
document.getElementById("formMaterials").addEventListener("submit", function (evt) {
    evt.preventDefault();
    sendForm();
});

// Configurar evento de PDF na lista de materiais
document.getElementById("listamateriais").addEventListener("dblclick", function (evt) {
    if (acess.imprimir) gerarPDFListaMateriais();
});


fetch('/buscarFiltro', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        tabela: 'Equipes',
        coluna: 'Prefixo',
        valor: 'all',
        orderBy: true,
        orderCamp: 'Prefixo'
    }),
    credentials: 'include'
})
    .then(response => response.json())
    .then(data => {
        console.log("✅ Dados da equipes recebidos!");

        const equipeSelect = document.getElementById("equipe");
        data.data.forEach(equipe => {
            const option = document.createElement("option");
            option.value = equipe.Prefixo;
            option.textContent = equipe.Prefixo;
            equipeSelect.appendChild(option);
        });

    })
    .catch(error => {
        console.error('Erro ao filtrar materiais:', error);
    });


function renderInputIntervalo() {
    console.log('pressionou');

    const htmlItervalo = `
        <div class="inputMensageContainner">
        <div class="detailsClose" onclick="this.parentElement.remove()"></div>
        <div class="inputMensageWrapper">
            <input type="date" class="inputMensage" id="dataInicio" placeholder="Mensagem..." id="inputMensageField">
            <input type="date" class="inputMensage" id="dataFim" placeholder="Mensagem..." id="inputMensageField">
            <button type="submit" class="btnMensage" id="btnMensage" onclick="getFiltroIntevaloData()">Enviar</button>
        </div>
    </div>
    `

    document.body.innerHTML += htmlItervalo;
}


function getFiltroIntevaloData() {
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;

    // Validação das datas
    if (!dataInicio || !dataFim) {
        criarMensagem(false, "Por favor, selecione ambas as datas!");
        return;
    }

    let startDate, endDate;

    // Garante que a data inicial seja menor que a final
    if (dataInicio > dataFim) {
        startDate = dataFim;
        endDate = dataInicio;
    } else {
        startDate = dataInicio;
        endDate = dataFim;
    }

    console.log('Filtrando por intervalo:', startDate, 'até', endDate);

    fetch('/buscarFiltro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tabela: 'Materiais Solicitados', // ou a tabela correta
            coluna: 'DataExe',
            valor: 'all',
            orderBy: true,
            orderCamp: 'DataExe',
            qtdLimite: 999,
            minValue: startDate,
            maxValue: endDate
        }),
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(dados => {
            console.log("✅ Dados filtrados recebidos:", dados);
            dadosTable = dados.data;
            console.log("dados = filtro");
            if (dados.data && dados.data.length > 0) {
                displayMain.innerHTML = '';
                document.getElementById('tabelaRespostaBody').innerHTML = generateSolicitacoesTableBody(dados.data);
                criarMensagem(true, `Filtro aplicado! ${dados.data.length} registros encontrados.`);
            } else {
                criarMensagem(false, "Nenhum registro encontrado para o período selecionado.");
                // Limpa a tabela ou mostra mensagem
                displayMain.querySelector('table tbody').innerHTML = '<tr><td colspan="8" style="text-align: center;">Nenhum registro encontrado</td></tr>';
            }

            // Fecha o modal
            const modal = document.querySelector('.inputMensageContainner');
            if (modal) modal.remove();
        })
        .catch(error => {
            console.error('❌ Erro ao buscar materiais:', error);
            criarMensagem(false, "Erro ao realizar o filtro!");
        });
}
function exportTab() {
    console.log(dadosTable);

    let tempExport = [];


    dadosTable.forEach((item, index) => {
        console.clear()
        console.log(item);

        let materiaisDist = [];
        let qtdDist = [];
        let devDist = [];
        let libDist = [];

        item.Materiais.forEach(material => {
            console.warn(material);
            
            materiaisDist.push(material.item.replace('.', ',') || "err");
            libDist.push(material.lib || 0);
            qtdDist.push(material.qtd || 0);
            devDist.push(material.dev || 0);
        })

        tempExport.push([
            item.id ||  "",
            item.Projeto || "",
            item.Cidade || "",
            formatarData(item.DataExe) || "",
            formatarData(item.DataSol) || "",
            item.Solicitante || "",
            item.Tensao || "",
            item.equipe || "",
            item.obs || "",
            item.tipo || "",
            item.updated_at || "",
            materiaisDist || "",
            qtdDist || "",
            devDist || "",
            libDist || ""
        ])

        console.log(tempExport);

    })

    exportCSV({
        head: [
            'id',
            'projeto',
            'Cidade',
            'dataExe',
            'dataSol',
            'solicitante',
            'tensao',
            'equipe',
            'obs',
            'tipo',
            'updated_at',
            'materiais',
            'qtd',
            'dev',
            'lib'
        ],
        body: tempExport
    }, 'Orçamentos recebidos');

}