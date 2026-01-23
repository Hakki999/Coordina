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

optionNav.forEach(option => {
    option.addEventListener("click", evt => {

        optionNav.forEach(opt => {
            opt.classList = "optionNav closeOption";
        });

        evt.currentTarget.classList = "optionNav openOption";
    })
})

function formatarDataBR(dataISO) {
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
}

function calcularDiferencaDatas(dataInicio, dataFim) {
    const inicio = new Date(dataInicio + "T12:40:58.883Z");
    const fim = new Date(dataFim);

    const diff = fim - inicio;

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { dias, horas, minutos };
}



//input 2025-10-07
function calculateTempoResposta(dataISO, lastUpdatedISO, attUpdatedStatus) {
    const now = new Date();
    const dataInicial = new Date(dataISO + "T00:00:00"); // garante horário 00:00
    const diff = now - dataInicial;

    let dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    let horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));



    if ((attUpdatedStatus == "Concluido V2" || attUpdatedStatus == "Concluido V1") && !lastUpdatedISO) {
        dias = 0;
        horas = 0;
        minutos = 0;
        return { dias, horas, minutos };
    }
    
    if ((attUpdatedStatus == "Concluido V2" || attUpdatedStatus == "Concluido V1") && lastUpdatedISO) {
        console.warn("-----");
        console.log(calcularDiferencaDatas(dataISO, lastUpdatedISO.time));
        
        return calcularDiferencaDatas(dataISO, lastUpdatedISO.time);
    }

    return { dias, horas, minutos };
}


const tableBody = document.querySelector("#tableBody");

