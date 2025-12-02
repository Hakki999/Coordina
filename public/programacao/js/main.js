function setNavBar() {
    const optionNav = document.querySelectorAll(".optionNav");
    let dadosTable = ""
    optionNav.forEach(option => {
        option.addEventListener("click", evt => {
            console.log('clikc');

            optionNav.forEach(opt => {
                opt.classList = "optionNav closeOption";
            });

            evt.currentTarget.classList = "optionNav openOption";
        })
    })
}


setNavBar();

function formatarDataBR(dataString) {
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}

function formatarBRL(brlString) {
    if (!brlString) brlString = 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(brlString);
}

function nullToZero(value) {
    console.log(value);

    if (value == null || value == undefined || value == '' || value == 'null' || value == 'undefined') {
        return "-";
    }
    return value;
}


function renderMaterialProgramado(data) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // Limpa o conteúdo existente
    data.forEach((item, i) => {
        let qtdVlr = 0;
        console.warn(item.programacao);

        if (Array.isArray(item.programacao) && item.programacao.length > 0) {
            console.log(item.programacao);
            
            
            item.programacao.forEach(qtd => {
                // Garantir que qtd.valor é numérico
                qtdVlr += Number(qtd.valor) || 0;
            });
            qtdVlr = qtdVlr;
            console.log("-------------------------");
            console.log(item.programacao);
            
        } else {
            // Se não for array ou estiver vazio, defina como 0 ou mantenha o valor?
            qtdVlr = 0;
            
        }

        const row = document.createElement('tr');
        row.classList.add('tableRow');
        row.setAttribute('data-id', i);
        row.setAttribute('ondblclick', `renderDetalhes(${i})`);
        row.innerHTML = `
            <td>${formatarDataBR(item.data)}</td>
            <td>${item.projeto}</td>
            <td>${item.equipe}</td>
            <td>${formatarBRL(item.valorMaterial)}</td>
            <td>${formatarBRL(qtdVlr) || 0}</td>
            <td>${formatarBRL(item.dif)}</td>
        `;
        tableBody.appendChild(row);
    });
}

fetch('/buscarFiltro', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        tabela: 'Material x Programado',
        coluna: 'id',
        valor: 'all',
        orderBy: true,
        orderCamp: 'data',
        qtdLimite: 200
    }),
    credentials: 'include'
})
    .then(response => response.json())
    .then(data => {
        console.log(data);
        console.log("✅ Dados de Material x Programado recebidos!");
        dadosTable = data.data;
        renderMaterialProgramado(dadosTable);

    })
    .catch(error => {
        console.error('Erro ao buscar materiais:', error);
        criarMensagem(false, 'Erro ao carregar lista de materiais. Tente novamente.');
    });

