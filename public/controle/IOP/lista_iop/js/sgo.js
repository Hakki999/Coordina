const { buscarDados } = require("../../../../../js/db/connect");

// Configurações
const CONFIG = {
    BATCH_SIZE: 10,
    DELAY_BETWEEN_REQUESTS: 50,
    IGNORE_STATUS: ['Obra Comissionada'],
    RETRY_ATTEMPTS: 2,
    RETRY_DELAY: 1000,
    DB_UPDATE_INTERVAL: 100
};

// Cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

// Fila de updates
let dbUpdateQueue = [];
let dbUpdateTimer = null;

/**
 * Versão otimizada de get_status - mesmo nome da original
 */
async function get_status(ids) {
    console.log('🚀 Iniciando busca otimizada de status...');
    criarMensagem(true, '🚀 Iniciando busca otimizada de status...');

    if (!Array.isArray(ids)) {
        ids = [ids];
    }

    const resultados = [];

    // Processa em lotes para maior performance
    for (let i = 0; i < ids.length; i += CONFIG.BATCH_SIZE) {
        const batch = ids.slice(i, i + CONFIG.BATCH_SIZE);
        console.log(`📦 Processando lote ${Math.floor(i / CONFIG.BATCH_SIZE) + 1} com ${batch.length} notas`);
        criarMensagem(true, `📦 Processando lote ${Math.floor(i / CONFIG.BATCH_SIZE) + 1}...`);

        const batchPromises = batch.map(id => buscarStatusIndividual(id));
        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach((result, index) => {
            const id = batch[index];

            if (result.status === 'fulfilled' && result.value) {
                const resultado = result.value;

                // Verifica se é ignorado (só para log, mas SALVA mesmo assim)
                if (CONFIG.IGNORE_STATUS.includes(resultado.res_status)) {
                    console.log(`⏭️ Nota ${id} com status "${resultado.res_status}" - ignorado para processamento, mas SALVO no banco`);
                }

                resultados.push(resultado);

                // Atualiza cache
                cache.set(`status_${id}`, {
                    data: resultado,
                    timestamp: Date.now()
                });

                // Atualiza DB imediatamente (não espera lote terminar)
                if (typeof atualizarDados === 'function') {
                    try {
                        atualizarDados(resultado);
                        console.log(`💾 Registro ${resultado.id || id} atualizado no banco`);
                    } catch (error) {
                        console.error(`❌ Erro ao atualizar banco:`, error);
                    }
                }
            } else {
                console.error(`❌ Falha ao buscar nota ${id}:`, result.reason);

                // Registra erro no banco também
                const erroResultado = {
                    id: dadosTable?.find(item => item.res_nota === id)?.id || null,
                    res_nota: id,
                    res_sap: null,
                    res_status: null,
                    error: result.reason?.message || 'Erro desconhecido',
                    status: 'erro',
                    timestamp: new Date().toISOString()
                };

                resultados.push(erroResultado);

                if (typeof atualizarDados === 'function') {
                    try {
                        atualizarDados(erroResultado);
                    } catch (error) {
                        console.error(`❌ Erro ao registrar falha no banco:`, error);
                    }
                }
            }
        });

        // Progresso
        const progresso = Math.min(i + CONFIG.BATCH_SIZE, ids.length);
        console.log(`📊 Progresso: ${progresso}/${ids.length} notas processadas`);
        criarMensagem(true, `📊 Progresso: ${progresso}/${ids.length} notas processadas...`);

        // Delay entre lotes
        if (i + CONFIG.BATCH_SIZE < ids.length) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_REQUESTS));
        }
    }

    console.log(`✅ Busca concluída: ${resultados.length} resultados salvos no banco`);
    criarMensagem(true, `✅ Busca concluída: ${resultados.length} resultados salvos no banco`);

    return resultados;
}

/**
 * Função auxiliar para buscar status individual com retry
 */
