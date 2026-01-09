// Configuração dos campos com base no JSON
const campoConfig = {
    "id": {
        label: "ID",
        type: "text",
        icon: "fas fa-hashtag",
        disabled: true,
        required: true
    },
    "res_nota": {
        label: "Número da Nota",
        type: "text",
        icon: "fas fa-file-invoice",
        required: true
    },
    "res_status": {
        label: "Status",
        type: "select",
        icon: "fas fa-tasks",
        options: [
            { value: "pendente", label: "Pendente" },
            { value: "aprovado", label: "Aprovado" },
            { value: "rejeitado", label: "Rejeitado" },
            { value: "em_andamento", label: "Em Andamento" }
        ],
        required: true
    },
    "res_opex": {
        label: "Opex",
        type: "select",
        icon: "fas fa-tasks",
        options: [
            { value: "Não", label: "Não" },
            { value: "Sim", label: "Sim" },
        ],
        required: true
    },
    "res_nome_obra": {
        label: "Nome da Obra",
        type: "text",
        icon: "fas fa-building",
        fullWidth: true,
        required: true
    },
    "res_cidade": {
        label: "Cidade",
        type: "select",
        icon: "fas fa-tag",
        options: cidades
,
        required: true
    },
    "res_pg": {
        label: "Código PG",
        type: "text",
        icon: "fas fa-barcode",
        required: true
    },
    "res_tipo": {
        label: "Tipo",
        type: "select",
        icon: "fas fa-tag",
        options: [
            { value: "RP", label: "cx" },
            { value: "PG", label: "PG" },
            { value: "OC", label: "OC" }
        ],
        required: true
    },
    "res_oc": {
        label: "Ocorrência",
        type: "text",
        icon: "fas fa-clipboard-list",
        required: true
    },
    "res_pep": {
        label: "PEP N3",
        type: "text",
        icon: "fas fa-clipboard-list",
        required: false
    },
    "res_data_exe": {
        label: "Data de Execução",
        type: "date",
        icon: "fas fa-calendar-alt",
        required: true
    },
    "res_data_cri": {
        label: "Data de Criação",
        type: "datetime-local",
        icon: "fas fa-calendar-plus",
        disabled: true
    },
    "res_resp": {
        label: "Responsável",
        type: "text",
        icon: "fas fa-user",
        disabled: true,
    }
};

// Dados atuais sendo editados
let dadosAtuais = {};

// Função para criar campo dinamicamente
function criarCampo(chave, valor) {
    const config = campoConfig[chave];
    if (!config) return '';
    
    const id = `edit_${chave}`;
    const isFullWidth = config.fullWidth ? 'fullWidth' : '';
    
    let inputField = '';
    
    switch(config.type) {
        case 'select':
            inputField = `
                <select id="${id}" class="editSelect" ${config.disabled ? 'disabled' : ''}>
                    ${config.options.map(opt => 
                        `<option value="${opt.value}" ${valor == opt.value ? 'selected' : ''}>${opt.label}</option>`
                    ).join('')}
                </select>
            `;
            break;
            
        case 'textarea':
            inputField = `<textarea id="${id}" class="editTextarea" ${config.disabled ? 'disabled' : ''}>${valor || ''}</textarea>`;
            break;
            
        default:
            const inputType = config.type === 'datetime-local' ? 'datetime-local' : 
                            config.type === 'date' ? 'date' : 'text';
            inputField = `<input type="${inputType}" id="${id}" class="editInput" value="${valor || ''}" 
                       ${config.disabled ? 'disabled' : ''} ${config.required ? 'required' : ''}>`;
    }
    
    return `
        <div class="editField ${isFullWidth}">
            <label for="${id}" class="${config.required ? 'required' : ''}">
                <i class="${config.icon}"></i> ${config.label}
            </label>
            ${inputField}
        </div>
    `;
}

