const optionNav = document.querySelectorAll(".optionNav");
let dadosTable = undefined;
const acess = JSON.parse(localStorage.getItem('acesso'))

optionNav.forEach(option => {
    option.addEventListener("click", evt => {
        
        optionNav.forEach(opt => {
            opt.classList = "optionNav closeOption";
        });

        evt.currentTarget.classList = "optionNav openOption";
    })
})

function renderMaterialSolicitados(dadosTable){
    console.log("📦 Renderizando dados de Material x Solicitados...");
    console.log(dadosTable);
    
    dadosTable.forEach(material => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>---</td>
            <td>${material.item}</td>
            <td>${material.qtd}</td>
            <td>${material.lib}</td>
            <td>${material.dev}</td>
        `;
        document.getElementById("tableBody").appendChild(tr);
    })
}

function mainListMateriais(){
    fetch('/getListMaterials',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (!data || !data.data) {
            throw new Error('Dados inválidos recebidos do servidor');
        }
    
        console.log("✅ Dados de Material x Solicitados recebidos!");
        dadosTable = data.data.data;
        renderMaterialSolicitados(dadosTable);
        
    })
    .catch(error => {
        console.error('Erro ao buscar materiais:', error);
        // Opcional: exibir mensagem para o usuário
        alert('Erro ao carregar lista de materiais. Tente novamente.');
    });
}

mainListMateriais()


document.addEventListener('dblclick', evt => {
    console.log("pressionou");
    console.log(acess);
    
    
    if (acess.imprimir) {
        exportarMateriaisCSVExcel(dadosTable);
        alert("Arquivo CSV exportado com sucesso!");
    }
})