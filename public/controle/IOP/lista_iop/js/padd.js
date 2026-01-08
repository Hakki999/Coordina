// padd.js - Versão corrigida usando dadosTable

// Variáveis globais para controle de parcelas
let parcelasAtuais = [];
let iopIdAtual = null;

// Função para abrir modal com múltiplas parcelas (MODIFICADA)
function openParcelaModal(parcelaId) {
    console.log('Abrindo modal para ID:', parcelaId);
    
    const modal = document.querySelector('.parcela-container');
    modal.style.display = "flex";
    modal.setAttribute('data-parcela-id', parcelaId);
    iopIdAtual = parcelaId;

    // Limpar container primeiro
    const container = document.getElementById('parcelasContainer');
    if (container) {
        container.innerHTML = '';
    }

    // Buscar o item correspondente no dadosTable
    const item = dadosTable.find(item => item.id == parcelaId);
    console.log('Item encontrado no dadosTable:', item);

    if (item && item.parcelas_adicionais) {
        try {
            // Remover possíveis barras invertidas de escape
            let parcelasStr = item.parcelas_adicionais;
            
            // Se a string começa e termina com aspas, removê-las
            if (parcelasStr.startsWith('"') && parcelasStr.endsWith('"')) {
                parcelasStr = parcelasStr.slice(1, -1);
            }
            
            // Substituir aspas simples por aspas duplas se necessário
            parcelasStr = parcelasStr.replace(/'/g, '"');
            
            console.log('String de parcelas processada:', parcelasStr);
            
            // Tentar parsear as parcelas_adicionais
            const parcelasParseadas = JSON.parse(parcelasStr);
            console.log('Parcelas parseadas com sucesso:', parcelasParseadas);
            
            if (Array.isArray(parcelasParseadas) && parcelasParseadas.length > 0) {
                parcelasAtuais = parcelasParseadas;
                console.log('Parcelas carregadas no array:', parcelasAtuais);
                renderizarParcelasExistentes();
                return;
            } else {
                console.log('Array de parcelas vazio ou inválido');
            }
        } catch (error) {
            console.error('Erro ao parsear parcelas_adicionais:', error);
            console.log('String que causou erro:', item.parcelas_adicionais);
            
            // Tentar alternativa: se for um objeto único, colocar em array
            try {
                // Tentar parsear como objeto direto
                const parcelaUnica = JSON.parse(item.parcelas_adicionais);
                if (parcelaUnica && typeof parcelaUnica === 'object') {
                    parcelasAtuais = [parcelaUnica];
                    console.log('Parcela única carregada:', parcelasAtuais);
                    renderizarParcelasExistentes();
                    return;
                }
            } catch (e2) {
                console.error('Também falhou ao parsear como objeto:', e2);
            }
        }
    }
    
    // Se não houver parcelas válidas ou nenhuma parcela
    console.log('Nenhuma parcela encontrada, iniciando nova...');
    parcelasAtuais = [];
    adicionarNovaParcela();
}

function adicionarNovaParcela() {
    const template = document.getElementById('parcelaTemplate');
    if (!template) {
        console.error('Template de parcela não encontrado!');
        return;
    }
    
    const clone = template.content.cloneNode(true);
    const container = document.getElementById('parcelasContainer');
    if (!container) {
        console.error('Container de parcelas não encontrado!');
        return;
    }
    
    // Definir número da parcela
    const numero = parcelasAtuais.length + 1;
    const parcelaItem = clone.querySelector('.parcela-item');
    parcelaItem.setAttribute('data-index', parcelasAtuais.length);
    
    // Atualizar número da parcela
    const numeroElement = clone.querySelector('.parcela-numero');
    if (numeroElement) {
        numeroElement.textContent = numero;
    }
    
    // Setar data atual como padrão para acionamento
    const now = new Date();
    const acionamentoInput = clone.querySelector('.acionamentoData');
    if (acionamentoInput) {
        acionamentoInput.value = formatarParaInputDatetime(now);
    }
    
    // Setar data +5 horas para finalização
    const finalizacaoDate = new Date(now.getTime() + (5 * 60 * 60 * 1000));
    const finalizacaoInput = clone.querySelector('.finalizacaoData');
    if (finalizacaoInput) {
        finalizacaoInput.value = formatarParaInputDatetime(finalizacaoDate);
    }
    
    // Adicionar ao container
    container.appendChild(clone);
    
    // Calcular esta parcela
    if (acionamentoInput) {
        setTimeout(() => calcularEstaParcela(acionamentoInput), 100);
    }
}

function fecharModalParcelas() {
    const modal = document.querySelector('.parcela-container');
    if (modal) {
        modal.style.display = "none";
        modal.removeAttribute('data-parcela-id');
    }
}

// Função auxiliar para formatar data para input datetime-local
function formatarParaInputDatetime(dataString) {
    if (!dataString) return '';
    
    try {
        // Se já estiver no formato correto (YYYY-MM-DDTHH:MM), retornar como está
        if (typeof dataString === 'string' && dataString.includes('T')) {
            // Verificar se tem segundos, remover se tiver
            if (dataString.length > 16) {
                return dataString.slice(0, 16);
            }
            return dataString;
        }
        
        const data = new Date(dataString);
        // Ajustar para o fuso horário local
        const tzoffset = data.getTimezoneOffset() * 60000; // offset in milliseconds
        const localISOTime = new Date(data - tzoffset).toISOString().slice(0, 16);
        return localISOTime;
    } catch (e) {
        console.error('Erro ao formatar data:', e, 'String:', dataString);
        return '';
    }
}

// Função para renderizar parcelas existentes
function renderizarParcelasExistentes() {
    const container = document.getElementById('parcelasContainer');
    if (!container) {
        console.error('Container de parcelas não encontrado!');
        return;
    }
    
    container.innerHTML = '';
    
    if (!parcelasAtuais || parcelasAtuais.length === 0) {
        console.log('Nenhuma parcela para renderizar, adicionando nova...');
        adicionarNovaParcela();
        return;
    }
    
    console.log('Renderizando', parcelasAtuais.length, 'parcelas...');
    
    parcelasAtuais.forEach((parcela, index) => {
        const template = document.getElementById('parcelaTemplate');
        if (!template) {
            console.error('Template de parcela não encontrado!');
            return;
        }
        
        const clone = template.content.cloneNode(true);
        const parcelaItem = clone.querySelector('.parcela-item');
        parcelaItem.setAttribute('data-index', index);
        
        // Atualizar número
        const numeroElement = clone.querySelector('.parcela-numero');
        if (numeroElement) {
            numeroElement.textContent = index + 1;
        }
        
        // Preencher valores (formatando datas corretamente)
        const acionamentoInput = parcelaItem.querySelector('.acionamentoData');
        const chegadaInput = parcelaItem.querySelector('.chegadaData');
        const finalizacaoInput = parcelaItem.querySelector('.finalizacaoData');
        const tipoParcelaInput = parcelaItem.querySelector('.tipoParcela');
        const valorOrcadoInput = parcelaItem.querySelector('.valorOrcado');
        const observacoesInput = parcelaItem.querySelector('.observacoes');
        
        console.log('Parcela', index, 'dados:', parcela);
        
        if (acionamentoInput && parcela.res_acionamento) {
            acionamentoInput.value = formatarParaInputDatetime(parcela.res_acionamento);
        }
        if (chegadaInput && parcela.res_chegada) {
            chegadaInput.value = formatarParaInputDatetime(parcela.res_chegada);
        }
        if (finalizacaoInput && parcela.res_finalizacao) {
            finalizacaoInput.value = formatarParaInputDatetime(parcela.res_finalizacao);
        }
        if (tipoParcelaInput && parcela.res_tipo_parcela !== undefined) {
            tipoParcelaInput.value = parcela.res_tipo_parcela;
        }
        if (valorOrcadoInput && parcela.res_valor_orcado !== undefined) {
            valorOrcadoInput.value = parcela.res_valor_orcado;
        }
        if (observacoesInput && parcela.res_obs) {
            observacoesInput.value = parcela.res_obs;
        }
        
        // Atualizar displays
        const horasElement = parcelaItem.querySelector('.quantidadeHoras');
        const valorElement = parcelaItem.querySelector('.valorCalculado');
        const vozElement = parcelaItem.querySelector('.quantidadeVoz');
        
        if (horasElement) {
            horasElement.textContent = parcela.res_qtd_horas ? parseFloat(parcela.res_qtd_horas).toFixed(2) : '0';
        }
        if (valorElement) {
            valorElement.textContent = formatarMoeda(parcela.res_calculo);
        }
        if (vozElement) {
            vozElement.textContent = parcela.res_qtd_voz ? parseFloat(parcela.res_qtd_voz).toFixed(2) : '0';
        }
        
        container.appendChild(clone);
        
        // Adicionar event listeners aos inputs desta parcela
        setTimeout(() => {
            const inputs = parcelaItem.querySelectorAll('input, select');
            inputs.forEach(input => {
                if (input.classList.contains('acionamentoData') || 
                    input.classList.contains('chegadaData') || 
                    input.classList.contains('finalizacaoData') ||
                    input.classList.contains('tipoParcela') ||
                    input.classList.contains('valorOrcado')) {
                    input.addEventListener('change', (e) => calcularEstaParcela(e.target));
                    input.addEventListener('input', (e) => calcularEstaParcela(e.target));
                }
            });
        }, 100);
    });
    
    calcularTotais();
}

// MODIFIQUE a função render_dados para atualizar os botões com informações das parcelas
function render_dados() {
    data = dadosTable;
    // Update the table with the fetched data
    tableBody.innerHTML = ""; // Clear existing rows
    data.forEach(item => {
        const row = document.createElement("tr");
        row.setAttribute('data-id', item.id);
        
        // Processar parcelas_adicionais para mostrar no botão
        let totalParcelas = 0;
        let totalValor = 0;
        let tooltipText = 'Adicionar parcelas';
        
        if (item.parcelas_adicionais) {
            try {
                // Processar a string JSON
                let parcelasStr = item.parcelas_adicionais;
                if (parcelasStr.startsWith('"') && parcelasStr.endsWith('"')) {
                    parcelasStr = parcelasStr.slice(1, -1);
                }
                parcelasStr = parcelasStr.replace(/'/g, '"');
                
                const parcelas = JSON.parse(parcelasStr);
                if (Array.isArray(parcelas)) {
                    totalParcelas = parcelas.length;
                    totalValor = parcelas.reduce((sum, p) => sum + (p.res_calculo || 0), 0);
                    tooltipText = `${totalParcelas} parcela(s) - Total: ${formatarMoeda(totalValor)}`;
                } else if (parcelas && typeof parcelas === 'object') {
                    totalParcelas = 1;
                    totalValor = parcelas.res_calculo || 0;
                    tooltipText = `1 parcela - Total: ${formatarMoeda(totalValor)}`;
                }
            } catch (error) {
                console.error('Erro ao processar parcelas para display:', error);
            }
        }
        
        row.innerHTML = `
          <th style="display: flex; gap: 15px; align-items: center; justify-content: center; padding: 8px;">
            <button class="editButton" data-id="${item.id}">Edit</button>
            <button class="padd" data-id="${item.id}" onclick="openParcelaModal(${item.id})" 
                    title="${tooltipText}">
              ${totalParcelas > 0 ? `Parcelas (${totalParcelas})` : 'Parcela adicional'}
            </button>
          </th>
          <td>${item.res_nota || ''}</td>
          <td>${item.res_status || ''}</td>
          <td>${cidades.find(cidade => cidade.value === item.res_cidade)?.label || item.res_cidade || ''}</td>
          <td>${item.res_nome_obra || ''}</td>
          <td>${item.res_data_exe || ''}</td>
          <td>${item.res_resp || ''}</td>
        `;
        tableBody.appendChild(row);
    });

    document.querySelectorAll(".editButton").forEach(button => {
        button.addEventListener("click", () => {
            const id = button.getAttribute("data-id");
            const item = dadosTable.find(item => item.id == id);
            console.warn(item);

            abrirEdicao(item);
        });
    });
}

// Função para salvar todas as parcelas (ATUALIZADA para salvar em dadosTable)
function salvarTodasParcelas() {
    if (!iopIdAtual) {
        criarMensagem(false, 'ID do contrato não encontrado');
        return;
    }

    // Primeiro recalcula todas as parcelas
    const parcelasItems = document.querySelectorAll('.parcela-item');
    parcelasItems.forEach(item => {
        const acionamentoInput = item.querySelector('.acionamentoData');
        if (acionamentoInput) {
            calcularEstaParcela(acionamentoInput);
        }
    });

    console.log('Parcelas a serem salvas:', parcelasAtuais);

    // Atualizar o item no dadosTable
    const itemIndex = dadosTable.findIndex(item => item.id == iopIdAtual);
    if (itemIndex !== -1) {
        // Converter para string JSON
        const parcelasString = JSON.stringify(parcelasAtuais);
        dadosTable[itemIndex].parcelas_adicionais = parcelasString;
        
        console.log('DadosTable atualizado:', dadosTable[itemIndex]);
        
        // Enviar para o servidor (mantendo sua rota atual /parcelaadd)
        fetch('/parcelaadd', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: iopIdAtual,
                parcelas: parcelasAtuais
            }),
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Parcelas salvas com sucesso:', data);
            
            // Atualizar visualmente a linha da tabela
            const linha = document.querySelector(`tr[data-id="${iopIdAtual}"]`);
            if (linha) {
                const botaoParcela = linha.querySelector('.padd');
                if (botaoParcela) {
                    const total = parcelasAtuais.reduce((sum, p) => sum + (p.res_calculo || 0), 0);
                    botaoParcela.textContent = parcelasAtuais.length > 0 ? 
                        `Parcelas (${parcelasAtuais.length})` : 'Parcela adicional';
                    botaoParcela.setAttribute('title', 
                        parcelasAtuais.length > 0 ? 
                        `${parcelasAtuais.length} parcela(s) - Total: ${formatarMoeda(total)}` : 
                        'Adicionar parcelas');
                }
            }
            
            criarMensagem(true, `${parcelasAtuais.length} parcela(s) salva(s) com sucesso!`);
            fecharModalParcelas();
            
            // Opcional: recarregar os dados do servidor
            // buscar_dados();
        })
        .catch(error => {
            console.error('Erro ao salvar parcelas:', error);
            criarMensagem(false, 'Erro ao salvar parcelas: ' + error.message);
        });
    } else {
        criarMensagem(false, 'Erro ao salvar parcelas: ID do contrato nao encontrado na tabela');
    }
}

