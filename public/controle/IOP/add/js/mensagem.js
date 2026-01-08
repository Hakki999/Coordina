function criarMensagem(tipo, mensagem) {
    const style = document.createElement('style');
    style.textContent = `
        .mensagemBox {
            width: 400px;
            height: 150px;
            background: linear-gradient(145deg, var(--thirdColor), color-mix(in srgb, var(--primaryColor) 70%, transparent));
            box-shadow: 
                0px 8px 32px rgba(0, 0, 0, 0.3),
                0px 0px 20px color-mix(in srgb, var(--emphasisColor) 20%, transparent);
            backdrop-filter: blur(10px);
            box-shadow: 0px 0px 10px var(--primaryColor);
            position: fixed;
            top: 30px;
            left: calc(50vw - 200px);
            border-radius: 15px;
            overflow: hidden;
            z-index: 99999;
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
            color: var(--fontColor);
            border-radius: 0px 0px 15px 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 400;
            font-size: 1rem;
        }

        .sucess .mensagemTipo {
            color: green !important;
        }

        .err div {
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
    `;

    // Só adiciona o style se não existir
    if (!document.querySelector('style#mensagemStyle')) {
        style.id = 'mensagemStyle';
        document.head.appendChild(style);
    }

    let tempClass = 'erro';
    let tipoTexto = 'erro';
    if (tipo) {
        tipoTexto = 'sucesso';
        tempClass = 'sucess';
    }

    const htmlMensagem = `
        <div class="mensagemBox ${tempClass}">
            <div class="mensagemTipo">
                ${tipoTexto}
            </div>
            <div class="mensagemCorpo">
                ${mensagem}
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', htmlMensagem);

    setTimeout(() => {
        const mensagemEl = document.querySelector('.mensagemBox');
        if (mensagemEl) {
            mensagemEl.remove();
        }
    }, 3000);
}