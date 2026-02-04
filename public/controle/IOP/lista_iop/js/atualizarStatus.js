function atualizarStatus(dados) {
    fetch('/atualizarStatus', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                table: 'table_iop',
                id: dados.id,
                res_status: dados.res_status,
                res_sap: dados.res_sap
            }),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(`✅ Dados atualizados com sucesso para ID ${dados.id}`);
            } else {
                console.error('Erro ao atualizar dados:', data.error);
            }
        })
        .catch(error => {
            console.error('Erro ao enviar requisição:', error);
        });
}
