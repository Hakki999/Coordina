function exportarMateriaisCSVExcel(materiais, nomeArquivo = 'materiais.csv') {
    if (!materiais || !Array.isArray(materiais)) {
        console.error('Dados de materiais inválidos');
        return;
    }
    
    const cabecalhos = ['Item', 'Quantidade', 'Liberado', 'Devolvido'];
    
    const linhasCSV = [
        cabecalhos.join(';'), // 🔥 Usar ponto e vírgula em vez de vírgula
        ...materiais.map(material => {
            return [
                `"${(material.item || '').replace(/"/g, '""')}"`,
                material.qtd || 0,
                material.lib || 0,
                material.dev || 0
            ].join(';'); // 🔥 Usar ponto e vírgula
        })
    ];
    
    const csvContent = linhasCSV.join('\r\n'); // 🔥 Usar \r\n para Windows
    
    // 🔥 BOM + charset específico
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
}