const optionNav = document.querySelectorAll(".optionNav");
const parcelaContainer = document.querySelector(".parcela-container");
var dadosTable = [];

const cidades = [
    { label: "Abadia de Goiás", value: "ABA" },
    { label: "Abadiânia", value: "ABD" },
    { label: "Acreúna", value: "ACR" },
    { label: "Adelândia", value: "ADE" },
    { label: "Água Limpa", value: "AGA" },
    { label: "Águas Lindas de Goiás", value: "AGS" },
    { label: "Água Fria de Goiás", value: "AGU" },
    { label: "Alexânia", value: "ALE" },
    { label: "Aloândia", value: "ALO" },
    { label: "Alto Paraíso de Goiás", value: "ALP" },
    { label: "Alto Horizonte", value: "ALT" },
    { label: "Alvorada do Norte", value: "ALV" },
    { label: "Amaralina", value: "AMA" },
    { label: "Americano do Brasil", value: "AME" },
    { label: "Amorinópolis", value: "AMO" },
    { label: "Anápolis", value: "ANA" },
    { label: "Anhanguera", value: "ANH" },
    { label: "Anicuns", value: "ANI" },
    { label: "Aparecida de Goiânia", value: "APA" },
    { label: "Aporé", value: "APO" },
    { label: "Aparecida do Rio Doce", value: "APR" },
    { label: "Araçu", value: "ARA" },
    { label: "Arenópolis", value: "ARE" },
    { label: "Aragarças", value: "ARG" },
    { label: "Aruanã", value: "ARN" },
    { label: "Aragoiânia", value: "ARO" },
    { label: "Araguapaz", value: "ARU" },
    { label: "Aurilândia", value: "AUR" },
    { label: "Avelinópolis", value: "AVE" },
    { label: "Baliza", value: "BAL" },
    { label: "Barro Alto", value: "BAR" },
    { label: "Bela Vista de Goiás", value: "BEL" },
    { label: "Bom Jesus de Goiás", value: "BOJ" },
    { label: "Bom Jardim de Goiás", value: "BOM" },
    { label: "Bonfinópolis", value: "BON" },
    { label: "Bonópolis", value: "BOO" },
    { label: "Brazabrantes", value: "BRA" },
    { label: "Britânia", value: "BRI" },
    { label: "Buriti de Goiás", value: "BUI" },
    { label: "Buriti Alegre", value: "BUR" },
    { label: "Buritinópolis", value: "BUT" },
    { label: "Campo Alegre de Goiás", value: "CAA" },
    { label: "Cabeceiras", value: "CAB" },
    { label: "Cachoeira Alta", value: "CAC" },
    { label: "Caldazinha", value: "CAD" },
    { label: "Campo Limpo de Goiás", value: "CAE" },
    { label: "Cacheira de Goiás", value: "CAH" },
    { label: "Caiapônia", value: "CAI" },
    { label: "Caldas Novas", value: "CAL" },
    { label: "Campestre de Goiás", value: "CAM" },
    { label: "Campinorte", value: "CAN" },
    { label: "Cachoeira Dourada", value: "CAO" },
    { label: "Campinaçu", value: "CAP" },
    { label: "Carmo do Rio Verde", value: "CAR" },
    { label: "Campos Belos", value: "CAS" },
    { label: "Castelândia", value: "CAT" },
    { label: "Caçu", value: "CAU" },
    { label: "Campos Verdes", value: "CAV" },
    { label: "Ceres", value: "CER" },
    { label: "Cezarina", value: "CEZ" },
    { label: "Chapadão do Céu", value: "CHA" },
    { label: "label Ocidental", value: "CID" },
    { label: "Cocalzinho de Goiás", value: "COC" },
    { label: "Colinas do Sul", value: "COL" },
    { label: "Corumbaíba", value: "COM" },
    { label: "Córrego do Ouro", value: "COR" },
    { label: "Corumbá de Goiás", value: "COU" },
    { label: "Cristalina", value: "CRI" },
    { label: "Cromínia", value: "CRO" },
    { label: "Cristianópolis", value: "CRS" },
    { label: "Crixás", value: "CRX" },
    { label: "Catalão", value: "CTA" },
    { label: "Caturaí", value: "CTU" },
    { label: "Cumari", value: "CUM" },
    { label: "Cavalcante", value: "CVA" },
    { label: "Damianópolis", value: "DAM" },
    { label: "Damolândia", value: "DAO" },
    { label: "Davinópolis", value: "DAV" },
    { label: "Diorama", value: "DIO" },
    { label: "Divinópolis de Goiás", value: "DIV" },
    { label: "Doverlândia", value: "DOV" },
    { label: "Edealina", value: "EDE" },
    { label: "Edéia", value: "EDI" },
    { label: "Estrela do Norte", value: "EST" },
    { label: "Faina", value: "FAI" },
    { label: "Fazenda Nova", value: "FAZ" },
    { label: "Firminópolis", value: "FIR" },
    { label: "Flores de Goiás", value: "FLO" },
    { label: "Formoso", value: "FOM" },
    { label: "Formosa", value: "FOR" },
    { label: "Gameleira de Goiás", value: "GAM" },
    { label: "Goiânia", value: "GIA" },
    { label: "Goiandira", value: "GOA" },
    { label: "Goianápolis", value: "GOI" },
    { label: "Goianésia", value: "GON" },
    { label: "Goianira", value: "GOR" },
    { label: "Goiás", value: "GOS" },
    { label: "Goiatuba", value: "GOT" },
    { label: "Gouvelândia", value: "GOU" },
    { label: "Guapó", value: "GUA" },
    { label: "Guarinos", value: "GUI" },
    { label: "Guarani de Goiás", value: "GUN" },
    { label: "Guaraíta", value: "GUR" },
    { label: "Heitoraí", value: "HEI" },
    { label: "Hidrolândia", value: "HID" },
    { label: "Hidrolina", value: "HIR" },
    { label: "Iaciara", value: "IAC" },
    { label: "Inaciolândia", value: "INA" },
    { label: "Indiara", value: "IND" },
    { label: "Inhumas", value: "INH" },
    { label: "Ipameri", value: "IPA" },
    { label: "Ipiranga de Goiás", value: "IPI" },
    { label: "Iporá", value: "IPO" },
    { label: "Israelândia", value: "ISR" },
    { label: "Itaberaí", value: "ITA" },
    { label: "Itumbiara", value: "ITB" },
    { label: "Itauçu", value: "ITC" },
    { label: "Itaguari", value: "ITG" },
    { label: "Itapirapuã", value: "ITI" },
    { label: "Itajá", value: "ITJ" },
    { label: "Itarumã", value: "ITM" },
    { label: "Itapaci", value: "ITP" },
    { label: "Itapuranga", value: "ITR" },
    { label: "Itaguaru", value: "ITU" },
    { label: "Ivolândia", value: "IVO" },
    { label: "Jandaia", value: "JAN" },
    { label: "Jaraguá", value: "JAR" },
    { label: "Jataí", value: "JAT" },
    { label: "Jaupaci", value: "JAU" },
    { label: "Jesúpolis", value: "JES" },
    { label: "Joviânia", value: "JOV" },
    { label: "Jussara", value: "JUS" },
    { label: "Lagoa Santa", value: "LAG" },
    { label: "Leopoldo de Bulhões", value: "LEO" },
    { label: "Luziânia", value: "LUZ" },
    { label: "Mairipotaba", value: "MAI" },
    { label: "Mambaí", value: "MAM" },
    { label: "Mara Rosa", value: "MAR" },
    { label: "Matrinchã", value: "MAT" },
    { label: "Maurilândia", value: "MAU" },
    { label: "Marzagão", value: "MAZ" },
    { label: "Mineiros", value: "MIE" },
    { label: "Mimoso de Goiás", value: "MIM" },
    { label: "Minaçu", value: "MIN" },
    { label: "Montividiu do Norte", value: "MOD" },
    { label: "Moiporá", value: "MOI" },
    { label: "Monte Alegre de Goiás", value: "MON" },
    { label: "Morro Agudo de Goiás", value: "MOO" },
    { label: "Morrinhos", value: "MOR" },
    { label: "Mossâmedes", value: "MOS" },
    { label: "Montes Claros de Goiás", value: "MOT" },
    { label: "Montividiu", value: "MOV" },
    { label: "Mozarlândia", value: "MOZ" },
    { label: "Mundo Novo", value: "MUN" },
    { label: "Mutunópolis", value: "MUT" },
    { label: "Nazário", value: "NAZ" },
    { label: "Nerópolis", value: "NER" },
    { label: "Niquelândia", value: "NIQ" },
    { label: "Nova Aurora", value: "NOA" },
    { label: "Nova Crixás", value: "NOC" },
    { label: "Nova Veneza", value: "NOE" },
    { label: "Nova Glória", value: "NOG" },
    { label: "Nova Iguaçu de Goiás", value: "NOI" },
    { label: "Novo Gama", value: "NOM" },
    { label: "Novo Brasil", value: "NOO" },
    { label: "Novo Planalto", value: "NOP" },
    { label: "Nova Roma", value: "NOR" },
    { label: "Nova América", value: "NOV" },
    { label: "Orizona", value: "ORI" },
    { label: "Ouro Verde de Goiás", value: "OUR" },
    { label: "Ouvidor", value: "OUV" },
    { label: "Paraúna", value: "PAA" },
    { label: "Padre Bernardo", value: "PAD" },
    { label: "Palmelo", value: "PAE" },
    { label: "Palminópolis", value: "PAI" },
    { label: "Palestina de Goiás", value: "PAL" },
    { label: "Palmeiras de Goiás", value: "PAM" },
    { label: "Panamá", value: "PAN" },
    { label: "Paranaiguara", value: "PAR" },
    { label: "Perolândia", value: "PER" },
    { label: "Petrolina de Goiás", value: "PET" },
    { label: "Piranhas", value: "PIA" },
    { label: "Pirenópolis", value: "PIE" },
    { label: "Pilar de Goiás", value: "PIL" },
    { label: "Piracanjuba", value: "PIR" },
    { label: "Pires do Rio", value: "PIS" },
    { label: "Planaltina", value: "PLA" },
    { label: "Portelândia", value: "POE" },
    { label: "Pontalina", value: "PON" },
    { label: "Porangatu", value: "POR" },
    { label: "Posse", value: "POS" },
    { label: "Porteirão", value: "POT" },
    { label: "Professor Jamil", value: "PRO" },
    { label: "Quirinópolis", value: "QUI" },
    { label: "Rialma", value: "RIA" },
    { label: "Rianápolis", value: "RIN" },
    { label: "Rio Quente", value: "RIO" },
    { label: "Rio Verde", value: "RIV" },
    { label: "Rubiataba", value: "RUB" },
    { label: "São João D'Aliança", value: "SA'" },
    { label: "Santa Cruz de Goiás", value: "SAA" },
    { label: "Santo Antônio Da Barra", value: "SAB" },
    { label: "São Francisco de Goiás", value: "SAC" },
    { label: "Santa Rita do Novo Destino", value: "SAD" },
    { label: "Santa Tereza de Goiás", value: "SAE" },
    { label: "Santa Fé de Goiás", value: "SAF" },
    { label: "Santo Antônio de Goiás", value: "SAG" },
    { label: "Santa Helena de Goiás", value: "SAH" },
    { label: "Santa Isabel", value: "SAI" },
    { label: "São João Da Paraúna", value: "SAJ" },
    { label: "São Luís de Montes Belos", value: "SAL" },
    { label: "São Domingos", value: "SAM" },
    { label: "Sanclerlândia", value: "SAN" },
    { label: "Santa Rosa de Goiás", value: "SAO" },
    { label: "São Miguel do Passa Quatro", value: "SAP" },
    { label: "Santa Rita do Araguaia", value: "SAR" },
    { label: "Santo Antônio do Descoberto", value: "SAS" },
    { label: "Santa Bárbara de Goiás", value: "SAT" },
    { label: "São Luiz do Norte", value: "SAU" },
    { label: "Santa Terezinha de Goiás", value: "SAZ" },
    { label: "Senador Canedo", value: "SEN" },
    { label: "Serranópolis", value: "SER" },
    { label: "Silvânia", value: "SIL" },
    { label: "Simolândia", value: "SIM" },
    { label: "Sítio D'Abadia", value: "SIT" },
    { label: "São Miguel do Araguaia", value: "SOM" },
    { label: "São Patrício", value: "SOP" },
    { label: "São Simão", value: "SOS" },
    { label: "Taquaral de Goiás", value: "TAQ" },
    { label: "Terezópolis de Goiás", value: "TEE" },
    { label: "Teresina de Goiás", value: "TER" },
    { label: "Três Ranchos", value: "TRE" },
    { label: "Trindade", value: "TRI" },
    { label: "Trombas", value: "TRO" },
    { label: "Turvânia", value: "TUR" },
    { label: "Turvelândia", value: "TUV" },
    { label: "Uirapuru", value: "UIR" },
    { label: "Uruana", value: "URA" },
    { label: "Urutaí", value: "URT" },
    { label: "Uruaçu", value: "URU" },
    { label: "Valparaíso de Goiás", value: "VAL" },
    { label: "Varjão", value: "VAR" },
    { label: "Vianópolis", value: "VIA" },
    { label: "Vicentinópolis", value: "VIC" },
    { label: "Vila Boa", value: "VIL" },
    { label: "Vila Propício", value: "VIP" }
]

