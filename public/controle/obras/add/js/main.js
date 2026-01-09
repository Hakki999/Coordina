
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
const cidade = document.querySelector('#cidade');
const dataexe = document.querySelector('#dataexe');

document.querySelector('#formAdd').addEventListener('submit', function (evt) {
    evt.preventDefault();

    fetch('/createNewObras', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nota: nota.value,
            cidade: cidade.value,
            data_exe: dataexe.value,
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