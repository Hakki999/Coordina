// ------------------------------- Requisição ----------------------------------------
const express = require('express')
const bodyParser = require('body-parser');
const { jwt, autenticarToken, gotoHome,VerifyAcess } = require('./js/middleware/JWT_mid');
const cookieParser = require('cookie-parser');
const { validarLogin, buscarMateriais, enviarOrcamento, solicitacoesRecentes, filtroSolicitacoes, changeLibDev, getAcess, buscarDados, inserirNovo, atualizarDados} = require("./js/db/connect");
const { sendMSG } = require(__dirname + '/js/WhatsAppSession/whatsAppRest');
const { processDataMS } = require('./js/dataAnalytics/processMS');
const { processMP } = require('./js/dataAnalytics/processMP');
const { processLM } = require('./js/dataAnalytics/processLM');
const { processVP } = require('./js/dataAnalytics/processVP');
const { handleValidationErrors, validationSchemas } = require('./js/middleware/express_mid');
const http = require("http");
const compression = require("compression");
const { log } = require('console');


console.log("🚀 Iniciando servidor...");

// ------------------------------- Configuração --------------------------------------
require('dotenv').config()
const port = process.env.PORT;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

app.use(cookieParser());
app.use(compression());

// ------------------------------- Rotas ---------------------------------------------

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/login/index.html");
})

app.get('/controle_almoxarifado', autenticarToken, VerifyAcess('Alpha', 'Programacão', 'Controle', 'Almoxarifado'), (req, res) => {
    res.sendFile(__dirname + "/public/Almoxarifado/index.html")
})

app.get('/lista_materiais', autenticarToken, VerifyAcess('Alpha', 'Programacão', 'Controle', 'Almoxarifado'), (req, res) => {
    res.sendFile(__dirname + "/public/lista_materiais/")
})

app.get('/programacao', autenticarToken, VerifyAcess('Alpha', 'Programacão', 'Controle', 'Almoxarifado'), (req, res) => {
    res.sendFile(__dirname + "/public/programacao/index.html")
})

app.get('/home', autenticarToken, (req, res) => {
    res.sendFile(__dirname + "/public/home/index.html")
})

app.get('/dashboard/equipes', autenticarToken, VerifyAcess('Alpha', 'Programacão', 'Controle', 'Almoxarifado'), (req, res) => {
    res.sendFile(__dirname + "/public/dashboard/dashboardEquipes/index.html")
});

app.get('/controle/iop/add', autenticarToken, VerifyAcess('Alpha', 'Programacão', 'Controle', 'Almoxarifado'), (req, res) => {
    res.sendFile(__dirname + "/public/controle/IOP/add/index.html");
});

app.get('/controle/iop/lista_iop', autenticarToken, VerifyAcess('Alpha', 'Programacão', 'Controle', 'Almoxarifado', "EQTL"), (req, res) => {
    res.sendFile(__dirname + "/public/controle/IOP/lista_iop/index.html");
});

app.get('/controle/obras/add', autenticarToken, VerifyAcess('Alpha', 'Programacão', 'Controle', 'Almoxarifado'), (req, res) => {
    res.sendFile(__dirname + "/public/controle/obras/add/index.html");
});

app.get('/controle/obras/obras', autenticarToken, VerifyAcess('Alpha', 'Programacão', 'Controle', 'Almoxarifado'), (req, res) => {
    res.sendFile(__dirname + "/public/controle/obras/obras/index.html");
});

app.get('/controle/producao/', autenticarToken, VerifyAcess('Alpha', 'Programacão', 'Controle', 'Almoxarifado'), (req, res) => {
    res.sendFile(__dirname + "/public/controle/producao/index.html");
});

app.get('/controle/get_sgo/', autenticarToken, VerifyAcess('Alpha', 'Programacão', 'Controle', 'Almoxarifado'), (req, res) => {
    res.sendFile(__dirname + "/public/controle/get_sgo/index.html");
});

// ------------------------------- Solicitações ---------------------------------------

