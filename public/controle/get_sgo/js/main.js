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
         case 'ObterNotaPorPEP':
            requestData = {
               uri: "http://10.204.8.68:8083/Service/SolicitacaoInvestimentoService.svc/rest/ListarSolicitacaoInvestimentoPorPEP",
               body: JSON.stringify({ "PEP": "{ID}" })
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
// ==========================================
// TIMELINE COM ANÁLISE DE GARGALOS - CORREÇÃO FINAL
// ==========================================

// 1. Aplicar tema personalizado
const themeStyles = document.createElement('style');
themeStyles.textContent = `
    :root {
        --primaryColor: #000814;
        --secundaryColor: #002855;
        --thirdColor: #1b263b;
        --emphasisColor: #0888ff;
        --fontColor: #f8f9fa;
    }
    
    .timeline-container {
        background: var(--primaryColor) !important;
        color: var(--fontColor) !important;
    }
    
    .timeline-header {
        background: var(--secundaryColor) !important;
        border-bottom: 2px solid var(--emphasisColor) !important;
    }
    
    .timeline-card {
        background: var(--thirdColor) !important;
        border-left: 4px solid var(--emphasisColor) !important;
    }
    
    .timeline-event {
        background: var(--secundaryColor) !important;
        border: 1px solid var(--emphasisColor) !important;
    }
    
    .btn-primary {
        background: var(--emphasisColor) !important;
        color: white !important;
    }
    
    .btn-secondary {
        background: var(--secundaryColor) !important;
        color: var(--fontColor) !important;
        border: 1px solid var(--emphasisColor) !important;
    }
    
    .metric-card {
        background: var(--thirdColor) !important;
        border: 1px solid var(--emphasisColor) !important;
    }
    
    .gargalo-badge {
        background: #ff4757 !important;
        color: white !important;
    }
    
    .eficiente-badge {
        background: #00b894 !important;
        color: white !important;
    }
`;
document.head.appendChild(themeStyles);

// 2. Adicionar botão de Análise
function adicionarBotaoTimeline() {
    if (document.querySelector('#btnGerarTimeline')) return;

    const container = document.querySelector('.headInput');
    const btnTimeline = document.createElement('button');
    btnTimeline.id = 'btnGerarTimeline';
    btnTimeline.innerHTML = '📊 Análise de Gargalos';
    btnTimeline.style.cssText = `
        margin-left: 10px;
        padding: 8px 20px;
        background: var(--emphasisColor);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s;
    `;
    
    btnTimeline.onmouseover = () => btnTimeline.style.transform = 'scale(1.05)';
    btnTimeline.onmouseout = () => btnTimeline.style.transform = 'scale(1)';
    
    btnTimeline.addEventListener('click', abrirAnaliseGargalos);
    container.appendChild(btnTimeline);
}

// 3. Estrutura de dados
let dadosAnaliseGlobal = {
    fluxos: new Map(),
    metricasGerais: {},
    gargalos: [],
    etapasCriticas: []
};

// 4. Função CORRIGIDA para parse de data
function parseData(dataStr) {
    if (!dataStr || dataStr === '-') return null;
    
    try {
        const partes = dataStr.split(',');
        if (partes.length !== 2) return null;
        
        const dataParte = partes[0].trim();
        const horaParte = partes[1].trim();
        
        const dataSplit = dataParte.split('/');
        const horaSplit = horaParte.split(':');
        
        if (dataSplit.length !== 3 || horaSplit.length !== 3) return null;
        
        const dia = parseInt(dataSplit[0]);
        const mes = parseInt(dataSplit[1]) - 1;
        const ano = parseInt(dataSplit[2]);
        
        const hora = parseInt(horaSplit[0]);
        const minuto = parseInt(horaSplit[1]);
        const segundo = parseInt(horaSplit[2]);
        
        const timestamp = new Date(ano, mes, dia, hora, minuto, segundo).getTime();
        
        if (isNaN(timestamp)) {
            console.error('Data inválida após parse:', dataStr);
            return null;
        }
        
        return timestamp;
    } catch (e) {
        console.error('Erro ao processar data:', dataStr, e);
        return null;
    }
}

// 5. Abrir Dashboard de Análise
function abrirAnaliseGargalos() {
    const typeSol = document.querySelector('#typeSol').value;
    
    if (typeSol !== 'FluxoNota') {
        alert('⚠️ A análise de gargalos está disponível apenas para "FluxoNota".');
        return;
    }

    const csvData = resResponse.value;
    if (!csvData || csvData.trim() === '') {
        alert('⚠️ Execute a consulta primeiro.');
        return;
    }

    const sucesso = processarDadosAnalise(csvData);
    
    if (!sucesso) {
        alert('❌ Erro ao processar os dados. Verifique o console para mais detalhes.');
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'analiseGargalos';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: var(--primaryColor);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        color: var(--fontColor);
        font-family: 'Segoe UI', Arial, sans-serif;
        overflow: hidden;
    `;
    
    overlay.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; 
                    background: var(--secundaryColor); border-bottom: 3px solid var(--emphasisColor);">
            <div>
                <h1 style="margin: 0; color: var(--fontColor); font-size: 1.8em;">
                    📊 Análise de Gargalos do Fluxo
                </h1>
                <p style="margin: 5px 0 0; opacity: 0.8;">
                    ${dadosAnaliseGlobal.metricasGerais.totalFluxos} solicitações analisadas
                </p>
            </div>
            <div style="display: flex; gap: 15px;">
                <button onclick="alternarVisualizacao('dashboard')" id="btnDashboard" 
                        style="padding: 10px 20px; background: var(--emphasisColor); color: white; 
                               border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    📈 Dashboard
                </button>
                <button onclick="alternarVisualizacao('timeline')" id="btnTimeline"
                        style="padding: 10px 20px; background: var(--thirdColor); color: var(--fontColor); 
                               border: 1px solid var(--emphasisColor); border-radius: 6px; cursor: pointer;">
                    ⏳ Timeline Detalhada
                </button>
                <button onclick="fecharAnalise()"
                        style="padding: 10px 20px; background: #dc3545; color: white; 
                               border: none; border-radius: 6px; cursor: pointer;">
                    ✖ Fechar
                </button>
            </div>
        </div>
        
        <div id="analiseContent" style="flex: 1; overflow-y: auto; padding: 30px;">
            ${renderizarDashboard()}
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') fecharAnalise();
    });
}

// 6. Processar dados - CORREÇÃO FINAL
function processarDadosAnalise(csv) {
    console.log('📊 Processando CSV...');
    
    const linhas = csv.split('\n');
    if (linhas.length < 2) {
        console.error('CSV vazio ou sem dados');
        return false;
    }
    
    const cabecalho = linhas[0].split(';');
    
    const idxId = cabecalho.indexOf('ID_Original');
    const idxData = cabecalho.indexOf('Data');
    const idxStatusDe = cabecalho.indexOf('StatusDe');
    const idxStatusPara = cabecalho.indexOf('StatusPara');
    const idxObservacao = cabecalho.indexOf('Observacao');
    const idxRespInterno = cabecalho.indexOf('RespInternoId');
    
    const fluxos = new Map();
    const temposPorEtapa = new Map();
    let totalEventos = 0;
    let eventosComData = 0;

    for (let i = 1; i < linhas.length; i++) {
        if (!linhas[i].trim()) continue;
        
        const valores = linhas[i].split(';');
        const id = valores[idxId];
        const dataStr = valores[idxData];
        const statusDe = valores[idxStatusDe] || '';
        const statusPara = valores[idxStatusPara] || '';
        const obs = valores[idxObservacao] || '';
        const resp = valores[idxRespInterno] || 'Sistema';

        if (!id) continue;
        
        totalEventos++;
        
        const timestamp = parseData(dataStr);
        
        if (!timestamp) {
            console.warn(`Linha ${i}: Data inválida - "${dataStr}"`);
            continue;
        }
        
        eventosComData++;

        if (!fluxos.has(id)) {
            fluxos.set(id, []);
        }

        fluxos.get(id).push({
            data: dataStr,
            timestamp,
            statusDe: statusDe || 'Início',
            statusPara: statusPara || 'Fim',
            observacao: obs,
            responsavel: resp
        });
    }

    console.log(`✅ Processados: ${eventosComData}/${totalEventos} eventos com data válida`);
    console.log(`📋 Total de fluxos: ${fluxos.size}`);

    if (fluxos.size === 0) {
        console.error('Nenhum fluxo válido encontrado');
        return false;
    }

    const metricas = {
        totalFluxos: fluxos.size,
        tempoTotalMs: 0,
        fluxoMaisLongo: { id: null, duracaoMs: 0 },
        fluxoMaisCurto: { id: null, duracaoMs: Infinity }
    };

    for (let [id, eventos] of fluxos) {
        eventos.sort((a, b) => a.timestamp - b.timestamp);
        
        console.log(`\n📌 Fluxo ${id}:`);
        
        // 🎯 CORREÇÃO: O tempo de espera é atribuído ao statusPara do evento
        for (let i = 0; i < eventos.length - 1; i++) {
            const eventoAtual = eventos[i];
            const proximoEvento = eventos[i + 1];
            
            const duracaoMs = proximoEvento.timestamp - eventoAtual.timestamp;
            
            if (duracaoMs > 0) {
                // 🎯 A ETAPA É O STATUS ONDE O PROCESSO FICOU (statusPara do próximo evento)
                const etapa = proximoEvento.statusPara || 'Início';
                
                console.log(`   ⏱️ Aguardou ${formatarHoras(duracaoMs / (1000 * 60 * 60))} no status "${etapa}"`);
                
                if (!temposPorEtapa.has(etapa)) {
                    temposPorEtapa.set(etapa, []);
                }
                
                temposPorEtapa.get(etapa).push(duracaoMs);
            }
        }
        
        if (eventos.length >= 2) {
            const primeiroEvento = eventos[0];
            const ultimoEvento = eventos[eventos.length - 1];
            
            const duracaoTotalMs = ultimoEvento.timestamp - primeiroEvento.timestamp;
            
            if (duracaoTotalMs > 0) {
                metricas.tempoTotalMs += duracaoTotalMs;
                
                if (duracaoTotalMs > metricas.fluxoMaisLongo.duracaoMs) {
                    metricas.fluxoMaisLongo = { id, duracaoMs: duracaoTotalMs };
                }
                if (duracaoTotalMs < metricas.fluxoMaisCurto.duracaoMs) {
                    metricas.fluxoMaisCurto = { id, duracaoMs: duracaoTotalMs };
                }
            }
        }
    }

    const mediasEtapas = [];
    
    console.log('\n📊 Resumo por etapa:');
    
    for (let [etapa, duracoes] of temposPorEtapa) {
        if (duracoes.length === 0) continue;
        
        const soma = duracoes.reduce((a, b) => a + b, 0);
        const mediaMs = soma / duracoes.length;
        const maximoMs = Math.max(...duracoes);
        const minimoMs = Math.min(...duracoes);
        
        const mediaHoras = mediaMs / (1000 * 60 * 60);
        
        console.log(`   ${etapa}: média ${formatarHoras(mediaHoras)} (${duracoes.length} ocorrências)`);
        
        mediasEtapas.push({
            etapa,
            mediaHoras: mediaHoras,
            maximoHoras: maximoMs / (1000 * 60 * 60),
            minimoHoras: minimoMs / (1000 * 60 * 60),
            ocorrencias: duracoes.length,
            mediaMs,
            maximoMs,
            minimoMs
        });
    }

    mediasEtapas.sort((a, b) => b.mediaHoras - a.mediaHoras);
    
    const gargalos = mediasEtapas.slice(0, Math.min(3, mediasEtapas.length));

    const totalFluxosComDuracao = Array.from(fluxos.values())
        .filter(e => e.length >= 2).length;
    
    const tempoMedioMs = totalFluxosComDuracao > 0 ? 
        metricas.tempoTotalMs / totalFluxosComDuracao : 0;

    dadosAnaliseGlobal = {
        fluxos,
        metricasGerais: {
            ...metricas,
            tempoMedioMs,
            totalFluxosComDuracao
        },
        mediasEtapas,
        gargalos,
        temposPorEtapa
    };
    
    console.log('\n✅ Análise concluída!');
    console.log(`   Gargalos: ${gargalos.map(g => g.etapa).join(' → ')}`);
    
    return true;
}

// 7. Renderizar Dashboard
function renderizarDashboard() {
    const { metricasGerais, gargalos, mediasEtapas } = dadosAnaliseGlobal;
    
    const totalHoras = metricasGerais.tempoTotalMs / (1000 * 60 * 60);
    const mediaHoras = metricasGerais.tempoMedioMs / (1000 * 60 * 60);
    
    return `
        <div style="max-width: 1400px; margin: 0 auto;">
            <!-- KPIs Principais -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
                <div class="metric-card" style="background: var(--thirdColor); padding: 25px; border-radius: 12px; 
                            border: 2px solid var(--emphasisColor); box-shadow: 0 4px 15px rgba(8, 136, 255, 0.2);">
                    <div style="font-size: 0.9em; opacity: 0.8; margin-bottom: 10px;">📋 Total de Fluxos</div>
                    <div style="font-size: 2.5em; font-weight: bold; color: var(--emphasisColor);">
                        ${metricasGerais.totalFluxos}
                    </div>
                    <div style="margin-top: 10px; font-size: 0.85em; opacity: 0.7;">
                        ${metricasGerais.totalFluxosComDuracao || 0} com duração calculada
                    </div>
                </div>
                
                <div class="metric-card" style="background: var(--thirdColor); padding: 25px; border-radius: 12px; 
                            border: 2px solid var(--emphasisColor);">
                    <div style="font-size: 0.9em; opacity: 0.8; margin-bottom: 10px;">⏱️ Tempo Total Acumulado</div>
                    <div style="font-size: 2.5em; font-weight: bold; color: var(--emphasisColor);">
                        ${formatarHoras(totalHoras)}
                    </div>
                    <div style="margin-top: 10px; font-size: 0.85em; opacity: 0.7;">
                        ${totalHoras > 0 ? Math.round(totalHoras / 24) : 0} dias
                    </div>
                </div>
                
                <div class="metric-card" style="background: var(--thirdColor); padding: 25px; border-radius: 12px; 
                            border: 2px solid var(--emphasisColor);">
                    <div style="font-size: 0.9em; opacity: 0.8; margin-bottom: 10px;">📊 Tempo Médio por Fluxo</div>
                    <div style="font-size: 2.5em; font-weight: bold; color: var(--emphasisColor);">
                        ${formatarHoras(mediaHoras)}
                    </div>
                    <div style="margin-top: 10px; font-size: 0.85em; opacity: 0.7;">
                        ${mediaHoras > 24 ? '⚠️ Acima do ideal' : '✅ Dentro do esperado'}
                    </div>
                </div>
                
                <div class="metric-card" style="background: var(--thirdColor); padding: 25px; border-radius: 12px; 
                            border: 2px solid var(--emphasisColor);">
                    <div style="font-size: 0.9em; opacity: 0.8; margin-bottom: 10px;">🎯 Etapas Identificadas</div>
                    <div style="font-size: 2.5em; font-weight: bold; color: var(--emphasisColor);">
                        ${mediasEtapas.length}
                    </div>
                    <div style="margin-top: 10px; font-size: 0.85em; opacity: 0.7;">
                        ${gargalos.length} gargalos críticos
                    </div>
                </div>
            </div>
            
            <!-- Seção de Gargalos -->
            ${gargalos.length > 0 ? `
                <div style="margin-bottom: 30px;">
                    <h2 style="color: var(--fontColor); margin-bottom: 20px; display: flex; align-items: center;">
                        <span style="background: #ff4757; width: 12px; height: 12px; border-radius: 50%; 
                                     display: inline-block; margin-right: 10px;"></span>
                        🚨 Gargalos Identificados (Status onde o processo mais aguardou)
                    </h2>
                    
                    <div style="display: grid; gap: 15px;">
                        ${gargalos.map((gargalo, index) => {
                            const percentual = mediaHoras > 0 ? (gargalo.mediaHoras / mediaHoras) * 100 : 0;
                            const severidade = gargalo.mediaHoras > 72 ? 'Crítico' : 
                                              gargalo.mediaHoras > 48 ? 'Alto' : 'Moderado';
                            
                            return `
                                <div style="background: var(--thirdColor); padding: 20px; border-radius: 10px; 
                                            border-left: 5px solid ${index === 0 ? '#ff4757' : '#ffa502'};">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div style="flex: 1;">
                                            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                                                <span style="font-size: 1.3em; font-weight: bold; color: var(--fontColor);">
                                                    ${index + 1}. ${gargalo.etapa}
                                                </span>
                                                <span class="gargalo-badge" style="padding: 4px 12px; border-radius: 20px; 
                                                                              font-size: 0.85em; font-weight: bold;">
                                                    ${severidade}
                                                </span>
                                            </div>
                                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 15px;">
                                                <div>
                                                    <div style="opacity: 0.7; font-size: 0.85em;">Tempo Médio de Espera</div>
                                                    <div style="font-size: 1.5em; color: var(--emphasisColor);">
                                                        ${formatarHoras(gargalo.mediaHoras)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style="opacity: 0.7; font-size: 0.85em;">Maior Espera</div>
                                                    <div style="font-size: 1.2em; color: #ffa502;">
                                                        ${formatarHoras(gargalo.maximoHoras)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style="opacity: 0.7; font-size: 0.85em;">Ocorrências</div>
                                                    <div style="font-size: 1.2em; color: var(--fontColor);">
                                                        ${gargalo.ocorrencias}x
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div style="text-align: center; min-width: 120px;">
                                            <div style="font-size: 2em; font-weight: bold; color: var(--emphasisColor);">
                                                ${Math.round(percentual)}%
                                            </div>
                                            <div style="opacity: 0.7; font-size: 0.85em;">do tempo médio</div>
                                        </div>
                                    </div>
                                    
                                    <div style="margin-top: 15px; height: 6px; background: var(--secundaryColor); 
                                                border-radius: 3px; overflow: hidden;">
                                        <div style="width: ${Math.min(percentual, 100)}%; height: 100%; 
                                                    background: linear-gradient(90deg, #ff4757, #ffa502); 
                                                    border-radius: 3px;"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : '<p style="color: var(--fontColor);">Nenhum gargalo identificado.</p>'}
            
            <!-- Todas as Etapas (Tabela) -->
            <div style="background: var(--thirdColor); padding: 25px; border-radius: 12px;">
                <h3 style="color: var(--fontColor); margin-bottom: 20px;">📋 Detalhamento de Todos os Status de Espera</h3>
                
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; color: var(--fontColor);">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--emphasisColor);">
                                <th style="padding: 15px; text-align: left;">Status onde o processo aguardou</th>
                                <th style="padding: 15px; text-align: center;">Tempo Médio</th>
                                <th style="padding: 15px; text-align: center;">Máximo</th>
                                <th style="padding: 15px; text-align: center;">Mínimo</th>
                                <th style="padding: 15px; text-align: center;">Ocorrências</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${mediasEtapas.map(etapa => {
                                const isGargalo = gargalos.includes(etapa);
                                
                                return `
                                    <tr style="border-bottom: 1px solid var(--secundaryColor); 
                                               ${isGargalo ? 'background: rgba(255, 71, 87, 0.1);' : ''}">
                                        <td style="padding: 12px 15px;">
                                            ${isGargalo ? '🚨' : '•'} ${etapa.etapa}
                                        </td>
                                        <td style="padding: 12px 15px; text-align: center; font-weight: bold;
                                                   color: ${isGargalo ? '#ff4757' : 'var(--emphasisColor)'};">
                                            ${formatarHoras(etapa.mediaHoras)}
                                        </td>
                                        <td style="padding: 12px 15px; text-align: center;">
                                            ${formatarHoras(etapa.maximoHoras)}
                                        </td>
                                        <td style="padding: 12px 15px; text-align: center;">
                                            ${formatarHoras(etapa.minimoHoras)}
                                        </td>
                                        <td style="padding: 12px 15px; text-align: center;">
                                            ${etapa.ocorrencias}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Recomendações -->
            ${gargalos.length > 0 ? `
                <div style="margin-top: 30px; padding: 20px; background: var(--secundaryColor); 
                            border-radius: 10px; border-left: 4px solid #ffa502;">
                    <h4 style="color: var(--fontColor); margin-bottom: 15px;">💡 Recomendações para Otimização</h4>
                    <ul style="color: var(--fontColor); opacity: 0.9; line-height: 1.8;">
                        ${gargalos.map(g => {
                            if (g.mediaHoras > 72) {
                                return `<li><strong>${g.etapa}:</strong> Status crítico - processo aguarda em média ${formatarHoras(g.mediaHoras)}. 
                                        Recomenda-se revisão urgente do processo.</li>`;
                            } else if (g.mediaHoras > 48) {
                                return `<li><strong>${g.etapa}:</strong> Status com alto tempo de espera (${formatarHoras(g.mediaHoras)}). 
                                        Considere implementar alertas automáticos.</li>`;
                            } else {
                                return `<li><strong>${g.etapa}:</strong> Ponto de atenção (${formatarHoras(g.mediaHoras)}). 
                                        Monitore para evitar aumento do tempo.</li>`;
                            }
                        }).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;
}

// 8. Funções auxiliares
function formatarHoras(horas) {
    if (isNaN(horas) || horas === null || horas === undefined || horas < 0) {
        return '0min';
    }
    
    if (horas < 1) {
        const minutos = Math.round(horas * 60);
        return `${minutos}min`;
    } else if (horas < 24) {
        const horasInt = Math.floor(horas);
        const minutos = Math.round((horas - horasInt) * 60);
        return minutos > 0 ? `${horasInt}h ${minutos}min` : `${horasInt}h`;
    } else {
        const dias = Math.floor(horas / 24);
        const horasRest = Math.round(horas % 24);
        return horasRest > 0 ? `${dias}d ${horasRest}h` : `${dias}d`;
    }
}

function alternarVisualizacao(modo) {
    const content = document.querySelector('#analiseContent');
    const btnDashboard = document.querySelector('#btnDashboard');
    const btnTimeline = document.querySelector('#btnTimeline');
    
    if (modo === 'dashboard') {
        content.innerHTML = renderizarDashboard();
        btnDashboard.style.background = 'var(--emphasisColor)';
        btnTimeline.style.background = 'var(--thirdColor)';
    } else {
        content.innerHTML = renderizarTimelineDetalhada();
        btnTimeline.style.background = 'var(--emphasisColor)';
        btnDashboard.style.background = 'var(--thirdColor)';
    }
}

function renderizarTimelineDetalhada() {
    const fluxos = Array.from(dadosAnaliseGlobal.fluxos.entries());
    
    return `
        <div style="max-width: 1200px; margin: 0 auto;">
            <h3 style="color: var(--fontColor); margin-bottom: 20px;">⏳ Timeline Detalhada por Solicitação</h3>
            
            <div style="display: grid; gap: 20px;">
                ${fluxos.map(([id, eventos]) => {
                    const duracaoTotal = eventos.length >= 2 ? 
                        eventos[eventos.length - 1].timestamp - eventos[0].timestamp : 0;
                    const duracaoHoras = duracaoTotal / (1000 * 60 * 60);
                    
                    return `
                        <div style="background: var(--thirdColor); padding: 20px; border-radius: 10px; 
                                    border-left: 4px solid var(--emphasisColor);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                                <h4 style="color: var(--emphasisColor); margin: 0;">Solicitação #${id}</h4>
                                <span style="background: var(--secundaryColor); padding: 5px 12px; border-radius: 20px;">
                                    ⏱️ Total: ${formatarHoras(duracaoHoras)}
                                </span>
                            </div>
                            
                            <div style="position: relative; padding-left: 20px;">
                                ${eventos.map((evento, i) => {
                                    const proximoEvento = eventos[i + 1];
                                    const tempoEspera = proximoEvento ? 
                                        (proximoEvento.timestamp - evento.timestamp) / (1000 * 60 * 60) : 0;
                                    
                                    return `
                                        <div style="display: flex; margin-bottom: 15px; position: relative;">
                                            ${i < eventos.length - 1 ? `
                                                <div style="position: absolute; left: 5px; top: 20px; width: 2px; height: calc(100% + 5px); 
                                                            background: var(--emphasisColor);"></div>
                                            ` : ''}
                                            <div style="min-width: 8px; height: 8px; background: ${i === eventos.length - 1 ? '#4CAF50' : 'var(--emphasisColor)'}; 
                                                        border-radius: 50%; margin-right: 15px; margin-top: 6px;"></div>
                                            <div style="flex: 1;">
                                                <div style="color: var(--fontColor); opacity: 0.8; font-size: 0.85em;">
                                                    ${evento.data}
                                                </div>
                                                <div style="color: var(--fontColor); margin-top: 5px;">
                                                    ${evento.statusDe || 'Início'} → <strong style="color: #4CAF50;">${evento.statusPara || 'Fim'}</strong>
                                                </div>
                                                ${evento.observacao ? `
                                                    <div style="margin-top: 5px; color: #aaa; font-style: italic; font-size: 0.9em;">
                                                        "${evento.observacao}"
                                                    </div>
                                                ` : ''}
                                                ${tempoEspera > 0 ? `
                                                    <div style="margin-top: 8px; padding: 5px 10px; background: rgba(255, 165, 2, 0.15); 
                                                                border-radius: 4px; border-left: 3px solid #ffa502;">
                                                        <span style="color: #ffa502;">⏱️ Aguardou <strong>${formatarHoras(tempoEspera)}</strong></span>
                                                        <span style="color: #aaa; margin-left: 10px;">
                                                            no status "<strong style="color: #ff4757;">${evento.statusPara}</strong>"
                                                        </span>
                                                    </div>
                                                ` : ''}
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function fecharAnalise() {
    const overlay = document.querySelector('#analiseGargalos');
    if (overlay) overlay.remove();
    document.body.style.overflow = '';
}

// 9. Tornar funções globais
window.alternarVisualizacao = alternarVisualizacao;
window.fecharAnalise = fecharAnalise;

// 10. Inicialização
const originalSendRequest = sendRequest;
sendRequest = async function() {
    await originalSendRequest();
    adicionarBotaoTimeline();
};

document.addEventListener('DOMContentLoaded', () => {
    adicionarBotaoTimeline();
});

console.log('✅ Análise de Gargalos - CORREÇÃO FINAL carregada!');
console.log('📌 Agora o tempo é atribuído ao status ONDE O PROCESSO AGUARDOU!');