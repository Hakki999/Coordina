let dadosTable = [];

// Variáveis globais
let filteredData = [...dadosTable];
let productionChart = null;
let dailyProductionChart = null;

function parseBrazilianDate(dateString) {
    if (!dateString) return null;
    
    // Tentar diferentes formatos
    try {
        // Formato 1: "02/02/2026, 16:14:27"
        if (dateString.includes('/') && dateString.includes(',')) {
            const [datePart, timePart] = dateString.split(', ');
            const [day, month, year] = datePart.split('/').map(Number);
            const [hours, minutes, seconds] = timePart.split(':').map(Number);
            
            return new Date(year, month - 1, day, hours, minutes, seconds);
        }
        
        // Formato 2: "dd/MM/yyyy"
        if (dateString.includes('/') && dateString.split('/').length === 3) {
            const [day, month, year] = dateString.split('/').map(Number);
            return new Date(year, month - 1, day);
        }
        
        // Formato 3: ISO string (yyyy-MM-dd)
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date;
        }
        
        return null;
    } catch (e) {
        console.error('Erro ao converter data:', dateString, e);
        return null;
    }
}

// Função para formatar valores monetários
function formatCurrency(value) {
    if (value === null || value === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Função para formatar datas
function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    } catch (e) {
        return '-';
    }
}

// Função para obter data no formato YYYY-MM-DD
function getDateOnly(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
}

// Função para atualizar os cards de resumo
function updateSummaryCards(data) {
    const totalObras = data.length;
    const valorTotal = data.reduce((sum, item) => sum + (item.res_orcamento || 0), 0);
    const pessoas = [...new Set(data.map(item => item.res_resp).filter(Boolean))].length;
    const mediaObra = totalObras > 0 ? valorTotal / totalObras : 0;

    document.getElementById('totalObras').textContent = totalObras;
    document.getElementById('valorTotal').textContent = formatCurrency(valorTotal);
    document.getElementById('totalPessoas').textContent = pessoas;
    document.getElementById('mediaObra').textContent = formatCurrency(mediaObra);
}

function populateFilters() {
    const pessoas = [...new Set(dadosTable.map(item => item.res_resp).filter(Boolean))].sort();
    const cidades = [...new Set(dadosTable.map(item => item.res_cidade).filter(Boolean))].sort();
    const tipos = [...new Set(dadosTable.map(item => item.res_tipo).filter(Boolean))].sort();

    const filterPerson = document.getElementById('filterPerson');
    const filterCity = document.getElementById('filterCity');
    const filterType = document.getElementById('filterType');

    // Limpar filtros existentes
    filterPerson.innerHTML = '<option value="all">Todos os responsáveis</option>';
    filterCity.innerHTML = '<option value="all">Todas as cidades</option>';

    // Popular filtro de pessoas
    pessoas.forEach(pessoa => {
        const option = document.createElement('option');
        option.value = pessoa;
        option.textContent = pessoa;
        filterPerson.appendChild(option);
    });

    // Popular filtro de cidades
    cidades.forEach(cidade => {
        const option = document.createElement('option');
        option.value = cidade;
        option.textContent = cidade;
        filterCity.appendChild(option);
    });

    // Configurar datas máximas para hoje
    const today = new Date().toISOString().split('T')[0];
    
    const specificDateInput = document.getElementById('filterSpecificDate');
    const startDateInput = document.getElementById('filterStartDate');
    const endDateInput = document.getElementById('filterEndDate');
    const filterDateInput = document.getElementById('filterDate');
    
    if (specificDateInput) specificDateInput.max = today;
    if (startDateInput) startDateInput.max = today;
    if (endDateInput) endDateInput.max = today;
    if (filterDateInput) filterDateInput.max = today;
    
    // Configurar data mínima baseada nos dados disponíveis
    if (dadosTable.length > 0) {
        const dates = dadosTable
            .map(item => item.res_data_criacao || item.res_data_exe)
            .filter(Boolean)
            .map(date => new Date(date));
        
        if (dates.length > 0) {
            const minDate = new Date(Math.min(...dates)).toISOString().split('T')[0];
            if (specificDateInput) specificDateInput.min = minDate;
            if (startDateInput) startDateInput.min = minDate;
            if (endDateInput) endDateInput.min = minDate;
            if (filterDateInput) filterDateInput.min = minDate;
        }
    }

    // Configurar event listener para alternar entre filtros de data
    const dateFilterTypeSelect = document.getElementById('dateFilterType');
    if (dateFilterTypeSelect) {
        dateFilterTypeSelect.addEventListener('change', toggleDateFilterFields);
    }
    
    // Inicializar visibilidade dos campos
    toggleDateFilterFields();
}

