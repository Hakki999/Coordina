// 🔧 FUNÇÃO PARA GERAR PDF DA LISTA DE MATERIAIS
function gerarPDFListaMateriais() {
    try {
        // Verificar se a listamateriais está visível
        const listamateriais = document.getElementById('listamateriais');
        if (!listamateriais || listamateriais.style.display === 'none') {
            alert('❌ A lista de materiais não está visível!');
            return;
        }

        // Coletar dados do cabeçalho
        const solicitante = document.getElementById('lmSolicitante').innerText;
        const projeto = document.getElementById('lmProjeto').innerText;
        const cidade = document.getElementById('lmCidade').innerText;
        const tensao = document.getElementById('lmTensao').innerText;
        const equipe = document.getElementById('lmEquipe').innerText;
        const dataSol = document.getElementById('lmDataSol').innerText;
        const dataExe = document.getElementById('lmDataExe').innerText;
        const obs = document.getElementById('lmObs').innerText;

        // Coletar dados da tabela de materiais
        const materialRows = document.querySelectorAll('#listamateriais tbody tr:not(:first-child)');
        let materiaisHTML = '';

        materialRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 4) {
                const material = cells[0].innerText;
                const orcado = cells[1].innerText;
                let liberado = cells[2].innerText;
                let devolvido = cells[3].innerText;

                if (!liberado || liberado.trim() === '' || liberado == 0 || liberado == "0") liberado = '';
                if (!devolvido || devolvido.trim() === '' || devolvido == 0 || devolvido || "0") devolvido = '';
                
                materiaisHTML += `
                    <tr>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${material}</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${orcado}</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${liberado}</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${devolvido}</td>
                    </tr>
                `;
            }
        });

        // Criar conteúdo HTML para o PDF
        const dataGeracao = new Date().toLocaleString('pt-BR');
        
        const conteudoPDF = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Lista de Materiais - ${projeto}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        margin: 0;
                        color: #2c3e50;
                        font-size: 24px;
                    }
                    .header .subtitle {
                        color: #7f8c8d;
                        font-size: 14px;
                        margin-top: 5px;
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 15px;
                        margin-bottom: 30px;
                    }
                    .info-item {
                    
                        margin-bottom: 8px;
                    }
                    .info-label {
                    position: relative;
                        font-weight: bold;
                        color: #2c3e50;
                    }
                    .info-value {
                        color: #34495e;
                    }
                    .table-container {
                        width: 100%;
                        margin-top: 20px;
                    }
                    .materiais-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                    }
                    .materiais-table th {
                        background-color: #34495e;
                        color: white;
                        padding: 12px;
                        text-align: left;
                        border: 1px solid #ddd;
                    }
                    .materiais-table td {
                        border: 1px solid #ddd;
                        padding: 10px;
                    }
                    .total-row {
                        background-color: #ecf0f1;
                        font-weight: bold;
                    }
                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        font-size: 12px;
                        color: #7f8c8d;
                        border-top: 1px solid #bdc3c7;
                        padding-top: 20px;
                    }
                    .observacoes {
                        margin-top: 20px;
                        padding: 15px;
                        background-color: #f8f9fa;
                        border-left: 4px solid #3498db;
                    }
                    .observacoes strong {
                        color: #2c3e50;
                    }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                    .ass:before {
                    content: "";
                    display: block;
                    width: 400px;
                    border-bottom: 1px solid #333;
                    margin-bottom: 5px;
                    padding-bottom: 5px;
                    position: absolute;
                    bottom: -20px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <img style="height: 50px;" src="../src/logo Veman.png">
                    <h1>LISTA DE MATERIAIS</h1>
                    <div class="subtitle">Relatório gerado em ${dataGeracao}</div>
                </div>

                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Solicitante:</span>
                        <span class="info-value">${solicitante}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Projeto:</span>
                        <span class="info-value">${projeto}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Cidade:</span>
                        <span class="info-value">${cidade}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Tensão:</span>
                        <span class="info-value">${tensao}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Equipe:</span>
                        <span class="info-value">${equipe}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Data Solicitação:</span>
                        <span class="info-value">${dataSol}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Data Execução:</span>
                        <span class="info-value">${dataExe}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label ass">Resp. Entrega:</span>
                            <br>
                            <br>
                            <br>
                        <span class="info-label ass">Resp. Recebimento:</span>
                    </div>
                     <div class="info-item">
                        
                    </div>
                </div>

                ${obs && obs !== 'N/A' ? `
                <div class="observacoes">
                    <strong>Observações:</strong><br>
                    ${obs}
                </div>
                ` : ''}

                <div class="table-container">
                    <h3 style="color: #2c3e50; margin-bottom: 15px;">📋 Materiais Solicitados</h3>
                    <table class="materiais-table">
                        <thead>
                            <tr>
                                <th style="width: 50%;">Material</th>
                                <th style="width: 16%; text-align: center;">Orçado</th>
                                <th style="width: 16%; text-align: center;">Liberado</th>
                                <th style="width: 18%; text-align: center;">Devolvido</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${materiaisHTML || `
                                <tr>
                                    <td colspan="4" style="text-align: center; padding: 20px; color: #7f8c8d;">
                                        Nenhum material encontrado
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>

                <div class="footer">
                    <p>Relatório gerado automaticamente pelo Sistema Coordina</p>
                    <p>${window.location.hostname} • ${dataGeracao}</p>
                </div>

                <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()" style="
                        background: #3498db;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                        margin: 5px;
                    ">🖨️ Imprimir</button>
                    <button onclick="window.close()" style="
                        background: #e74c3c;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                        margin: 5px;
                    ">❌ Fechar</button>
                </div>
            </body>
            </html>
        `;

        // Abrir nova janela para impressão/visualização
        const janelaPDF = window.open('', '_blank', 'width=1000,height=800,scrollbars=yes,resizable=yes');
        janelaPDF.document.write(conteudoPDF);
        janelaPDF.document.close();

        // Focar na nova janela
        janelaPDF.focus();

        console.log('✅ PDF gerado com sucesso!');

    } catch (error) {
        console.error('❌ Erro ao gerar PDF:', error);
        alert('❌ Erro ao gerar PDF. Verifique o console para mais detalhes.');
    }
}

