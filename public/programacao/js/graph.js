
// Função para tratar clique no gráfico
function handleChartClick(event, elements) {
    if (elements.length > 0) {
        const firstElement = elements[0];
        const datasetIndex = firstElement.datasetIndex;
        const index = firstElement.index;

        const label = graph.data.labels[index];
        const value = graph.data.datasets[datasetIndex].data[index];
        const datasetLabel = graph.data.datasets[datasetIndex].label;

        // Feedback visual no elemento clicado
        highlightBar(index);

        // Modal mais elaborado (substitua por sua implementação UI)
        showDataModal(label, value, datasetLabel);
    }
}

// Função para destacar a barra clicada
function highlightBar(index) {
    // Reset todas as barras
    graph.data.datasets[0].backgroundColor = graph.data.datasets[0].backgroundColor.map(color =>
        color.replace('0.9', '0.7').replace('1', '0.7')
    );

    // Destaca a barra clicada
    const originalColor = graph.data.datasets[0].backgroundColor[index];
    graph.data.datasets[0].backgroundColor[index] = originalColor.replace('0.7', '0.9').replace('0.5', '0.9');

    graph.update('active');

    // Remove o destaque após 1 segundo
    setTimeout(() => {
        graph.data.datasets[0].backgroundColor[index] = originalColor;
        graph.update('active');
    }, 1000);
}

// Função para mostrar dados (substitua por modal, console, etc.)
function showDataModal(label, value, datasetLabel) {
    // Exemplo com console e alerta - substitua por sua UI
    console.log(`Clicado: ${label} - ${datasetLabel}: R$ ${value}`);

    // Usando SweetAlert2 ou similar para melhor UX
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: `${label}`,
            html: `<strong>${datasetLabel}:</strong> R$ ${value.toLocaleString('pt-BR')}`,
            icon: 'info',
            confirmButtonText: 'Fechar',
            background: '#fff',
            customClass: {
                popup: 'custom-swal'
            }
        });
    } else {
        // Fallback para alert padrão
        alert(`${datasetLabel}\n${label}: R$ ${value.toLocaleString('pt-BR')}`);
    }
}

// Função utilitária para adicionar dados
function addData(label, value) {
    graph.data.labels.push(label);
    graph.data.datasets[0].data.push(value);

    // Adiciona cor nova se necessário
    if (graph.data.labels.length > graph.data.datasets[0].backgroundColor.length) {
        const colors = [
            'rgba(139, 69, 19, 0.7)',   // marrom
            'rgba(128, 0, 128, 0.7)',   // roxo
            'rgba(255, 165, 0, 0.7)',   // laranja
            'rgba(0, 128, 128, 0.7)',   // teal
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        graph.data.datasets[0].backgroundColor.push(randomColor);
        graph.data.datasets[0].borderColor.push(randomColor.replace('0.7', '1'));
    }

    graph.update();
}

// Exemplo de uso da função addData:
// addData('Jun', 15);

// Destruir gráfico adequadamente
function destroyChart() {
    graph.destroy();
}

// Exportar dados do gráfico
function exportChartData() {
    return {
        labels: [...graph.data.labels],
        datasets: graph.data.datasets.map(dataset => ({
            label: dataset.label,
            data: [...dataset.data]
        }))
    };
}

function agruparPorEquipe(dados) {
    const agrupado = {};

    dados.forEach(item => {
        const equipe = item.equipe;

        if (!agrupado[equipe]) {
            agrupado[equipe] = {
                equipe: equipe,
                valorMaterial: 0,
                valorProgramado: 0,
                projetos: [],
                datas: [],
                count: 0
            };
        }

        agrupado[equipe].valorMaterial += Number(item.valorMaterial) || 0;
        agrupado[equipe].valorProgramado += Number(item.valorProgramado) || 0;
        agrupado[equipe].projetos.push(item.projeto);
        agrupado[equipe].datas.push(item.data);
        agrupado[equipe].count++;
    });

    return Object.values(agrupado);
}

let equipes = "";

function renderChar(data) {
    document.body.insertAdjacentHTML('beforeend',  `
        <div class="graphContainer">
            <div class="graphClose" onclick="this.parentElement.remove()"></div>
            <div class="graph">
                <canvas id="myChart"></canvas>
            </div>
        </div>
    `)

    // Verificação segura do elemento e contexto
    const canvas = document.getElementById('myChart');

    const ctx = canvas.getContext('2d');
    equipes = agruparPorEquipe(data);

    let labelsData = [];
    let valueMaterial = [];
    let valueProg = [];

    equipes.forEach(e => {
        labelsData.push(e.equipe);
        valueMaterial.push(e.valorMaterial);
        valueProg.push(e.valorProgramado)
    })

    const graph = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labelsData,
            datasets: [{
                label: 'Materiais Solicitados',
                data: valueMaterial,
                borderWidth: 2,
                backgroundColor: [
                    'rgba(250, 204, 21, 0.7)'
                ],
                borderColor: [
                    'rgba(250, 204, 21, 1)'
                ],
                borderRadius: 4,
                borderSkipped: false,
            },
            {
                label: 'Valor Programado',
                data: valueProg,
                borderWidth: 2,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.7)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)'
                ],
                borderRadius: 4,
                borderSkipped: false,
            }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 4,
                    displayColors: true,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                    },
                    ticks: {
                        callback: function (value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            onClick: (event, elements) => {
                handleChartClick(event, elements);
            }
        }
    });
}


