
function filtroOpen(typeFilterB) {
    let typeInput = '';

    switch (typeFilterB) {
        case 'Dia':
            typeInput = 'date'
            break;

        default:
            typeInput = 'text'
            break;
    }

    const htmlFiltro = `
    <div class="inputMensageContainner">
        <div class="detailsClose" onclick="this.parentElement.remove()"></div>
        <div class="inputMensageWrapper">
            <label for="inputMensageField">${typeFilterB.toUpperCase()}</label>
            <input type="${typeInput}"  tipo="${typeFilterB}" class="inputMensage inputFiltroSend" placeholder="${typeFilterB.toUpperCase()}" id="inputMensageField">
            <button type="submit" class="btnMensage" id="btnMensage" onclick="filtrarTabela();">Enviar</button>
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
        case 'Dia':
            typeFilter = 'data'
            break;
        case 'Projeto':
            typeFilter = 'projeto'
            break;
        case 'Equipe':
            typeFilter = 'equipe'
            break;
        default:
            typeFilter = 'projeto'
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
            tabela: 'Material x Programado',
            coluna: typeFilter,
            valor: valorFilter,
            qtdLimite: 100,
            orderBy: false
        }),
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            console.log("✅ Dados filtrados recebidos!");
            renderMaterialProgramado(data.data);
            dadosTable = data.data;
             document.querySelector('.inputMensageContainner').remove();
        criarMensagem(true, "Filtro realizado com sucesso!");
        })
        .catch(error => {
            console.error('Erro ao filtrar materiais:', error);
            criarMensagem(false, 'Erro ao filtrar materiais. Tente novamente.');
        });
}
