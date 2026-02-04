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
        case 'dataExe':
            typeInput = 'date'
            break;
        case 'nota':
            typeInput = 'number'
            autoComplet = [...new Set(dadosTable.filter(item => item.res_nota).map(item => item.res_nota))];
            autoComplet = formatOption(autoComplet);
            break;

        case 'status':
            typeInput = 'text'
            autoComplet = [...new Set(dadosTable.filter(item => item.res_status).map(item => item.res_status))];
            autoComplet = formatOption(autoComplet);
            break;
        case 'resp':
            typeInput = 'text'
            autoComplet = [...new Set(dadosTable.filter(item => item.res_resp).map(item => item.res_resp))];
            autoComplet = formatOption(autoComplet);
            break;
        case 'nomeObra':
            typeInput = 'text'
            autoComplet = [...new Set(dadosTable.filter(item => item.res_nome_obra).map(item => item.res_nome_obra))];
            autoComplet = formatOption(autoComplet);
            break;
        default:
            typeInput = 'text'
    }

    const htmlFiltro = `
    <div class="inputMensageContainner">
        <div class="detailsClose" onclick="this.parentElement.remove()"></div>
        <div class="inputMensageWrapper">
            <label for="inputMensageField">${typeFilterB.toUpperCase()}</label>
            <input list="listData" type="${typeInput}"  tipo="${typeFilterB}" class="inputMensage inputFiltroSend" placeholder="${typeFilterB.toUpperCase()}" id="inputMensageField">
            <button type="submit" class="btnMensage" id="btnMensage" onclick="filtrarTabela();">Enviar</button>
            
<datalist id="listData">
${autoComplet}
</datalist>
        </div>
    </div>
    `;
    

    document.body.insertAdjacentHTML('beforeend', htmlFiltro);

}

function filtrarTabela() {
    console.log('Filtrando tabela...');

    let typeFilter = document.querySelector('.inputFiltroSend').getAttribute('tipo');
    let valorFilter = document.querySelector('.inputFiltroSend').value;
    switch (typeFilter) {
        case 'nota':
            typeFilter = 'res_nota'
            break;
        case 'status':
            typeFilter = 'res_status'
            break;
        case 'nomeObra':
            typeFilter = 'res_nome_obra'
            break;
        case 'dataExe':
            typeFilter = 'res_data_exe'
            break;
        case 'resp':
            typeFilter = 'res_resp'
            break;
        
        default:
            typeFilter = 'res_nota'
            break;
    }

    
    console.log(`Tipo de Filtro: ${typeFilter}`);

    if(valorFilter == '') {
        valorFilter = 'all';
    }

    fetch('/buscarFiltro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tabela: 'table_iop',
            coluna: typeFilter,
            valor: valorFilter,
            qtdLimite: 100,
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
            criarMensagem(false, 'Erro ao filtrar materiais. Tente novamente.');
        });
}