app.post('/login', async (req, res) => {
    try {
        const { user, password } = req.body;
        
        if (!user || !password) {
            return res.status(400).json({ error: "Dados incompletos" });
        }

        const resultado = (await validarLogin(user, password));

        console.log(resultado);


        if (!resultado.success) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        const token = jwt.sign(
            { 
                userId: resultado.data.user,
                role: resultado.data.function
            },
            process.env.JWT_SECRET,
            { expiresIn: '600m' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1400 * 60 * 1000
        }).json({
            success: true,
            message: "Login bem-sucedido",
            nome: resultado.data.user,
            redirect: '/home',
            acesso: getAcess(resultado.data.function),
            tel: resultado.data.Celular
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            success: false,
            message: "Erro ao logar",
            nome: "none",
            redirect: '/'
        });
    }
});

app.get('/listarMateriais', (req, res) => {
    console.log("✅ Materiais enviados!");

    buscarMateriais().then(data => {
        console.log(data.length);

        res.json(data)
    })
})

app.post('/enviarOrcamento', validationSchemas.enviarOrcamento, handleValidationErrors, autenticarToken, async (req, res) => {
    console.log("✅ Orçamento recebido!");

    try {
        // 1. Primeiro, enviar o orçamento
        const data = await enviarOrcamento(
            req.body.solicitante,
            req.body.cidade,
            req.body.dataExe,
            req.body.datasolic,
            req.body.materiais,
            req.body.projeto,
            req.body.obs,
            req.body.tensao,
            req.body.equipe,
            req.body.tipo,
            req.body.listaNomes
        );

        // 2. Preparar e enviar mensagens
        let tempM = "";
        let tempLN = "";

        req.body.materiais.forEach(element => {
            tempM += `*_--> ${element.qtd}x_* -- _${element.item}_ \n`;
        });

        req.body.listaNomes.forEach(element => {
            if (Array.isArray(element)) {
                if (element[0] != "") tempLN += `*_--> ${element[1]}x_* -- _${element[0]}_ \n`;
            } else {
                if (element != "") tempLN += `*_--> 1x_* -- _${element}_ \n`;
            }
        });

        const msg = `
✅ *Orçamento enviado com sucesso* ✅

*Projeto:* ${req.body.projeto}
*Cidade:* ${req.body.cidade}
*Equipe:* ${req.body.equipe}
*Data Execução:* ${req.body.dataExe}

*Estruturas solicitadas:*
${tempLN}

*Materiais solicitados:*

${tempM}
        `;

        // Enviar mensagens em paralelo
        await Promise.all([
            sendMSG(req.body.tel, msg),
            sendMSG('6286016758', msg)
        ]);

        // 3. Buscar dados da equipe
        const dataResp = await buscarDados('Equipes', 'Prefixo', req.body.equipe, 1, true, 'Prefixo');
        console.log(`🔃 Processando equipe:`, dataResp);

        if (!dataResp || dataResp.length === 0) {
            throw new Error('Equipe não encontrada');
        }

        // 4. Processar dados sequencialmente com validações
        const barremos = await processDataMS(data.dados, req.body.tensao, dataResp[0].trabalho, data.dados[0].id);

        if (!barremos || !barremos.data) {
            throw new Error('Dados de materiais solicitados inválidos ou vazios');
        }

        // const dataMP = await processMP(barremos.data);

        //  const dataVP = await processVP({
        //      table: 'res_cubo_obra_programacao',
        //      filters: {
        //          des_equipe: req.body.equipe,
        //          dta_programacao: req.body.dataExe,
        //          num_obra: req.body.projeto
        //      }
        //  }, dataMP[0].id)

        // 5. Só enviar resposta quando TUDO estiver concluído
        res.json({
            status: 'Orçamento Enviado!',
            id: data.dados[0]?.id
        });

    } catch (error) {
        console.error('❌ Erro no processamento do orçamento:');
        console.error(error);

        // Enviar resposta de erro apropriada
        if (error.message.includes('Equipe não encontrada')) {
            res.status(404).json({
                status: 'Erro: Equipe não encontrada'
            });
        } else if (error.message.includes('Materiais solicitados inválidos')) {
            res.status(500).json({
                status: 'Erro ao processar materiais solicitados'
            });
        } else {
            res.status(500).json({
                status: 'Erro ao enviar o orçamento',
                error: error.message
            });
        }
    }
});
app.post('/solicitacoesRecentes', autenticarToken, (req, res) => {
    console.log("✅ Solicitações recentes enviadas!");

    const qtd = req.body.valor;

    solicitacoesRecentes(qtd)
        .then(data => {
            console.log('Sucesso ao buscar solicitações recentes');

            res.json({
                data: data
            });
        })
        .catch(error => {
            console.error("Erro:", error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar solicitações'
            });
        });
});

