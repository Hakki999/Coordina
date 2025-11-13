const { createClient } = require('@supabase/supabase-js');
const { log } = require('console');
const { appendFileSync } = require('fs');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { processDataMS } = require('../dataAnalytics/processMS');

const supabase = createClient(
    process.env.DATABASE_URL,
    process.env.DATABASE_KEY
)


async function validarLogin(usuario, senha) {
    try {
        // Verifica se as variáveis de ambiente estão carregadas
        if (!process.env.DATABASE_KEY) {
            throw new Error('Chave do banco de dados não configurada.');
        }

        // Realiza a consulta
        const { data, error } = await supabase
            .from('Usuarios')
            .select('*')
            .eq('user', usuario)
            .eq('password', senha)
            .limit(1);

        // Se houver erro na consulta
        if (error) {
            throw error;
        }

        // Verifica se encontrou algum usuário
        if (data && data.length > 0) {
            return {
                success: true,
                data: data[0], // Retorna o primeiro usuário encontrado
                error: null
            };
        } else {
            return {
                success: false,
                data: null,
                error: 'Usuário ou senha inválidos.'
            };
        }
    } catch (error) {
        // Captura qualquer erro que ocorrer na tentativa de login
        console.error('Erro ao validar login:', error.message);
        return {
            success: false,
            data: null,
            error: 'Erro interno do servidor. Tente novamente mais tarde.'
        };
    }
}

async function buscarMateriais() {
    try {
        let todosMateriais = [];
        let pagina = 0;
        const limite = 1000; // Supabase max por página
        let temMaisDados = true;

        console.log('🔄 Buscando materiais com paginação...');

        while (temMaisDados) {
            const inicio = pagina * limite;

            const { data, error, count } = await supabase
                .from('Materiais Almoxarifado')
                .select('*', {
                    count: 'exact',
                    head: false
                })
                .range(inicio, inicio + limite - 1);

            if (error) {
                console.error('❌ Erro Supabase:', error);
                throw error;
            }

            if (data && data.length > 0) {
                todosMateriais = todosMateriais.concat(data);
                console.log(`📦 Página ${pagina + 1}: ${data.length} registros`);

                // Se veio menos que o limite, é a última página
                if (data.length < limite) {
                    temMaisDados = false;
                } else {
                    pagina++;
                }
            } else {
                temMaisDados = false;
            }
        }

        console.log(`✅ Total de materiais carregados: ${todosMateriais.length}`);
        return todosMateriais;

    } catch (error) {
        console.error('❌ Erro ao buscar materiais:', error);
        return [];
    }
}
async function enviarOrcamento(solicitante, cidade, dataexe, datasolic, materiais, projeto, obs, tensao, equipe, tipo, listaNomes) {
    try {
        const { data, error } = await supabase
            .from('Materiais Solicitados')
            .insert([
                {
                    Solicitante: solicitante,
                    Cidade: cidade,
                    DataExe: dataexe,
                    DataSol: datasolic,
                    Materiais: materiais,
                    Projeto: projeto,
                    obs: obs,
                    Tensao: tensao,
                    equipe: equipe,
                    tipo: tipo,
                    lista_nomes: listaNomes
                }
            ]);

        if (error) {
            console.error('Erro ao inserir dados:', error);
            throw error;
        }

        console.log('Dados inseridos com sucesso:', data);
        return {
            success: "Dados inseridos com sucesso"
        };

    } catch (error) {
        console.error('Erro na função enviarOrcamento:', error);
        return null;
    }
}

async function solicitacoesRecentes(qtd = 5) {
    try {
        // Validação do parâmetro
        const quantidade = parseInt(qtd);
        if (isNaN(quantidade) || quantidade <= 0) {
            throw new Error('Quantidade deve ser um número positivo');
        }

        console.log(`🔍 Buscando ${quantidade} solicitações recentes...`);

        const { data, error } = await supabase
            .from('Materiais Solicitados')
            .select('*')
            .order('DataSol', { ascending: false })
            .limit(quantidade);

        if (error) {
            console.error('❌ Erro no Supabase:', error);
            throw new Error(`Erro ao buscar solicitações: ${error.message}`);
        }

        console.log(`✅ ${data?.length || 0} solicitações encontradas`);

        return data || [];

    } catch (error) {
        console.error('❌ Erro em solicitacoesRecentes:', error);
        throw error; // Propaga o erro para ser tratado no controller
    }
}

