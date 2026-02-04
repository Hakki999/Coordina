function formatarMoeda(valor, opcoes = {}) {
    // Configurações padrão
    const padrao = {
        moeda: 'BRL',
        exibirSimbolo: true,
        casasDecimais: 2,
        separadorDecimal: ',',
        separadorMilhar: '.',
        ...opcoes
    };

    // Validação do valor de entrada
    if (valor === null || valor === undefined || valor === '') {
        return '';
    }

    // Converte para número
    let numero;
    if (typeof valor === 'string') {
        // Remove qualquer formatação existente
        const valorLimpo = valor
            .replace(/[^\d,-]/g, '') // Remove tudo exceto dígitos, vírgula e hífen
            .replace(',', '.'); // Converte vírgula para ponto para parseFloat
        
        numero = parseFloat(valorLimpo);
        
        // Verifica se é um número válido
        if (isNaN(numero)) {
            return '';
        }
    } else if (typeof valor === 'number') {
        numero = valor;
    } else {
        // Tenta converter outros tipos
        numero = parseFloat(valor);
        if (isNaN(numero)) {
            return '';
        }
    }

    // Arredonda para o número de casas decimais especificado
    const fator = Math.pow(10, padrao.casasDecimais);
    numero = Math.round(numero * fator) / fator;

    // Separa parte inteira e decimal
    const partes = numero.toFixed(padrao.casasDecimais).split('.');
    let parteInteira = partes[0];
    const parteDecimal = padrao.casasDecimais > 0 ? padrao.separadorDecimal + partes[1] : '';

    // Formata a parte inteira com separadores de milhar
    if (padrao.separadorMilhar) {
        const regex = /(\d)(?=(\d{3})+(?!\d))/g;
        parteInteira = parteInteira.replace(regex, `$1${padrao.separadorMilhar}`);
    }

    // Monta o valor formatado
    let valorFormatado = parteInteira + parteDecimal;

    // Adiciona o símbolo da moeda se solicitado
    if (padrao.exibirSimbolo) {
        const simbolos = {
            'BRL': 'R$ ',
            'USD': 'US$ ',
            'EUR': '€ ',
            'GBP': '£ ',
            'JPY': '¥ ',
            'default': ''
        };

        const simbolo = simbolos[padrao.moeda] || padrao.moeda + ' ';
        valorFormatado = simbolo + valorFormatado;
    }

    return valorFormatado;
}

// Função para desformatar moeda (converter de volta para número)
function desformatarMoeda(valorFormatado) {
    if (!valorFormatado || typeof valorFormatado !== 'string') {
        return null;
    }

    // Remove símbolos e caracteres não numéricos, exceto vírgula/ponto
    const valorLimpo = valorFormatado
        .replace(/[^\d,-.]/g, '') // Mantém apenas dígitos, vírgula, ponto e hífen
        .replace(/\./g, '') // Remove separadores de milhar
        .replace(',', '.'); // Converte vírgula decimal para ponto

    const numero = parseFloat(valorLimpo);
    
    return isNaN(numero) ? null : numero;
}