// Adicionar event listeners quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    // Event listener para o botão de fechar modal
    const fecharModalBtn = document.querySelector('.fechar-modal-parcelas');
    if (fecharModalBtn) {
        fecharModalBtn.addEventListener('click', fecharModalParcelas);
    }
    
    // Event listener para o botão de salvar parcelas
    const salvarParcelasBtn = document.querySelector('#salvarParcelas');
    if (salvarParcelasBtn) {
        salvarParcelasBtn.addEventListener('click', salvarTodasParcelas);
    }
    
    // Event listener para fechar modal clicando fora
    const modal = document.querySelector('.parcela-container');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                fecharModalParcelas();
            }
        });
    }
});

// Função para formatar moeda (se não existir)
if (typeof formatarMoeda === 'undefined') {
    function formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor || 0);
    }
}

// Função para calcular uma parcela específica (se não existir)
if (typeof calcularEstaParcela === 'undefined') {
    function calcularEstaParcela(elemento) {
        const parcelaItem = elemento.closest('.parcela-item');
        if (!parcelaItem) return;
        
        const index = parseInt(parcelaItem.getAttribute('data-index'));
        
        // Obter valores dos inputs
        const acionamento = parcelaItem.querySelector('.acionamentoData')?.value;
        const chegada = parcelaItem.querySelector('.chegadaData')?.value;
        const finalizacao = parcelaItem.querySelector('.finalizacaoData')?.value;
        const tipoParcela = parseFloat(parcelaItem.querySelector('.tipoParcela')?.value) || 0;
        const valorOrcado = parseFloat(parcelaItem.querySelector('.valorOrcado')?.value) || 0;
        
        // Calcular horas
        let horasTrabalhadas = 0;
        if (acionamento && finalizacao) {
            const inicio = new Date(acionamento);
            const fim = new Date(finalizacao);
            const diferencaMs = Math.abs(fim - inicio);
            horasTrabalhadas = (diferencaMs / (1000 * 60 * 60)).toFixed(2);
        }
        
        // Calcular valor
        const valorCalculado = (horasTrabalhadas * tipoParcela) - valorOrcado;
        const qtdVoz = tipoParcela > 0 ? (valorCalculado / tipoParcela).toFixed(2) : 0;
        
        // Atualizar display
        const horasElement = parcelaItem.querySelector('.quantidadeHoras');
        const valorElement = parcelaItem.querySelector('.valorCalculado');
        const vozElement = parcelaItem.querySelector('.quantidadeVoz');
        
        if (horasElement) horasElement.textContent = horasTrabalhadas;
        if (valorElement) valorElement.textContent = formatarMoeda(valorCalculado);
        if (vozElement) vozElement.textContent = qtdVoz;
        
        // Atualizar ou adicionar ao array
        const parcelaData = {
            res_acionamento: acionamento || null,
            res_chegada: chegada || null,
            res_finalizacao: finalizacao || null,
            res_qtd_horas: parseFloat(horasTrabalhadas) || 0,
            res_tipo_parcela: tipoParcela,
            res_valor_orcado: valorOrcado,
            res_calculo: valorCalculado,
            res_qtd_voz: parseFloat(qtdVoz) || 0,
            res_obs: parcelaItem.querySelector('.observacoes')?.value || null
        };
        
        if (parcelasAtuais[index]) {
            parcelasAtuais[index] = parcelaData;
        } else {
            parcelasAtuais.push(parcelaData);
        }
        
        // Atualizar totais
        calcularTotais();
    }
}

