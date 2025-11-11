// ------------------------------- Requisição ----------------------------------------
const express = require('express')
const bodyParser = require('body-parser');
const { jwt, autenticarToken } = require('./js/midwares/JWT_mid');
const cookieParser = require('cookie-parser');
const { validarLogin, buscarMateriais, enviarOrcamento, solicitacoesRecentes, filtroSolicitacoes, changeLibDev } = require("./js/db/connect");
const e = require('express');

// ------------------------------- Configuração --------------------------------------
require('dotenv').config()
const port = process.env.PORT;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public/"));
app.use(cookieParser());

// ------------------------------- Rotas ---------------------------------------------

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/login/index.html");
})

app.get('/controle_almoxarifado', autenticarToken, (req, res) => {
    res.sendFile(__dirname + "/public/Almoxarifado/index.html")
})

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
            { expiresIn: '30m' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 60 * 1000
        }).json({
            success: true,
            message: "Login bem-sucedido",
            nome: resultado.data.user,
            redirect: '/controle_almoxarifado',
            acesso: getAcess(resultado.data.function)
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
//(solicitante, cidade, dataexe, datasolic, materiais, projeto)
app.post('/enviarOrcamento', (req, res) => {
    console.log("✅ Orçamento recebido!");

    enviarOrcamento(
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

    ).then(data => {
        console.log('eviado com sucesso');

        res.json({ status: 'Orçamento Enviado!' })
    }).catch(err => {
        console.log('erro ao enviar o orçamento');

        res.json({ status: 'Erro ao enviar o orçamento.' })
    })
}
)

app.post('/solicitacoesRecentes', (req, res) => {
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

app.post('/filtroSolicitacoes', (req, res) => {
    console.log("✅ Filtro de solicitações aplicado!");
    const campo = req.body.campo;
    const valor = req.body.valor;
    filtroSolicitacoes(campo, valor).then(data => {
        res.json(data)
    }
    )
});

app.post('/changeLibDev', (req, res) => {
    console.log(req.body);
    
    changeLibDev(req.body.dataTemp, req.body.id).then(data => {
        console.log('🔃Atualização realizada com sucesso🔃 id:'+req.body.id);
        
        res.json({ status: 'Atualização realizada com sucesso!' })
    })
});

// ------------------------------- Abertura do Servidor -------------------------------

app.listen(port, err => {
    if (err) {
        console.log("Erro ao iniciar o servidor :(");
        console.log("\x1b[Erro ao iniciar o servidor :(\x1b[0m");
    } else {
        console.log("\x1b[32mServidor iniciado com sucesso :)\x1b[0m");

    }
})