async function buscarStatusIndividual(id, tentativa = 1) {
    try {
        const response = await fetch("http://10.204.8.68:8083/Service/SolicitacaoInvestimentoService.svc/rest/ListarSolicitacaoInvestimentoPorNota", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
                "authorization": "Basic SjQwODIxNDQ5OjEwUDx5KWMiYlhUJncwXnQtU159",
                "content-type": "application/json;charset=UTF-8"
            },
            "body": JSON.stringify({ "Nota": id }),
            "method": "POST"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Encontra o ID correspondente no dadosTable
        const item = Array.isArray(dadosTable) ? dadosTable.find(item => item.res_nota === id) : null;

        return {
            id: item?.id || null,
            res_nota: id,
            res_sap: data[0]?.SolicitacaoId || null,
            res_status: data[0]?.DescStatusNota || null,
            status: 'sucesso',
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error(`❌ Erro na tentativa ${tentativa} para nota ${id}:`, error.message);

        if (tentativa < CONFIG.RETRY_ATTEMPTS) {
            console.log(`🔄 Retentando em ${CONFIG.RETRY_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
            return buscarStatusIndividual(id, tentativa + 1);
        }

        throw error;
    }
}

/**
 * Versão otimizada de get_orcamento - mesmo nome da original
 */
async function get_orcamento(res_sap_ids) {
    console.log('💰 Iniciando busca otimizada de orçamentos SAP...');
    criarMensagem(true, '💰 Iniciando busca otimizada de orçamentos...');

    if (!Array.isArray(res_sap_ids)) {
        res_sap_ids = [res_sap_ids];
    }

    // Filtra IDs válidos
    res_sap_ids = res_sap_ids.filter(id => id && id !== 'null' && id !== 'undefined');

    if (res_sap_ids.length === 0) {
        console.log('⚠️ Nenhum ID SAP válido para buscar');
        return [];
    }

    const resultados = [];

    // Processa em lotes
    for (let i = 0; i < res_sap_ids.length; i += CONFIG.BATCH_SIZE) {
        const batch = res_sap_ids.slice(i, i + CONFIG.BATCH_SIZE);
        console.log(`📦 Processando lote ${Math.floor(i / CONFIG.BATCH_SIZE) + 1} com ${batch.length} orçamentos`);

        const batchPromises = batch.map(sapId => buscarOrcamentoIndividual(sapId));
        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach((result, index) => {
            const sapId = batch[index];

            if (result.status === 'fulfilled' && result.value) {
                const resultado = result.value;
                resultados.push(resultado);

                // Encontra o ID correspondente
                const item = Array.isArray(dadosTable) ? dadosTable.find(item => item.res_sap === sapId) : null;

                // Atualiza DB imediatamente
                if (typeof atualizarDados === 'function') {
                    try {
                        atualizarDados({
                            id: item?.id || null,
                            res_sap: sapId,
                            res_orcamento: resultado.res_orcamento
                        });
                        console.log(`💾 Orçamento SAP ${sapId} atualizado no banco`);
                    } catch (error) {
                        console.error(`❌ Erro ao atualizar orçamento no banco:`, error);
                    }
                }
            } else {
                console.error(`❌ Falha ao buscar orçamento SAP ${sapId}:`, result.reason);
            }
        });

        // Progresso
        const progresso = Math.min(i + CONFIG.BATCH_SIZE, res_sap_ids.length);
        console.log(`📊 Orçamentos: ${progresso}/${res_sap_ids.length} processados`);
        criarMensagem(true, `📊 Orçamentos: ${progresso}/${res_sap_ids.length} processados...`);

        if (i + CONFIG.BATCH_SIZE < res_sap_ids.length) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_REQUESTS));
        }
    }

    console.log(`✅ Busca de orçamentos concluída: ${resultados.length} resultados salvos no banco`);
    criarMensagem(true, `✅ Orçamentos concluídos: ${resultados.length} resultados salvos`);

    return resultados;
}

/**
 * Função auxiliar para buscar orçamento individual com retry
 */
async function buscarOrcamentoIndividual(sapId, tentativa = 1) {
    try {
        const response = await fetch("http://10.204.8.68:8083/Service/OrcamentoSap.svc/rest/GetOrcamentoSapBySolicitacaoId", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
                "authorization": "Basic SjQwODIxNDQ5OjEwUDx5KWMiYlhUJncwXnQtU159",
                "content-type": "application/json;charset=UTF-8"
            },
            "body": sapId.toString(),
            "method": "POST"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return {
            res_sap: sapId,
            res_orcamento: data.MoTotal,
            status: 'sucesso',
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error(`❌ Erro na tentativa ${tentativa} para SAP ${sapId}:`, error.message);

        if (tentativa < CONFIG.RETRY_ATTEMPTS) {
            console.log(`🔄 Retentando em ${CONFIG.RETRY_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
            return buscarOrcamentoIndividual(sapId, tentativa + 1);
        }

        throw error;
    }
}

/**
 * main_status otimizado - mesmo nome da original
 */
function main_status() {
    console.log('🚀 Iniciando main_status otimizado...');

    if (!Array.isArray(dadosTable)) {
        console.error('❌ dadosTable não encontrado ou não é um array');
        return;
    }

    // PEGA TODAS as notas, independente do status
    const todasNotas = dadosTable
        .map(item => item.res_nota)
        .filter(nota => nota && nota !== 'null' && nota !== 'undefined');

    console.log(`📋 Total de notas a processar: ${todasNotas.length}`);
    console.log(`📋 Status ignorados durante processamento: ${CONFIG.IGNORE_STATUS.join(', ')}`);
    console.log('📋 NOTA: Todos os resultados serão SALVOS no banco!');

    // Chama a função get_status otimizada
    get_status(todasNotas).then(resultados => {
        console.log(`✅ main_status concluído! ${resultados.length} notas processadas`);
        console.log(`📊 Status ignorados encontrados: ${resultados.filter(r => CONFIG.IGNORE_STATUS.includes(r.res_status)).length}`);
    });
}

/**
 * main_orcamento otimizado - mesmo nome da original
 */
function main_orcamento() {
    console.log('💰 Iniciando main_orcamento otimizado...');

    if (!Array.isArray(dadosTable)) {
        console.error('❌ dadosTable não encontrado ou não é um array');
        return;
    }

    // PEGA TODOS os SAP IDs válidos
    const todosSapIds = dadosTable
        .map(item => item.res_sap)
        .filter(id => id && id !== 'null' && id !== 'undefined');

    console.log(`📊 Total de orçamentos a processar: ${todosSapIds.length}`);

    // Chama a função get_orcamento otimizada
    get_orcamento(todosSapIds).then(resultados => {
        console.log(`✅ main_orcamento concluído! ${resultados.length} orçamentos processados`);
    });
}

// Substitui as funções originais pelas otimizadas
console.log('🚀 Versões otimizadas carregadas!');
console.log('📌 As funções originais foram substituídas:');
console.log('   - get_status (otimizado)');
console.log('   - get_orcamento (otimizado)');
console.log('   - main_status (otimizado)');
console.log('   - main_orcamento (otimizado)');
console.log('📌 Todos os resultados são SALVOS no banco imediatamente!');

/**
 * Versão corrigida - processa múltiplas notas
 */
async function buscarPEPIndividual(ids, tentativa = 1) {
    // Se for um array, processa em lote
    if (Array.isArray(ids)) {
        console.log(`🚀 Processando ${ids.length} notas em lote...`);
        
        const resultados = [];
        const BATCH_SIZE = 10; // Processa 10 por vez
        
        for (let i = 0; i < ids.length; i += BATCH_SIZE) {
            const batch = ids.slice(i, i + BATCH_SIZE);
            console.log(`📦 Lote ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(ids.length/BATCH_SIZE)}`);
            
            // Processa todas as notas do lote em paralelo
            const batchPromises = batch.map(nota => processarNotaIndividual(nota));
            const batchResults = await Promise.allSettled(batchPromises);
            
            // Coleta resultados
            batchResults.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    resultados.push(result.value);
                    
                    // Salva no banco imediatamente
                    if (typeof atualizarDados === 'function') {
                        try {
                            atualizarDados(result.value);
                            console.log(`💾 Nota ${result.value.res_nota} salva no banco`);
                        } catch (error) {
                            console.error(`❌ Erro ao salvar no banco:`, error);
                        }
                    }
                }
            });
            
            console.log(`📊 Progresso: ${Math.min(i + BATCH_SIZE, ids.length)}/${ids.length}`);
        }
        
        console.log(`✅ Processamento concluído! ${resultados.length} notas processadas`);
        return resultados;
    }
    
    // Se for ID único, processa apenas um
    return processarNotaIndividual(ids, tentativa);
}