// 🔧 FUNÇÃO ALTERNATIVA COM jsPDF (se preferir biblioteca)
async function gerarPDFComJsPDF() {
    // Verificar se jsPDF está disponível
    if (typeof jsPDF === 'undefined') {
        // Carregar jsPDF dinamicamente
        await carregarScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        await carregarScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js');
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Coletar dados
        const solicitante = document.getElementById('lmSolicitante').innerText;
        const projeto = document.getElementById('lmProjeto').innerText;
        const cidade = document.getElementById('lmCidade').innerText;
        const tensao = document.getElementById('lmTensao').innerText;
        const equipe = document.getElementById('lmEquipe').innerText;
        const dataSol = document.getElementById('lmDataSol').innerText;
        const dataExe = document.getElementById('lmDataExe').innerText;
        const obs = document.getElementById('lmObs').innerText;

        // Configurações do PDF
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text('📦 LISTA DE MATERIAIS', 105, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`, 105, 28, { align: 'center' });

        // Informações do projeto
        let yPos = 45;
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        
        doc.text(`Solicitante: ${solicitante}`, 20, yPos);
        doc.text(`Projeto: ${projeto}`, 20, yPos + 8);
        doc.text(`Cidade: ${cidade}`, 20, yPos + 16);
        doc.text(`Tensão: ${tensao}`, 20, yPos + 24);
        
        doc.text(`Equipe: ${equipe}`, 110, yPos);
        doc.text(`Data Solicitação: ${dataSol}`, 110, yPos + 8);
        doc.text(`Data Execução: ${dataExe}`, 110, yPos + 16);

        yPos += 35;

        // Observações (se houver)
        if (obs && obs !== 'N/A') {
            doc.setFontSize(11);
            doc.setTextColor(30, 30, 30);
            doc.text('Observações:', 20, yPos);
            
            doc.setFontSize(10);
            doc.setTextColor(80, 80, 80);
            const obsLines = doc.splitTextToSize(obs, 170);
            doc.text(obsLines, 20, yPos + 8);
            
            yPos += 15 + (obsLines.length * 5);
        }

        // Tabela de materiais
        const materialRows = document.querySelectorAll('#listamateriais tbody tr:not(:first-child)');
        const tableData = [];

        materialRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 4) {
                tableData.push([
                    cells[0].innerText,
                    cells[1].innerText,
                    cells[2].innerText,
                    cells[3].innerText
                ]);
            }
        });

        // Adicionar tabela
        doc.autoTable({
            startY: yPos,
            head: [['Material', 'Orçado', 'Liberado', 'Devolvido']],
            body: tableData.length > 0 ? tableData : [['Nenhum material encontrado', '', '', '']],
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [52, 73, 94], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { left: 20, right: 20 }
        });

        // Rodapé
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Sistema Coordina - Página ${i} de ${pageCount}`, 105, 285, { align: 'center' });
        }

        // Salvar PDF
        doc.save(`lista_materiais_${projeto}_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
        console.error('❌ Erro ao gerar PDF com jsPDF:', error);
        // Fallback para método HTML
        gerarPDFListaMateriais();
    }
}

// 🔧 FUNÇÃO AUXILIAR PARA CARREGAR SCRIPTS
function carregarScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// 🔧 ADICIONAR BOTÃO DE PDF NA LISTAMATERIAIS
function adicionarBotaoPDF() {
    const listamateriais = document.getElementById('listamateriais');
    if (!listamateriais) return;

    // Verificar se o botão já existe
    if (document.getElementById('botaoGerarPDF')) return;

    const botaoPDF = document.createElement('button');
    botaoPDF.id = 'botaoGerarPDF';
    botaoPDF.innerHTML = '📄 Gerar PDF';
    botaoPDF.style.cssText = `
        position: absolute;
        top: 15px;
        left: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 600;
        z-index: 101;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
    `;

    botaoPDF.onmouseover = function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
    };

    botaoPDF.onmouseout = function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    };

    botaoPDF.onclick = gerarPDFListaMateriais;

    listamateriais.appendChild(botaoPDF);
}

// 🔧 INICIALIZAR BOTÃO QUANDO A LISTA ABRIR
// Adicione esta linha na função que abre a listamateriais
function abrirListaMateriais() {
    // Seu código existente para abrir a lista...
    
    // Adicionar botão PDF após um pequeno delay para garantir que o DOM esteja pronto
    setTimeout(adicionarBotaoPDF, 100);
}

// 🔧 EXEMPLO DE USO - Adicione isso onde você abre a listamateriais
// No seu código existente, onde tem: listamateriais.style.display = "block";
// Adicione após: setTimeout(adicionarBotaoPDF, 100);