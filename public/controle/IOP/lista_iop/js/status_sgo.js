async function lerIdsDoArquivo() {
    try {
        // Extrai IDs da tabela atual
        const ids = dadosTable.map(item => item.res_nota).filter(id => id);

        console.log(`✅ Encontrados ${ids.length} IDs válidos na tabela`);
        return ids;
    } catch (error) {
        console.error('❌ Erro ao extrair IDs da tabela:', error.message);
        return [];
    }
}

async function pegarInfonome_obras(nome_obra) {
    try {
        const response = await fetch("http://10.204.8.68:8083/Service/SolicitacaoInvestimentoService.svc/rest/ListarSolicitacaoInvestimentoPorNota", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
                "authorization": "Basic SjQwODIxNDQ5OnNITGg3M2xTZlh2M1VRM1FuVTRPIw",
                "content-type": "application/json;charset=UTF-8"
            },
            "body": JSON.stringify({ "Nota": nome_obra }),
            "method": "POST"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Retorna apenas o DescStatusNota se disponível
        if (Array.isArray(data) && data.length > 0) {
            // Se for array, retorna apenas o primeiro item
            return {
                id: nome_obra,
                DescStatusNota: data[0].DescStatusNota || null,
                status: 'sucesso',
                timestamp: new Date().toISOString()
            };
        } else if (data && typeof data === 'object') {
            // Se for objeto
            return {
                id: nome_obra,
                DescStatusNota: data.DescStatusNota || null,
                status: 'sucesso',
                timestamp: new Date().toISOString()
            };
        } else {
            return {
                id: nome_obra,
                DescStatusNota: null,
                status: 'sucesso',
                timestamp: new Date().toISOString()
            };
        }
        
    } catch (error) {
        console.error(`❌ Erro ao buscar nome_obra ${nome_obra}:`, error.message);
        return {
            id: nome_obra,
            DescStatusNota: null,
            error: error.message,
            status: 'erro',
            timestamp: new Date().toISOString()
        };
    }
}

// Função para atualizar apenas o campo res_status em dadosTable
async function atualizarResStatus(resultados) {
    try {
        console.log(`📊 Atualizando res_status para ${resultados.length} resultados`);
        
        let atualizados = 0;
        let naoEncontrados = 0;
        let erros = 0;
        
        // Para cada resultado, atualiza o campo res_status na linha correspondente
        resultados.forEach(resultado => {
            // Encontra o índice da linha em dadosTable com o ID correspondente
            const linhaIndex = dadosTable.findIndex(linha => linha.res_nota === resultado.id);
            
            if (linhaIndex !== -1) {
                // Atualiza APENAS o campo res_status
                if (resultado.status === 'sucesso' && resultado.DescStatusNota) {
                    dadosTable[linhaIndex].res_status = resultado.DescStatusNota;
                    dadosTable[linhaIndex].status_consulta = 'sucesso';
                    dadosTable[linhaIndex].data_consulta = new Date(resultado.timestamp).toLocaleString('pt-BR');
                    atualizados++;
                    console.log(`   ✅ ID ${resultado.id}: res_status atualizado para "${resultado.DescStatusNota}"`);
                } else if (resultado.status === 'erro') {
                    dadosTable[linhaIndex].status_consulta = 'erro';
                    dadosTable[linhaIndex].data_consulta = new Date(resultado.timestamp).toLocaleString('pt-BR');
                    dadosTable[linhaIndex].erro = resultado.error;
                    erros++;
                    console.log(`   ❌ ID ${resultado.id}: Erro na consulta - ${resultado.error}`);
                } else {
                    // Sucesso mas sem DescStatusNota
                    dadosTable[linhaIndex].status_consulta = 'sucesso';
                    dadosTable[linhaIndex].data_consulta = new Date(resultado.timestamp).toLocaleString('pt-BR');
                    dadosTable[linhaIndex].res_status = 'N/A';
                    atualizados++;
                    console.log(`   ⚠️  ID ${resultado.id}: Sem DescStatusNota na resposta`);
                }
            } else {
                // ID não encontrado na tabela
                naoEncontrados++;
                console.log(`   ⚠️  ID ${resultado.id} não encontrado em dadosTable`);
            }
        });
        
        console.log(`\n📊 RESUMO DA ATUALIZAÇÃO:`);
        console.log(`   - IDs encontrados e atualizados: ${atualizados}`);
        console.log(`   - IDs não encontrados na tabela: ${naoEncontrados}`);
        console.log(`   - IDs com erro na consulta: ${erros}`);
        
        return {
            atualizados,
            naoEncontrados,
            erros,
            totalLinhas: dadosTable.length
        };
        
    } catch (error) {
        console.error('❌ Erro ao atualizar res_status:', error);
        throw error;
    }
}

// Função para mostrar estatísticas de dadosTable
function mostrarEstatisticasDadosTable() {
    console.log('\n📊 ESTATÍSTICAS DA dadosTable:');
    console.log(`   - Total de linhas: ${dadosTable.length}`);
    
    if (dadosTable.length > 0) {
        // Conta status de consulta
        const statusCounts = {};
        dadosTable.forEach(item => {
            const status = item.status_consulta || 'não consultado';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        console.log('   - Distribuição por status da consulta:');
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`     ${status}: ${count}`);
        });
        
        // Conta valores diferentes de res_status
        const resStatusCounts = {};
        dadosTable.forEach(item => {
            if (item.res_status) {
                resStatusCounts[item.res_status] = (resStatusCounts[item.res_status] || 0) + 1;
            }
        });
        
        if (Object.keys(resStatusCounts).length > 0) {
            console.log('   - Distribuição de res_status:');
            Object.entries(resStatusCounts).forEach(([status, count]) => {
                console.log(`     "${status}": ${count}`);
            });
        }
        
        // Mostra exemplo dos primeiros registros
        console.log('\n🔍 EXEMPLO DOS PRIMEIROS REGISTROS:');
        const exemplos = dadosTable.slice(0, 3);
        exemplos.forEach((item, index) => {
            console.log(`   ${index + 1}. ID: ${item.res_nota}, res_status: "${item.res_status || 'N/A'}"`);
        });
    }
}