// Função para aplicar filtros
// Função para aplicar filtros
function applyFilters() {
    const selectedPerson = document.getElementById('filterPerson').value;
    const selectedCity = document.getElementById('filterCity').value;
    const selectedType = document.getElementById('filterType').value;
    const selectedDate = document.getElementById('filterDate').value;
    const dateFilterType = document.getElementById('dateFilterType').value;
    const specificDate = document.getElementById('filterSpecificDate').value;
    const startDate = document.getElementById('filterStartDate').value;
    const endDate = document.getElementById('filterEndDate').value;

    filteredData = dadosTable.filter(item => {
        // Filtro por pessoa
        if (selectedPerson !== 'all' && item.res_resp !== selectedPerson) {
            return false;
        }

        // Filtro por cidade
        if (selectedCity !== 'all' && item.res_cidade !== selectedCity) {
            return false;
        }

        // Filtro por tipo
        if (selectedType !== 'all' && item.res_tipo !== selectedType) {
            return false;
        }

        // Filtro por data de execução (até a data selecionada)
        if (selectedDate) {
            const itemDate = getDateOnly(item.res_data_exe);
            if (itemDate && itemDate > selectedDate) {
                return false;
            }
        }

        // Filtro por data de criação (corrigido)
        const creationDateRaw = item.res_data_criacao || item.res_data_cri;
        
        // Verificar se há data de criação disponível
        if (!creationDateRaw) {
            // Se não há data de criação e algum filtro de data foi especificado, excluir item
            if (dateFilterType === 'specific' && specificDate) {
                return false;
            }
            if (dateFilterType === 'range' && (startDate || endDate)) {
                return false;
            }
            return true; // Item sem data passa se não houver filtro de data
        }

        // Parsear a data de criação usando a função parseBrazilianDate
        const creationDateFormatted = parseBrazilianDate(creationDateRaw);
        
        // Se o parse falhar, tratar como data inválida
        if (!creationDateFormatted) {
            if (dateFilterType === 'specific' && specificDate) {
                return false;
            }
            if (dateFilterType === 'range' && (startDate || endDate)) {
                return false;
            }
            return true;
        }

        // Obter apenas a parte da data (YYYY-MM-DD)
        const creationDate = getDateOnly(creationDateFormatted);
        
        if (dateFilterType === 'specific' && specificDate) {
            // Filtro por data específica
            if (!creationDate || creationDate !== specificDate) {
                return false;
            }
        } else if (dateFilterType === 'range') {
            // Filtro por intervalo de datas
            let passesDateFilter = true;
            
            if (startDate) {
                if (!creationDate || creationDate < startDate) {
                    passesDateFilter = false;
                }
            }
            
            if (endDate) {
                if (!creationDate || creationDate > endDate) {
                    passesDateFilter = false;
                }
            }
            
            if (!passesDateFilter) {
                return false;
            }
        }

        return true;
    });

    updateSummaryCards(filteredData);
    updateCharts();
    updateTable();
}