app.post('/filtroSolicitacoes', autenticarToken, (req, res) => {
    console.log("✅ Filtro de solicitações aplicado!");
    const campo = req.body.campo;
    const valor = req.body.valor;
    filtroSolicitacoes(campo, valor).then(data => {
        res.json(data)
    }
    )
});

app.post('/changeLibDev', validationSchemas.changeLibDev, handleValidationErrors, autenticarToken, (req, res) => {

    changeLibDev(req.body.dataTemp, req.body.id).then(data => {
        console.log('🔃Atualização realizada com sucesso🔃 id:' + req.body.id);

        res.json({ status: 'Atualização realizada com sucesso!' })
    })
});

app.post('/getMP', autenticarToken, async (req, res) => {
    try {
        console.log("📦 Buscando dados de Material x Programado...");

        const data = await buscarDados('Material x Programado', 'id', 'all');

        if (!data || data.length === 0) {
            console.log("⚠️  Nenhum dado encontrado na tabela Material x Programado");
            return res.json({
                status: 'success',
                message: 'Nenhum dado encontrado',
                data: []
            });
        }

        console.log(`✅ ${data.length} registros encontrados e enviados!`);
        res.json({
            status: 'success',
            data: data
        });

    } catch (err) {
        console.error('❌ Erro ao buscar dados de Material x Programado:', err);
        res.status(500).json({
            status: 'error',
            message: 'Erro interno do servidor'
        });
    }
});

app.post('/buscarFiltro', validationSchemas.buscarFiltro, handleValidationErrors, autenticarToken, (req, res) => {
    const tabela = req.body.tabela;
    const coluna = req.body.coluna;
    const valor = req.body.valor;
    const qtdLimite = req.body.qtdLimite;
    const orderBy = req.body.orderBy;
    const orderCamp = req.body.orderCamp || 'data';
    const minValue = req.body.minValue || null;
    const maxValue = req.body.maxValue || null;

    console.log(`🔍 Buscando dados em ${tabela} onde ${coluna} = ${valor}...`)
    buscarDados(tabela, coluna, valor, qtdLimite, orderBy, orderCamp, minValue, maxValue).then(data => {
        console.log(`✅ ${data.length} registros encontrados e enviados!`)
        res.json({
            status: 'success',
            data: data
        });
    }
    ).catch(err => {
        console.error(`❌ Erro ao buscar dados em ${tabela}:`, err);
        res.status(500).json({
            status: 'error',
            message: 'Erro interno do servidor'
        });
    }
    );
});

app.post('/getListMaterials', autenticarToken, (req, res) => {

    processLM().then(data => {

        console.log("✅ Materiais distrinchados enviados! - processLM()");

        res.json(data)
    }).catch(err => {

        console.log("❌ Erro ao buscar materiais! distinchados - processLM()");

    })
})