function formatarDataBR(dataISO) {
  const data = new Date(dataISO);

  if (isNaN(data)) return "Data inválida";

  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();

  // Verifica se tem hora na string original
  const temHora = dataISO.includes('T');

  if (temHora) {
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
  }

  return `${dia}/${mes}/${ano}`;
}



optionNav.forEach(option => {
    option.addEventListener("click", evt => {

        optionNav.forEach(opt => {
            opt.classList = "optionNav closeOption";
        });

        evt.currentTarget.classList = "optionNav openOption";
    })
})

const tableBody = document.querySelector("#tableBody");

function copyInfos(id){
    const item = dadosTable.find(item => item.id == id);
   if (item) {
       let info = `
<====> PROJETO IOP <====>
Cidade: ${item.res_cidade}
Data de Criação: ${item.res_data_cri}
Data de Execução: ${formatarDataBR(item.res_data_exe)}
Nome da Obra: ${item.res_nome_obra}
Nota: ${item.res_nota}
OC: ${item.res_oc}
Opex: ${item.res_opex}
Responsável: ${item.res_resp}
       `;

       if (item.parcelas_adicionais) {
           pa = JSON.parse(item.parcelas_adicionais.replace(/'/g, '"'))[0];
           console.warn(pa);
           
           info += `
<====> PARCELA ADD <====>
Acionamento: ${formatarDataBR(pa.res_acionamento)}
Finalização: ${formatarDataBR(pa.res_finalizacao)}
Qtd. Hora: ${pa.res_qtd_horas}hrs
Qtd. voz: ${pa.res_qtd_voz}hrs
Tipo: ${pa.res_tipo_parcela}
`


       }
       navigator.clipboard.writeText(info).then(() => {
           console.log('Informações copiadas para a área de transferência:');
           console.log(info);
           criarMensagem(true, 'Informações copiadas para a área de transferência');
       }).catch(err => {
           console.error('Erro ao copiar informações:', err);
           criarMensagem(false, 'Erro ao copiar informações');
       });
   } else {
       console.warn('Item não encontrado:', id);
       criarMensagem(false, 'Item não encontrado');
   }
}

function initializeCopyButtons() {
    document.querySelectorAll(".copyinfo").forEach(button => {
        button.addEventListener("click", () => {
            const id = button.getAttribute("data-id");
            copyInfos(id);
        });
    });
}

function atualizarDadosTabela(dados) {
    fetch('/atualizar_obras', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            criarMensagem(true, data.message || 'Atualizado com sucesso');
            
        } else {
            criarMensagem(false, data.message || 'Erro ao atualizar');
        }
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
    });
}