function resetFilters() {
    document.getElementById('filterPerson').value = 'all';
    document.getElementById('filterCity').value = 'all';
    document.getElementById('filterType').value = 'all';
    document.getElementById('filterDate').value = '';
    document.getElementById('dateFilterType').value = 'specific';
    document.getElementById('filterSpecificDate').value = '';
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';

    // Mostrar/ocultar campos apropriados
    toggleDateFilterFields();

    filteredData = [...dadosTable];
    updateSummaryCards(filteredData);
    updateCharts();
    updateTable();
}

// Adicione esta função para alternar entre os campos de data
function toggleDateFilterFields() {
    const dateFilterType = document.getElementById('dateFilterType').value;
    const specificDateContainer = document.getElementById('specificDateContainer');
    const dateRangeContainer = document.getElementById('dateRangeContainer');
    
    if (dateFilterType === 'specific') {
        specificDateContainer.style.display = 'block';
        dateRangeContainer.style.display = 'none';
    } else {
        specificDateContainer.style.display = 'none';
        dateRangeContainer.style.display = 'block';
    }
}

// Função para exportar dados
function exportData() {
    const dataToExport = filteredData.map(item => ({
        Responsável: item.res_resp || '',
        Obra: item.res_nome_obra || '',
        Cidade: item.res_cidade || '',
        Tipo: item.res_tipo || '',
        'Data Execução': item.res_data_exe || '',
        Orçamento: item.res_orcamento || 0,
        Status: item.res_status || ''
    }));

    // Converter para CSV
    const headers = Object.keys(dataToExport[0]).join(',');
    const rows = dataToExport.map(item =>
        Object.values(item).map(value =>
            typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
    ).join('\n');

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `analise_producao_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Função para atualizar gráficos
function updateCharts() {
    // Verificar se temos dados
    if (filteredData.length === 0) {
        console.warn('Nenhum dado para exibir nos gráficos');
        return;
    }

    // Agrupar dados por responsável
    const groupedByPerson = filteredData.reduce((acc, item) => {
        const pessoa = item.res_resp || 'Não informado';
        if (!acc[pessoa]) {
            acc[pessoa] = {
                total: 0,
                count: 0,
                dailyData: {}
            };
        }
        acc[pessoa].total += item.res_orcamento || 0;
        acc[pessoa].count += 1;

        // Agrupar por data para produção diária
        const dateKey = getDateOnly(item.res_data_exe);
        if (dateKey) {
            if (!acc[pessoa].dailyData[dateKey]) {
                acc[pessoa].dailyData[dateKey] = {
                    total: 0,
                    count: 0
                };
            }
            acc[pessoa].dailyData[dateKey].total += item.res_orcamento || 0;
            acc[pessoa].dailyData[dateKey].count += 1;
        }

        return acc;
    }, {});

    // Preparar dados para o gráfico principal
    const pessoas = Object.keys(groupedByPerson);
    const valores = pessoas.map(pessoa => groupedByPerson[pessoa].total);
    const quantidades = pessoas.map(pessoa => groupedByPerson[pessoa].count);

    // Destruir gráficos existentes
    if (productionChart) {
        productionChart.destroy();
    }
    if (dailyProductionChart) {
        dailyProductionChart.destroy();
    }

    // Obter contexto dos canvas
    const productionCtx = document.getElementById('productionChart');
    const dailyCtx = document.getElementById('typeChart');
    
    if (!productionCtx || !dailyCtx) {
        console.error('Elementos canvas não encontrados');
        return;
    }

    // Atualizar título do segundo gráfico
    const chart2Title = document.querySelector('.chart-card:nth-child(2) h3');
    if (chart2Title) {
        chart2Title.textContent = 'Produção Diária';
    }

    // Configurar cores
    const colors = [
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
    ];

    // Obter tipo de gráfico selecionado
    const chartType = document.getElementById('chartType').value;

    // Criar gráfico de produção
    if (chartType === 'bar') {
        productionChart = new Chart(productionCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: pessoas,
                datasets: [
                    {
                        label: 'Valor Total (R$)',
                        data: valores,
                        backgroundColor: colors[0],
                        borderColor: colors[0].replace('0.7', '1'),
                        borderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Quantidade de Obras',
                        data: quantidades,
                        backgroundColor: colors[1],
                        borderColor: colors[1].replace('0.7', '1'),
                        borderWidth: 2,
                        yAxisID: 'y1',
                        type: 'line'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function (context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.datasetIndex === 0) {
                                    label += formatCurrency(context.parsed.y);
                                } else {
                                    label += context.parsed.y + ' obra(s)';
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#ffffff',
                            maxRotation: 45
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        ticks: {
                            color: '#ffffff',
                            callback: function (value) {
                                return formatCurrency(value);
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        title: {
                            display: true,
                            text: 'Valor (R$)',
                            color: '#ffffff'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                        title: {
                            display: true,
                            text: 'Quantidade',
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    } else {
        // Gráfico de pizza
        productionChart = new Chart(productionCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: pessoas,
                datasets: [{
                    data: valores,
                    backgroundColor: colors,
                    borderColor: colors.map(color => color.replace('0.7', '1')),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = valores.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Calcular dados para gráfico de produção diária (agora usando todos os dados, não por pessoa)
    const dailyProductionData = filteredData.reduce((acc, item) => {
        const dateKey = getDateOnly(item.res_data_exe);
        if (!dateKey) return acc;
        
        if (!acc[dateKey]) {
            acc[dateKey] = {
                total: 0,
                count: 0,
                pessoas: new Set()
            };
        }
        acc[dateKey].total += item.res_orcamento || 0;
        acc[dateKey].count += 1;
        if (item.res_resp) {
            acc[dateKey].pessoas.add(item.res_resp);
        }
        
        return acc;
    }, {});

    // Ordenar datas
    const sortedDates = Object.keys(dailyProductionData).sort();
    
    if (sortedDates.length === 0) {
        // Se não houver datas, mostrar mensagem
        dailyCtx.parentElement.innerHTML = '<p style="color: #ffffff; text-align: center; padding: 40px;">Sem dados diários para exibir</p>';
        return;
    }
    
    // Preparar dados para o gráfico
    const dailyLabels = sortedDates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
    });
    
    const dailyValues = sortedDates.map(date => dailyProductionData[date].total);
    const dailyCounts = sortedDates.map(date => dailyProductionData[date].count);

    // Criar gráfico de produção diária (linha)
    dailyProductionChart = new Chart(dailyCtx.getContext('2d'), {
        type: 'line',
        data: {
            labels: dailyLabels,
            datasets: [
                {
                    label: 'Valor Diário (R$)',
                    data: dailyValues,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: colors[0],
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Obras por Dia',
                    data: dailyCounts,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: colors[1],
                    borderWidth: 2,
                    type: 'bar',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#ffffff'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.datasetIndex === 0) {
                                label += formatCurrency(context.raw);
                            } else {
                                label += context.raw + ' obra(s)';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        color: '#ffffff',
                        callback: function (value) {
                            return formatCurrency(value);
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    title: {
                        display: true,
                        text: 'Valor (R$)',
                        color: '#ffffff'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: {
                        color: '#ffffff'
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    title: {
                        display: true,
                        text: 'Quantidade',
                        color: '#ffffff'
                    }
                }
            }
        }
    });

    // Adicionar métricas de produção diária
    updateDailyMetrics(dailyProductionData);
}

// Função para atualizar métricas de produção diária
function updateDailyMetrics(dailyData) {
    const dates = Object.keys(dailyData);
    
    if (dates.length === 0) {
        return;
    }
    
    // Calcular métricas
    const totalDays = dates.length;
    const totalDailyValue = dates.reduce((sum, date) => sum + dailyData[date].total, 0);
    const totalDailyCount = dates.reduce((sum, date) => sum + dailyData[date].count, 0);
    const avgDailyValue = totalDailyValue / totalDays;
    const avgDailyCount = totalDailyCount / totalDays;
    
    // Encontrar dia com maior produção
    let maxValueDay = '';
    let maxValue = 0;
    
    dates.forEach(date => {
        if (dailyData[date].total > maxValue) {
            maxValue = dailyData[date].total;
            maxValueDay = date;
        }
    });
    
    // Atualizar ou criar cards de métricas diárias
    let metricsContainer = document.getElementById('dailyMetrics');
    if (!metricsContainer) {
        metricsContainer = document.createElement('div');
        metricsContainer.id = 'dailyMetrics';
        metricsContainer.className = 'daily-metrics-container';
        metricsContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            backdrop-filter: blur(10px);
        `;
        
        // Inserir após os cards de resumo
        const summaryCards = document.querySelector('.summary-cards');
        if (summaryCards) {
            summaryCards.parentNode.insertBefore(metricsContainer, summaryCards.nextSibling);
        }
    }
    
    metricsContainer.innerHTML = `
        <div class="metric-card" style="background: rgba(54, 162, 235, 0.2); padding: 15px; border-radius: 8px; color: #ffffff;">
            <div style="font-size: 12px; opacity: 0.8;">MÉDIA DIÁRIA</div>
            <div style="font-size: 24px; font-weight: bold;">${formatCurrency(avgDailyValue)}</div>
            <div style="font-size: 14px;">${avgDailyCount.toFixed(1)} obras/dia</div>
        </div>
        <div class="metric-card" style="background: rgba(255, 99, 132, 0.2); padding: 15px; border-radius: 8px; color: #ffffff;">
            <div style="font-size: 12px; opacity: 0.8;">MELHOR DIA</div>
            <div style="font-size: 20px; font-weight: bold;">${formatCurrency(maxValue)}</div>
            <div style="font-size: 14px;">${formatDate(maxValueDay)}</div>
        </div>
        <div class="metric-card" style="background: rgba(75, 192, 192, 0.2); padding: 15px; border-radius: 8px; color: #ffffff;">
            <div style="font-size: 12px; opacity: 0.8;">TOTAL PERÍODO</div>
            <div style="font-size: 20px; font-weight: bold;">${formatCurrency(totalDailyValue)}</div>
            <div style="font-size: 14px;">${totalDailyCount} obras</div>
        </div>
        <div class="metric-card" style="background: rgba(255, 206, 86, 0.2); padding: 15px; border-radius: 8px; color: #ffffff;">
            <div style="font-size: 12px; opacity: 0.8;">DIAS ANALISADOS</div>
            <div style="font-size: 24px; font-weight: bold;">${totalDays}</div>
            <div style="font-size: 14px;">dias com produção</div>
        </div>
    `;
}