function renderDetalhes(i) {
    material_orcado = dadosTable[i]
    console.warn('Dados recebidos:', material_orcado);

    // Verificar se baremosSolicitacao existe e tem materiais
    if (!material_orcado.baremosSolicitacao || !material_orcado.baremosSolicitacao.materiais) {
        console.error('❌ Estrutura de dados inválida:', material_orcado);
        return;
    }

    // Filtrar e processar os materiais (remover vazios)
    let baremosTratados = '';
    let totalBaremos = 0;

    material_orcado.baremosSolicitacao.materiais
        .filter(rowB => rowB && (rowB.material || rowB.valor || rowB.servico)) // Remove itens vazios
        .forEach(rowB => {
            const valor = parseFloat(rowB.valor) || 0;
            totalBaremos += valor;
            
            baremosTratados += `
            <tr>
                <td>${rowB.material || '-'}</td>
                <td style="text-align: center;">${formatarBRL(valor) || '-'}</td>
                <td style="text-align: center;">${nullToZero(rowB.servico) || '-'}</td>
            </tr>
            `;
        });

    // Se não houver materiais após filtrar
    if (!baremosTratados) {
        baremosTratados = `
        <tr>
            <td colspan="3" style="text-align: center;">Nenhum material encontrado</td>
        </tr>
        `;
    }

    // Processar a programação
    let programacaoTratada = '';
    let totalProgramacao = 0;

    if (material_orcado.programacao && Array.isArray(material_orcado.programacao)) {
        material_orcado.programacao
            .filter(prog => prog && (prog.tipo_servico || prog.des_servico || prog.valor)) // Remove itens vazios
            .forEach(prog => {
                const valor = parseFloat(prog.valor) || 0;
                totalProgramacao += valor;
                
                programacaoTratada += `
                <tr>
                    <td>${prog.tipo_servico || '-'}</td>
                    <td>${prog.des_servico || '-'}</td>
                    <td style="text-align: center;">${formatarBRL(valor) || '-'}</td>
                </tr>
                `;
            });
    }

    // Se não houver programação após filtrar
    if (!programacaoTratada) {
        programacaoTratada = `
        <tr>
            <td colspan="3" style="text-align: center;">Nenhuma programação encontrada</td>
        </tr>
        `;
    }

    // Calcular totais
    const totalGeral = totalBaremos + totalProgramacao;

    const htmlDetalhes = `
    <div class="detailsCont">
        <div class="detailsClose" onclick="this.parentElement.remove()">
        </div>
        <div class="details">
            <div class="sections-container">
                <!-- Seção Baremos -->
                <div class="section">
                    <h3>📦 Materiais Solicitados</h3>
                    <div class="baremos">
                        <table>
                            <thead>
                                <tr>
                                    <th>Material</th>
                                    <th>Valor</th>
                                    <th>Serviço</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${baremosTratados}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="2" style="text-align: right; font-weight: bold;">Total Materiais:</td>
                                    <td style="text-align: center; font-weight: bold;">${formatarBRL(totalBaremos)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <!-- Seção Programação -->
                <div class="section">
                    <h3>📊 Programação de Serviços</h3>
                    <div class="programacao">
                        <table>
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Descrição do Serviço</th>
                                    <th>Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${programacaoTratada}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="2" style="text-align: right; font-weight: bold;">Total Programação:</td>
                                    <td style="text-align: center; font-weight: bold;">${formatarBRL(totalProgramacao)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Total Geral -->
            <div class="total-geral">
                <table>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="text-align: right; font-weight: bold; font-size: 1.1em;">
                                TOTAL GERAL:
                            </td>
                            <td style="text-align: center; font-weight: bold; font-size: 1.1em; color: #2c3e50;">
                                ${formatarBRL(totalGeral)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', htmlDetalhes);
}

function renderInputIntervalo() {
    console.log('pressionou');

    const htmlItervalo = `
        <div class="inputMensageContainner">
        <div class="detailsClose" onclick="this.parentElement.remove();"></div>
        <div class="inputMensageWrapper">
            <input type="date" class="inputMensage" placeholder="Mensagem..." id="inputMensageField">
            <input type="date" class="inputMensage" placeholder="Mensagem..." id="inputMensageField">
            <button type="submit" class="btnMensage" id="btnMensage" onclick="getFiltroIntevaloData()">Enviar</button>
        </div>
    </div>
    `

    document.body.insertAdjacentHTML('beforeend', htmlItervalo);
}

function getFiltroIntevaloData() {
    const inputValues = document.querySelectorAll('.inputMensage');

    let startDate, endDate = undefined;

    if (inputValues[0].value > inputValues[1].value) {
        startDate = inputValues[1].value;
        endDate = inputValues[0].value;
    } else {
        startDate = inputValues[0].value;
        endDate = inputValues[1].value;
    }

    fetch('/buscarFiltro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tabela: 'Material x Programado',
            coluna: 'data',
            valor: 'all',
            orderBy: true,
            orderCamp: 'data',
            qtdLimite: 999,
            minValue: startDate,
            maxValue: endDate
        }),
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            console.log("✅ Dados de Material x Programado recebidos!");
            dadosTable = data.data;
            renderMaterialProgramado(dadosTable);
            criarMensagem(true, "Filtro realizado com sucesso!");
            document.querySelector('.inputMensageContainner').remove();
        })
        .catch(error => {
            console.error('Erro ao buscar materiais:', error);
            criarMensagem(false, "Erro ao realizar o filtro!");
        })

}



function exportar() {
    console.log(dadosTable);

    let tempExport = [];


    dadosTable.forEach((item, index) => {
        console.clear()
        console.log(item);

        let materiaisDist = [];
        let valorDist = [];
        let servicoDist = [];

        item.baremosSolicitacao.materiais.forEach(material => {
            materiaisDist.push(material.material.replace('.', ','));
            valorDist.push(material.valor.replace('.', ','));
            servicoDist.push(material.servico.replace('.', ','));
        })

        tempExport.push([
            item.id || "--",
            formatarDataBR(item.data) || "--",
            item.dif || "--",
            item.baremosSolicitacao.naoEncontrado || "--",
            item.projeto || "--",
            item.equipe || "--",
            materiaisDist || "--",
            servicoDist || "--",
            valorDist || "--",
            item.baremosSolicitacao.total || "--"
        ])

        console.log(tempExport);

    })

    exportCSV({
        head: [
            'id',
            'data',
            'dif',
            'não econtrado',
            'projeto',
            'equipe',
            'material',
            'servico',
            'valor',
            'total'
        ],
        body: tempExport
    }, 'Material x Programado');

}