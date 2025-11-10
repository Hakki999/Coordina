const optionNav = document.querySelectorAll(".optionNav");
const displayMain = document.getElementById("displayMain");
let materiais, orcados = undefined

optionNav.forEach(option => {
    option.addEventListener("click", evt => {

        optionNav.forEach(opt => {
            opt.classList = "optionNav closeOption";
        });

        evt.currentTarget.classList = "optionNav openOption";
    })
})

function renderSolicitacoes() {

    const unicos = materiais.filter(
        (obj, index, self) =>
            index === self.findIndex(o => o.itemID === obj.itemID)
    );
    matOpcs = '<option value=""></option>';

    unicos.forEach(un => {
        matOpcs += `<option value="${un.itemID}">${un.itemID}</option>`
    })


    const h = Math.floor(window.innerHeight / 22);
    let opcs = "";
    for (let i = 0; i < h; i++) {
        opcs += `
            <div class="op">
                <select class="mat materialsStyle">
                    ${matOpcs}
                </select>
                <input class="materialsStyle inputqtd" type="number">
            </div>
    `
    }

    const contM = `
        <div class="materials">
                ${opcs}
        </div>

        <div class="listMaterials">
            <table>
            <tbody>
                <tr style="background-color: var(--primaryColor);">
                    <td>Descrição</td>
                    <td>Qtd.</td>
                </tr>

            </tbody>
            </table>
            <button class="buttonNext unSubmit" onclick="openFormMaterials()">Próximo</button>
        </div>
    `
    displayMain.style.flexDirection = "collum"
    displayMain.innerHTML = `
        <div style="width: 40%; display: flex; align-items: center; justify-content: space-around; padding: 10px 0px;">
            <h2>Material</h2>
            <h2>Qtd.</h2>
        </div>
    `
    displayMain.innerHTML += contM;
    definirMateriais(materiais)
}

function renderListaMateriais(m) {
    let tr = []
    m.forEach(mate => {
        tr.push(`
                <tr>
                    <td>${mate.item}</td>
                    <td>${mate.qtd}</td>
                </tr>
            `)
    })

    const contM = `
            <table>
            <tbody>
                <tr style="background-color: var(--primaryColor);">
                    <td>Descrição</td>
                    <td>Qtd.</td>
                </tr>
                    ${tr}
            </tbody>
            </table>
            <button class="buttonNext unSubmit" onclick="openFormMaterials()">Próximo</button>
    `

    document.querySelector('.listMaterials').innerHTML = contM;
}

function openFormMaterials() {
    document.getElementById("formMaterials").style.display = "block"
}

document.querySelectorAll(".closeFather").forEach(close => {
    close.addEventListener("click", evt => {
        evt.target.parentElement.style.display = "none"

    })
})

document.querySelector(".unSubmit").addEventListener("submit", evt => {
    evt.preventDefault()
})
const menuSelect = document.querySelectorAll(".menuSelect");
menuSelect.forEach(ms => {
    ms.addEventListener('click', evt => {
        menuSelect.forEach(m => {
            m.classList.remove("menuSelected")
        })

        evt.target.classList.add("menuSelected")
    })
})

// No frontend - CORRETO
async function listarMateriais() {
    try {
        console.log('🔍 Fazendo requisição...')

        const response = await fetch('http://localhost:8080/listarMateriais')
        console.log('📨 Response object:', response) // Isso é o que você está vendo

        // ⚠️ ESTA É A PARTE IMPORTANTE ⚠️
        const data = await response.json()

        console.log('📦 Dados extraídos:')
        console.log(data) // 👈 Aqui estão seus dados reais!

        materiais = data;
        renderSolicitacoes(data);

    } catch (error) {
        console.error('❌ Erro:', error)
    }
}

listarMateriais();

function agruparItensSeguro(itens) {
    try {
        if (!Array.isArray(itens)) return []

        const mapa = new Map()

        itens.forEach(item => {
            if (!item?.item) return

            const nome = item.item.toString().trim()
            const quantidade = Math.max(0, parseInt(item.qtd) || 0)

            if (!nome) return

            if (mapa.has(nome)) {
                const existente = mapa.get(nome)
                existente.qtd = (parseInt(existente.qtd) + quantidade).toString()
            } else {
                mapa.set(nome, {
                    item: nome,
                    qtd: quantidade.toString()
                })
            }
        })

        return Array.from(mapa.values()).filter(item => parseInt(item.qtd) > 0)

    } catch (error) {
        console.error('Erro ao agrupar itens:', error)
        return []
    }
}

