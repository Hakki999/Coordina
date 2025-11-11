function sendRequest(uri, value, methodP = 'POST') {
    fetch(uri, {
        method: methodP,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(value),
        credentials: 'include' // Isso é importante para enviar cookies
    })
    .then(res => res.json())
    .then(data => {
        console.log('Resposta do servidor:', data);

        if(data.success){
            localStorage.setItem('nome', data.nome)
            localStorage.setItem('redirect', data.redirect)
            
            // CORREÇÃO: Redirecionar a janela, não fazer fetch
            window.location.href = data.redirect;
        }else{
            alert('Falha no login: ' + data.message);
        }
    })
    .catch(err => {
        console.error('Erro na requisição:', err);
        alert('Erro na requisição: ' + err.message);
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