
const optionNav = document.querySelectorAll(".optionNav");
const role = localStorage.getItem('role');
let idBacklog = undefined;
let uri = '/createNewIOP';

if (role == 'STC') {

    document.getElementById("notaGroup").remove();
    document.getElementById("obraGroup").remove();
    document.querySelector('#tipo').setAttribute("required", "false");
    document.querySelector('#pg').setAttribute("required", "false");
    uri = '/create_backlog_iop';
}

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

function updateNomeObra() {
    let x = (oc.value || '').split('-');

    x = oc.value[0] + "-" + oc.value[1];
    nome_obra.value = `NR-${oc.value}-${tipo.value}-PG-${pg.value}-${cidade.value}`;
}

document.querySelector('#formAdd').addEventListener('change', function () {
    if (role != 'STC') updateNomeObra();
});

document.querySelector('#formAdd').addEventListener('submit', function (evt) {
    evt.preventDefault();

    let payLoad = '';

    if (role == 'STC') {
        payLoad = JSON.stringify({
            cidade: cidade.value,
            dataExecucao: dataexe.value,
            tipo: tipo.value,
            oc: String(oc.value).split('-').slice(0, 2).join('-'),
            pg: pg.value,
            resp: localStorage.getItem('nome')
        });
    } else {
        payLoad = JSON.stringify({
            nota: nota.value,
            nome_obra: nome_obra.value,
            cidade: cidade.value,
            dataExecucao: dataexe.value,
            tipo: tipo.value,
            oc: String(oc.value).split('-').slice(0, 2).join('-'),
            pg: pg.value,
            resp: localStorage.getItem('nome'),
            idback: idBacklog || "Não"
        })
    }


    console.warn('Payload a ser enviado:', payLoad);

    fetch(uri, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: payLoad
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

