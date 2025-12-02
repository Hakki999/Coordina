const { buscarDados } = require('../db/connect');

function unificarMateriais(listas) {
    const resultado = {};
    
    listas.forEach(lista => {
        lista.forEach(itemObj => {
            const item = itemObj.item;
            const qtd = parseInt(itemObj.qtd) || 0;
            const lib = parseInt(itemObj.lib) || 0;
            const dev = parseInt(itemObj.dev) || 0;
            
            if (resultado[item]) {
                resultado[item].qtd += qtd;
                resultado[item].lib += lib;
                resultado[item].dev += dev;
            } else {
                resultado[item] = {
                    item: item,
                    qtd: qtd,
                    lib: lib,
                    dev: dev
                };
            }
        });
    });
    
    return Object.values(resultado);
}

function unificarEOrdenarMateriais(listas) {
    const unificado = unificarMateriais(listas);
    return unificado.sort((a, b) => a.item.localeCompare(b.item));
}

async function processLM() {
    try {
        const data = await buscarDados('Materiais Solicitados', 'id', 'all', 999, false, 'DataSol');
        
        let lista_materiais = [];
        
        data.forEach(d => {
            lista_materiais.push(d.Materiais);
        });

        lista_materiais = unificarEOrdenarMateriais(lista_materiais);
        
        console.log("✅ Materiais processados:", lista_materiais.length, "itens");
        
        return {
            status: 200,
            data: {
                data: lista_materiais
            }
        };
        
    } catch (err) {
        console.error('❌ Erro ao buscar dados de Material x Solicitados:', err);
        return {
            status: 500,
            data: {
                status: 'error',
                message: 'Erro interno do servidor'
            }
        };
    }
}

module.exports = { processLM };