async function filtroSolicitacoes(campo, valor) {
    // Validações de entrada
    if (!campo || typeof campo !== 'string') {
        throw new Error('Campo de filtro inválido ou não especificado');
    }

    if (!valor && valor !== '') {
        throw new Error('Valor de filtro inválido');
    }

    try {
        const { data, error } = await supabase
            .from('Materiais Solicitados')
            .select('*')
            .ilike(campo, `%${valor}%`)
            .order('DataSol', { ascending: false });

        if (error) {
            throw new Error(`Erro no Supabase: ${error.message}`);
        }

        return data || [];

    } catch (error) {
        console.error('Erro na filtragem de solicitações:', error);
        // Retorna array vazio em caso de erro para não quebrar o fluxo
        // Em alternativa, pode-se manter o throw dependendo do caso de uso
        return [];
    }
}

async function changeLibDev(dataTemp, id) {
    try {
        if (!dataTemp || !id) {
            throw new Error('Dados e ID são obrigatórios');
        }

        const { data, error } = await supabase
            .from('Materiais Solicitados')
            .update({
                Materiais: dataTemp,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();

        if (error) throw error;
        if (!data?.length) throw new Error('Registro não encontrado');

        console.log('Atualizado:', data[0]);
        return { success: true, data: data[0] };

    } catch (error) {
        console.error('Erro no changeLibDev:', error);
        return {
            success: false,
            message: error.message,
            data: null
        };
    }
}

function getAcess(perfil) {
    if (perfil == "Programação") {
        console.log("====> Perfil de Programação detectado");

        return {
            editlibdev: false,
            imprimir: false
        }
    }
    if (perfil == "Almoxarifado") {
        console.log("====> Perfil de Almoxarifado detectado");
        return {
            editlibdev: true,
            imprimir: true
        }
    }
    if (perfil == "Alpha") {
        console.log("====> Perfil Alpha detectado");

        return {
            editlibdev: true,
            imprimir: true
        }
    }

    console.log("====> Perfil desconhecido, acesso restrito");
    return {
        editlibdev: false,
        imprimir: false
    }
}

async function buscarEquipes() {
    try {
        const { data, error } = await supabase
            .from('Equipes')
            .select('*');
        if (error) {
            console.error('Erro ao buscar equipes:', error);
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Erro na função buscarEquipes:', error);
        return [];
    }
}

async function buscarArray(collum, arrayValues, tableName = 'Materiais Solicitados') {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .in(collum, arrayValues)
        if (error) {
            console.error('Erro ao buscar array:', error);
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Erro na função buscarArray:', error);
        return [];
    }
}

async function updateValor(dataResp) {
    // Validações iniciais
    if (!dataResp || typeof dataResp !== 'object') {
        console.error('Dados de resposta inválidos ou não fornecidos');
        return { success: false, error: 'Dados inválidos' };
    }

    if (!dataResp.id) {
        console.error('ID não fornecido para atualização');
        return { success: false, error: 'ID é obrigatório' };
    }

    try {
        console.log(`Atualizando registro ID: ${dataResp.id}`, dataResp);

        const { data, error, status } = await supabase
            .from('Materiais Solicitados')
            .update({ 
                barremos: dataResp
            })
            .eq('id', dataResp.id)
            .select(); // Retorna o registro atualizado

        if (error) {
            console.error('Erro ao atualizar no Supabase:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw error;
        }

        if (!data || data.length === 0) {
            console.warn(`Nenhum registro encontrado com ID: ${dataResp.id}`);
            return { 
                success: false, 
                error: 'Registro não encontrado',
                id: dataResp.id 
            };
        }

        console.log(`✅ Registro atualizado com sucesso - ID: ${dataResp.id}`);
        return { 
            success: true, 
            data: data[0],
            id: dataResp.id,
            updatedAt: new Date().toISOString()
        };

    } catch (error) {
        console.error('Erro crítico na função updateValor:', {
            id: dataResp.id,
            error: error.message,
            stack: error.stack
        });
        
        return { 
            success: false, 
            error: error.message,
            id: dataResp.id,
            code: error.code
        };
    }
}

async function  pegarTodaTabela() {
    const {data, error } = await supabase
    .from('Materiais Solicitados')
    .select('*')
    

    return data;
 }


module.exports = { validarLogin, buscarMateriais, enviarOrcamento, solicitacoesRecentes, filtroSolicitacoes, changeLibDev, getAcess, buscarArray, updateValor, pegarTodaTabela}