// Função para abrir edição
function abrirEdicao(dados) {
    dadosAtuais = { ...dados };
    
    // Cria ou atualiza o container
    let editContainer = document.querySelector('.editContainer');
    if (!editContainer) {
        editContainer = document.createElement('div');
        editContainer.className = 'editContainer';
        editContainer.style.display = 'flex';
        document.body.appendChild(editContainer);
    } else {
        editContainer.style.display = 'flex';
    }
    
    // Insere o HTML se necessário
    if (!editContainer.innerHTML.trim()) {
        editContainer.innerHTML = `
            <div class="editOverlay" onclick="fecharEdicao()"></div>
            <div class="editWrapper">
                <div class="editHeader">
                    <h2><i class="fas fa-edit"></i> Editar Serviço #${dados.id}</h2>
                </div>
                
                <div class="editGrid" id="editGrid"></div>
                
                <div class="editFooter">
                    <button type="button" class="btnCancel" onclick="fecharEdicao()">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button type="button" class="btnSave" onclick="salvarEdicao()">
                        <i class="fas fa-save"></i> Solicitar Alterações
                    </button>
                </div>
            </div>
        `;
    } else {
        // Atualiza o título
        const titulo = editContainer.querySelector('h2');
        if (titulo) {
            titulo.innerHTML = `<i class="fas fa-edit"></i> Editar Serviço #${dados.id}`;
        }
    }
    
    // Cria os campos dinamicamente
    const editGrid = editContainer.querySelector('#editGrid') || editContainer.querySelector('.editGrid');
    if (editGrid) {
        let camposHTML = '';
        
        // Ordena os campos para melhor layout
        const camposOrdenados = [
            'id', 'res_nota', 'res_status', 'res_opex',
            'res_nome_obra', 'res_pep',
            'res_cidade', 'res_pg',
            'res_tipo', 'res_oc',
            'res_data_exe', 'res_data_cri',
            'res_resp'
        ];
        
        camposOrdenados.forEach(chave => {
            if (dados[chave] !== undefined) {
                camposHTML += criarCampo(chave, dados[chave]);
            }
        });
        
        editGrid.innerHTML = camposHTML;
    }
    
    // Foco no primeiro campo editável
    setTimeout(() => {
        const primeiroCampo = editContainer.querySelector('.editInput:not([disabled]), .editSelect:not([disabled])');
        if (primeiroCampo) primeiroCampo.focus();
    }, 100);
}

// Função para fechar edição
function fecharEdicao() {
    const editContainer = document.querySelector('.editContainer');
    if (editContainer) {
        editContainer.style.display = 'none';
        dadosAtuais = {};
    }
}

// Função para coletar dados do formulário
function coletarDados() {
    const dados = { ...dadosAtuais };
    
    Object.keys(campoConfig).forEach(chave => {
        const elemento = document.getElementById(`edit_${chave}`);
        if (elemento) {
            dados[chave] = elemento.value;
        }
    });
    
    return dados;
}

// Função para salvar edição
function salvarEdicao() {
    const dadosEditados = coletarDados();
    
    // Validação básica
    const camposInvalidos = [];
    Object.keys(campoConfig).forEach(chave => {
        const config = campoConfig[chave];
        const elemento = document.getElementById(`edit_${chave}`);
        
        if (config.required && elemento && !elemento.value.trim()) {
            camposInvalidos.push(config.label);
            elemento.style.borderColor = '#ff6b6b';
        }
    });
    
    if (camposInvalidos.length > 0) {
        alert(`Por favor, preencha os campos obrigatórios:\n${camposInvalidos.join('\n')}`);
        return;
    }
    
    // Aqui você implementaria a chamada à API
    console.log('Dados a serem salvos:', dadosEditados);
    
    fetch('/atualizar_iop', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(dadosEditados),
        credentials: 'include'
    }).then(response => response.json())
      .then(data => {
          if (data.success) {
              criarMensagem(true, data.message);
              buscar_dados();
              fecharEdicao();
          } else {
              criarMensagem(false, data.message);
          }
      })
      .catch(error => {
          console.error('Erro ao atualizar IOP:', error);
          criarMensagem(false, 'Erro ao atualizar IOP');
      });
}

// Evento para fechar com ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        fecharEdicao();
    }
});