// Função para calcular totais (se não existir)
if (typeof calcularTotais === 'undefined') {
    function calcularTotais() {
        let totalHoras = 0;
        let totalValor = 0;
        let totalVoz = 0;
        
        parcelasAtuais.forEach(parcela => {
            totalHoras += parcela.res_qtd_horas || 0;
            totalValor += parcela.res_calculo || 0;
            totalVoz += parcela.res_qtd_voz || 0;
        });
        
        const totalHorasElement = document.getElementById('totalHoras');
        const totalValorElement = document.getElementById('totalValor');
        const totalVozElement = document.getElementById('totalVoz');
        
        if (totalHorasElement) totalHorasElement.textContent = totalHoras.toFixed(2);
        if (totalValorElement) totalValorElement.textContent = formatarMoeda(totalValor);
        if (totalVozElement) totalVozElement.textContent = totalVoz.toFixed(2);
    }
}

// Função para remover parcela (se não existir)
if (typeof removerParcela === 'undefined') {
    function removerParcela(botao) {
        const parcelaItem = botao.closest('.parcela-item');
        if (!parcelaItem) return;
        
        const index = parseInt(parcelaItem.getAttribute('data-index'));
        
        // Remover do array
        if (parcelasAtuais[index]) {
            parcelasAtuais.splice(index, 1);
        }
        
        // Remover do DOM
        parcelaItem.remove();
        
        // Reindexar e recalcular
        reindexarParcelas();
        calcularTotais();
    }
}

// Função para reindexar parcelas (se não existir)
if (typeof reindexarParcelas === 'undefined') {
    function reindexarParcelas() {
        const parcelasItems = document.querySelectorAll('.parcela-item');
        
        parcelasItems.forEach((item, novoIndex) => {
            item.setAttribute('data-index', novoIndex);
            const numeroElement = item.querySelector('.parcela-numero');
            if (numeroElement) {
                numeroElement.textContent = novoIndex + 1;
            }
            
            // Recalcular para atualizar array
            const acionamentoInput = item.querySelector('.acionamentoData');
            if (acionamentoInput) {
                calcularEstaParcela(acionamentoInput);
            }
        });
    }
}