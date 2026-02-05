function formatOption(dados) {
    let temp = '';
    dados.forEach(value => {
        temp += `<option value="${value}">${value}</option>`;
    });
    return temp;
}
function filtroOpen(typeFilterB) {
    let typeInput = '';
    let autoComplet = [];
    console.warn("Tipo de Filtro:", typeFilterB);

    switch (typeFilterB) {
        case 'nota':
            typeFilterB = 'Nota'
            autoComplet = [...new Set(dadosTable.map(item => item.res_nota))].filter(item => item != null && item != '');
            break;
        case 'status':
            typeFilterB = 'Status'
            autoComplet = [...new Set(dadosTable.map(item => item.res_status_asbuilt))].filter(item => item != null && item != '');
            break;
        case 'cidade':
            typeFilterB = 'Cidade';
            autoComplet = [...new Set(dadosTable.map(item => item.res_cidade))];
            console.warn(autoComplet);
            
            autoComplet = autoComplet.map(cidadeValue => {
                return cidades.filter(cidade => cidade.value == cidadeValue)[0]?.label || cidadeValue;
            }).filter(item => item != null && item != '')

            break;
        case 'dataExe':
            typeFilterB = 'Data de Execução'
            autoComplet = [...new Set(dadosTable.map(item => item.res_data_exe))].filter(item => item != null && item != '');
            break;
        case 'resp':
            typeFilterB = 'Responsavel'
            autoComplet = [...new Set(dadosTable.map(item => item.res_resp_asbuilt))].filter(item => item != null && item != '');
            break;
        case 'opex':
            typeFilterB = 'Opex'
            autoComplet = [...new Set(dadosTable.map(item => item.res_opex))].filter(item => item != null && item != '');
            break;
        default:
            typeFilterB = 'Nota'
            autoComplet = [...new Set(dadosTable.map(item => item.res_nota))].filter(item => item != null && item != '');
            break;
    }
    console.log("Sugestões de Autocompletar:", autoComplet);

    autoComplet = formatOption(autoComplet);

    const htmlFiltro = `
    <div class="inputMensageContainner">
        <div class="detailsClose" onclick="this.parentElement.remove()"></div>
        <div class="inputMensageWrapper">
            <label for="inputMensageField">${typeFilterB.toUpperCase()}</label>
            <input list="listData" type="${typeInput}"  tipo="${typeFilterB}" class="inputMensage inputFiltroSend" placeholder="${typeFilterB.toUpperCase()}" id="inputMensageField">
            <button type="submit" class="btnMensage" id="btnMensage" onclick="filtrarTabela();">Enviar</button>
        </div>

        <datalist id="listData">
            ${autoComplet}
        </datalist>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', htmlFiltro);

}

function filtrarTabela() {
    console.log('Filtrando tabela...');

    let typeFilter = document.querySelector('.inputFiltroSend').getAttribute('tipo');
    let valorFilter = document.querySelector('.inputFiltroSend').value;
    switch (typeFilter) {
        case 'Nota':
            typeFilter = 'res_nota'

            break;
        case 'Status':
            typeFilter = 'res_status_asbuilt'
            break;
        case 'Cidade':
            typeFilter = 'res_cidade';
            valorFilter = cidades.filter(cidade => cidade.label == valorFilter)[0]?.value || '';
            console.warn("Cidade filtrada:", valorFilter);
            break;
        case 'Data de Execução':
            typeFilter = 'res_data_exe'
            break;
        case 'Responsavel':
            typeFilter = 'res_resp_asbuilt'
            break;
        case 'Opex':
            typeFilter = 'res_opex'
            break;
    }


    console.log(`Tipo de Filtro: ${typeFilter}`);

    if (valorFilter == '') {
        valorFilter = 'all';
    }

    console.warn(typeFilter);
    

    fetch('/buscarFiltro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tabela: 'table_obras',
            coluna: typeFilter,
            valor: valorFilter,
            qtdLimite: 999,
            orderBy: false,
            orderCamp: 'id'
        }),
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            console.log("✅ Dados filtrados recebidos!");

            dadosTable = data.data;
            console.warn(dadosTable);

            render_dados();
            document.querySelector('.inputMensageContainner').remove();
            criarMensagem(true, "Filtro realizado com sucesso!");
        })
        .catch(error => {
            console.error('Erro ao filtrar materiais:', error);
            criarMensagem(false, 'Erro ao filtrar. Tente novamente.');
        });
}