// Função para atualizar tabela
function updateTable() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    if (filteredData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: #ffffff;">
                    Nenhuma obra encontrada com os filtros aplicados
                </td>
            </tr>
        `;
        return;
    }

    // Ordenar dados por data de execução (mais recente primeiro)
    const sortedData = [...filteredData].sort((a, b) => {
        const dateA = new Date(a.res_data_exe || 0);
        const dateB = new Date(b.res_data_exe || 0);
        return dateB - dateA;
    });

    sortedData.forEach(item => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${item.res_resp || 'Não informado'}</td>
            <td>${item.res_nome_obra || '-'}</td>
            <td>${item.res_cidade || '-'}</td>
            <td>
                <span class="badge ${item.res_tipo === 'RC' ? 'badge-rc' : item.res_tipo === 'RT' ? 'badge-rt' : 'badge-other'}">
                    ${item.res_tipo || '-'}
                </span>
            </td>
            <td>${formatDate(item.res_data_exe)}</td>
            <td>${formatCurrency(item.res_orcamento)}</td>
            <td>
                <span class="status-badge" style="
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    background: ${getStatusColor(item.res_status)};
                ">
                    ${item.res_status || 'Não informado'}
                </span>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Função auxiliar para cores de status
function getStatusColor(status) {
    if (!status) return 'rgba(108, 117, 125, 0.2)';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('concluída') || statusLower.includes('aprovada')) {
        return 'rgba(40, 167, 69, 0.2)';
    } else if (statusLower.includes('pendente') || statusLower.includes('aguardando')) {
        return 'rgba(255, 193, 7, 0.2)';
    } else if (statusLower.includes('comissionada') || statusLower.includes('execução')) {
        return 'rgba(23, 162, 184, 0.2)';
    } else if (statusLower.includes('liberado')) {
        return 'rgba(0, 123, 255, 0.2)';
    } else {
        return 'rgba(108, 117, 125, 0.2)';
    }
}

function start() {
    console.log('Iniciando análise de produção...');
    console.log('Total de registros:', dadosTable.length);
    
    if (dadosTable.length === 0) {
        console.warn('Nenhum dado disponível');
        document.body.innerHTML += `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(220, 53, 69, 0.9);
                color: white;
                padding: 30px 50px;
                border-radius: 10px;
                text-align: center;
                z-index: 9999;
            ">
                <h3>⚠️ Erro ao carregar dados</h3>
                <p>Não foi possível carregar os dados do servidor.</p>
                <button onclick="location.reload()" style="
                    background: white;
                    color: #dc3545;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 15px;
                ">
                    Tentar novamente
                </button>
            </div>
        `;
        return;
    }
    
    try {
        // Popular filtros
        populateFilters();

        // Inicializar dados
        updateSummaryCards(filteredData);
        updateCharts();
        updateTable();

        // Adicionar event listeners
        document.getElementById('applyFilters').addEventListener('click', applyFilters);
        document.getElementById('resetFilters').addEventListener('click', resetFilters);
        document.getElementById('exportData').addEventListener('click', exportData);
        document.getElementById('chartType').addEventListener('change', updateCharts);

        // Configurar data máxima como hoje
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('filterDate');
        if (dateInput) {
            dateInput.max = today;
        }
        
        console.log('✅ Análise de produção iniciada com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao iniciar análise:', error);
    }
}



// Adicione CSS para os novos elementos
// Adicione CSS para os novos elementos
function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .badge-rc {
            background: rgba(40, 167, 69, 0.2);
            color: #28a745;
        }
        
        .badge-rt {
            background: rgba(0, 123, 255, 0.2);
            color: #007bff;
        }
        
        .badge-other {
            background: rgba(108, 117, 125, 0.2);
            color: #6c757d;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .metric-card {
            transition: transform 0.3s ease;
            cursor: default;
        }
        
        .metric-card:hover {
            transform: translateY(-5px);
        }
        
        /* Estilos para os novos filtros de data - AJUSTADOS */
        .date-filter-container {
            background: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .date-filter-header {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 15px;
        }
        
        @media (min-width: 768px) {
            .date-filter-header {
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                gap: 20px;
            }
        }
        
        .date-filter-header h4 {
            margin: 0;
            color: #ffffff;
            font-size: 14px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            opacity: 0.9;
        }
        
        .date-filter-select {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #ffffff;
            padding: 10px 12px;
            border-radius: 6px;
            width: 100%;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .date-filter-select:hover {
            border-color: rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.12);
        }
        
        .date-filter-select:focus {
            outline: none;
            border-color: #4dabf7;
            box-shadow: 0 0 0 2px rgba(77, 171, 247, 0.2);
        }
        
        @media (min-width: 768px) {
            .date-filter-select {
                width: 180px;
            }
        }
        
        .date-filter-fields {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        @media (min-width: 768px) {
            .date-filter-fields {
                flex-direction: row;
                align-items: flex-end;
                gap: 15px;
            }
        }
        
        .date-input-group {
            flex: 1;
            min-width: 0;
        }
        
        .date-input-group label {
            display: block;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 6px;
            font-size: 13px;
            font-weight: 400;
        }
        
        .date-input {
            width: 100%;
            padding: 10px 12px;
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            background: rgba(255, 255, 255, 0.08);
            color: #ffffff;
            font-size: 14px;
            transition: all 0.3s ease;
            box-sizing: border-box;
        }
        
        .date-input:hover {
            border-color: rgba(255, 255, 255, 0.25);
            background: rgba(255, 255, 255, 0.1);
        }
        
        .date-input:focus {
            outline: none;
            border-color: #4dabf7;
            box-shadow: 0 0 0 2px rgba(77, 171, 247, 0.2);
            background: rgba(255, 255, 255, 0.12);
        }
        
        .date-range-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
            width: 100%;
        }
        
        @media (min-width: 768px) {
            .date-range-group {
                flex-direction: row;
                align-items: flex-end;
                gap: 10px;
            }
        }
        
        .date-range-separator {
            color: rgba(255, 255, 255, 0.4);
            font-weight: 500;
            text-align: center;
            padding: 5px 0;
            display: none;
        }
        
        @media (min-width: 768px) {
            .date-range-separator {
                display: block;
                padding: 0 5px;
                align-self: center;
            }
        }
        
        /* Estilos para os inputs de data customizados */
        .date-input::-webkit-calendar-picker-indicator {
            filter: invert(1);
            opacity: 0.7;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: opacity 0.3s ease;
        }
        
        .date-input::-webkit-calendar-picker-indicator:hover {
            opacity: 1;
            background: rgba(255, 255, 255, 0.1);
        }
        
        /* Placeholder para inputs de data */
        .date-input::placeholder {
            color: rgba(255, 255, 255, 0.4);
        }
        
        /* Responsividade para telas pequenas */
        @media (max-width: 767px) {
            .date-filter-container {
                padding: 12px;
                margin-top: 12px;
            }
            
            .date-filter-select,
            .date-input {
                padding: 8px 10px;
                font-size: 13px;
            }
            
            .date-filter-fields {
                gap: 10px;
            }
            
            .date-input-group label {
                font-size: 12px;
                margin-bottom: 4px;
            }
        }
        
        /* Animações suaves para troca de filtros */
        .date-filter-fields {
            transition: all 0.3s ease;
        }
        
        /* Adicionar ícone de calendário para inputs de data */
        .date-input-group {
            position: relative;
        }
        
        .date-input-group::after {
            content: '📅';
            position: absolute;
            right: 12px;
            top: 32px;
            opacity: 0.5;
            pointer-events: none;
            font-size: 14px;
        }
        
        @media (max-width: 767px) {
            .date-input-group::after {
                top: 30px;
                right: 10px;
                font-size: 13px;
            }
        }
        
        .date-input-group:focus-within::after {
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);
}

// Função para buscar dados
async function buscar_dados() {
    try {
        console.log('📡 Buscando dados do servidor...');
        
        const response = await fetch('/getIOP', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ok: true })
        });
        
        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Dados recebidos:', data.length, 'registros');
        
        // Verificar estrutura dos dados
        if (data.length > 0) {
            console.log('📋 Exemplo do primeiro registro:', data[0]);
        }
        
        // Atribuir dados às variáveis globais
        dadosTable = data;
        filteredData = [...dadosTable];
        
        // Adicionar estilos
        addStyles();
        
        // Iniciar aplicação
        start();
        
        return data;
    } catch (error) {
        console.error('❌ Erro ao buscar dados:', error);
        alert('Erro ao carregar dados. Verifique o console para detalhes.');
        return [];
    }
}

// Iniciar busca de dados quando a página carregar
window.addEventListener('load', buscar_dados);