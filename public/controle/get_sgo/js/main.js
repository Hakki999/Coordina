// Configuração inicial do menu
const optionNav = document.querySelectorAll(".optionNav");
let resRequestLength = 0;

optionNav.forEach(option => {
    option.addEventListener("click", evt => {
        optionNav.forEach(opt => {
            opt.classList = "optionNav closeOption";
        });
        evt.currentTarget.classList = "optionNav openOption";
    })
});

// Configurações de lote
let CONFIG = {
    TAMANHO_LOTE: 10,          // Número de requisições simultâneas
    DELAY_ENTRE_LOTES: 500,     // Delay entre lotes (ms)
    TIMEOUT_REQUEST: 30000,      // Timeout por requisição (30s)
    MAX_RETRIES: 3,              // Máximo de tentativas por requisição
    RETRY_DELAY: 1000            // Delay entre tentativas (ms)
};

// Elementos DOM
const resRequest = document.querySelector('#resRequest');
const resResponse = document.querySelector('#resResponse');
const sendBtn = document.querySelector('#sendReq');
const bodyReqRes = document.querySelector('.bodyReqRes');

// Criar container para tabela HTML
const tabelaContainer = document.createElement('div');
tabelaContainer.id = 'tabelaResultados';
tabelaContainer.className = 'tabela-container';
tabelaContainer.style.cssText = `
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 10px;
    box-sizing: border-box;
    display: none;
`;

// Esconder textarea original e adicionar container da tabela
resResponse.style.display = 'none';
resResponse.parentNode.insertBefore(tabelaContainer, resResponse.nextSibling);

// Atualizar CONFIG quando os selects mudarem
document.querySelector('#tmLote').addEventListener('change', (e) => {
    CONFIG.TAMANHO_LOTE = parseInt(e.target.value);
});

document.querySelector('#tmDelay').addEventListener('change', (e) => {
    CONFIG.DELAY_ENTRE_LOTES = parseInt(e.target.value);
});

document.querySelector('#tmTimeout').addEventListener('change', (e) => {
    CONFIG.TIMEOUT_REQUEST = parseInt(e.target.value);
});

document.querySelector('#tmMaxTentativas').addEventListener('change', (e) => {
    CONFIG.MAX_RETRIES = parseInt(e.target.value);
});

// Função para extrair IDs do textarea
function extrairIdsDoTextarea(texto) {
    return texto
        .split('\n')
        .map(id => id.trim())
        .filter(id => id.length > 0);
}

// Função para converter data do formato .NET
function converterDotNetDate(dotNetDate) {
    if (typeof dotNetDate !== 'string') return null;

    try {
        const match = dotNetDate.match(/\/Date\((\d+)/);
        if (!match) return null;

        const timestamp = parseInt(match[1], 10);
        if (isNaN(timestamp)) return null;

        return new Date(timestamp);
    } catch (error) {
        console.error('Erro ao converter data .NET:', error);
        criarMensagem(false, 'Erro ao converter data .NET');
        return null;
    }
}

// Função para processar valores de data
function processarValorDate(valor) {
    if (typeof valor === 'string' && valor.substring(0, 6) === '/Date(') {
        const date = converterDotNetDate(valor);
        return date ? date.toLocaleString('pt-BR') : valor;
    }
    return valor;
}

// Função principal de requisição com retry
async function fazerRequisicaoComRetry(id, requestData, tentativa = 1) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_REQUEST);

        // Substituir placeholder pelo ID atual
        let body = requestData.body;
        if (typeof body === 'string') {
            body = body.replace(/{ID}/g, id);
        }

        const response = await fetch(requestData.uri, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
                "authorization": "Basic SjQwODIxNDQ5OnNITGg3M2xTZlh2M1VRM1FuVTRPIw",
                "content-type": "application/json;charset=UTF-8"
            },
            "body": body,
            "method": "POST",
            "signal": controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            return data.map((item, index) => ({
                id: id,
                itemData: item,
                data: data,
                status: 'sucesso',
                timestamp: new Date().toISOString(),
                isMultiple: true,
                itemCount: data.length,
                itemIndex: index
            }));
        } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            return [{
                id: id,
                itemData: data,
                data: data,
                status: 'sucesso',
                timestamp: new Date().toISOString(),
                isMultiple: false,
                itemCount: 1,
                itemIndex: 0
            }];
        } else {
            return [{
                id: id,
                itemData: {},
                data: {},
                status: 'sucesso',
                timestamp: new Date().toISOString(),
                isMultiple: false,
                itemCount: 0,
                itemIndex: 0
            }];
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log(`⏰ Timeout no ID ${id} (tentativa ${tentativa}/${CONFIG.MAX_RETRIES})`);
        } else {
            console.log(`❌ Erro no ID ${id} (tentativa ${tentativa}/${CONFIG.MAX_RETRIES}):`, error.message);
        }

        if (tentativa < CONFIG.MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
            return fazerRequisicaoComRetry(id, requestData, tentativa + 1);
        }

        return [{
            id: id,
            error: error.message,
            status: 'erro',
            timestamp: new Date().toISOString(),
            isMultiple: false,
            itemCount: 0,
            itemIndex: 0
        }];
    }
}

