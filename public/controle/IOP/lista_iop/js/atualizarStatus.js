function atualizarDados(dados) {
    fetch('/atualizarStatus', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                table: 'table_iop',
                id: dados.id,
                res_status: dados.res_status,
                res_sap: dados.res_sap,
                res_orcamento: dados.res_orcamento
            }),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(`✅ Dados atualizados com sucesso para ID ${dados.id}`);
                criarMensagem(true, `Dados atualizados com sucesso para ID ${dados.id}`);
            } else {
                console.error('Erro ao atualizar dados:', data.error);
                criarMensagem(false, `Erro ao atualizar dados para ID ${dados.id}: ${data.error}`);
            }
        })
        .catch(error => {
            console.error('Erro ao enviar requisição:', error);
        });
}