function definirMateriais(materiais) {


    document.querySelectorAll('.op').forEach(mt => {
        mt.addEventListener("change", evt => {

            orcados = [

            ]

            document.querySelectorAll('.mat').forEach((x, i) => {
                console.log();

                materiais.forEach(m => {
                    if (m.itemID == x.value) {
                        orcados.push({
                            item: m.item,
                            qtd: m.qtd * document.querySelectorAll(".inputqtd")[i].value
                        })
                    }
                })


            })

            orcados = agruparItensSeguro(orcados)
            renderListaMateriais(orcados)

        });
    });
}

function sendForm() {
    const projeto = document.getElementById("projeto").value;
    const cidade = document.getElementById("cidade").value;
    const tensao = document.getElementById("tensaoRede").value;
    const dataExe = document.getElementById("dataexe").value;
    const equipe = document.getElementById("equipe").value;
    const tipo = document.getElementById("tipoServ").value;
    const obs = document.getElementById("Obs").value;

    let listaNomes = [];

    document.querySelectorAll('.mat').forEach((x, i) => {
        listaNomes.push(x.value)
    });

    fetch('/enviarOrcamento', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            projeto,
            cidade,
            tensao,
            dataExe,
            equipe,
            tipo,
            obs,
            materiais: orcados,
            listaNomes: listaNomes,
            solicitante: localStorage.getItem('nome'),
            datasolic: new Date().toISOString()
        })
    })
        .then(response => {
            if (response.ok) {
                alert("Orçamento enviado com sucesso!");
            } else {
                alert("Erro no envio do orçamento. Verifique os dados e tente novamente.");
            }
        })
        .catch(error => {
            console.error(error);
            alert("Erro ao enviar o orçamento. Tente novamente mais tarde.");
        });
}

document.getElementById("formMaterials").addEventListener("submit", evt => {
    evt.preventDefault();
    sendForm();
})

function renderRecebidos(filtro = "/solicitacoesRecentes", valor = 20) {
    fetch(filtro, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            valor: valor
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('📦 Dados recebidos:', data);

            // ⚠️ CORREÇÃO: Chame uma função DIFERENTE para renderizar
            renderizarTabela(data.data); // 👈 Nome diferente!
        })
        .catch(error => {
            console.error('❌ Erro ao buscar solicitações:', error);
        });
}

// Nova função separada para renderizar
function renderizarTabela(dados) {
    // Sua lógica de renderização da tabela aqui
    console.log('🎨 Renderizando tabela com:', dados);


    let tabelaBody = "";

    dados.forEach(item => {
        tabelaBody += `
            <tr class="tableRowRecebidos">
                <td>${item.Solicitante}</td>
                <td>${item.equipe}</td>
                <td>${item.Projeto}</td>
                <td>${item.Tensao}</td>
                <td>${item.Cidade}</td>
                <td>${item.DataExe}</td>
                <td>${item.tipo}</td>
                <td>${item.obs}</td>
            </tr>
        `;
    });

    const htmlRecebidos = `
                <div class="filtro">
    <div class="filtro-container">
        <div class="filtro-grupo">
            <label class="filtro-label">Solicitante</label>
            <select class="filtro-select">
                <option value="">Todos</option>
                <!-- Opções aqui -->
            </select>
        </div>
        
        <div class="filtro-grupo">
            <label class="filtro-label">Equipe</label>
            <select class="filtro-select">
                <option value="">Todas</option>
                <!-- Opções aqui -->
            </select>
        </div>
        
        <div class="filtro-grupo">
            <label class="filtro-label">Projeto</label>
            <select class="filtro-select">
                <option value="">Todos</option>
                <!-- Opções aqui -->
            </select>
        </div>
        
        <div class="filtro-grupo">
            <label class="filtro-label">Data</label>
            <input type="date" class="filtro-input">
        </div>
        
        <div class="filtro-botoes">
            <button class="btn-filtro">Limpar</button>
            <button class="btn-filtro primario">Filtrar</button>
        </div>
    </div>
</div>
        <table id="tabelaResposta">
            <thead>
                <tr>
                    <th>Solicitante</th>
                    <th>Equipe</th>
                    <th>Projeto</th>
                    <th>Tensão</th>
                    <th>Cidade</th>
                    <th>Data Exe.</th>
                    <th>Tipo</th>
                    <th>Obs.</th>
                </tr>
            </thead>

            <tbody>
                ${tabelaBody}
            </tbody>
        </table>
    `
    displayMain.style.flexDirection = "column"
    displayMain.innerHTML = htmlRecebidos

    document.querySelectorAll('.tableRowRecebidos').forEach(row => {
        row.addEventListener('dblclick', evt => {
            alert('Funcionalidade de detalhes em desenvolvimento.')
        })
    });
}