function buscar_dados() {
    fetch('/getIOP', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ok: true })
    }).then(response => response.json())
        .then(data => {
            // Process the response data
            console.log(data);

            dadosTable = data;
            render_dados();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
buscar_dados()

// MODIFIQUE a função render_dados para atualizar os botões com informações das parcelas
function render_dados() {
    data = dadosTable;
    // Update the table with the fetched data
    tableBody.innerHTML = ""; // Clear existing rows
    data.forEach(item => {
        const row = document.createElement("tr");
        row.setAttribute('data-id', item.id);
        
        // Processar parcelas_adicionais para mostrar no botão
        let totalParcelas = 0;
        let totalValor = 0;
        let tooltipText = 'Adicionar parcelas';
        
        if (item.parcelas_adicionais) {
            try {
                // Processar a string JSON
                let parcelasStr = item.parcelas_adicionais;
                if (parcelasStr.startsWith('"') && parcelasStr.endsWith('"')) {
                    parcelasStr = parcelasStr.slice(1, -1);
                }
                parcelasStr = parcelasStr.replace(/'/g, '"');
                
                const parcelas = JSON.parse(parcelasStr);
                if (Array.isArray(parcelas)) {
                    totalParcelas = parcelas.length;
                    totalValor = parcelas.reduce((sum, p) => sum + (p.res_calculo || 0), 0);
                    tooltipText = `${totalParcelas} parcela(s) - Total: ${formatarMoeda(totalValor)}`;
                } else if (parcelas && typeof parcelas === 'object') {
                    totalParcelas = 1;
                    totalValor = parcelas.res_calculo || 0;
                    tooltipText = `1 parcela - Total: ${formatarMoeda(totalValor)}`;
                }
            } catch (error) {
                console.error('Erro ao processar parcelas para display:', error);
            }
        }
        
        row.innerHTML = `
          <th style="display: flex; gap: 15px; align-items: center; justify-content: center; padding: 8px;">
            <button class="editButton" data-id="${item.id}" title="Editar">Edit</button>
            <button class="padd" data-id="${item.id}" onclick="openParcelaModal(${item.id})" 
                    title="${tooltipText}">
              ${totalParcelas > 0 ? `Parcelas (${totalParcelas})` : 'Parcela adicional'}
            </button>
            <button class="copyinfo" data-id="${item.id}" title="Copiar informações">Copy Info</button>
          </th>
          <td>${item.res_nota || ''}</td>
          <td>${item.res_status || ''}</td>
          <td>
            <select class="baixa-select" data-id="${item.id || ''}" ${JSON.parse(localStorage.getItem('acesso') || '{}').edit_baixa ? '' : 'disabled'}>
                <option value="" ${!item.res_baixa ? 'selected' : ''} disabled>Selecione</option>
                <option value="Sem" ${item.res_baixa === 'Sem' ? 'selected' : ''}>Sem</option>
                <option value="Parcial" ${item.res_baixa === 'Parcial' ? 'selected' : ''}>Parcial</option>
                <option value="Total" ${item.res_baixa === 'Total' ? 'selected' : ''}>Total</option>
            </select>
          </td>
          <td>${cidades.find(cidade => cidade.value === item.res_cidade)?.label || item.res_cidade || ''}</td>
          <td>${item.res_nome_obra || ''}</td>
          <td>${item.res_data_exe || ''}</td>
          <td>${item.res_resp || ''}</td>
        `;
        tableBody.appendChild(row);
    });

    document.querySelectorAll(".editButton").forEach(button => {
        button.addEventListener("click", () => {
            const id = button.getAttribute("data-id");
            const item = dadosTable.find(item => item.id == id);
            console.warn(item);

            abrirEdicao(item);
        });
    });

    initializeCopyButtons();
    calculateMoney()
}

function exportTableToCSV() {
    console.log(dadosTable);

    let tempExport = [];


    dadosTable.forEach((item, index) => {
        console.clear()
        console.log(item);

        tempExport.push([
            item.id || "",
            cidades.find(cidade => cidade.value === item.res_cidade)?.label || item.res_cidade || "",
            item.res_data_cri.replace(',', '') || "",
            item.res_data_exe || "",
            item.res_nome_obra || "",
            item.res_nota || "",
            item.res_oc || "",
            item.res_pep || "",
            item.res_pg || "",
            item.res_resp || "",
            item.res_status || "",
            item.res_tipo || "",
            item.res_orcamento?.toString().replace(".", ",") || ""
        ])

        console.log(tempExport);

    })

    exportCSV({
        head: [
            'ID',
            'Cidade',
            'Data de Criação',
            'Data de Execução',
            'Nome da Obra',
            'Nota',
            'OC',
            'PEP',
            'PG',
            'Responsável',
            'Status',
            'Tipo',
            'Valor'
        ],
        body: tempExport
    }, 'Material x Programado');

}

function openParcelaModal(parcelaId) {
    parcelaContainer.style.display = "flex";
    parcelaContainer.setAttribute('data-parcela-id', parcelaId);

    console.warn(dadosTable.find(item => item.id == parcelaId));
}

function formatarDataPtBR(dataISO) {
    if (!dataISO || typeof dataISO !== 'string') return '';
    
    // Remove espaços extras
    const dataString = dataISO.trim();
    
    // Verifica se está no formato esperado
    if (!dataString.includes('T')) {
        console.warn('Formato não suportado (sem "T"):', dataISO);
        return dataISO;
    }
    
    try {
        // Divide a string em data e hora
        const partes = dataString.split('T');
        const dataParte = partes[0]; // "2026-01-27"
        const horaParte = partes[1]; // "17:01"
        
        if (!dataParte || !horaParte) {
            return dataISO;
        }
        
        // Extrai ano, mês e dia
        const [ano, mes, dia] = dataParte.split('-').map(num => parseInt(num, 10));
        
        // Extrai hora e minuto (pode ter timezone depois, ex: "17:01:00" ou "17:01-03:00")
        const horaMinutoParte = horaParte.split(/[:\-\+Z]/)[0]; // Pega apenas "17:01"
        const [hora, minuto] = horaMinutoParte.split(':').map(num => parseInt(num, 10));
        
        // Valida os valores
        if (
            isNaN(ano) || isNaN(mes) || isNaN(dia) ||
            isNaN(hora) || isNaN(minuto) ||
            mes < 1 || mes > 12 ||
            dia < 1 || dia > 31 ||
            hora < 0 || hora > 23 ||
            minuto < 0 || minuto > 59
        ) {
            console.warn('Valores de data inválidos:', dataISO);
            return dataISO;
        }
        
        // Formata no padrão pt-BR
        const diaFormatado = String(dia).padStart(2, '0');
        const mesFormatado = String(mes).padStart(2, '0');
        const horaFormatada = String(hora).padStart(2, '0');
        const minutoFormatado = String(minuto).padStart(2, '0');
        
        return `${diaFormatado}/${mesFormatado}/${ano} ${horaFormatada}:${minutoFormatado}`;
        
    } catch (error) {
        console.error('Erro ao formatar data:', dataISO, error);
        return dataISO;
    }
}

function calculateMoney(){
    let total = 0;

    dadosTable.forEach(item => {
        total += parseFloat(item.res_orcamento) || 0;
    });
    document.getElementById("orcamento_m").innerText = formatarMoeda(total);
    return total;
}

function atualizarDadosTabela(dados) {
    dados.table = 'table_iop';
    fetch('/atualizarStatus', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            criarMensagem(true, data.message || 'Atualizado com sucesso');
            
        } else {
            criarMensagem(false, data.message || 'Erro ao atualizar');
        }
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
    });
}


tableBody.addEventListener("change", evt => {
    // Obtém o elemento que foi alterado
    const changedElement = evt.target;
    
    // Verifica se é um dos selects que queremos monitorar
    if (
        !changedElement.classList.contains('baixa-select')
    ) {
        return; // Sai se não for um dos nossos selects
    }
    
    // Obtém o ID da linha/registro
    const id = changedElement.getAttribute("data-id");
    
    if (!id) {
        console.warn('Elemento sem data-id:', changedElement);
        return;
    }
    
    // Encontra o item correspondente
    let item = dadosTable.find(item => item.id == id);
    
    if (item) {
        console.log('Item encontrado:', item);

        const linha = changedElement.closest('tr');
        if (linha) {
            const baixaSelect = linha.querySelector('.baixa-select');

            if (baixaSelect) item.res_baixa = baixaSelect.value;

            console.warn('Item com baixa atualizado:', baixaSelect);
        }
        console.warn('Item atualizado:', item);

        // Atualiza a tabela
        atualizarDadosTabela(item);
    } else {
        console.warn('Item não encontrado para ID:', id);
    }
});