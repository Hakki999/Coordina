const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  "https://mqhigeybfslznjkuqygo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xaGlnZXliZnNsem5qa3VxeWdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE1NjA5MiwiZXhwIjoyMDc1NzMyMDkyfQ.soQefPJx0z6KBxElZzD_oMNxMne5iDpsP4xPCjRIJCM" // ← Esta é a chave importante!
)


async function validarLogin(usuario, senha){
  const { data, err } = await supabase
    .from('Usuarios')
    .select('*')
    .eq('user', usuario)
    .eq('password', senha)
    .limit(1)
    
    return data;
}

async function buscarMateriais() {
    const { data, err} = await supabase
    .from('Materiais Almoxarifado')
    .select('*')

    return data
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
        return data;
        
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
    const { data, error } = await supabase
        .from('Materiais Solicitados')
        .select('*')
        .ilike(campo, `%${valor}%`)
        .order('datasolic', { ascending: false });
    console.log(data);
    
    return data;
}

module.exports = { validarLogin, buscarMateriais, enviarOrcamento, solicitacoesRecentes, filtroSolicitacoes }