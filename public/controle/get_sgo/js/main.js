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
   background-color: #1e1e1e;
   border-radius: 10px;
   padding: 10px;
   box-sizing: border-box;
   display: none;
   color: #e0e0e0;
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

// Função principal de requisição com retry (CORRIGIDA para booleanos)
async function fazerRequisicaoComRetry(id, requestData, tentativa = 1) {
   try {
      // Verificar se é uma requisição múltipla (array de URIs)
      if (Array.isArray(requestData.uri)) {
         // Processar todas as URIs em paralelo para este ID
         const promessasMultiplas = requestData.uri.map(async (uri, index) => {
            try {
               const controller = new AbortController();
               const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_REQUEST);

               // Substituir placeholder pelo ID atual
               let body = requestData.body;
               if (typeof body === 'string') {
                  body = body.replace(/{ID}/g, id);
               }

               console.log(`📤 Enviando requisição para ${uri} com ID ${id}`);
               
               const response = await fetch(uri, {
                  "headers": {
                     "accept": "application/json, text/plain, */*",
                     "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
                     "authorization": "Basic SjQwODIxNDQ5OjEwUDx5KWMiYlhUJncwXnQtU159",
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
               
               // Extrair o nome do endpoint da URI para identificar
               const uriParts = uri.split('/');
               const endpointName = uriParts[uriParts.length - 1] || `Endpoint_${index + 1}`;

               console.log(`✅ Resposta recebida de ${endpointName} para ID ${id}:`, data);

               // Retornar um objeto padronizado - TRATANDO BOOLEANOS
               return {
                  id: id,
                  endpoint: endpointName,
                  uri: uri,
                  data: data,
                  valor: data, // Guardar o valor bruto (pode ser true/false)
                  status: 'sucesso',
                  timestamp: new Date().toISOString(),
                  endpointIndex: index,
                  tipoResposta: typeof data // 'boolean', 'object', etc.
               };

            } catch (error) {
               if (error.name === 'AbortError') {
                  console.log(`⏰ Timeout no ID ${id} - Endpoint ${index + 1}`);
               } else {
                  console.log(`❌ Erro no ID ${id} - Endpoint ${index + 1}:`, error.message);
               }

               return {
                  id: id,
                  endpoint: `Endpoint_${index + 1}`,
                  uri: uri,
                  error: error.message,
                  status: 'erro',
                  timestamp: new Date().toISOString(),
                  endpointIndex: index
               };
            }
         });

         // Aguardar todas as requisições múltiplas
         const resultadosMultiplos = await Promise.allSettled(promessasMultiplas);
         
         // Processar resultados - achatar a estrutura
         const resultadosProcessados = [];
         resultadosMultiplos.forEach((resultado) => {
            if (resultado.status === 'fulfilled') {
               // Adicionar o resultado diretamente
               resultadosProcessados.push(resultado.value);
            } else {
               // Tratar falha na promessa
               resultadosProcessados.push({
                  id: id,
                  endpoint: 'Erro',
                  error: resultado.reason?.message || 'Erro desconhecido na promessa',
                  status: 'erro',
                  timestamp: new Date().toISOString()
               });
            }
         });

         return resultadosProcessados;
      } 
      // Requisição única (comportamento original)
      else {
         const controller = new AbortController();
         const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_REQUEST);

         // Substituir placeholder pelo ID atual
         let body = requestData.body;
         if (typeof body === 'string') {
            body = body.replace(/{ID}/g, id);
         }

         console.log(`📤 Enviando requisição única para ${requestData.uri} com ID ${id}`);

         let key = 'SjQwODIxNDQ5OjEwUDx5KWMiYlhUJncwXnQtU159';

         if (localStorage.getItem('role') == "EQTL") {
            key = 'pdsfisdoifhsdfohsd o';
         }

         const response = await fetch(requestData.uri, {
            "headers": {
               "accept": "application/json, text/plain, */*",
               "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
               "authorization": "Basic " + key,
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
               endpoint: 'Único',
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
               endpoint: 'Único',
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
               endpoint: 'Único',
               itemData: {},
               data: {},
               status: 'sucesso',
               timestamp: new Date().toISOString(),
               isMultiple: false,
               itemCount: 0,
               itemIndex: 0
            }];
         }
      }

   } catch (error) {
      console.log(`❌ Erro capturado no ID ${id}:`, error);

      if (tentativa < CONFIG.MAX_RETRIES) {
         console.log(`🔄 Tentativa ${tentativa + 1}/${CONFIG.MAX_RETRIES} para ID ${id}`);
         await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
         return fazerRequisicaoComRetry(id, requestData, tentativa + 1);
      }

      // Se for requisição múltipla, retornar erro para cada endpoint
      if (Array.isArray(requestData.uri)) {
         return requestData.uri.map((uri, index) => ({
            id: id,
            endpoint: `Endpoint_${index + 1}`,
            uri: uri,
            error: error.message,
            status: 'erro',
            timestamp: new Date().toISOString(),
            endpointIndex: index
         }));
      }

      return [{
         id: id,
         endpoint: 'Único',
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

   console.log(`\n📦 Processando lote ${Math.floor(inicio / CONFIG.TAMANHO_LOTE) + 1}: IDs ${inicio + 1} até ${fim} (${lote.length} IDs)`);

   const promessas = lote.map(id => fazerRequisicaoComRetry(id, requestData));
   const resultadosLote = await Promise.allSettled(promessas);

   const resultadosProcessados = [];
   resultadosLote.forEach((resultado, index) => {
      const id = lote[index];

      if (resultado.status === 'fulfilled') {
         const dados = resultado.value;
         
         // Garantir que dados é um array
         if (Array.isArray(dados)) {
            // Adicionar todos os resultados diretamente
            dados.forEach(item => {
               resultadosProcessados.push(item);
            });
            
            // Logging
            if (Array.isArray(requestData.uri)) {
               const sucessos = dados.filter(r => r && r.status === 'sucesso').length;
               const erros = dados.filter(r => r && r.status === 'erro').length;
               console.log(`   📍 ${id}: ${sucessos} sucessos, ${erros} erros`);
               
               // Mostrar valores booleanos no log
               dados.filter(r => r && r.status === 'sucesso').forEach(r => {
                  console.log(`      ${r.endpoint}: ${r.valor}`);
               });
            } else {
               const sucessos = dados.filter(r => r && r.status === 'sucesso').length;
               console.log(`   ✅ ${id}: ${sucessos} resultado(s)`);
            }
         } else {
            console.log(`   ⚠️ ${id}: Resultado inesperado`, dados);
         }
      } else {
         console.log(`   ❌ ${id}: Falha na promessa`);
         
         if (Array.isArray(requestData.uri)) {
            requestData.uri.forEach((uri, idx) => {
               resultadosProcessados.push({
                  id: id,
                  endpoint: `Endpoint_${idx + 1}`,
                  uri: uri,
                  error: resultado.reason?.message || 'Erro desconhecido na promessa',
                  status: 'erro',
                  timestamp: new Date().toISOString()
               });
            });
         } else {
            resultadosProcessados.push({
               id: id,
               endpoint: 'Único',
               error: resultado.reason?.message || 'Erro desconhecido na promessa',
               status: 'erro',
               timestamp: new Date().toISOString()
            });
         }
      }
   });

   return resultadosProcessados;
}

// Função para extrair todos os campos dos resultados (CORRIGIDA para booleanos)
function extrairTodosCampos(resultados) {
   const camposBase = [
      'ID_Original',
      'Endpoint',
      'Status',
      'DataConsulta',
      'Valor_Retornado',  // Novo campo para valores booleanos
      'Tipo_Resposta',
      'Erro'
   ];

   const camposDados = new Set();

   resultados.forEach(resultado => {
      if (resultado.status === 'sucesso') {
         // Se for um objeto com propriedades
         if (resultado.data && typeof resultado.data === 'object' && !Array.isArray(resultado.data)) {
            Object.keys(resultado.data).forEach(chave => {
               if (typeof resultado.data[chave] !== 'object') {
                  camposDados.add(chave);
               }
            });
         }
         // Se for um array
         else if (resultado.data && Array.isArray(resultado.data) && resultado.data.length > 0) {
            const primeiroItem = resultado.data[0];
            if (typeof primeiroItem === 'object') {
               Object.keys(primeiroItem).forEach(chave => {
                  if (typeof primeiroItem[chave] !== 'object') {
                     camposDados.add(chave);
                  }
               });
            }
         }
         // Se for um valor primitivo (boolean, number, string)
         else if (resultado.valor !== undefined) {
            camposDados.add('Valor');
         }
      }
   });

   const camposOrdenados = Array.from(camposDados).sort();
   return [...camposBase, ...camposOrdenados];
}

// Função para converter item em linha CSV (CORRIGIDA para booleanos)
function converterItemParaLinhaCSV(item, campos) {
   const linha = [];

   campos.forEach(campo => {
      let valor = '';

      switch (campo) {
         case 'ID_Original':
            valor = item.id || '';
            break;
         case 'Endpoint':
            valor = item.endpoint || 'N/A';
            break;
         case 'Status':
            valor = item.status || 'N/A';
            break;
         case 'DataConsulta':
            if (item.timestamp) {
               try {
                  valor = new Date(item.timestamp).toLocaleString('pt-BR');
               } catch (e) {
                  valor = '';
               }
            }
            break;
         case 'Valor_Retornado':
            // Para valores booleanos primitivos
            if (item.valor !== undefined) {
               valor = String(item.valor);
            }
            break;
         case 'Tipo_Resposta':
            valor = item.tipoResposta || (item.data ? typeof item.data : 'desconhecido');
            break;
         case 'Erro':
            valor = item.error || '';
            break;
         case 'Valor':
            // Campo genérico para valores primitivos
            if (item.valor !== undefined) {
               valor = String(item.valor);
            }
            break;
         default:
            // Tentar extrair o valor do data ou itemData
            if (item.data) {
               if (Array.isArray(item.data) && item.data.length > 0) {
                  if (item.itemIndex !== undefined && item.data[item.itemIndex]) {
                     valor = item.data[item.itemIndex][campo] || '';
                  } else {
                     valor = item.data[0]?.[campo] || '';
                  }
               } else if (typeof item.data === 'object') {
                  valor = item.data[campo] || '';
               }
            }
            break;
      }

      // Processar valor
      if (valor && typeof valor === 'object') {
         try {
            valor = JSON.stringify(valor);
         } catch (e) {
            valor = '';
         }
      }

      valor = processarValorDate(valor);
      
      // Limpar para CSV
      if (typeof valor === 'string') {
         valor = valor
            .replace(/\r\n/g, ' ')
            .replace(/\n/g, ' ')
            .replace(/\r/g, ' ')
            .replace(/\t/g, ' ')
            .replace(/"/g, "'")
            .trim();
      }

      linha.push(valor || '');
   });

   return linha.join(';');
}

// Função para gerar CSV completo
function gerarCSV(resultados) {
   if (!resultados || resultados.length === 0) {
      return '';
   }

   const campos = extrairTodosCampos(resultados);
   const cabecalho = campos.join(';');

   const linhas = [cabecalho];

   resultados.forEach(item => {
      const linha = converterItemParaLinhaCSV(item, campos);
      linhas.push(linha);
   });

   return linhas.join('\n');
}

// Função para criar tabela HTML com suporte a dark mode (CORRIGIDA para booleanos)
function criarTabelaHTML(csv) {
   if (!csv || csv.trim() === '') {
      return '<p class="sem-dados" style="color: #e0e0e0; text-align: center;">Nenhum dado disponível</p>';
   }

   const linhas = csv.split('\n');
   if (linhas.length < 2) {
      return '<p class="sem-dados" style="color: #e0e0e0; text-align: center;">Nenhum dado disponível</p>';
   }

   const cabecalho = linhas[0].split(';');
   const dados = linhas.slice(1).filter(linha => linha.trim() !== '');

   let html = '<div class="tabela-wrapper" style="overflow-x: auto; margin-bottom: 10px;">';
   html += '<table class="tabela-resultados" style="width: 100%; border-collapse: collapse; border: 1px solid #444; color: #e0e0e0;">';

   // Cabeçalho
   html += '<thead><tr style="background-color: #2d2d2d;">';
   cabecalho.forEach(coluna => {
      html += `<th style="padding: 10px; text-align: left; border: 1px solid #444; font-weight: bold; background-color: #333; color: #fff; position: sticky; top: 0;">${coluna}</th>`;
   });
   html += '</tr></thead>';

   // Corpo da tabela
   html += '<tbody>';
   dados.forEach(linha => {
      const colunas = linha.split(';');
      html += '<tr style="background-color: #1e1e1e;">';
      colunas.forEach((valor, index) => {
         // Verificar se é uma linha de erro
         const isErro = index === 2 && valor === 'erro'; // Status está no índice 2
         // Verificar se é valor booleano (true/false)
         const isBooleano = valor === 'true' || valor === 'false';
         
         let estilo = 'padding: 8px; text-align: left; border: 1px solid #444;';
         
         if (isErro) {
            estilo += ' background-color: #3a1a1a; color: #ff8a80;';
         } else if (isBooleano) {
            if (valor === 'true') {
               estilo += ' color: #4caf50; font-weight: bold;'; // Verde para true
            } else {
               estilo += ' color: #f44336;'; // Vermelho para false
            }
         } else {
            estilo += ' color: #e0e0e0;';
         }
         
         html += `<td style="${estilo}">${valor || '-'}</td>`;
      });
      html += '</tr>';
   });
   html += '</tbody>';

   html += '</table>';
   html += '</div>';

   return html;
}

// Função para copiar tabela para área de transferência
async function copiarTabela() {
   const tabela = document.querySelector('.tabela-resultados');
   if (!tabela) {
      alert('Nenhuma tabela disponível para copiar');
      return;
   }

   try {
      // Criar um elemento temporário para copiar
      const range = document.createRange();
      range.selectNode(tabela);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      
      // Tentar copiar com formatação HTML
      document.execCommand('copy');
      
      // Limpar seleção
      window.getSelection().removeAllRanges();
      
      // Feedback visual
      const btnCopiar = document.querySelector('#btnCopiarTabela');
      const textoOriginal = btnCopiar.innerHTML;
      btnCopiar.innerHTML = '✅ Copiado!';
      btnCopiar.style.backgroundColor = '#2e7d32';
      
      setTimeout(() => {
         btnCopiar.innerHTML = textoOriginal;
         btnCopiar.style.backgroundColor = '#2196F3';
      }, 2000);
      
   } catch (err) {
      console.error('Erro ao copiar:', err);
      
      // Fallback: copiar como texto
      try {
         const csv = resResponse.value;
         if (csv) {
            await navigator.clipboard.writeText(csv);
            alert('Tabela copiada como texto (formato CSV)');
         }
      } catch (fallbackErr) {
         alert('Não foi possível copiar a tabela');
      }
   }
}

// Função para atualizar tabela HTML (CORRIGIDA)
function atualizarTabelaHTML(resultados) {
   console.log('📊 Atualizando tabela com', resultados.length, 'resultados');
   
   // Filtrar resultados para mostrar apenas os que têm dados relevantes
   const resultadosVisiveis = resultados.filter(r => {
      // Mostrar sempre sucessos e erros
      return true;
   });
   
   const csv = gerarCSV(resultadosVisiveis);
   resResponse.value = csv; // Manter o CSV no textarea oculto
   
   const tabelaHTML = criarTabelaHTML(csv);
   tabelaContainer.innerHTML = tabelaHTML;
   tabelaContainer.style.display = 'block';
   
   // Adicionar container para botões e legenda
   const botoesContainer = document.createElement('div');
   botoesContainer.style.display = 'flex';
   botoesContainer.style.gap = '10px';
   botoesContainer.style.marginBottom = '10px';
   botoesContainer.style.flexWrap = 'wrap';
   
   // Verificar se os botões já existem
   if (!document.querySelector('#btnCopiarTabela')) {
      // Botão para copiar tabela
      const btnCopiar = document.createElement('button');
      btnCopiar.id = 'btnCopiarTabela';
      btnCopiar.innerHTML = '📋 Copiar Tabela';
      btnCopiar.style.padding = '8px 16px';
      btnCopiar.style.backgroundColor = '#2196F3';
      btnCopiar.style.color = 'white';
      btnCopiar.style.border = 'none';
      btnCopiar.style.borderRadius = '4px';
      btnCopiar.style.cursor = 'pointer';
      btnCopiar.style.fontSize = '14px';
      btnCopiar.style.transition = 'all 0.3s';
      
      btnCopiar.addEventListener('mouseenter', () => {
         btnCopiar.style.backgroundColor = '#1976D2';
         btnCopiar.style.transform = 'translateY(-2px)';
      });
      
      btnCopiar.addEventListener('mouseleave', () => {
         btnCopiar.style.backgroundColor = '#2196F3';
         btnCopiar.style.transform = 'translateY(0)';
      });
      
      btnCopiar.addEventListener('click', copiarTabela);
      botoesContainer.appendChild(btnCopiar);
   }
   
   // Legenda melhorada
   const legenda = document.createElement('div');
   legenda.className = 'tabela-legenda';
   legenda.style.padding = '15px';
   legenda.style.backgroundColor = '#2d2d2d';
   legenda.style.borderRadius = '5px';
   legenda.style.border = '1px solid #444';
   legenda.style.color = '#e0e0e0';
   legenda.style.flex = '1';
   
   const sucessos = resultados.filter(r => r.status === 'sucesso').length;
   const erros = resultados.filter(r => r.status === 'erro').length;
   const booleanos = resultados.filter(r => r.tipoResposta === 'boolean' || (r.valor !== undefined && typeof r.valor === 'boolean')).length;
   const objetos = resultados.filter(r => r.tipoResposta === 'object' && r.valor === undefined).length;
   
   legenda.innerHTML = `
       <div style="display: flex; gap: 20px; flex-wrap: wrap;">
           <div><strong>📊 Resumo:</strong></div>
           <div style="color: #4caf50;">✅ Sucessos: ${sucessos}</div>
           <div style="color: #f44336;">❌ Erros: ${erros}</div>
           <div style="color: #ff9800;">🔵 Booleanos: ${booleanos}</div>
           <div style="color: #2196F3;">📦 Objetos: ${objetos}</div>
           <div>📋 Total: ${resultados.length}</div>
       </div>
       <div style="margin-top: 10px; font-size: 12px; color: #aaa;">
           💡 Valores booleanos (true/false) aparecem em destaque na tabela
       </div>
   `;
   
   // Botão de download se não existir no headInput
   if (!document.querySelector('#btnDownloadCSV')) {
      const btnDownload = document.createElement('button');
      btnDownload.id = 'btnDownloadCSV';
      btnDownload.innerHTML = '⬇️ Download CSV';
      btnDownload.style.padding = '8px 16px';
      btnDownload.style.backgroundColor = '#4CAF50';
      btnDownload.style.color = 'white';
      btnDownload.style.border = 'none';
      btnDownload.style.borderRadius = '4px';
      btnDownload.style.cursor = 'pointer';
      btnDownload.style.fontSize = '14px';
      btnDownload.style.transition = 'all 0.3s';
      
      btnDownload.addEventListener('mouseenter', () => {
         btnDownload.style.backgroundColor = '#45a049';
         btnDownload.style.transform = 'translateY(-2px)';
      });
      
      btnDownload.addEventListener('mouseleave', () => {
         btnDownload.style.backgroundColor = '#4CAF50';
         btnDownload.style.transform = 'translateY(0)';
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
      
      botoesContainer.appendChild(btnDownload);
   }
   
   // Limpar container e adicionar novos elementos
   tabelaContainer.innerHTML = tabelaHTML;
   tabelaContainer.insertBefore(botoesContainer, tabelaContainer.firstChild);
   tabelaContainer.appendChild(legenda);
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

// Função para adicionar botão de download no cabeçalho
function adicionarBotaoDownload() {
   if (document.querySelector('#btnDownloadCSV')) return;

   const container = document.querySelector('.headInput');
   const btnDownload = document.createElement('button');
   btnDownload.id = 'btnDownloadCSV';
   btnDownload.innerHTML = '⬇️ Download CSV';
   btnDownload.style.marginLeft = '10px';
   btnDownload.style.padding = '5px 15px';
   btnDownload.style.backgroundColor = '#4CAF50';
   btnDownload.style.color = 'white';
   btnDownload.style.border = 'none';
   btnDownload.style.borderRadius = '4px';
   btnDownload.style.cursor = 'pointer';

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

   const ids = extrairIdsDoTextarea(resRequest.value);
   resRequestLength = ids.length;

   if (ids.length === 0) {
      criarMensagem(false, 'Por favor, insira pelo menos um ID no campo de requisição.');
      return;
   }

   console.log(`🚀 Iniciando processamento de ${ids.length} IDs...`);
   console.log(`   Configuração: Lote=${CONFIG.TAMANHO_LOTE}, Tentativas=${CONFIG.MAX_RETRIES}`);

   let typeSol = document.querySelector('#typeSol').value;
   let requestData = {};

   console.log(`   Tipo de Solicitação: ${typeSol}`);

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
            body: JSON.stringify({ "soliciatacaoid": "{ID}" })
         };
         break;
      case 'OrcamentoNota':
         requestData = {
            uri: "http://10.204.8.68:8083/Service/OrcamentoSap.svc/rest/GetOrcamentoSapBySolicitacaoId",
            body: "{ID}"
         };
         break;
      case 'ObterFluxoArquivos':
         requestData = {
            uri: "http://10.204.8.68:8083/Service/FileUploadServ.svc/rest/GetArquivoFluxoSol",
            body: JSON.stringify({ solId: "{ID}", status: "CONS" })
         };
         break;
      case 'assinaturas':
         requestData = {
            uri: [
               "http://10.204.8.68:8083/Service/DocumentoObra.svc/rest/AEOAssinadoCompanhia",
               "http://10.204.8.68:8083/Service/DocumentoObra.svc/rest/AEOAssinadoParceira",
               "http://10.204.8.68:8083/Service/DocumentoObra.svc/rest/ACOSAssinadoCompanhia",
               "http://10.204.8.68:8083/Service/DocumentoObra.svc/rest/ACOSAssinadoParceira"
            ],
            body: JSON.stringify({ solId: "{ID}" })
         };
         break;
      default:
         criarMensagem(false, 'Tipo de solicitação inválido');
         return;
   }

   // Adicionar botão de download se não existir
   adicionarBotaoDownload();

   // Mostrar loading
   sendBtn.classList.add('loading');
   tabelaContainer.innerHTML = '<div class="loading-message" style="padding: 20px; text-align: center; color: #e0e0e0;">Processando... Aguarde.<br>Isso pode levar alguns minutos.</div>';
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

         console.log(`   ⏱️  Tempo do lote: ${(tempoLote / 1000).toFixed(1)}s | Progresso: ${progresso}/${ids.length}`);

         // Atualizar tabela progressivamente
         if (todosResultados.length > 0) {
            atualizarTabelaHTML(todosResultados);
         }

         if (i + CONFIG.TAMANHO_LOTE < ids.length) {
            console.log(`   ⏳ Aguardando ${CONFIG.DELAY_ENTRE_LOTES / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_ENTRE_LOTES));
         }
      }

      const tempoTotal = (Date.now() - inicioGlobal) / 1000;

      // Atualizar tabela final
      atualizarTabelaHTML(todosResultados);

      // Estatísticas finais
      const sucessos = todosResultados.filter(r => r.status === 'sucesso').length;
      const erros = todosResultados.filter(r => r.status === 'erro').length;
      const booleanos = todosResultados.filter(r => r.tipoResposta === 'boolean' || (r.valor !== undefined && typeof r.valor === 'boolean')).length;

      console.log('\n' + '='.repeat(50));
      console.log('✅ PROCESSO FINALIZADO!');
      console.log('='.repeat(50));
      console.log(`📊 Total: ${todosResultados.length} resultados`);
      console.log(`✅ Sucessos: ${sucessos}`);
      console.log(`🔵 Booleanos: ${booleanos}`);
      console.log(`❌ Erros: ${erros}`);
      console.log(`⏱️ Tempo total: ${tempoTotal.toFixed(1)}s`);
      console.log('='.repeat(50));

      criarMensagem(true, `Processamento concluído! ${sucessos} sucessos, ${erros} erros.`);

   } catch (error) {
      console.error('❌ Erro durante o processamento:', error);
      criarMensagem(false, 'Erro durante o processamento:\n' + error.message);
      tabelaContainer.innerHTML = `<div class="erro-mensagem" style="padding: 20px; text-align: center; color: #ff8a80; background-color: #3a1a1a; border-radius: 5px;">Erro: ${error.message}</div>`;
   } finally {
      sendBtn.classList.remove('loading');
   }
}

// Expor funções para o onclick do botão