/**
 * Função auxiliar para processar uma única nota
 */
async function processarNotaIndividual(id, tentativa = 1) {
    try {
        console.log(`🔍 Buscando PEP para nota ${id}...`);
        
        const response = await fetch("http://10.204.8.68:8083/Service/SolicitacaoInvestimentoService.svc/rest/carregarMaterialNota", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
                "authorization": "Basic SjQwODIxNDQ5OjEwUDx5KWMiYlhUJncwXnQtU159",
                "content-type": "application/json;charset=UTF-8"
            },
            "body": JSON.stringify({ "notaSAP": id, "usuarioLogado": "J40821449" }),
            "method": "POST"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Encontra o ID correspondente no dadosTable
        const item = Array.isArray(dadosTable) ? dadosTable.find(item => item.res_nota === id) : null;
        console.warn(data);
        
        const resultado = {
            id: item?.id || null,
            res_nota: id,
            res_pep: data[0]?.Pep || null
        };

        console.log(`✅ PEP encontrado para nota ${id}:`, resultado);
        return resultado;

    } catch (error) {
        console.error(`❌ Erro na tentativa ${tentativa} para nota ${id}:`, error.message);

        // Se tiver tentativas restantes
        if (tentativa < 3) {
            console.log(`🔄 Tentativa ${tentativa + 1} em 1 segundo...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return processarNotaIndividual(id, tentativa + 1);
        }

        // Retorna objeto de erro
        return {
            id: Array.isArray(dadosTable) ? dadosTable.find(item => item.res_nota === id)?.id : null,
            res_nota: id,
            error: error.message,
            status: 'erro',
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Versão otimizada de main_pep
 */
async function main_pep() {
    console.log('🚀 Iniciando main_pep...');

    if (!Array.isArray(dadosTable)) {
        console.error('❌ dadosTable não encontrado ou não é um array');
        return;
    }

    // PEGA TODAS as notas, independente do status
    const todasNotas = dadosTable
        .map(item => item.res_nota)
        .filter(nota => nota && nota !== 'null' && nota !== 'undefined');

    console.log(`📋 Total de notas a processar: ${todasNotas.length}`);
    console.log('📋 Todos os resultados serão SALVOS no banco!');

    try {
        // Chama a função com array de notas
        const resultados = await buscarPEPIndividual(todasNotas);
        
        const sucessos = resultados.filter(r => r.status === 'sucesso').length;
        const erros = resultados.filter(r => r.status === 'erro').length;
        
        console.log('='.repeat(50));
        console.log(`✅ main_pep concluído!`);
        console.log(`📊 Total: ${resultados.length} notas`);
        console.log(`✅ Sucessos: ${sucessos}`);
        console.log(`❌ Erros: ${erros}`);
        console.log('='.repeat(50));
        
        return resultados;
    } catch (error) {
        console.error('❌ Erro fatal em main_pep:', error);
    }
}

console.log('✅ Funções PEP carregadas!');
console.log('📌 Comandos disponíveis:');
console.log('   - main_pep() - Processa todas as notas');
console.log('   - buscarPEPIndividual(["123", "456"]) - Processa notas específicas');
console.log('   - testarPEP("123") - Testa uma única nota');