const { verificarExistenciaTabela, inserirNovo, atualizarDados, buscarDados} = require('../db/connect');

function processMP(sol) {
    const dbMaterialProgramado = {
        data: sol.DataExe,
        projeto: sol.Projeto,
        equipe: sol.equipe,
        programacao: null,
        valorMaterial: sol.barremos.total,
        dif: undefined,
        baremosSolicitacao: sol.barremos,
        naoEcontrados: sol.naoEncontrados,
        id: (sol.DataExe + sol.Projeto + sol.equipe)
    }

    // Retorne a Promise corretamente
    return verificarExistenciaTabela('Material x Programado', 'id', dbMaterialProgramado.id)
        .then(exists => {
            if (!exists) {
                console.log('⚠️ dados não encontrados, inserindo novo...');
                return inserirNovo('Material x Programado', dbMaterialProgramado);
            } else {
                console.log('⚠️ dados já existem, atualizando...');
                return atualizarDados('Material x Programado', dbMaterialProgramado, 'id', dbMaterialProgramado.id);
            }
        })
        .catch(error => {
            console.error('Erro ao processar MP:', error);
            throw error; // Propague o erro para o chamador
        });
}


function atualizarMPAlL(){
    buscarDados('Materiais Solicitados', 'id', 'all', 999, true, 'DataSol').then(data => {
        data.forEach(sol => {
            processMP(sol);
        });
    }).catch(error => {
        console.error('Erro ao buscar dados de Materiais Solicitados:', error);
    });
}

module.exports = { processMP };