function ordenarDados(dados) {
    const prioridades = new Map([
        ['Pendente', 0],
        ['Aguardando Evidências', 1],
        ['Ir em campo', 2],
        ['Problema Sistemico', 3],
        ['Concluido V1', 4],
        ['Concluido V2', 5]
    ]);

    // Filtrar e ordenar em uma única operação
    return dados
        .filter(item => {
            const status = item.res_status_asbuilt;
            return status && prioridades.has(status);
        })
        .sort((a, b) => {
            return prioridades.get(a.res_status_asbuilt) - prioridades.get(b.res_status_asbuilt);
        });
}
function buscar_dados() {
    fetch('/getObras', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ok: true })
    }).then(response => response.json())
        .then(data => {
            // Process the response data
            console.log(data);
            console.warn();
            
            dadosTable = ordenarDados(data);
            render_dados();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
buscar_dados()

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
          <td>${item.res_nota || ''}</td>
                    <td>
    <select class="status-select" data-id="${item.id || ''}" ${item.readonly ? 'disabled' : ''}>
        <option value="" ${!item.res_status_asbuilt ? 'selected' : ''} disabled>Selecione</option>
        <option value="Pendente" ${item.res_status_asbuilt === 'Pendente' ? 'selected' : ''}>Pendente</option>
        <option value="Concluido V1" ${item.res_status_asbuilt === 'Concluido V1' ? 'selected' : ''}>Concluido V1</option>
        <option value="Concluido V2" ${item.res_status_asbuilt === 'Concluido V2' ? 'selected' : ''}>Concluido V2</option>
        <option value="Problema Sistemico" ${item.res_status_asbuilt === 'Problema Sistemico' ? 'selected' : ''}>Problema Sistemico</option>
        <option value="Aguardando Evidências" ${item.res_status_asbuilt === 'Aguardando Evidências' ? 'selected' : ''}>Aguardando Evidências</option>
        <option value="Ir em campo" ${item.res_status_asbuilt === 'Ir em campo' ? 'selected' : ''}>Ir em campo</option>
    </select>

          <td>${cidades.find(cidade => cidade.value === item.res_cidade)?.label || item.res_cidade || ''}</td>

          <td>${formatarDataBR(item.res_data_exe) || ''}</td>

          <td>${calculateTempoResposta(item.res_data_exe, item.res_last_updated, item.res_status_asbuilt).dias || ''}<span style="opacity: 0.5; font-size: 0.8em"> dias</span></td>
          <td>
    <select class="opex-select" data-id="${item.id || ''}" ${item.readonly ? 'disabled' : ''}>
        <option value="" ${!item.res_opex ? 'selected' : ''} disabled>Selecione</option>
        <option value="Sim" ${item.res_opex === 'Sim' ? 'selected' : ''}>Sim</option>
        <option value="Não" ${item.res_opex === 'Não' ? 'selected' : ''}>Não</option>
    </select>
</td>
          <td>
    <select class="resp-select" data-id="${item.id || ''}" ${item.readonly ? 'disabled' : ''}>
        <option value="" ${!item.res_resp_asbuilt ? 'selected' : ''} disabled>Selecione</option>
        <option value="Lucas Ramos" ${item.res_resp_asbuilt === 'Lucas Ramos' ? 'selected' : ''}>Lucas Ramos</option>
        <option value="Lucas Botelho" ${item.res_resp_asbuilt === 'Lucas Botelho' ? 'selected' : ''}>Lucas Botelho</option>
        <option value="José Miguel" ${item.res_resp_asbuilt === 'José Miguel' ? 'selected' : ''}>José Miguel</option>
        <option value="Luiz" ${item.res_resp_asbuilt === 'Luiz' ? 'selected' : ''}>Luiz</option>
        <option value="Rafael" ${item.res_resp_asbuilt === 'Rafael' ? 'selected' : ''}>Rafael</option>
        <option value="Leonardo" ${item.res_resp_asbuilt === 'Leonardo' ? 'selected' : ''}>Leonardo</option>
    </select>
</td>
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

    
    const selects = document.querySelectorAll('#tableBody select');
    
    selects.forEach(select => {
        // Adiciona classe baseada no valor atual
        updateSelectClass(select);
        
        // Adiciona evento de change
        select.addEventListener('change', function() {
            updateSelectClass(this);
            
            // Animação de atualização
            this.classList.add('updated');
            setTimeout(() => {
                this.classList.remove('updated');
            }, 500);
        });
        
        // Adiciona tooltip se o texto for muito longo
        if (select.options[select.selectedIndex]) {
            const selectedText = select.options[select.selectedIndex].text;
            if (selectedText.length > 15) {
                select.setAttribute('title', selectedText);
            }
        }
    });
}

function exportTableToCSV() {
    console.log(dadosTable);

    let tempExport = [];


    dadosTable.forEach((item, index) => {
        console.clear()
        console.log(item);

        tempExport.push([
            item.id || "",
            item.res_cidade || "",
            item.res_data_cri || "",
            item.res_data_exe || "",
            item.res_nome_obra || "",
            item.res_nota || "",
            item.res_oc || "",
            item.res_pep || "",
            item.res_pg || "",
            item.res_resp || "",
            item.res_status || "",
            item.res_tipo || ""
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
            'Tipo'
        ],
        body: tempExport
    }, 'Material x Programado');

}

function openParcelaModal(parcelaId) {
    parcelaContainer.style.display = "flex";
    parcelaContainer.setAttribute('data-parcela-id', parcelaId);

    console.warn(dadosTable.find(item => item.id == parcelaId));
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

tableBody.addEventListener("change", evt => {
    // Obtém o elemento que foi alterado
    const changedElement = evt.target;
    
    // Verifica se é um dos selects que queremos monitorar
    if (!changedElement.classList.contains('opex-select') && 
        !changedElement.classList.contains('resp-select') &&
        !changedElement.classList.contains('status-select')
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
            const opexSelect = linha.querySelector('.opex-select');
            const respSelect = linha.querySelector('.resp-select');
            const statusSelect = linha.querySelector('.status-select');
            
            if (opexSelect) item.res_opex = opexSelect.value;
            if (respSelect) item.res_resp_asbuilt = respSelect.value;
            if (statusSelect) item.res_status_asbuilt = statusSelect.value;
        }
        console.warn('Item atualizado:', item);

        item.res_last_updated = {
            time: new Date().toISOString(),
            user: localStorage.getItem('nome'),
            status: item.res_status_asbuilt
        }

        // Atualiza a tabela
        atualizarDadosTabela(item);
    } else {
        console.warn('Item não encontrado para ID:', id);
    }
});

function updateSelectClass(select) {
    // Remove todas as classes de estado
    select.classList.remove('sim-selected', 'nao-selected', 'pendente-selected');
    
    const value = select.value.toLowerCase();
    const classes = select.className;
    
    // Adiciona classe baseada no tipo e valor
    if (select.classList.contains('opex-select')) {
        if (value.includes('sim')) select.classList.add('sim-selected');
        else if (value.includes('não') || value.includes('nao')) select.classList.add('nao-selected');
        else if (value.includes('pendente')) select.classList.add('pendente-selected');
    }
}