// Função principal para atualizar res_status
async function atualizarStatusNotas() {
    console.log('🚀 Iniciando atualização de res_status...');
    
    // Verifica se dadosTable tem dados
    if (dadosTable.length === 0) {
        console.log('⚠️  dadosTable está vazia. Nenhum ID para processar.');
        return;
    }
    
    const ids = await lerIdsDoArquivo();
    
    if (ids.length === 0) {
        console.log('⚠️  Nenhum ID encontrado para processar');
        mostrarEstatisticasDadosTable();
        return;
    }
    
    const todosResultados = [];
    
    console.log(`🔍 Iniciando consulta de ${ids.length} notas para atualizar res_status...`);
    
    // Processa em lotes para não sobrecarregar
    const batchSize = 10;
    for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        console.log(`\n📦 Processando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(ids.length/batchSize)} (${batch.length} IDs)`);
        
        // Processa cada ID no lote
        const batchPromises = batch.map(async (id, indexInBatch) => {
            console.log(`   [${i + indexInBatch + 1}/${ids.length}] Consultando ID: ${id}`);
            const resultado = await pegarInfonome_obras(id);
            return resultado;
        });
        
        // Aguarda todas as consultas do lote
        const batchResults = await Promise.all(batchPromises);
        todosResultados.push(...batchResults);
        
        // Atualiza dadosTable com os resultados do lote
        await atualizarResStatus(batchResults);
        
        // Delay entre lotes
        if (i + batchSize < ids.length) {
            console.log(`   ⏳ Aguardando 1 segundo antes do próximo lote...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    // Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('✅ ATUALIZAÇÃO DE res_status FINALIZADA!');
    console.log('='.repeat(60));
    
    const sucessos = todosResultados.filter(r => r.status === 'sucesso' && r.DescStatusNota).length;
    const sucessosSemStatus = todosResultados.filter(r => r.status === 'sucesso' && !r.DescStatusNota).length;
    const erros = todosResultados.filter(r => r.status === 'erro').length;
    
    console.log('\n📊 RESUMO FINAL:');
    console.log(`   - Total de IDs processados: ${ids.length}`);
    console.log(`   - Consultas com sucesso (com DescStatusNota): ${sucessos}`);
    console.log(`   - Consultas com sucesso (sem DescStatusNota): ${sucessosSemStatus}`);
    console.log(`   - Consultas com erro: ${erros}`);
    
    // Estatísticas detalhadas
    mostrarEstatisticasDadosTable();
    
    // Mostra alguns exemplos de atualizações
    console.log('\n🎯 EXEMPLOS DE ATUALIZAÇÕES REALIZADAS:');
    const atualizadosComSucesso = dadosTable.filter(item => 
        item.status_consulta === 'sucesso' && item.res_status
    );
    
    if (atualizadosComSucesso.length > 0) {
        const exemplos = atualizadosComSucesso.slice(0, 5);
        exemplos.forEach((item, index) => {
            console.log(`   ${index + 1}. ID ${item.res_nota}: res_status = "${item.res_status}"`);
        });
        
        if (atualizadosComSucesso.length > 5) {
            console.log(`   ... e mais ${atualizadosComSucesso.length - 5} registros`);
        }
    }
    
    console.log('\n💡 Campo res_status atualizado com sucesso!');
    render_dados()
}

// Função para adicionar dados à tabela (se necessário)
function adicionarDadosATabela(novosDados) {
    if (Array.isArray(novosDados)) {
        dadosTable.push(...novosDados);
        console.log(`✅ ${novosDados.length} registros adicionados à dadosTable`);
    } else {
        dadosTable.push(novosDados);
        console.log('✅ 1 registro adicionado à dadosTable');
    }
}

// Função para buscar status de um único ID
async function buscarStatusIndividual(id) {
    console.log(`🔍 Buscando status para ID: ${id}`);
    
    const resultado = await pegarInfonome_obras(id);
    
    // Encontra e atualiza na tabela
    const linhaIndex = dadosTable.findIndex(linha => linha.res_nota === id);
    
    if (linhaIndex !== -1) {
        if (resultado.status === 'sucesso' && resultado.DescStatusNota) {
            dadosTable[linhaIndex].res_status = resultado.DescStatusNota;
            dadosTable[linhaIndex].status_consulta = 'sucesso';
            dadosTable[linhaIndex].data_consulta = new Date().toLocaleString('pt-BR');
            console.log(`✅ Status atualizado: "${resultado.DescStatusNota}"`);
            return { sucesso: true, status: resultado.DescStatusNota };
        } else {
            console.log(`❌ Erro ou sem status na resposta`);
            return { sucesso: false, erro: resultado.error };
        }
    } else {
        console.log(`⚠️  ID ${id} não encontrado na tabela`);
        return { sucesso: false, erro: 'ID não encontrado na tabela' };
    }
}
