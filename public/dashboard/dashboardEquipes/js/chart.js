
// Cria o grafico
function criarGraficoFromTabela(tabelaId, graficoId, tipo = 'bar', titulo = 'Gráfico') {
    const tabela = document.getElementById(tabelaId);
    const canvas = document.getElementById(graficoId);
    
    if (!tabela || !canvas) {
        console.error('Elementos não encontrados!');
        return null;
    }

    const labels = Array.from(tabela.querySelectorAll('tbody tr td:first-child'))
                        .map(td => td.textContent.trim());
    
    const valores = Array.from(tabela.querySelectorAll('tbody tr td:nth-child(2)'))
                        .map(td => {
                            const valor = Number(td.textContent.replace(/[^\d,-]/g, '').replace(',', '.'));
                            return isNaN(valor) ? 0 : valor;
                        });

    const ctx = canvas.getContext('2d');
    return new Chart(ctx, {
        type: tipo,
        data: {
            labels: labels,
            datasets: [{
                label: titulo,
                data: valores,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: titulo }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', evt => criarGraficoFromTabela('tabelaPerformance', 'meuGrafico', 'bar', 'Peformace'))