// Função para processar lote de IDs
async function processarLote(ids, requestData, inicio) {
    const fim = Math.min(inicio + CONFIG.TAMANHO_LOTE, ids.length);
    const lote = ids.slice(inicio, fim);

    console.log(`\n📦 Processando lote ${Math.floor(inicio / CONFIG.TAMANHO_LOTE) + 1}: IDs ${inicio + 1} até ${fim} (${lote.length} requisições)`);

    const promessas = lote.map(id => fazerRequisicaoComRetry(id, requestData));
    const resultadosLote = await Promise.allSettled(promessas);

    const resultadosProcessados = [];
    resultadosLote.forEach((resultado, index) => {
        const id = lote[index];

        if (resultado.status === 'fulfilled') {
            const dados = resultado.value;
            resultadosProcessados.push(...dados);

            const sucessos = dados.filter(r => r.status === 'sucesso').length;
            const erros = dados.filter(r => r.status === 'erro').length;

            if (dados.length > 0 && dados[0].itemCount > 0) {
                const itemCount = dados[0].itemCount;
                console.log(`   ✅ ${id}: ${itemCount} item${itemCount > 1 ? 'ns' : ''} encontrado${itemCount > 1 ? 's' : ''}`);
            } else if (erros > 0) {
                console.log(`   ❌ ${id}: Erro após ${CONFIG.MAX_RETRIES} tentativas`);
            } else {
                console.log(`   ⚠️ ${id}: Nenhum item encontrado`);
            }
        } else {
            console.log(`   ❌ ${id}: Falha total após ${CONFIG.MAX_RETRIES} tentativas`);
            resultadosProcessados.push({
                id: id,
                error: resultado.reason?.message || 'Erro desconhecido',
                status: 'erro',
                timestamp: new Date().toISOString(),
                isMultiple: false,
                itemCount: 0,
                itemIndex: 0
            });
        }
    });

    return resultadosProcessados;
}

