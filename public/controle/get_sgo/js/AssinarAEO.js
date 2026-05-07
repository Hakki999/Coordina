
const DEFAULT_TIMEOUT = 8000;
const DEFAULT_INTERVAL = 300;

const relatorio = [];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isVisible(element) {
    return !!(
        element &&
        element.offsetParent !== null &&
        getComputedStyle(element).visibility !== "hidden" &&
        getComputedStyle(element).display !== "none"
    );
}

function waitForElement(config) {
    return new Promise((resolve) => {
        const startTime = Date.now();

        const intervalId = setInterval(() => {
            const element = document.querySelector(config.object);

            if (element && (!config.visible || isVisible(element))) {
                clearInterval(intervalId);
                resolve(element);
                return;
            }

            if (Date.now() - startTime >= (config.timeout || DEFAULT_TIMEOUT)) {
                clearInterval(intervalId);
                console.warn("TIMEOUT:", config.object);
                resolve(null);
            }
        }, config.checkTime || DEFAULT_INTERVAL);
    });
}

async function autoClick(config) {
    const element = await waitForElement({
        object: config.object,
        timeout: config.timeout || DEFAULT_TIMEOUT,
        checkTime: config.eventTime || DEFAULT_INTERVAL,
        visible: true
    });

    if (!element) return "timeout";

    element.scrollIntoView({ block: "center", inline: "center" });
    await sleep(config.delayBeforeClick || 200);

    element.click();

    console.log("CLICK:", config.object);
    await sleep(config.delayAfterClick || 500);

    return "clicked";
}

async function autoType(config) {
    const element = await waitForElement({
        object: config.object,
        timeout: config.timeout || DEFAULT_TIMEOUT,
        checkTime: config.eventTime || DEFAULT_INTERVAL,
        visible: true
    });

    if (!element) return "timeout";

    element.scrollIntoView({ block: "center", inline: "center" });
    element.focus();

    element.value = "";
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));

    await sleep(100);

    element.value = config.text;

    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    element.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));

    console.log("TYPE:", config.object, config.text);
    await sleep(config.delayAfterType || 500);

    return "typed";
}

async function waitForElementNotExist(config) {
    return new Promise((resolve) => {
        const startTime = Date.now();

        const intervalId = setInterval(() => {
            const element = document.querySelector(config.object);

            if (!element) {
                clearInterval(intervalId);
                console.log("ELEMENTO NÃO EXISTE MAIS:", config.object);
                resolve("not_exists");
                return;
            }

            if (Date.now() - startTime >= (config.timeout || DEFAULT_TIMEOUT)) {
                clearInterval(intervalId);
                console.warn("TIMEOUT AGUARDANDO SUMIR:", config.object);
                resolve("timeout");
            }

        }, config.checkTime || DEFAULT_INTERVAL);
    });
}

async function validarEtapa(nota, descricao, funcao) {
    const resultado = await funcao();

    if (resultado === "timeout" || resultado === null) {
        throw new Error(`Timeout na etapa: ${descricao}`);
    }

    return resultado;
}

