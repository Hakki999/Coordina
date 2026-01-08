function expandirLinhas(linha) {
    // Encontrar quais colunas são arrays
    const arrays = linha.map((campo, index) => ({ campo, index, isArray: Array.isArray(campo) }));
    const arraysEncontrados = arrays.filter(item => item.isArray);

    // Se não há arrays, retorna a linha original
    if (arraysEncontrados.length === 0) {
        return [linha];
    }

    // Verificar o comprimento dos arrays (assumimos que todos os arrays têm o mesmo comprimento)
    const comprimento = arraysEncontrados[0].campo.length;

    // Criar as linhas expandidas
    const linhasExpandidas = [];
    for (let i = 0; i < comprimento; i++) {
        const novaLinha = linha.map((campo, idx) => {
            if (Array.isArray(campo)) {
                return campo[i];
            } else {
                return campo;
            }
        });
        linhasExpandidas.push(novaLinha);
    }

    return linhasExpandidas;
}

function exportCSV(dados, nomeArquivo = 'export.csv') {
    // Expandir as linhas que contêm arrays
    const linhasExpandidas = [];
    dados.body.forEach(linha => {
        const expandidas = expandirLinhas(linha);
        linhasExpandidas.push(...expandidas);
    });

    // Agora, criar o conteúdo CSV
    const linhasCSV = [
        dados.head.join(';'), // Cabeçalho
        ...linhasExpandidas.map(linha => {
            // Formatar cada campo: se for string, escapar aspas; outros, converter para string
            return linha.map(campo => {
                if (typeof campo === 'string') {
                    return `"${campo.replace(/"/g, '""')}"`;
                } else {
                    return String(campo);
                }
            }).join(';');
        })
    ];

    const csvContent = linhasCSV.join('\r\n');

    // BOM para Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { 
        type: 'text/csv;charset=windows-1252;' 
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    criarMensagem(true, "Arquivo exportado com sucesso!");
}
