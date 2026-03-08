// Função simplificada para buscar status das notas
async function get_status(ids) {
    console.log('🚀 Iniciando busca de status...');

    if (!Array.isArray(ids)) {
        ids = [ids]; // Converte para array se for único
    }

    const resultados = [];

    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        console.log(`📋 [${i + 1}/${ids.length}] Buscando status para: ${id}`);
        criarMensagem(true, `Buscando status para a nota ${id}... <br> 📋 [${i + 1}/${ids.length}]`);
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
            console.log(data);

            resultados.push({
                id: dadosTable.find(item => item.res_nota === id)?.id || null,
                res_sap: data[0]?.SolicitacaoId || null,
                res_status: data[0]?.DescStatusNota || null,
                status: 'sucesso',
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            resultados.push({
                id: dadosTable.find(item => item.res_nota === id)?.id || null,
                res_sap: null,
                res_status: null,
                error: error.message,
                status: 'erro',
                timestamp: new Date().toISOString()
            });
        }

        // Delay pequeno entre requisições
        if (i < ids.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    console.log(`✅ Busca concluída: ${resultados.length} resultados: \n ${JSON.stringify(resultados, null, 2)}`);
    return resultados;
}

// Função simplificada para buscar orçamento SAP
async function get_orcamento(res_sap_ids) {
    console.log('💰 Iniciando busca de orçamentos SAP...');

    if (!Array.isArray(res_sap_ids)) {
        res_sap_ids = [res_sap_ids]; // Converte para array se for único
    }

    const resultados = [];

    for (let i = 0; i < res_sap_ids.length; i++) {
        const sapId = res_sap_ids[i];
        console.log(`📊 [${i + 1}/${res_sap_ids.length}] Buscando orçamento para ID SAP: ${sapId}`);
        criarMensagem(true, `Buscando orçamento para o ID SAP ${sapId}... <br> � [${i + 1}/${res_sap_ids.length}]`);
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

            resultados.push({
                res_sap: sapId,
                res_orcamento: data.MoTotal,
                status: 'sucesso',
                timestamp: new Date().toISOString()
            });
            console.log(data);


        } catch (error) {
            resultados.push({
                res_sap: sapId,
                orcamento: null,
                error: error.message,
                status: 'erro',
                timestamp: new Date().toISOString()
            });
        }

        // Delay pequeno entre requisições
        if (i < res_sap_ids.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    console.log(`✅ Busca de orçamentos concluída: ${resultados.length} resultados`);
    return resultados;
}

// Exemplos de uso simples:
// 
// 1. Buscar status de uma única nota:
// get_status('12345').then(resultado => console.log(resultado));
//
// 2. Buscar status de várias notas:
// get_status(['12345', '67890', '54321']).then(resultados => console.log(resultados));
//
// 3. Buscar orçamento de um ID SAP:
// get_orcamento('210839').then(resultado => console.log(resultado));
//
// 4. Buscar orçamento de vários IDs SAP:
// get_orcamento(['210839', '210840', '210841']).then(resultados => console.log(resultados));

function main_status() {
    let notas = dadosTable.map(item => item.res_nota);
    console.log(notas);
    get_status(notas).then(resultados => {

        resultados.forEach(resultado => {
            console.warn(resultado);

            atualizarDados(resultado)
        });
    });
}

function main_orcamento() {
    let sapIds = dadosTable.map(item => item.res_sap);
    get_orcamento(sapIds).then(resultados => {
        resultados.forEach(resultado => {
            resultado.id = dadosTable.find(item => item.res_sap === resultado.res_sap).id;
            atualizarDados(resultado)
        });
    });
}