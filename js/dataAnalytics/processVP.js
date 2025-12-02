const gpm = require('../db/dwgpm');
const { atualizarDados, buscarDados } = require('../db/connect');

// Processa o valor programado em uma obra
function processVP(sol, idatt) {
    console.log("📦 Buscando dados de gpm...");
    console.log(sol);
    
    
    return gpm.gpmSearch(sol).then(res => {
        let tempReturn = [];

        if (res.length == 0) {
            console.log("⚠️  Nenhum dado encontrado na tabela gpm, id: " + idatt);
            
            return 
        }

        console.log(sol);
        

        res.forEach(item => {
            if(item.des_atividade == null || item.des_atividade == undefined){
                return
            }
            let tipoServ = item.des_atividade.split(' ')[0];
            switch (tipoServ) {
                case 'INSTALAR':
                    tipoServ = 'ODI';
                    break;
                case 'APOIO':
                    tipoServ = 'ODI';
                    break;
                default:
                    tipoServ = 'ODD';
                    break;
            }

            if(item.vlr > 0){
                tempReturn.push({
                    tipo_servico: tipoServ,
                    des_servico: item.des_atividade,
                    valor: item.vlr
                })
            }
            
        })

        atualizarDados('Material x Programado',{
            programacao: tempReturn
        },  'id', idatt);
        console.log(tempReturn);
        
        return tempReturn;
    }).catch(err => {
        console.log(err);
        throw err; // Isso permite que o chamador capture o erro
    });
}

//  processVP({
//      table: 'res_cubo_obra_programacao',
//      filters: {
//          des_equipe: 'FIRO001M',
//          dta_programacao: '2025-11-06',
//          num_obra: '8280769'
//      }
//  }).then(res => {
//      console.log(res);
//  }).catch(err => {
//      console.log(err);
//  });

function atualizarTudoVP(){
    buscarDados('Material x Programado', 'id', 'all', 999, false, 'data').then(data => {
    data.forEach(sol => {
        let tempSol = {
            table: 'res_cubo_obra_programacao',
            filters: {
                des_equipe: sol.equipe,
                dta_programacao: sol.data,
                num_obra: sol.projeto
            }
        }

        processVP(tempSol, sol.id).then(res => {
            console.log(res);
        }).catch(err => {
            console.log(err);
        });
    });
}).catch(error => {
    console.error('Erro ao buscar dados de Materiais Solicitados:', error);
});

}

// atualizarTudoVP()



module.exports = { processVP };