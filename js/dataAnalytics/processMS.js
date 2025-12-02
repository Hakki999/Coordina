const { json } = require('body-parser');
const { filtroSolicitacoes, buscarArray, updateValor, pegarTodaTabelaMateriaisSolicitados } = require('../db/connect');

function processDataMS(sol, tensao, tipoEquipe, idTb) {
    return new Promise((resolve, reject) => {
        sol = sol[0] || sol;
        console.log("\x1b[1m\x1b[34m====== Processando dados de materiais e serviços ======\x1b[0m");

        console.log("\x1b[36mJSON recebido:\x1b[0m");  // Ciano
        //console.log(sol);      // Formata o JSO
        console.log("\x1b[33mTensão:\x1b[0m", tensao);       // Amarelo
        console.log("\x1b[35mTipo equipe:\x1b[0m", tipoEquipe); // Magenta
        console.log("\x1b[32mID tabela:\x1b[0m", idTb);         // Verde

        console.log("\x1b[34m==========================================================\x1b[0m");

        let solicitation = [];
        let eqt = [];
        
        if (Array.isArray(sol.lista_nomes) && sol.lista_nomes.length > 0 && !Array.isArray(sol.lista_nomes[0])) {
            console.log('É um array simples');
            sol.lista_nomes.forEach(mat => {
                if (mat !== '') {
                    solicitation.push(mat);
                    eqt.push(1);
                }
            });
        } else {
            sol.lista_nomes.forEach(mat => {
                if (mat[0] !== '') {
                    solicitation.push(mat[0]);
                    eqt.push(mat[1]);
                }
            });
        }

        buscarArray('Materiais', solicitation, 'Material x Serviço').then(data => {

            let barremos = {
                materiais: [],
                total: 0,
                naoEncontrados: 0,
                id: idTb
            };

            // Selecionar os materiais solicitados
            for (let i = 0; i < solicitation.length; i++) {
                const sos = solicitation[i];
                for (let j = 0; j < data.length; j++) {
                    const dat = data[j];

                    // Função para parse seguro - verifica se já é objeto ou se precisa fazer parse
                    const safeParse = (value) => {
                        if (typeof value === 'object' && value !== null) {
                            return value; // Já é objeto, retorna como está
                        }
                        if (typeof value === 'string') {
                            try {
                                return JSON.parse(value);
                            } catch (error) {
                                console.warn('Erro ao parsear JSON:', value, error);
                                return { Servico: '', valor: '0' };
                            }
                        }
                        return { Servico: '', valor: '0' };
                    };

                    // Aplica o parse seguro apenas se necessário
                    const lv13 = safeParse(dat.lv13);
                    const lm13 = safeParse(dat.lm13);
                    const lv34 = safeParse(dat.lv34);
                    const lm34 = safeParse(dat.lm34);

                    if (sos === dat.Materiais) {
                        let valorFinal = 0;
                        let servicoFinal = '';

                        // Função para converter valor seguro
                        const parseValor = (valor) => {
                            if (valor === null || valor === undefined || valor === '') return 0;
                            const num = parseFloat(valor);
                            return isNaN(num) ? 0 : num;
                        };

                        switch (tensao) {
                            case '13.8':
                                if (tipoEquipe == 'lm') {
                                    valorFinal = parseValor(lm13.valor);
                                    servicoFinal = lm13.Servico || '';
                                }
                                if (tipoEquipe == 'lv') {
                                    valorFinal = parseValor(lv13.valor);
                                    servicoFinal = lv13.Servico || '';
                                }
                                break;
                            case '34.5':
                                if (tipoEquipe == 'lm') {
                                    valorFinal = parseValor(lm34.valor);
                                    servicoFinal = lm34.Servico || '';
                                }
                                if (tipoEquipe == 'lv') {
                                    valorFinal = parseValor(lv34.valor);
                                    servicoFinal = lv34.Servico || '';
                                }
                                break;
                            default:
                                console.log('Tensão não reconhecida:', tensao);
                                valorFinal = 0;
                                servicoFinal = '';
                        }

                        barremos.materiais.push({
                            material: sos,
                            valor: (valorFinal * eqt[j]).toFixed(2),
                            servico: servicoFinal
                        });
                    }
                }
            }

            // Calcula o valor total
            let somaTotal = 0;
            for (let k = 0; k < barremos.materiais.length; k++) {
                somaTotal += parseFloat(barremos.materiais[k].valor);
            }
            barremos.total = somaTotal;

            // Verifica a quantidade de materiais não encontrados
            let quantidadeEncontrados = barremos.materiais
                .filter(item => item.valor !== 0).length;
            let solicitados = solicitation.length;
            barremos.naoEncontrados = solicitados - quantidadeEncontrados;

            // Agora, updateValor deve retornar uma Promise
            updateValor(barremos)
                .then((dataResp) => {
                    resolve(dataResp);
                })
                .catch(error => {
                    reject(error);
                });
        }).catch(error => {
            reject(error);
        });
    });
}

function atualizarTudo() {
    pegarTodaTabelaMateriaisSolicitados().then(dados => {

        dados.forEach(dt => {
            processDataMS(dt, dt.Tensao, 'lm', dt.id)
        });

    })
}


module.exports = { processDataMS };