app.post('/createNewIOP', autenticarToken, async (req, res) => {
    try {
        console.log('📝 Tentativa de criação de novo IOP:', req.body);

        /* =========================
           Validação de campos
        ========================== */
        const camposObrigatorios = [
            'nota',
            'nome_obra',
            'cidade',
            'pg',
            'tipo',
            'oc',
            'dataExecucao'
        ];

        const camposFaltantes = camposObrigatorios.filter(
            campo => !req.body[campo]
        );

        if (camposFaltantes.length > 0) {
            console.log('❌ Campos obrigatórios faltando:', camposFaltantes);
            return res.status(400).json({
                status: 'error',
                message: 'Campos obrigatórios não preenchidos',
                camposFaltantes
            });
        }

        /* =========================
           Validação da data
        ========================== */
        const dataExecucao = new Date(req.body.dataExecucao);

        if (isNaN(dataExecucao.getTime())) {
            console.log('❌ Data de execução inválida:', req.body.dataExecucao);
            return res.status(400).json({
                status: 'error',
                message: 'Data de execução inválida'
            });
        }

        /* =========================
           Preparação dos dados
        ========================== */
        const now = new Date();
        const dataAtual = now.toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            dateStyle: 'short',
            timeStyle: 'medium'
        });

        const dadosIOP = {
            res_nota: req.body.nota.trim(),
            res_status: 'pendente',
            res_nome_obra: req.body.nome_obra.trim(),
            res_cidade: req.body.cidade.trim(),
            res_pg: req.body.pg.trim(),
            res_tipo: req.body.tipo.trim(),
            res_oc: req.body.oc.trim(),
            res_data_exe: req.body.dataExecucao,
            res_data_cri: dataAtual,
            res_resp: req.body.resp || 'Sistema'
        };

        console.log('📋 Dados do IOP preparados:', dadosIOP);

        let iopExistente = await buscarDados('table_iop', 'res_nota',  dadosIOP.res_nota, 1, true);

        const iopPorOC = await buscarDados('table_iop', 'res_oc',  dadosIOP.res_oc, 1, true);

        console.log("----------------------");
        if (iopExistente.length > 0 && iopPorOC.length > 0) {
            console.log('⚠️ IOP já existe com nota:', req.body.nota.trim());
            return res.status(409).json({
                status: 'error',
                message: 'Já existe um IOP com esta nota',
                iopExistente: iopExistente.id
            });
        }

        /* =========================
           Inserção no banco
        ========================== */
        const result = await inserirNovo('table_iop', dadosIOP);

        if (!result) {
            console.error('❌ Erro ao criar novo IOP - resultado inválido:', result);
            throw new Error('Falha na criação do IOP');
        }

        console.log('✅ Novo IOP criado com sucesso! ID:', result.id);

        /* =========================
           Notificação (opcional)
        ========================== */
        if (process.env.ENABLE_NOTIFICATIONS === 'true') {
            await enviarNotificacao({
                tipo: 'novo_iop',
                iop_id: result.id,
                nota: dadosIOP.res_nota,
                obra: dadosIOP.res_nome_obra,
                criado_por: dadosIOP.res_resp
            });
        }

        /* =========================
           Resposta final
        ========================== */
        return res.status(201).json({
            status: 'success',
            message: 'IOP criado com sucesso',
            data: {
                id: result.id,
                nota: dadosIOP.res_nota,
                obra: dadosIOP.res_nome_obra,
                data_criacao: dadosIOP.res_data_cri,
                status: dadosIOP.res_status
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('🔥 Erro crítico ao criar IOP:', error);

        const statusCode = error.code === 'ER_DUP_ENTRY' ? 409 : 500;

        return res.status(statusCode).json({
            status: 'error',
            message:
                error.code === 'ER_DUP_ENTRY'
                    ? 'Já existe um registro com esta nota'
                    : 'Erro interno do servidor ao criar IOP',
            error:
                process.env.NODE_ENV === 'development'
                    ? error.message
                    : undefined,
            timestamp: new Date().toISOString()
        });
    }
});

app.post('/getIOP', autenticarToken, async (req, res) => {
    try {
        const data = await buscarDados(
            'table_iop',   // tabela
            'id',          // campo chave
            'all',         // filtro
            999,           // limite
            false,         // paginação
            'res_data_cri' // ordenação
        );

        console.log('Dados IOP:', data);
        res.json(data);

    } catch (error) {
        console.error('Erro ao buscar dados IOP:', error);
        res.status(500).json({
            error: 'Erro ao buscar dados IOP'
        });
    }
});

app.post('/atualizar_iop', autenticarToken, VerifyAcess('Alpha', 'Programacão', 'Controle', 'Almoxarifado'), (req, res) => {
    // Lógica para atualizar IOP

    atualizarDados('table_iop', req.body, 'id', req.body.id)
        .then(() => {
            res.json({
                success: true,
                message: 'IOP atualizado com sucesso'
            })
        })
        .catch((error) => {
            res.json({
                success: false,
                message: 'Erro ao atualizar IOP'
            })
        });
});

app.post('/parcelaadd', autenticarToken, VerifyAcess('Alpha', 'Programacão', 'Controle', 'Almoxarifado'), (req, res) => {
    const dados = req.body;
    
    console.log('Dados recebidos:', dados);
    
    // Se vier com array de parcelas
    if (dados.parcelas && Array.isArray(dados.parcelas)) {
        // Salva como JSON string na coluna parcelas_adicionais
        const updateData = {
            parcelas_adicionais: JSON.stringify(dados.parcelas)
        };
        
        atualizarDados('table_iop', updateData, 'id', dados.id)
        .then(() => {
            res.json({
                success: true,
                message: `${dados.parcelas.length} parcela(s) salva(s) com sucesso`
            })
        })
        .catch((error) => {
            console.error('Erro:', error);
            res.json({
                success: false,
                message: 'Erro ao salvar parcelas'
            })
        });
    } else {
        // Mantém compatibilidade com o formato antigo
        atualizarDados('table_iop', dados, 'id', dados.id)
        .then(() => {
            res.json({
                success: true,
                message: 'Dados atualizados com sucesso'
            })
        })
        .catch((error) => {
            console.error('Erro:', error);
            res.json({
                success: false,
                message: 'Erro ao atualizar dados'
            })
        });
    }
});

app.post('/createNewObras', autenticarToken, async (req, res) => {
    try {
        console.log('📝 Tentativa de criação de nova obra:', req.body);
        
        // Log do usuário que está fazendo a requisição (se disponível)
        if (req.user) {
            console.log('👤 Usuário solicitante:', req.user.id || req.user.email);
        }

        /* =========================
           Validação de campos
        ========================== */
        const camposObrigatorios = [
            'nota',
            'cidade',
            'data_exe',
            'resp'
        ];

        const camposFaltantes = camposObrigatorios.filter(
            campo => !req.body[campo] || req.body[campo].toString().trim() === ''
        );

        if (camposFaltantes.length > 0) {
            console.log('❌ Campos obrigatórios faltando:', camposFaltantes);
            return res.status(400).json({
                status: 'error',
                message: 'Campos obrigatórios não preenchidos',
                camposFaltantes,
                timestamp: new Date().toISOString()
            });
        }

        /* =========================
           Validação da data
        ========================== */
        // Verifica se a data_exe está no formato correto
        const dataExe = req.body.data_exe.trim();
        const dataExecucao = new Date(dataExe);
        
        if (isNaN(dataExecucao.getTime())) {
            console.log('❌ Data de execução inválida:', dataExe);
            return res.status(400).json({
                status: 'error',
                message: 'Data de execução inválida. Use o formato YYYY-MM-DD ou YYYY-MM-DD HH:MM:SS',
                timestamp: new Date().toISOString()
            });
        }

        // Valida se a data não é futura (se necessário)
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        dataExecucao.setHours(0, 0, 0, 0);
        
        if (dataExecucao > hoje) {
            console.log('⚠️ Data de execução é futura:', dataExe);
            // Retorne um erro se não permitir datas futuras
            return res.status(400).json({
                status: 'error',
                message: 'Data de execução não pode ser futura'
            });
        }

        const iopExistente = await buscarDados('table_obras', 'res_nota',  req.body.nota.trim(), 1, true);
        console.log("----------------------");
        console.log("----------------------");
        if (iopExistente.length > 0) {
            console.log('⚠️ IOP já existe com nota:', req.body.nota.trim());
            return res.status(409).json({
                status: 'error',
                message: 'Já existe um IOP com esta nota',
                iopExistente: iopExistente.id
            });
        }


        /* =========================
           Preparação dos dados
        ========================== */
        const now = new Date();
        const dataAtualISO = now.toISOString();
        const dataAtualBR = now.toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            dateStyle: 'short',
            timeStyle: 'medium'
        });

        // Sanitização e preparação dos dados
        const dadosObra = {
            res_nota: req.body.nota.trim(),
            res_data_exe: req.body.data_exe.trim(),
            res_cidade: req.body.cidade.trim(),
            res_data_cri: dataAtualISO,
            res_status_asbuilt: 'Pendente', // Status inicial padrão
            res_resp_add: req.body.resp ? req.body.resp.trim() : 'Não especificado'
        };

        console.log('📋 Dados da obra preparados:', dadosObra);
        /* =========================
           Inserção no banco de dados
        ========================== */
        console.log('💾 Inserindo no banco de dados...');
        const result = await inserirNovo('table_obras', dadosObra);

        console.log('✅ Nova obra criada com sucesso! ID:', result.id);

        /* =========================
           Resposta de sucesso
        ========================== */
        return res.status(201).json({
            status: 'success',
            message: 'Obra criada com sucesso',
            data: {
                id: result.id
            },
            timestamp: dataAtualISO,
            metadata: {
                versao: '1.0',
                ambiente: process.env.NODE_ENV || 'development'
            }
        });

    } catch (error) {
        console.error('🔥 Erro crítico ao criar obra:', error);
        
        // Determinar código de status baseado no erro
        let statusCode = 500;
        let errorMessage = 'Erro interno do servidor ao criar obra';
        
        if (error.code === 'ER_DUP_ENTRY') {
            statusCode = 409;
            errorMessage = 'Já existe um registro com esta nota';
        } else if (error.code === 'ER_NO_REFERENCED_ROW') {
            statusCode = 400;
            errorMessage = 'Referência inválida (chave estrangeira)';
        } else if (error.code === 'ER_DATA_TOO_LONG') {
            statusCode = 400;
            errorMessage = 'Dados muito longos para o campo';
        } else if (error.message.includes('resultado inválido')) {
            statusCode = 500;
            errorMessage = error.message;
        }

        // Log detalhado para desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            console.error('🔍 Detalhes do erro:', {
                message: error.message,
                code: error.code,
                stack: error.stack
            });
        }

        return res.status(statusCode).json({
            status: 'error',
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                code: error.code,
                // Não incluir stack em produção
            } : undefined,
            timestamp: new Date().toISOString(),
            sugestao: statusCode === 500 
                ? 'Tente novamente mais tarde ou contate o suporte'
                : 'Verifique os dados enviados e tente novamente'
        });
    }
});

