
const optionNav = document.querySelectorAll(".optionNav");

optionNav.forEach(option => {
    option.addEventListener("click", evt => {

        optionNav.forEach(opt => {
            opt.classList = "optionNav closeOption";
        });

        evt.currentTarget.classList = "optionNav openOption";
    })
})

const nota = document.querySelector('#nota');
const nome_obra = document.querySelector('#nome_obra');
const cidade = document.querySelector('#cidade');
const dataexe = document.querySelector('#dataexe');
const tipo = document.querySelector('#tipo');
const oc = document.querySelector('#oc');
const pg = document.querySelector('#pg');

document.querySelector('#formAdd').addEventListener('change', function() {
    nome_obra.value = `NR-${oc.value}-${tipo.value}-PG-${pg.value}-${cidade.value}`;
});

document.querySelector('#formAdd').addEventListener('submit', function (evt) {
    evt.preventDefault();

    fetch('/createNewIOP', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nota: nota.value,
            nome_obra: nome_obra.value,
            cidade: cidade.value,
            dataExecucao: dataexe.value,
            tipo: tipo.value,
            oc: oc.value,
            pg: pg.value,
            resp: localStorage.getItem('nome')
        })
    }).then(response => {
        
        if (response.ok) {
            criarMensagem(true, 'Obra cadastrada com sucesso!',);

            nota.value = '';
            nome_obra.value = '';
            cidade.value = '';
            dataexe.value = '';
            tipo.value = '';
            oc.value = '';
            pg.value = '';
        } else {
            criarMensagem(false, 'Erro ao cadastrar obra.');
        }
    });
});