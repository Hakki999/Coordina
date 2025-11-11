function criarInputComSugestoes(className, valores, autoCompletar = true) {
    // Criar elementos HTML
    const container = document.createElement('div');
    const input = document.createElement('input');
    const suggestionsBox = document.createElement('div');
    
    // Adicionar classes
    container.className = `input-suggestions-container ${className}-container`;
    input.className = `input-suggestions ${className}-input`;
    suggestionsBox.className = `suggestions-box ${className}-suggestions`;
    
    // Configurar atributos do input
    input.type = 'text';
    input.autocomplete = 'off';
    
    // Aplicar estilos CSS
    const style = document.createElement('style');
    style.textContent = `
        .input-suggestions-container {
            position: relative;
            display: inline-block;
            width: 100%;
            max-width: 300px;
        }
        
        .input-suggestions {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
        }
        
        .input-suggestions:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
        
        .suggestions-box {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ccc;
            border-top: none;
            border-radius: 0 0 4px 4px;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .suggestion-item {
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #f0f0f0;
            font-size: 14px;
        }
        
        .suggestion-item:hover {
            background-color: #f8f9fa;
        }
        
        .suggestion-item:last-child {
            border-bottom: none;
        }
        
        .suggestion-item.active {
            background-color: #007bff;
            color: white;
        }
    `;
    
    document.head.appendChild(style);
    
    // Variáveis de estado
    let currentFocus = -1;
    
    // Função para filtrar sugestões
    function filtrarSugestoes(texto) {
        return valores.filter(valor => 
            valor.toLowerCase().includes(texto.toLowerCase())
        );
    }
    
    // Função para mostrar sugestões
    function mostrarSugestoes(sugestoes) {
        suggestionsBox.innerHTML = '';
        suggestionsBox.style.display = sugestoes.length ? 'block' : 'none';
        
        sugestoes.forEach((sugestao, index) => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = sugestao;
            
            div.addEventListener('click', function() {
                input.value = sugestao;
                suggestionsBox.style.display = 'none';
                currentFocus = -1;
            });
            
            suggestionsBox.appendChild(div);
        });
    }
    
    // Função para autocompletar
    function autocompletarValor() {
        const texto = input.value.toLowerCase();
        if (!texto || !autoCompletar) return;
        
        const sugestao = valores.find(valor => 
            valor.toLowerCase().startsWith(texto)
        );
        
        if (sugestao) {
            input.value = sugestao;
            input.setSelectionRange(texto.length, sugestao.length);
        }
    }
    
    // Event listeners
    input.addEventListener('input', function(e) {
        const texto = e.target.value;
        
        if (texto.length === 0) {
            suggestionsBox.style.display = 'none';
            currentFocus = -1;
            return;
        }
        
        const sugestoes = filtrarSugestoes(texto);
        mostrarSugestoes(sugestoes);
    });
    
    input.addEventListener('keydown', function(e) {
        const items = suggestionsBox.getElementsByClassName('suggestion-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentFocus = Math.min(currentFocus + 1, items.length - 1);
            adicionarClasseAtiva(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentFocus = Math.max(currentFocus - 1, -1);
            adicionarClasseAtiva(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentFocus > -1 && items[currentFocus]) {
                items[currentFocus].click();
            } else if (autoCompletar) {
                autocompletarValor();
            }
        } else if (e.key === 'Escape') {
            suggestionsBox.style.display = 'none';
            currentFocus = -1;
        } else if (e.key === 'Tab' && autoCompletar) {
            autocompletarValor();
        }
    });
    
    function adicionarClasseAtiva(items) {
        // Remove classe ativa de todos os itens
        for (let i = 0; i < items.length; i++) {
            items[i].classList.remove('active');
        }
        
        // Adiciona classe ativa ao item atual
        if (currentFocus > -1 && items[currentFocus]) {
            items[currentFocus].classList.add('active');
        }
    }
    
    // Fechar sugestões ao clicar fora
    document.addEventListener('click', function(e) {
        if (!container.contains(e.target)) {
            suggestionsBox.style.display = 'none';
            currentFocus = -1;
        }
    });
    
    // Montar a estrutura
    container.appendChild(input);
    container.appendChild(suggestionsBox);
    
    return container;
}

// Função auxiliar para adicionar ao DOM
function adicionarInputAoDOM(className, valores, autoCompletar = true, elementoPai = document.body) {
    const input = criarInputComSugestoes(className, valores, autoCompletar);
    elementoPai.appendChild(input);
    return input;
}