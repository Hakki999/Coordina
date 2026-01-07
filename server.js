// ------------------------------- Requisição ----------------------------------------
const express = require('express')
const bodyParser = require('body-parser');
const { jwt, autenticarToken, gotoHome } = require('./js/middleware/JWT_mid');
const cookieParser = require('cookie-parser');
const { validarLogin, buscarMateriais, enviarOrcamento, solicitacoesRecentes, filtroSolicitacoes, changeLibDev, getAcess, buscarDados, inserirNovo } = require("./js/db/connect");
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
app.use(express.static(__dirname + "/public/"));
app.use(cookieParser());
app.use(compression());

// ------------------------------- Rotas ---------------------------------------------

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/login/index.html");
})

app.get('/controle_almoxarifado', autenticarToken, (req, res) => {
    res.sendFile(__dirname + "/public/Almoxarifado/index.html")
})

app.get('/lista_materiais', autenticarToken, (req, res) => {
    res.sendFile(__dirname + "/public/lista_materiais/")
})

app.get('/programacao', autenticarToken, (req, res) => {
    res.sendFile(__dirname + "/public/programacao/index.html")
})

app.get('/home', autenticarToken, (req, res) => {
    res.sendFile(__dirname + "/public/home/index.html")
})

app.get('/dashboard/equipes', autenticarToken, (req, res) => {
    res.sendFile(__dirname + "/public/dashboard/dashboardEquipes/index.html")
});

app.get('/controle/iop/add', autenticarToken, (req, res) => {
    res.sendFile(__dirname + "/public/controle/obras/add/index.html");
});

app.get('/controle/iop/obras', autenticarToken, (req, res) => {
    res.sendFile(__dirname + "/public/controle/obras/obras/index.html");
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
            { userId: resultado.data.user.id },
            process.env.JWT_SECRET,
            { expiresIn: '300m' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 700 * 60 * 1000
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
    console.log(req.body);

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

    console.log('-------------------------------------');

    console.log({
        coluna,
        orderCamp
    });


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

app.post('/cadastrar_nova_obra', autenticarToken, (req, res) => {
    console.log(req.body);
    // inserirNovo({
    //     nota: req.body.nota,
    //     status: undefined,
    //     cidade: req.body.cidade,
    //     tipo_obra: req.body.tipo_obra,
    //     proxima_exe: undefined,
    //     pi: req.body.pi,
    //     valor: undefined,
    //     resp_asbuilt: undefined,
    //     criador_obra: req.body.criador,
    //     ultima_edicao: undefined
    // })
})

app.post('/getListMaterials', autenticarToken, (req, res) => {

    processLM().then(data => {

        console.log("✅ Materiais distrinchados enviados! - processLM()");
        console.log(data);

        res.json(data)
    }).catch(err => {

        console.log("❌ Erro ao buscar materiais! distinchados - processLM()");
        console.log(err);

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

        /* =========================
           Verificação de duplicidade
        ========================== */
        // const iopExistente = await verificarExistente('table_iop', {
        //   res_nota: dadosIOP.res_nota
        // });

        const iopExistente = false;

        if (iopExistente) {
            console.log('⚠️ IOP já existe com nota:', dadosIOP.res_nota);
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

app.post('/getIOP', async (req, res) => {
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


// ------------------------------- ping ----------------------------------------------
app.get('/ping', (req, res) => {
    res.send('pong');
})
// ------------------------------- Abertura do Servidor -------------------------------
// Cria servidor HTTP manual com keep-alive otimizado
const server = http.createServer(app);

// Configura Keep Alive — ESSENCIAL PARA LOCAL TUNNEL
server.keepAliveTimeout = 60 * 1000; // 60s
server.headersTimeout = 65 * 1000;   // 65s


server.listen(port, async () => {
    console.log(`🌍 Servidor público na porta: http://localhost:${port}/`);
});
