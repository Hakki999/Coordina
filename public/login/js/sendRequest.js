 function criarMensagem(tipo, mensagem) {
    const style = document.createElement('style');
    style.textContent = `

        .mensagemBox {
            width: 400px;
            height: 150px;

            background-color: color-mix(in srgb, var(--thirdColor) 80%, transparent);
            backdrop-filter: blur(10px);
            box-shadow: 0px 0px 10px var(--primaryColor);
            position: fixed;
            top: 30px;
            left: calc(50vw - 200px);   
            border-radius: 15px;
            overflow: hidden;
        }

        .mensagemBox .mensagemTipo {
            width: 100%;
            height: 50px;
            background-color: var(--primaryColor);
            color: var(--fontColor);
            border-radius: 15px 15px 0px 0px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1.2rem;
            text-transform: uppercase;

        }

        .mensagemBox .mensagemCorpo {
            width: 100%;
            height: 100px;
            background-color: var(--thirdColor);
            color: var(--fontColor);
            border-radius: 0px 0px 15px 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 400;
            font-size: 1rem;
        }

        .sucess .mensagemTipo {
            border: 2px solid green !important;
            color: green !important;
        }

        .err div {
            border: 2px solid red !important;
            color: red !important;
        }

        .mensagemBox::after{
            content: "";

            width: 10px;
            height: 5px;

            position: absolute;
            bottom: 0px;

            background-color: var(--emphasisColor);
            animation: closeMensagem 3s ease forwards;
        }

        @keyframes closeMensagem {
            0%{
                width: 0%;
            }
            100%{
                width: 100%;
            }
        }
            `

    document.head.appendChild(style);

    let tempClass = 'erro'
    if (tipo) {
        tipo = 'sucesso'
        tempClass = 'sucess'
    } else {
        tipo = 'erro'
    }

    const htmlMensagem = `
    <div class="mensagemBox ${tempClass}">
        <div class="mensagemTipo">
            ${tipo.toString()}
        </div>
        <div class="mensagemCorpo">
            ${mensagem.toString()}
        </div>
    </div>
            `
    document.body.innerHTML += htmlMensagem
    setTimeout(() => {
        document.querySelector('.mensagemBox').remove();
    }, 3000);
}

function sendRequest(uri, value, methodP = 'POST') {
    fetch(uri, {
        method: methodP,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(value),
        credentials: 'include' 
    })
    .then(res => res.json())
    .then(data => {
        console.log('Resposta do servidor:', data);

        if(data.success){
            localStorage.setItem('nome', data.nome)
            localStorage.setItem('redirect', data.redirect)
            localStorage.setItem('acesso', JSON.stringify(data.acesso))
            localStorage.setItem('tel', data.tel)
            criarMensagem(true, 'Sucesso ao logar!');
            // CORREÇÃO: Redirecionar a janela, não fazer fetch
            window.location.href = data.redirect;

        }else{
            criarMensagem(false, data.message);
        }
    })
    .catch(err => {
        console.error('Erro na requisição:', err);
        criarMensagem(false, 'Erro na requisição: ' + err.message);
        return err;
    });
}

document.querySelector('form').addEventListener('submit', evt => {
    evt.preventDefault();
    sendRequest('/login', {
        user: document.getElementById('usuario').value,
        password: document.getElementById('senha').value
    });
});