async function runFlow(nota) {

    const logEtapa = (etapa, tipo = "info") => {
        const estilo = `
            background: #111827;
            color: #00ff88;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 13px;
            border-left: 5px solid #00ff88;
        `;

        const estiloErro = `
            background: #3b0a0a;
            color: #ff4d4d;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 13px;
            border-left: 5px solid #ff0000;
        `;

        const estiloSucesso = `
            background: #052e16;
            color: #4ade80;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 13px;
            border-left: 5px solid #22c55e;
        `;

        if (tipo === "erro") {
            console.log(`%c❌ [${nota}] ${etapa}`, estiloErro);
        } else if (tipo === "success") {
            console.log(`%c✅ [${nota}] ${etapa}`, estiloSucesso);
        } else {
            console.log(`%c🚀 [${nota}] ${etapa}`, estilo);
        }
    };

    logEtapa("INICIANDO FLUXO");

    try {

        logEtapa("Voltando para o início");
        await validarEtapa(nota, "Voltando para o inicio", async () => {
            return await autoClick({
                object: "#tabPesquisar a[href='#tabContPesquisar']",
                timeout: 8000,
                eventTime: 300,
                delayAfterClick: 1500
            });
        });

        logEtapa("Inserindo número da nota");
        await validarEtapa(nota, "Inserir número da nota", async () => {
            return await autoType({
                object: "#txtNotaPesq",
                text: nota,
                timeout: 8000,
                eventTime: 300
            });
        });

        logEtapa("Clicando no botão de pesquisa");
        await validarEtapa(nota, "Clicar no botão de pesquisa", async () => {
            return await autoClick({
                object: "#btnPesqSolInvest",
                timeout: 8000,
                eventTime: 300,
                delayAfterClick: 1500
            });
        });

        logEtapa("Aguardando modal da pesquisa sumir");
        await validarEtapa(nota, "Aguardar modal de pesquisa sumir", async () => {
            return await waitForElementNotExist({
                object: "div[class='modal fade bd-example-modal-lg in']",
                timeout: 150000,
                checkTime: 300
            });
        });

        logEtapa("Abrindo fluxo");
        await validarEtapa(nota, "Clicar no botão de abrir fluxo", async () => {
            return await autoClick({
                object: ".btn-minier",
                timeout: 10000,
                eventTime: 300,
                delayAfterClick: 1000
            });
        });

        logEtapa("Abrindo aba fluxo");
        await validarEtapa(nota, "Abrir aba Fluxo", async () => {
            return await autoClick({
                object: 'a[ng-click="habilitaDesabilitaAbaFluxo(sol);"]',
                timeout: 10000,
                eventTime: 300,
                delayAfterClick: 1000
            });
        });

        logEtapa("Aguardando modal do fluxo sumir");
        await validarEtapa(nota, "Aguardar modal do fluxo sumir", async () => {
            return await waitForElementNotExist({
                object: "div[class='modal fade bd-example-modal-lg in']",
                timeout: 150000,
                checkTime: 300
            });
        });

        logEtapa("Verificando mensagens de erro");
        await validarEtapa(nota, "Verificar mensagem de erro", async () => {

            const mensagemErro = document.querySelector("#toast-container .toast-message");

            if (mensagemErro) {
                const textoErro = mensagemErro.textContent.trim();

                logEtapa(`ERRO ENCONTRADO -> ${textoErro}`, "erro");

                throw new Error(textoErro);
            }

            logEtapa("Nenhum erro encontrado");
            return "sem_erro";
        });

        // --------------------------------------------

        logEtapa("Clicando em assinar AEO");
        await validarEtapa(nota, "clica no botão de assinar AEO", async () => {
            return await autoClick({
                object: "#btnAssinarAEO",
                timeout: 10000,
                eventTime: 300,
                delayAfterClick: 1000
            });
        });

        logEtapa("Aguardando modal do fluxo sumir");
        await validarEtapa(nota, "Aguardar modal do fluxo sumir", async () => {
            return await waitForElementNotExist({
                object: "div[class='modal fade bd-example-modal-lg in']",
                timeout: 150000,
                checkTime: 300
            });
        });

        logEtapa("Clica em Assinar AEO");
        await validarEtapa(nota, "clica no botão de assinar AEO", async () => {
            return await autoClick({
                object: "#btnAssinarAEO",
                timeout: 10000,
                eventTime: 300,
                delayAfterClick: 5000
            });
        });

        logEtapa("Aguardando modal do fluxo sumir");
        await validarEtapa(nota, "Aguardar modal do fluxo sumir", async () => {
            return await waitForElementNotExist({
                object: "div[class='modal fade bd-example-modal-lg in']",
                timeout: 150000,
                checkTime: 300
            });
        });

        logEtapa("Clica em Assinar AEO");
        await validarEtapa(nota, "clica no botão de assinar AEO", async () => {
            return await autoClick({
                object: ".confirm",
                timeout: 10000,
                eventTime: 300,
                delayAfterClick: 1000
            });
        });
      
        //------------------------------------------
        logEtapa("Verificando erros finais");
        await validarEtapa(nota, "Verificar mensagem de erro", async () => {

            const mensagemErro = document.querySelector(".sweet-alert.showSweetAlert.visible p");

            if (mensagemErro) {

                const textoErro = mensagemErro.textContent.trim();

                logEtapa(`ERRO FINAL -> ${textoErro}`, "erro");

                await autoClick({
                    object: ".confirm",
                    timeout: 10000,
                    eventTime: 300
                });

                throw new Error(textoErro);
            }

            logEtapa("Fluxo finalizado sem erros", "success");

            return "sem_erro";
        });

        logEtapa("NOTA ASSINADA COM SUCESSO", "success");

        relatorio.push({
            nota,
            status: "OK",
            obs: "Nota Assinada com sucesso"
        });

    } catch (erro) {

        logEtapa(`NOTA PULADA -> ${erro.message}`, "erro");

        relatorio.push({
            nota,
            status: "PULADA",
            obs: erro.message
        });
    }
}

function criarInputNotas() {
    // evita duplicar
    if (document.getElementById("boxNotas")) return;

    const box = document.createElement("div");
    box.id = "boxNotas";

    box.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1e1e1e;
            color: #fff;
            padding: 15px;
            border-radius: 8px;
            z-index: 999999;
            width: 300px;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            font-family: Arial;
        " draggable="true">
            <h4 style="margin: 0 0 10px 0;">Inserir Notas</h4>

            <textarea id="notasInput" placeholder="Uma nota por linha..."
                style="width: 100%; height: 120px; margin-bottom: 10px;"></textarea>

            <button id="btnIniciarNotas" style="
                width: 100%;
                padding: 8px;
                background: #28a745;
                border: none;
                color: #fff;
                cursor: pointer;
                border-radius: 5px;
                margin-bottom: 5px;
            ">Iniciar</button>

            <button id="btnFecharNotas" style="
                width: 100%;
                padding: 6px;
                background: #dc3545;
                border: none;
                color: #fff;
                cursor: pointer;
                border-radius: 5px;
            ">Fechar</button>
        </div>
    `;

    document.body.appendChild(box);

    document.getElementById("btnIniciarNotas").onclick = async () => {
        const input = document.getElementById("notasInput").value;

        const notasArray = input
            .trim()
            .split("\n")
            .map(n => n.trim())
            .filter(n => n !== "");

        if (notasArray.length === 0) {
            alert("Digite pelo menos uma nota!");
            return;
        }

        console.warn("Notas capturadas:", notasArray);

        for (const nota of notasArray) {
            await runFlow(nota);

            // 🔥 evita quebrar o sistema (dojo/angular lento)
            await new Promise(r => setTimeout(r, 2000));
        }

        console.warn("Processo finalizado.");

        console.warn("========== RESUMO FINAL ==========");

        console.table(relatorio);

        const total = relatorio.length;
        const sucesso = relatorio.filter(item => item.status === "OK").length;
        const puladas = relatorio.filter(item => item.status === "PULADA").length;

        console.warn(`Total de notas: ${total}`);
        console.warn(`Comissionadas com sucesso: ${sucesso}`);
        console.warn(`Puladas por erro/timeout: ${puladas}`);

    };

    document.getElementById("btnFecharNotas").onclick = () => {
        box.remove();
    };
}

// executa
criarInputNotas();
