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
    console.warn("Iniciando fluxo da nota:", nota);

    try {
        await validarEtapa(nota, "Voltando para o inicio", async () => {
            return await autoClick({
                object: "#tabPesquisar a[href='#tabContPesquisar']",
                timeout: 8000,
                eventTime: 300,
                delayAfterClick: 1500
            });
        });

        await validarEtapa(nota, "Inserir número da nota", async () => {
            return await autoType({
                object: "#txtNotaPesq",
                text: nota,
                timeout: 8000,
                eventTime: 300
            });
        });

        await validarEtapa(nota, "Clicar no botão de pesquisa", async () => {
            return await autoClick({
                object: "#btnPesqSolInvest",
                timeout: 8000,
                eventTime: 300,
                delayAfterClick: 1500
            });
        });

        await validarEtapa(nota, "Aguardar modal de pesquisa sumir", async () => {
            return await waitForElementNotExist({
                object: "div[class='modal fade bd-example-modal-lg in']",
                timeout: 150000,
                checkTime: 300
            });
        });

        await validarEtapa(nota, "Clicar no botão de abrir fluxo", async () => {
            return await autoClick({
                object: ".btn-minier",
                timeout: 10000,
                eventTime: 300,
                delayAfterClick: 1000
            });
        });

        await validarEtapa(nota, "Abrir aba Fluxo", async () => {
            return await autoClick({
                object: 'a[ng-click="habilitaDesabilitaAbaFluxo(sol);"]',
                timeout: 10000,
                eventTime: 300,
                delayAfterClick: 1000
            });
        });

        await validarEtapa(nota, "Aguardar modal do fluxo sumir", async () => {
            return await waitForElementNotExist({
                object: "div[class='modal fade bd-example-modal-lg in']",
                timeout: 150000,
                checkTime: 300
            });
        });

        //click botão #btnVerificarSttSAP
        await validarEtapa(nota, "Clicar em Verificar Status SAP", async () => {
            return await autoClick({
                object: "#btnVerificarSttSAP",
                timeout: 10000,
                eventTime: 300
            });
        });

        await validarEtapa(nota, "Aguardar modal do fluxo sumir", async () => {
            return await waitForElementNotExist({
                object: "div[class='modal fade bd-example-modal-lg in']",
                timeout: 150000,
                checkTime: 300
            });
        });

        //click no botão .confirm
        await validarEtapa(nota, "Confirmar Verificação de Status SAP", async () => {
            return await autoClick({
                object: ".confirm",
                timeout: 10000,
                eventTime: 300
            });
        });

        await validarEtapa(nota, "Aguardar modal do fluxo sumir", async () => {
            return await waitForElementNotExist({
                object: "div[class='modal fade bd-example-modal-lg in']",
                timeout: 150000,
                checkTime: 300
            });
        });

        //click no botão .confirm
        await validarEtapa(nota, "Confirmar aceite de Status SAP", async () => {
            return await autoClick({
                object: ".confirm",
                timeout: 10000,
                eventTime: 300
            });
        });


        //---------------------------------------------------------
        // FINALIZAÇÃO DO FLUXO
        //---------------------------------------------------------

        console.error("Nota comissionada:", nota);

        relatorio.push({
            nota,
            status: "OK",
            obs: "Nota comissionada com sucesso"
        });

    } catch (erro) {
        console.error("Nota pulada:", nota, erro.message);

        relatorio.push({
            nota,
            status: "PULADA",
            obs: erro.message
        });
    }
}

const notas = `
420176268
420170489
420170555
420174172
420171480
420171159
420170139
420174654
420170742
420171780
420171269
420172010
420171672
420171180
420175052
420170919
420170661
420171061
420171594
420171651
420176314
420179875
420176292
420171367
420171789
420171112
420173769
420173708
420171111
420171236
420171848
420171761
420166971
420170865
420170837
420171210
420180077
420171543
420171168
420177279
430128849
420168332
420165019
420179939
420171084
420176422
420176313
420174094
420174210
420176175
420177247
420177655
420177036
420178525
420177725
420178068
420178180
420165431
420164716
420173721
420179641
420180788
420180826
420177689
420178154
420176481
420169278
420165269
420167562

`;

const notasArray = notas
    .trim()
    .split("\n")
    .map(nota => nota.trim())
    .filter(nota => nota !== "");

for (const nota of notasArray) {
    await runFlow(nota);
}

console.warn("========== RESUMO FINAL ==========");

console.table(relatorio);

const total = relatorio.length;
const sucesso = relatorio.filter(item => item.status === "OK").length;
const puladas = relatorio.filter(item => item.status === "PULADA").length;

console.warn(`Total de notas: ${total}`);
console.warn(`Comissionadas com sucesso: ${sucesso}`);
console.warn(`Puladas por erro/timeout: ${puladas}`);