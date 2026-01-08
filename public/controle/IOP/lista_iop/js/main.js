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

const tableBody = document.querySelector("#tableBody");

function buscar_dados() {
    fetch('/getIOP', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ok: true})
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

function render_dados() {
    data = dadosTable
    // Update the table with the fetched data
    tableBody.innerHTML = ""; // Clear existing rows
    data.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <th style="display: flex; gap: 15px; align-items: center; justify-content: center; padding: 8px;"><button class="editButton" data-id="${item.id}">Edit</button><button class="padd" data-id="${item.id}" onclick="openParcelaModal(${item.id})">Parcela adicional</button></th>
              <td>${item.res_nota}</td>
              <td>${item.res_status}</td>
              <td>${cidades.find(cidade => cidade.value === item.res_cidade).label}</td>
              <td>${item.res_nome_obra}</td>
              <td>${item.res_data_exe}</td>
              <td>${item.res_resp}</td>
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
}

buscar_dados()

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