app.post('/getObras', autenticarToken, async (req, res) => {
    try {
        const data = await buscarDados(
            'table_obras',   // tabela
            'id',          // campo chave
            'all',         // filtro
            999,           // limite
            false,         // paginação
            'res_data_cri' // ordenação
        );

        res.json(data);

    } catch (error) {
        console.error('Erro ao buscar dados IOP:', error);
        res.status(500).json({
            error: 'Erro ao buscar dados IOP'
        });
    }
});

app.post('/atualizar_obras', autenticarToken, (req, res) => {
    // Lógica para atualizar IOP

    atualizarDados('table_obras', req.body, 'id', req.body.id)
        .then(() => {
            res.json({
                success: true,
                message: 'Dados atualizados com sucesso'
            })
        })
        .catch((error) => {
            res.json({
                success: false,
                message: 'Erro ao atualizar dados'
            })
        });
});

app.patch('/atualizarStatus', autenticarToken, (req, res) => {
    // Lógica para atualizar IOP

let dados = {
    id: req.body.id,
    res_status: req.body.res_status,
    res_sap: req.body.res_sap,
    res_orcamento: req.body.res_orcamento,
    res_baixa: req.body.res_baixa
};

    atualizarDados(req.body.table, dados, 'id', dados.id)
        .then(() => {
            res.json({
                success: true,
                message: 'Dados atualizados com sucesso'
            })
        })
        .catch((error) => {
            res.json({
                success: false,
                message: 'Erro ao atualizar dados'
            })
        });
});


// ------------------------------- ping ----------------------------------------------
app.get('/ping', (req, res) => {
    res.send('pong');
})
// ------------------------------- Abertura do Servidor -------------------------------
app.use(express.static(__dirname + "/public/"));
// Cria servidor HTTP manual com keep-alive otimizado
const server = http.createServer(app);

// Configura Keep Alive — ESSENCIAL PARA LOCAL TUNNEL
server.keepAliveTimeout = 60 * 1000; // 60s
server.headersTimeout = 65 * 1000;   // 65s


server.listen(port, async () => {
    console.log(`🌍 Servidor público na porta: http://localhost:${port}/`);
});
