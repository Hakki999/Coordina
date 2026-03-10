
const backlogTableBody = document.getElementById('backlogTableBody');
let dadosIop = "";

function renderBacklog(dt){

    dt = dt.filter(item => item.feito != 'sim');

    backlogTableBody.innerHTML = ''; // Limpa a tabela existente
    dt.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><button class="transpor-button" onclick="pasteBacklog(${item.id}, this)">📂</button></td>
            <td>${cidadesGoias.find(cidade => cidade.sigla == item.res_cidade)?.cidade || 'Desconhecida'}</td>
            <td>${item.res_data_exe}</td>
            <td>${item.res_tipo}</td>
            <td>${item.res_oc}</td>
            <td>${item.res_pg}</td>
        `;
        backlogTableBody.appendChild(row);
    });

    document.querySelector(".badge").innerText = `Total de itens: ${dt.length}`;
}

fetch('/buscarFiltro',
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
    //         const tabela = req.body.tabela;
    // const coluna = req.body.coluna;
    // const valor = req.body.valor;
    // const qtdLimite = req.body.qtdLimite;
    // const orderBy = req.body.orderBy;
            tabela: 'backlog_iop',
            coluna: 'id',
            valor: 'all',
            qtdLimite: 9999,
            orderBy: true
        }),
        credentials: 'include'
    }
)
.then(response => response.json())
.then(data => {
    // Manipule os dados recebidos e atualize a tabela
    console.warn(data.data);
    dadosIop = data.data;

    renderBacklog(dadosIop);
})
.catch(error => {
    console.error('Erro ao buscar dados:', error);
});

function pasteBacklog(id, element){
    let tempData = dadosIop.find(item => item.id === id);

    document.getElementById("cidade").value = tempData.res_cidade || '';
    document.getElementById("dataexe").value = tempData.res_data_exe || '';
    document.getElementById("tipo").value = tempData.res_tipo || '';
    document.getElementById("oc").value = tempData.res_oc || '';
    document.getElementById("pg").value = tempData.res_pg || '';

    console.log("Dados do backlog selecionado:", tempData);

    // remove do array
    let tempIOP = dadosIop.filter(item => item.id !== id);
    idBacklog = id
    renderBacklog(tempIOP);
    console.log("Backlog IOP removido:", id);

    updateNomeObra();
}