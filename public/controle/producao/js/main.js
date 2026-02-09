const optionNav = document.querySelectorAll(".optionNav");

optionNav.forEach(option => {
    option.addEventListener("click", evt => {
        optionNav.forEach(opt => {
            opt.classList = "optionNav closeOption";
        });
        evt.currentTarget.classList = "optionNav openOption";
    });
});



function buscar_dados() {
    console.log('Buscando dados do servidor...');
    
    return fetch('/getIOP', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ok: true })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro na resposta do servidor: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log('Dados recebidos do servidor:', data.length, 'registros');
        
        // Atribui os dados à variável global
        dadosTable = data;
        filteredData = [...dadosTable];
        
        return data; // Retorna para possível uso futuro
    })
    .catch(error => {
        console.error('Erro ao buscar dados:', error);
        // Mostra mensagem de erro para o usuário
        alert('Erro ao carregar dados. Verifique o console para detalhes.');
        return [];
    });
}

// Função para inicializar a aplicação após receber os dados
function inicializarAplicacao() {
    console.log('Inicializando aplicação com', dadosTable.length, 'registros');
    
    if (dadosTable.length === 0) {
        console.warn('Nenhum dado disponível para inicialização');
        // Mostra mensagem na interface
        document.body.innerHTML += '<div style="padding: 20px; background: #f8d7da; color: #721c24; margin: 20px;">Nenhum dado disponível para exibir</div>';
        return;
    }
    
    try {
        // Inicializa os filtros e gráficos
        start();
        console.log('Aplicação inicializada com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        alert('Erro ao inicializar gráficos. Verifique o console.');
    }
}

// Aguarda o DOM estar pronto E os dados serem carregados
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, buscando dados...');
    
    // Adiciona um indicador de carregamento
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading';
    loadingDiv.innerHTML = '<p>Carregando dados...</p>';
    loadingDiv.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); padding:20px; background:#007bff; color:white; border-radius:5px;';
    document.body.appendChild(loadingDiv);
    
    buscar_dados()
        .then(() => {
            // Remove indicador de carregamento
            const loading = document.getElementById('loading');
            if (loading) loading.remove();
            
            // Inicializa a aplicação com os dados
            inicializarAplicacao();
        })
        .catch(error => {
            console.error('Falha no carregamento:', error);
            const loading = document.getElementById('loading');
            if (loading) {
                loading.innerHTML = '<p>Erro ao carregar dados. Recarregue a página.</p>';
                loading.style.background = '#dc3545';
            }
        });
});