// Função para formatar valor para CSV
function formatarParaCSV(valor) {
    if (valor === null || valor === undefined) {
        return '';
    }

    const valorProcessado = processarValorDate(valor);
    const stringValor = String(valorProcessado);

    if (stringValor.includes(';') ||
        stringValor.includes('\n') ||
        stringValor.includes('\r') ||
        stringValor.includes('"')) {
        return '"' + stringValor.replace(/"/g, '""') + '"';
    }

    return stringValor;
}

// Função para extrair todos os campos dos resultados
function extrairTodosCampos(resultados) {
    const camposBase = [
        'ID_Original',
        'Item_Numero',
        'Status',
        'DataConsulta',
        'Erro',
        'Total_Itens'
    ];

    const camposDados = new Set();

    resultados.forEach(resultado => {
        if (resultado.itemData && typeof resultado.itemData === 'object') {
            Object.keys(resultado.itemData).forEach(chave => {
                camposDados.add(chave);
            });
        }
    });

    const camposOrdenados = Array.from(camposDados).sort();

    return camposBase.concat(camposOrdenados);
}

// Função para converter item em linha CSV
function converterItemParaLinhaCSV(idOriginal, itemData, itemIndex, totalItems, campos) {
    const linha = [];

    campos.forEach(campo => {
        let valorFormatado = '';

        switch (campo) {
            case 'ID_Original':
                valorFormatado = idOriginal || '';
                break;
            case 'Item_Numero':
                valorFormatado = itemIndex >= 0 ? `Item_${itemIndex + 1}` : 'Único';
                break;
            case 'Status':
                valorFormatado = 'sucesso';
                break;
            case 'DataConsulta':
                valorFormatado = new Date().toLocaleString('pt-BR');
                break;
            case 'Erro':
                valorFormatado = '';
                break;
            case 'Total_Itens':
                valorFormatado = totalItems || 1;
                break;
            default:
                if (itemData && itemData[campo] !== undefined) {
                    valorFormatado = itemData[campo];
                }
                break;
        }

        valorFormatado = processarValorDate(valorFormatado);

        if (typeof valorFormatado === 'string') {
            valorFormatado = valorFormatado
                .replace(/\r\n/g, ' ')
                .replace(/\n/g, ' ')
                .replace(/\r/g, ' ')
                .replace(/\t/g, ' ')
                .replace(/"/g, "'")
                .trim();
        } else if (typeof valorFormatado === 'object' && valorFormatado !== null) {
            try {
                valorFormatado = JSON.stringify(valorFormatado)
                    .replace(/\r\n/g, ' ')
                    .replace(/\n/g, ' ')
                    .replace(/\r/g, ' ')
                    .replace(/\t/g, ' ')
                    .replace(/"/g, "'");
            } catch (e) {
                valorFormatado = '';
            }
        }

        linha.push(valorFormatado || '');
    });

    return linha.join(';');
}

// Função para converter erro em linha CSV
function converterErroParaLinhaCSV(erroItem, campos) {
    const linha = [];

    campos.forEach(campo => {
        let valorFormatado = '';

        switch (campo) {
            case 'ID_Original':
                valorFormatado = erroItem.id || '';
                break;
            case 'Item_Numero':
                valorFormatado = 'Erro';
                break;
            case 'Status':
                valorFormatado = erroItem.status || 'erro';
                break;
            case 'DataConsulta':
                if (erroItem.timestamp) {
                    try {
                        valorFormatado = new Date(erroItem.timestamp).toLocaleString('pt-BR');
                    } catch (e) {
                        valorFormatado = '';
                    }
                }
                break;
            case 'Erro':
                valorFormatado = erroItem.error || '';
                break;
            case 'Total_Itens':
                valorFormatado = 0;
                break;
            default:
                valorFormatado = '';
                break;
        }

        valorFormatado = processarValorDate(valorFormatado);

        if (typeof valorFormatado === 'string') {
            valorFormatado = valorFormatado
                .replace(/\r\n/g, ' ')
                .replace(/\n/g, ' ')
                .replace(/\r/g, ' ')
                .replace(/\t/g, ' ')
                .replace(/"/g, "'")
                .trim();
        }

        linha.push(valorFormatado || '');
    });

    return linha.join(';');
}

// Função para gerar CSV completo
function gerarCSV(resultados) {
    const itensSucesso = resultados.filter(r => r.status === 'sucesso');
    const itensErro = resultados.filter(r => r.status === 'erro');

    const campos = extrairTodosCampos(itensSucesso);
    const cabecalho = campos.join(';');

    const linhas = [cabecalho];

    itensSucesso.forEach(item => {
        if (item.itemData) {
            const linha = converterItemParaLinhaCSV(
                item.id,
                item.itemData,
                item.itemIndex,
                item.itemCount,
                campos
            );
            linhas.push(linha);
        }
    });

    itensErro.forEach(item => {
        const linha = converterErroParaLinhaCSV(item, campos);
        linhas.push(linha);
    });

    return linhas.join('\n');
}

// NOVA FUNÇÃO: Criar tabela HTML a partir do CSV
function criarTabelaHTML(csv) {
    if (!csv || csv.trim() === '') return '<p class="sem-dados">Nenhum dado disponível</p>';

    const linhas = csv.split('\n');
    if (linhas.length === 0) return '<p class="sem-dados">Nenhum dado disponível</p>';

    const cabecalho = linhas[0].split(';');
    const dados = linhas.slice(1).filter(linha => linha.trim() !== '');

    let html = '<div class="tabela-wrapper">';
    html += '<table class="tabela-resultados">';

    // Cabeçalho
    html += '<thead><tr>';
    cabecalho.forEach(coluna => {
        html += `<th>${coluna}</th>`;
    });
    html += '</tr></thead>';

    // Corpo da tabela
    html += '<tbody>';
    dados.forEach(linha => {
        const colunas = linha.split(';');
        html += '<tr>';
        colunas.forEach((valor, index) => {
            // Verificar se é uma linha de erro
            const isErro = index === 2 && valor === 'erro';
            const classe = isErro ? 'class="erro-linha"' : '';
            html += `<td ${classe}>${valor || '-'}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody>';

    html += '</table>';
    html += '</div>';

    // Adicionar legenda
    html += '<div class="tabela-legenda">';
    html += '<p><span class="legenda-item">📊</span> Total de linhas: ' + dados.length +"/"+  resRequestLength + ' | ' + ((dados.length / resRequestLength) * 100).toFixed(2) + '%</p>';
    html += '<p><span class="legenda-item">✅</span> Clique no botão "Download CSV" para baixar o arquivo original</p>';
    html += '</div>';

    return html;
}

// NOVA FUNÇÃO: Atualizar tabela HTML
function atualizarTabelaHTML(resultados) {
    const csv = gerarCSV(resultados);
    resResponse.value = csv; // Manter o CSV no textarea oculto
    tabelaContainer.innerHTML = criarTabelaHTML(csv);
    tabelaContainer.style.display = 'block';
}

// Função para fazer download do CSV
function downloadCSV(conteudo, nomeArquivo = 'resultados.csv') {
    const blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', nomeArquivo);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Função para adicionar botão de download
function adicionarBotaoDownload() {
    // Verificar se o botão já existe
    if (document.querySelector('#btnDownloadCSV')) return;

    const container = document.querySelector('.headInput');
    const btnDownload = document.createElement('button');
    btnDownload.id = 'btnDownloadCSV';
    btnDownload.innerHTML = 'Download CSV';


    btnDownload.addEventListener('mouseenter', () => {
        btnDownload.style.transform = 'translateY(-2px)';
        btnDownload.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
    });

    btnDownload.addEventListener('mouseleave', () => {
        btnDownload.style.transform = 'translateY(0)';
        btnDownload.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    });

    btnDownload.addEventListener('click', () => {
        if (resResponse.value) {
            const typeSol = document.querySelector('#typeSol').value;
            const nomeArquivo = `resultados_${typeSol}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
            downloadCSV(resResponse.value, nomeArquivo);
        } else {
            alert('Nenhum dado disponível para download');
        }
    });

    container.appendChild(btnDownload);
}

// Função principal de envio
async function sendRequest() {
    // Atualizar CONFIG com valores atuais dos selects
    CONFIG = {
        TAMANHO_LOTE: parseInt(document.querySelector('#tmLote').value) || 10,
        DELAY_ENTRE_LOTES: parseInt(document.querySelector('#tmDelay').value) || 500,
        TIMEOUT_REQUEST: parseInt(document.querySelector('#tmTimeout').value) || 30000,
        MAX_RETRIES: parseInt(document.querySelector('#tmMaxTentativas').value) || 3,
        RETRY_DELAY: 1000
    };

        resRequestLength = document.querySelector('#resRequest');
        resRequestLength = resRequestLength.value.split('\n').filter(id => id.trim() !== '').length;

    const ids = extrairIdsDoTextarea(resRequest.value);

    if (ids.length === 0) {
        criarMensagem(false, 'Por favor, insira pelo menos um ID no campo de requisição.');
        return;
    }

    console.log(`🚀 Iniciando processamento de ${ids.length} IDs...`);
    console.log(`   Configuração: Lote=${CONFIG.TAMANHO_LOTE}, Tentativas=${CONFIG.MAX_RETRIES}, Timeout=${CONFIG.TIMEOUT_REQUEST / 1000}s`);

    const typeSol = document.querySelector('#typeSol').value;
    let requestData = {};

    // Configurar requestData baseado no tipo selecionado
    switch (typeSol) {
        case 'Notas':
            requestData = {
                uri: "http://10.204.8.68:8083/Service/SolicitacaoInvestimentoService.svc/rest/ListarSolicitacaoInvestimentoPorNota",
                body: JSON.stringify({ "Nota": "{ID}" })
            };
            break;
        case 'NomeObra':
            requestData = {
                uri: "http://10.204.8.68:8083/Service/SolicitacaoInvestimentoService.svc/rest/ListarSolicitacaoInvestimentoPorNomeProjeto",
                body: JSON.stringify({ "NomeProjeto": "{ID}" })
            };
            break;
        case 'NPEP':
            requestData = {
                uri: "http://10.204.8.68:8083/Service/SolicitacaoInvestimentoService.svc/rest/carregarMaterialNota",
                body: JSON.stringify({ "notaSAP": "{ID}", "usuarioLogado": "J40821449" })
            };
            break;
        case 'FluxoNota':
            requestData = {
                uri: "http://10.204.8.68:8083/Service/LogFluxo.svc/rest/GetListLogFluxoBySliId",
                body: JSON.stringify({ "soliciatacaoid": parseInt("{ID}") })
            };
            break;
        case 'OrcamentoNota':
            requestData = {
                uri: "http://10.204.8.68:8083/Service/OrcamentoSap.svc/rest/GetOrcamentoSapBySolicitacaoId",
                body: "{ID}" // Caso especial: apenas o ID como string
            };
            break;
        default:
            criarMensagem(false, 'Tipo de solicitação inválido');
            return;
    }

    // Adicionar botão de download se não existir
    adicionarBotaoDownload();

    // Adicionar classe de loading ao botão
    sendBtn.classList.add('loading');
    tabelaContainer.innerHTML = '<div class="loading-message">Processando... Aguarde.<br>Isso pode levar alguns minutos dependendo da quantidade de IDs.</div>';
    tabelaContainer.style.display = 'block';

    const todosResultados = [];
    const inicioGlobal = Date.now();

    try {
        for (let i = 0; i < ids.length; i += CONFIG.TAMANHO_LOTE) {
            const inicioLote = Date.now();

            const resultadosLote = await processarLote(ids, requestData, i);
            todosResultados.push(...resultadosLote);

            const tempoLote = Date.now() - inicioLote;
            const progresso = Math.min(i + CONFIG.TAMANHO_LOTE, ids.length);

            console.log(`   ⏱️  Tempo do lote: ${(tempoLote / 1000).toFixed(1)}s | Progresso: ${progresso}/${ids.length} (${Math.round(progresso / ids.length * 100)}%)`);

            // Atualizar tabela progressivamente
            if (todosResultados.length > 0) {
                atualizarTabelaHTML(todosResultados);
            }

            if (i + CONFIG.TAMANHO_LOTE < ids.length) {
                console.log(`   ⏳ Aguardando ${CONFIG.DELAY_ENTRE_LOTES / 1000}s antes do próximo lote...`);
                await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_ENTRE_LOTES));
            }
        }

        const tempoTotal = (Date.now() - inicioGlobal) / 1000;

        // Atualizar tabela final
        atualizarTabelaHTML(todosResultados);

        // Estatísticas
        const sucessos = todosResultados.filter(r => r.status === 'sucesso').length;
        const erros = todosResultados.filter(r => r.status === 'erro').length;
        const totalItens = todosResultados.reduce((acc, item) => acc + (item.itemCount || 1), 0);

        console.log('\n' + '='.repeat(50));
        console.log('✅ PROCESSO FINALIZADO!');
        console.log('='.repeat(50));
        console.log('📊 RESUMO:');
        console.log(`   📦 IDs processados: ${todosResultados.length}`);
        console.log(`   ✅ Sucessos: ${sucessos}`);
        console.log(`   📊 Total de itens: ${totalItens}`);
        console.log(`   ❌ Erros: ${erros}`);
        console.log('='.repeat(50));
        const trLength = document.querySelectorAll('.tabela-resultados tbody tr').length;
        

        document.querySelector('.tabela-legenda').innerHTML = `
            <p>📦 IDs processados: ${todosResultados.length}</p>
            <p>✅ Sucessos: ${sucessos}</p>
            <p>📊 Total de itens: ${totalItens}</p>
            <p>❌ Erros: ${erros}</p>
            <p>📋 Resultado: ${trLength}/${resRequestLength} | ${((trLength/resRequestLength)*100).toFixed(2)}%</p>
        `;

        criarMensagem(true, 'Processamento concluído com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante o processamento:', error);
        criarMensagem(false, 'Erro durante o processamento:\n' + error.message);
        tabelaContainer.innerHTML = `<div class="erro-mensagem">Erro durante o processamento:<br>${error.message}</div>`;
    } finally {
        sendBtn.classList.remove('loading');
    }
}


// Expor funções para o onclick do botão
window.sendRequest = sendRequest;