const { json } = require('body-parser');
const { filtroSolicitacoes, buscarArray, updateValor, pegarTodaTabela } = require('../db/connect');

function processDataMS(solicitation, tensao, tipoEquipe, idTb) {
    solicitation = solicitation.lista_nomes.filter(item => item !== null && item !== undefined && item.trim() !== '');

    buscarArray('Materiais', solicitation, 'Material x Serviço').then(data => {

        let barremos = {
            materiais: [],
            total: 0,
            naoEncontrados: 0,
            id: idTb
        };

        //Slecionar os materiais solicitados
        for (let i = 0; i < solicitation.length; i++) {
            const sos = solicitation[i];
            for (let j = 0; j < data.length; j++) {
                const dat = data[j];

                if (sos === dat.Materiais) {
                    let valorFinal = 0;
                    let servicoFinal = '';

                    switch (tensao) {
                        case '13.8':
                            if (tipoEquipe == 'lm') {
                                valorFinal = parseFloat(dat.lm13.valor)
                                servicoFinal = dat.lm13.Servico
                            }
                            if (tipoEquipe == 'lv') {
                                valorFinal = parseFloat(dat.lv13.valor)
                                servicoFinal = dat.lv13.Servico
                            }
                            break;
                        case '34.5':
                            if (tipoEquipe == 'lm') {
                                valorFinal = parseFloat(dat.lm34.valor)
                                servicoFinal = dat.lm34.Servico
                            }
                            if (tipoEquipe == 'lv') {
                                valorFinal = parseFloat(dat.lv34.valor)
                                servicoFinal = dat.lv34.Servico
                            }
                            break;
                        default:
                    }

                    barremos.materiais.push({
                        material: sos,
                        valor: valorFinal,
                        servico: servicoFinal
                    });
                }

            }
        }

        //Calcula o valor total
        let somaTotal = 0;
        for (let k = 0; k < barremos.materiais.length; k++) {
            somaTotal += parseFloat(barremos.materiais[k].valor);
        }
        barremos.total = somaTotal;

        //Verifica a quantidade de materiais não encontrados
        let quantidadeEncontrados = barremos.materiais
            .filter(item => item.valor !== 0).length;
        let solicitados = solicitation.length;
        barremos.naoEncontrados = solicitados - quantidadeEncontrados;

        updateValor(barremos)

    }).catch(error => {
        console.error('Erro ao buscar array:', error);
    });
}

function atualizarTudo() {
    pegarTodaTabela().then(dados => {
        dados.forEach(dt => {
            processDataMS(dt, dt.Tensao, 'lm', dt.id)
        });

    })
}

module.exports = processDataMS;