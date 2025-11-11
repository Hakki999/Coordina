function criarInputComAutocomplete(inputId, opcoes, placeholder) {
    const container = document.createElement('div');
    container.className = 'autocomplete-container';
    
    container.innerHTML = `
        <input type="text" id="${inputId}" class="autocomplete-input" 
               placeholder="${placeholder}" autocomplete="off">
        <div class="autocomplete-list"></div>
    `;
    
    const input = container.querySelector('input');
    const list = container.querySelector('.autocomplete-list');
    
    input.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        const filtered = opcoes.filter(opcao => 
            opcao.toLowerCase().includes(value)
        );
        
        mostrarSugestoes(filtered);
    });
    
    input.addEventListener('blur', function() {
        setTimeout(() => {
            list.style.display = 'none';
        }, 200);
    });
    
    input.addEventListener('focus', function() {
        if (this.value) {
            const value = this.value.toLowerCase();
            const filtered = opcoes.filter(opcao => 
                opcao.toLowerCase().includes(value)
            );
            mostrarSugestoes(filtered);
        } else {
            // Mostrar todas as opções quando focar no input vazio
            mostrarSugestoes(opcoes.slice(0, 10)); // Limitar a 10 opções
        }
    });
    
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const items = list.querySelectorAll('.autocomplete-item');
            if (items.length > 0) {
                // Simular clique no primeiro item
                items[0].dispatchEvent(new MouseEvent('click'));
            }
        }
    });
    
    function mostrarSugestoes(sugestoes) {
        if (sugestoes.length === 0) {
            list.style.display = 'none';
            return;
        }
        
        list.innerHTML = sugestoes.map(sugestao => 
            `<div class="autocomplete-item" data-value="${sugestao}">${sugestao}</div>`
        ).join('');
        
        list.style.display = 'block';
        
        // Adicionar eventos aos itens
        list.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('mousedown', function(e) {
                e.preventDefault(); // Prevenir que o blur aconteça antes do click
                input.value = this.getAttribute('data-value');
                list.style.display = 'none';
                
                // Disparar evento de change para validação
                input.dispatchEvent(new Event('change', { bubbles: true }));
            });
        });
    }
    
    // Validação para aceitar apenas valores da lista
    input.addEventListener('change', function() {
        if (this.value && !opcoes.includes(this.value)) {
            this.style.borderColor = '#ff4444';
            
            // Criar mensagem de erro
            let errorMsg = this.parentNode.querySelector('.error-message');
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.style.color = '#ff4444';
                errorMsg.style.fontSize = '0.8rem';
                errorMsg.style.marginTop = '5px';
                this.parentNode.appendChild(errorMsg);
            }
            errorMsg.textContent = 'Por favor, selecione uma opção válida da lista';
        } else {
            this.style.borderColor = '';
            const errorMsg = this.parentNode.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        }
    });
    
    return container;
}