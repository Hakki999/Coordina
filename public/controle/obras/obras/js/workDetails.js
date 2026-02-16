// Variável global para armazenar os dados importados do Excel
let dadosTableInportExcel = [];
const ups = [
    { up: "EQT001", desc: "INST CAIXA MEDICAO C/ SIST CP PAREDE LM", vlr: 181.79 },
    { up: "EQT002", desc: "INST ATERRAMENTO COMPL 1HASTE LM", vlr: 854.39 },
    { up: "EQT003", desc: "INST ATERRAMENTO COMPL 3HASTES LM", vlr: 464.19 },
    { up: "EQT004", desc: "RET CAIXA MEDICAO C/ SIST CP PAREDE LM", vlr: 127.25 },
    { up: "EQT005", desc: "INST ATERRAMENTO COMPL 5-8HASTES LM", vlr: 706.84 },
    { up: "EQT006", desc: "INST 1HASTE ADICIONAL ATERRAMENTO LM", vlr: 79.33 },
    { up: "EQT007", desc: "INST FIO TERRA LM", vlr: 66.78 },
    { up: "EQT008", desc: "INST SECCION E ATERRAM CERCA LM", vlr: 177.07 },
    { up: "EQT009", desc: "RET SECCION E ATERRAM CERCA LM", vlr: 169.97 },
    { up: "EQT010", desc: "TRATAMENTO QUIMICO DE SOLO P/ ATERRAM LM", vlr: 187.47 },
    { up: "EQT011", desc: "MEDIR RESISTENCIA ATERRAMENTO LM", vlr: 182.06 },
    { up: "EQT012", desc: "INST CHAVE FUSIVEL RELIG LM", vlr: 1003.63 },
    { up: "EQT013", desc: "RET CHAVE FUSIVEL RELIG LM", vlr: 612.21 },
    { up: "EQT014", desc: "INST ESTR CP CHAVE FUSIVEL RELIG 1/2F LM", vlr: 1810.43 },
    { up: "EQT015", desc: "RET ESTR CP CHAVE FUSIVEL RELIG 1/2F LM", vlr: 1073.46 },
    { up: "EQT016", desc: "INST ESTR CP CHAVE FUSIVEL RELIG 3F LM", vlr: 2715.48 },
    { up: "EQT017", desc: "RET ESTR CP CHAVE FUSIVEL RELIG 3F LM", vlr: 1866.91 },
    { up: "EQT018", desc: "INST CHAVE FUSIVEL 15/25KV LM", vlr: 577.63 },
    { up: "EQT019", desc: "RET CHAVE FUSIVEL 15/25KV LM", vlr: 432.15 },
    { up: "EQT020", desc: "INST CHAVE FUSIVEL 34,5KV LM", vlr: 577.63 },
    { up: "EQT021", desc: "RET CHAVE FUSIVEL 34,6KV LM", vlr: 432.15 },
    { up: "EQT022", desc: "INST CHAVE FACA LM", vlr: 577.63 },
    { up: "EQT023", desc: "RET CHAVE FACA LM", vlr: 432.15 },
    { up: "EQT024", desc: "INST CHAVE SECCIONADORA A SECO 3F LM", vlr: 213.91 },
    { up: "EQT025", desc: "RET CHAVE SECCIONADORA A SECO 3F LM", vlr: 154.95 },
    { up: "EQT026", desc: "INST CHAVE BY-PASS LM", vlr: 913.43 },
    { up: "EQT027", desc: "RET CHAVE BY-PASS LM", vlr: 661.68 },
    { up: "EQT028", desc: "INST CHAVE A OLEO LM", vlr: 148.77 },
    { up: "EQT029", desc: "RET CHAVE A OLEO LM", vlr: 111.26 },
    { up: "EQT030", desc: "INST ELO FUSIVEL LM", vlr: 67.37 },
    { up: "EQT031", desc: "RET ELO FUSIVEL LM", vlr: 56.63 },
    { up: "EQT032", desc: "OPERAR CHAVE/GRAMPO LV LM", vlr: 97.95 },
    { up: "EQT033", desc: "INST SENSOR FALTA LM", vlr: 68.59 },
    { up: "EQT034", desc: "RET SENSOR FALTA LM", vlr: 48.16 },
    { up: "EQT035", desc: "INST ESTR CP SENSOR FALTA POSTE LM", vlr: 2336.89 },
    { up: "EQT036", desc: "RET ESTR CP SENSOR FALTA POSTE LM", vlr: 1460.94 },
    { up: "EQT037", desc: "INST RELIGADOR 1F POSTE LM", vlr: 1179.57 },
    { up: "EQT038", desc: "RET RELIGADOR 1F POSTE LM", vlr: 825.62 },
    { up: "EQT039", desc: "INST ESTR CP RELIGADOR 1F POSTE LM", vlr: 3411.38 },
    { up: "EQT040", desc: "RET ESTR CP RELIGADOR 1F POSTE LM", vlr: 2374.54 },
    { up: "EQT041", desc: "INST RELIGADOR DIST 1F BASE C LM", vlr: 182.96 },
    { up: "EQT042", desc: "RET RELIGADOR DIST 1F BASE C LM", vlr: 133.74 },
    { up: "EQT043", desc: "INST ESTR CP RELIG DIST 1F BASE C LM", vlr: 493.45 },
    { up: "EQT044", desc: "RET ESTR CP RELIG DIST 1F BASE C LM", vlr: 394.75 },
    { up: "EQT045", desc: "INST RELIGADOR/SECCIONADOR 3F LM", vlr: 2623.58 },
    { up: "EQT046", desc: "RET RELIGADOR/SECCIONADOR 3F LM", vlr: 1741.22 },
    { up: "EQT047", desc: "INST ESTR CP RELIGADOR/SECCIONADOR 3F LM", vlr: 9481.54 },
    { up: "EQT048", desc: "RET ESTR CP RELIGADOR/SECCIONADOR 3F LM", vlr: 5936.98 },
    { up: "EQT049", desc: "INST REGULADOR TENSAO POSTE/PLATAF LM", vlr: 3701.6 },
    { up: "EQT050", desc: "RET REGULADOR TENSAO POSTE/PLATAF LM", vlr: 2042.41 },
    { up: "EQT051", desc: "INST ESTR CP BCO REGULADOR PLATAFORMA LM", vlr: 11813.09 },
    { up: "EQT052", desc: "RET ESTR CP BCO REGULADOR PLATAFORMA LM", vlr: 6196.61 },
    { up: "EQT053", desc: "INST ESTR CP BCO REGULADOR POSTE LM", vlr: 8441.95 },
    { up: "EQT054", desc: "RET ESTR CP BCO REGULADOR POSTE LM", vlr: 3922.35 },
    { up: "EQT055", desc: "INST CELULAR CAPACITOR LM", vlr: 665.61 },
    { up: "EQT056", desc: "RET CELULAR CAPACITOR LM", vlr: 350.18 },
    { up: "EQT057", desc: "INST ESTR CP BCO CAPACITOR FIXO LM", vlr: 6510.75 },
    { up: "EQT058", desc: "RET ESTR CP BCO CAPACITOR FIXO LM", vlr: 2052.27 },
    { up: "EQT059", desc: "INST ESTR CP BCO CAPACITOR AUTOMATICO LM", vlr: 5821.86 },
    { up: "EQT060", desc: "RET ESTR CP BCO CAPACITOR AUTOMATICO LM", vlr: 1859.89 },
    { up: "EQT061", desc: "INST REATOR POSTE/PLATAF LM", vlr: 3050.08 },
    { up: "EQT062", desc: "RET REATOR POSTE/PLATAF LM", vlr: 1682.93 },
    { up: "EQT063", desc: "INST ESTR CP BCO REATOR DERIVACAO LM", vlr: 16491.07 },
    { up: "EQT064", desc: "RET ESTR CP BCO REATOR DERIVACAO LM", vlr: 11544.47 },
    { up: "EQT065", desc: "INST EQUIP MEDICAO TENSAO/CORRENTE LM", vlr: 120.1 },
    { up: "EQT066", desc: "RET EQUIP MEDICAO TENSAO/CORRENTE LM", vlr: 79.06 },
    { up: "EQT067", desc: "INST TRAFO DT POSTE/PLATAF 1/2F LM", vlr: 1431.51 },
    { up: "EQT068", desc: "RET TRAFO DT POSTE/PLATAF 1/2F LM", vlr: 1144.83 },
    { up: "EQT069", desc: "INST TRAFO DT POSTE/PLATAF 3F LM", vlr: 1947.53 },
    { up: "EQT070", desc: "RET TRAFO DT POSTE/PLATAF 3F LM", vlr: 1947.53 },
    { up: "EQT071", desc: "INST ESTR CP TRAFO DT 1F FN LM", vlr: 2330.55 },
    { up: "EQT072", desc: "RET ESTR CP TRAFO DT 1F FN LM", vlr: 1908.51 },
    { up: "EQT073", desc: "INST ESTR CP TRAFO DT 2F FF LM", vlr: 2804.3 },
    { up: "EQT074", desc: "RET ESTR CP TRAFO DT 2F FF LM", vlr: 2194.67 },
    { up: "EQT075", desc: "INST ESTR CP TRAFO DT 3F LM", vlr: 3920.38 },
    { up: "EQT076", desc: "RET ESTR CP TRAFO DT 3F LM", vlr: 2744.24 },
    { up: "EQT077", desc: "INST ESTR CP TRAFO DT PLATAFORMA LM", vlr: 4270.39 },
    { up: "EQT078", desc: "RET ESTR CP TRAFO DT PLATAFORMA LM", vlr: 2778.64 },
    { up: "EQT079", desc: "INST TRAFO DT C/ TALHA MANUAL LM", vlr: 2672.86 },
    { up: "EQT080", desc: "RET TRAFO DT C/ TALHA MANUAL LM", vlr: 1603.68 },
    { up: "EQT081", desc: "INST LIGACAO TRAFO NA REDE SECUNDARIA LM", vlr: 159.54 },
    { up: "EQT082", desc: "RET LIGACAO TRAFO NA REDE SECUNDARIA LM", vlr: 100.12 },
    { up: "EQT083", desc: "ALTERAR TAP EXTERNO TRAFO LM", vlr: 542.04 },
    { up: "EQT084", desc: "INST TRANSFORMADOR POTENCIAL (TP) LM", vlr: 902.66 },
    { up: "EQT085", desc: "RET TRANSFORMADOR POTENCIAL (TP) LM", vlr: 683.06 },
    { up: "EQT086", desc: "INST MEDICAO FISCAL TRAFO LM", vlr: 333.97 },
    { up: "EQT087", desc: "RET MEDICAO FISCAL TRAFO LM", vlr: 240.03 },
    { up: "EQT088", desc: "INST POSTE CONCRETO ATE 14M LM", vlr: 2293.42 },
    { up: "EQT089", desc: "RET POSTE CONCRETO ATE 14M LM", vlr: 907.11 },
    { up: "EQT090", desc: "INST POSTE CONCRETO 15 A 22M LM", vlr: 3358.88 },
    { up: "EQT091", desc: "RET POSTE CONCRETO 15 A 22M LM", vlr: 1752.45 },
    { up: "EQT092", desc: "INST POSTE CONCRETO MAIOR/IGUAL 23M LM", vlr: 4310.19 },
    { up: "EQT093", desc: "RET POSTE CONCRETO MAIOR/IGUAL 23M LM", vlr: 2008.13 },
    { up: "EQT094", desc: "INST POSTE DE FIBRA 7 A 19M LM", vlr: 1529.57 },
    { up: "EQT095", desc: "RET POSTE DE FIBRA 7 A 19M LM", vlr: 779.94 },
    { up: "EQT096", desc: "INST POSTE DE FIBRA MAIOR/IGUAL 20M LM", vlr: 2863.91 },
    { up: "EQT097", desc: "RET POSTE DE FIBRA MAIOR/IGUAL 20M LM", vlr: 1365.48 },
    { up: "EQT098", desc: "RET POSTE DE MADEIRA LM", vlr: 779.94 },
    { up: "EQT099", desc: "INST POSTE MET QUAD 5 OU 7M PADRAO LM", vlr: 220.54 },
    { up: "EQT100", desc: "RET POSTE MET QUAD 5 OU 7M PADRAO LM", vlr: 132.31 },
    { up: "EQT101", desc: "INST POSTE MET QUAD 7M RD LM", vlr: 1233.83 },
    { up: "EQT102", desc: "RET POSTE MET QUAD 7M RD LM", vlr: 132.31 },
    { up: "EQT103", desc: "ADICIONAL RETIRAR POSTE BASE CONCRETO LM", vlr: 442.43 },
    { up: "EQT104", desc: "ADICIONAL EXEC MAN ATIV EQUIP/POSTE LM", vlr: 1117.78 },
    { up: "EQT105", desc: "APRUMAR POSTE CONC/FIBRA LM", vlr: 848.57 },
    { up: "EQT106", desc: "RESTAURAR PASSEIO SIMPLES CIMENTADO LM", vlr: 726.7 },
    { up: "EQT107", desc: "RESTAURAR PASSEIO ESPECIAL PEDRA PORT LM", vlr: 1050.01 },
    { up: "EQT108", desc: "ABRIR CAVA ROCHA C/ EQUIPAMENTO ESPEC LM", vlr: 2147.78 },
    { up: "EQT109", desc: "ABRIR CAVA ROCHA C/ EXPLOSIVO LM", vlr: 3153.11 },
    { up: "EQT110", desc: "BASE CONCRETO 1CAMADA PARA POSTE LM", vlr: 1313.25 },
    { up: "EQT111", desc: "BASE CONCRETO 2CAMADAS PARA POSTE LM", vlr: 1884.54 },
    { up: "EQT112", desc: "BASE CONCRETO C/ MANILHA PARA POSTE LM", vlr: 2242.41 },
    { up: "EQT113", desc: "BASE COM BRITA LM", vlr: 1046.07 },
    { up: "EQT114", desc: "INST ESTAI ANCORA LM", vlr: 1196.68 },
    { up: "EQT115", desc: "RET ESTAI ANCORA LM", vlr: 678.79 },
    { up: "EQT116", desc: "INST ESTAI SUBSOLO BASE REFORCADA LM", vlr: 1336.34 },
    { up: "EQT117", desc: "INST ESTAI AEREO LM", vlr: 844.29 },
    { up: "EQT118", desc: "RET ESTAI AEREO LM", vlr: 540.49 },
    { up: "EQT119", desc: "TENSIONAR ESTAI LM", vlr: 61.52 },
    { up: "EQT120", desc: "INST PLACA IDENTIFICACAO COMPONENTE LM", vlr: 65.49 },
    { up: "EQT121", desc: "RETIRAR ABELHAS E INSETOS LM", vlr: 848.57 },
    { up: "EQT122", desc: "PINTAR NUMERACAO POSTE LM", vlr: 52.04 },
    { up: "EQT123", desc: "ARRASTAR POSTE/MATERIAL MANUAL LM", vlr: 1138.01 },
    { up: "EQT124", desc: "DEMARCAR POSTE LM", vlr: 78.22 },
    { up: "EQT125", desc: "LIMPAR/ACEIRAR AO REDOR POSTE/ESTAI LM", vlr: 47.57 },
    { up: "EQT126", desc: "INST COND NU COBRE > 50MM² LM", vlr: 9.15 },
    { up: "EQT127", desc: "RET COND NU COBRE > 50MM² LM", vlr: 5.2 },
    { up: "EQT128", desc: "INST COND NU COBRE <= 50MM² LM", vlr: 7.27 },
    { up: "EQT129", desc: "RET COND NU COBRE <= 50MM² LM", vlr: 3.52 },
    { up: "EQT130", desc: "INST COND NU ALUMINIO > 1/0 LM", vlr: 11.42 },
    { up: "EQT131", desc: "RET COND NU ALUMINIO > 1/0 LM", vlr: 4.37 },
    { up: "EQT132", desc: "INST COND NU ALUMINIO <= 1/0 LM", vlr: 8.92 },
    { up: "EQT133", desc: "RET COND NU ALUMINIO <= 1/0 LM", vlr: 4.37 },
    { up: "EQT134", desc: "INST EMENDA COND NU AL/CU LM", vlr: 142.19 },
    { up: "EQT135", desc: "TENSIONAR COND NU COBRE > 50MM² LM", vlr: 411.89 },
    { up: "EQT136", desc: "TENSIONAR COND NU COBRE <= 50MM² LM", vlr: 330.05 },
    { up: "EQT137", desc: "TENSIONAR COND NU ALUMINIO > 1/0 LM", vlr: 505.36 },
    { up: "EQT138", desc: "TENSIONAR COND NU ALUMINIO <= 1/0 LM", vlr: 361.82 },
    { up: "EQT139", desc: "INST CONECTOR EM CONDUTOR LM", vlr: 76.92 },
    { up: "EQT140", desc: "RET CONECTOR EM CONDUTOR LM", vlr: 135.73 },
    { up: "EQT141", desc: "INST JUMPER EM CONDUTOR LM", vlr: 95.5 },
    { up: "EQT142", desc: "RET JUMPER EM CONDUTOR LM", vlr: 57.07 },
    { up: "EQT143", desc: "INST PASSAGEM DE NEUTRO LM", vlr: 541.17 },
    { up: "EQT144", desc: "RET PASSAGEM DE NEUTRO LM", vlr: 312.19 },
    { up: "EQT145", desc: "INST AMARRACAO COND NU/MULTIP/PROTEG LM", vlr: 317.13 },
    { up: "EQT146", desc: "INST FLY TAP/CRUZAM AEREO COND NU LM", vlr: 165 },
    { up: "EQT147", desc: "RET FLY TAP /CRUZAM AEREO COND NU LM", vlr: 99.63 },
    { up: "EQT148", desc: "INST ESPACADOR/AFASTADOR REDE PRI/SEC LM", vlr: 95.71 },
    { up: "EQT149", desc: "RET ESPACADOR/AFASTADOR REDE PRI/SEC LM", vlr: 47.69 },
    { up: "EQT150", desc: "INST ESFERA SINALIZACAO RD LM", vlr: 441.91 },
    { up: "EQT151", desc: "RET ESFERA DE SINALIZACAO RD LM", vlr: 237.56 },
    { up: "EQT152", desc: "RETIRAR OBJETO ESTRANHO REDE LM", vlr: 99.35 },
    { up: "EQT153", desc: "INST ESTRIBO OU GRAMPO LINHA VIVA RD LM", vlr: 97.2 },
    { up: "EQT154", desc: "RET ESTRIBO OU GRAMPO LINHA VIVA RD LM", vlr: 34.15 },
    { up: "EQT155", desc: "INST MUFLA RD CONDUTOR LM", vlr: 302 },
    { up: "EQT156", desc: "RET MUFLA RD CONDUTOR LM", vlr: 226.53 },
    { up: "EQT157", desc: "VERIFICAR SEQUENCIA DE FASE(BT OU MT) LM", vlr: 159.12 },
    { up: "EQT158", desc: "INST ESTRUTURA SECUNDARIA LM", vlr: 308.07 },
    { up: "EQT159", desc: "RET ESTRUTURA SECUNDARIA LM", vlr: 308.07 },
    { up: "EQT160", desc: "INST ESTRUT SECUNDARIA CRUZETA BT LM", vlr: 814.68 },
    { up: "EQT161", desc: "RET ESTRUT SECUNDARIA CRUZETA BT LM", vlr: 415.38 },
    { up: "EQT162", desc: "INST ESTR PRI 2/3F SUS/PAS SP CRUZ SP LM", vlr: 849.77 },
    { up: "EQT163", desc: "RET ESTR PRI 2/3F SUS/PAS SP CRUZ SP LM", vlr: 637.19 },
    { up: "EQT164", desc: "INST ESTR PRI 2/3F SUS/PAS DP CRUZ DP LM", vlr: 290.01 },
    { up: "EQT165", desc: "RET ESTR PRI 2/3F SUS/PAS DP CRUZ DP LM", vlr: 217.51 },
    { up: "EQT166", desc: "INST ESTR PRI 2/3F ANC/AMA SP CRUZ DP LM", vlr: 1393.51 },
    { up: "EQT167", desc: "RET ESTR PRI 2/3F ANC/AMA SP CRUZ DP LM", vlr: 975.46 },
    { up: "EQT168", desc: "INST ESTR PRI 2/3F ANC/AMA DP CRUZ DP LM", vlr: 1982.27 },
    { up: "EQT169", desc: "RET ESTR PRI 2/3F ANC/AMA DP CRUZ DP LM", vlr: 1387.53 },
    { up: "EQT170", desc: "INST ESTR PRI 1F SUSP/PAS SP S/CRUZ LM", vlr: 349.32 },
    { up: "EQT171", desc: "RET ESTR PRI 1F SUSP/PAS SP S/CRUZ LM", vlr: 256.72 },
    { up: "EQT172", desc: "INST ESTR PRI 1F SUSP/PAS DP S/CRUZ LM", vlr: 475.11 },
    { up: "EQT173", desc: "RET ESTR PRI 1F SUSP/PAS DP S/CRUZ LM", vlr: 325.19 },
    { up: "EQT174", desc: "INST ESTR PRI 1F ANC/AMA SP S/CRUZ LM", vlr: 543.92 },
    { up: "EQT175", desc: "RET ESTR PRI 1F ANC/AMA SP S/CRUZ LM", vlr: 376.53 },
    { up: "EQT176", desc: "INST ESTR PRI 1F ANC/AMA DP S/CRUZ LM", vlr: 683.93 },
    { up: "EQT177", desc: "RET ESTR PRI 1F ANC/AMA DP S/CRUZ LM", vlr: 462.1 },
    { up: "EQT178", desc: "INST ESTR PRI 2/3F SUS/PAS SP S/CRUZ LM", vlr: 617.17 },
    { up: "EQT179", desc: "RET ESTR PRI 2/3F SUS/PAS SP S/CRUZ LM", vlr: 325.69 },
    { up: "EQT180", desc: "INST ESTR PRI 2/3F ANC/AMA SP S/CRUZ LM", vlr: 887.76 },
    { up: "EQT181", desc: "RET ESTR PRI 2/3F ANC/AMA SP S/CRUZ LM", vlr: 450.64 },
    { up: "EQT182", desc: "INST ESTR PRI 2/3F ANC/AMA DP S/CRUZ LM", vlr: 1190.87 },
    { up: "EQT183", desc: "RET ESTR PRI 2/3F ANC/AMA DP S/CRUZ LM", vlr: 595.09 },
    { up: "EQT184", desc: "INST ESTR PRI 3F ANC/AMA CRUZ DP HT LM", vlr: 2142.64 },
    { up: "EQT185", desc: "RET ESTR PRI 3F ANC/AMA CRUZ DP HT LM", vlr: 1663.24 },
    { up: "EQT186", desc: "INST ESTR PRI 3F ANC/AMA S/CRUZ HTE LM", vlr: 1924.59 },
    { up: "EQT187", desc: "RET ESTR PRI 3F ANC/AMA S/CRUZ HTE LM", vlr: 1496.71 },
    { up: "EQT188", desc: "NIVELAR CRUZETA LM", vlr: 156.39 },
    { up: "EQT189", desc: "INST ISOLADOR ROLDANA LM", vlr: 55.07 },
    { up: "EQT190", desc: "RET ISOLADOR ROLDANA LM", vlr: 55.07 },
    { up: "EQT191", desc: "INST ISOLADOR PINO/PILAR LM", vlr: 393.65 },
    { up: "EQT192", desc: "RET ISOLADOR PINO/PILAR LM", vlr: 393.65 },
    { up: "EQT193", desc: "INST ISOLAD DISCO/ANCORAGEM LM", vlr: 432.84 },
    { up: "EQT194", desc: "RET ISOLAD DISCO/ANCORAGEM LM", vlr: 272.65 },
    { up: "EQT195", desc: "INST PARA-RAIOS BT LM", vlr: 110.54 },
    { up: "EQT196", desc: "RET PARA-RAIOS BT LM", vlr: 76 },
    { up: "EQT197", desc: "INST PARA-RAIOS MT LM", vlr: 144.2 },
    { up: "EQT198", desc: "RET PARA-RAIOS MT LM", vlr: 89.43 },
    { up: "EQT199", desc: "INST ESTR CP PARA-RAIOS MT LM", vlr: 1241.87 },
    { up: "EQT200", desc: "RET ESTR CP PARA-RAIOS MT LM", vlr: 680.16 },
    { up: "EQT201", desc: "INST COND 2PLEX BT 1X10(10)-1X35(35) LM", vlr: 20.97 },
    { up: "EQT202", desc: "RET COND 2PLEX BT 1X10(10)-1X35(35) LM", vlr: 7.89 },
    { up: "EQT203", desc: "INST COND 3PLEX BT 2X10(10)-2X35(35) LM", vlr: 28.45 },
    { up: "EQT204", desc: "RET COND 3PLEX BT 2X10(10)-2X35(35) LM", vlr: 7.89 },
    { up: "EQT205", desc: "INST COND 4PLEX BT 3X10(10)-3X120(70) LM", vlr: 30.95 },
    { up: "EQT206", desc: "RET COND 4PLEX BT 3X10(10)-3X120(70) LM", vlr: 7.89 },
    { up: "EQT207", desc: "INST COND ISOL MT ATE 3X185MM²+3/8 LM", vlr: 40.3 },
    { up: "EQT208", desc: "RET COND ISOL MT ATE 3X185MM²+3/8 LM", vlr: 7.35 },
    { up: "EQT209", desc: "INST COND ISOL BT <= 1X25MM² POST MET LM", vlr: 3.03 },
    { up: "EQT210", desc: "RET COND ISOL BT <= 1X25MM² POST MET LM", vlr: 0.95 },
    { up: "EQT211", desc: "INST COND ISOL BT <= 2X25MM² POST MET LM", vlr: 3.51 },
    { up: "EQT212", desc: "RET COND ISOL BT <= 2X25MM² POST MET LM", vlr: 1.01 },
    { up: "EQT213", desc: "INST EMENDA COND MULTIPLEXADO LM", vlr: 142.19 },
    { up: "EQT214", desc: "TENSIONAR COND MULTIPLEXADO LM", vlr: 595.51 },
    { up: "EQT215", desc: "INST ESTR PRI RDC PASSANTE SIMPLES LM", vlr: 782.85 },
    { up: "EQT216", desc: "RET ESTR PRI RDC PASSANTE SIMPLES LM", vlr: 454.57 },
    { up: "EQT217", desc: "INST ESTR PRI RDC ANCORAGEM SIMPLES LM", vlr: 963.93 },
    { up: "EQT218", desc: "RET ESTR PRI RDC ANCORAGEM SIMPLES LM", vlr: 647.64 },
    { up: "EQT219", desc: "INST ESTR PRI RDC ANCORAGEM DUPLA LM", vlr: 1191.38 },
    { up: "EQT220", desc: "RET ESTR PRI RDC ANCORAGEM DUPLA LM", vlr: 735.27 },
    { up: "EQT221", desc: "INST ESTR PRI RDC N3S-CE LM", vlr: 1480.12 },
    { up: "EQT222", desc: "RET ESTR PRI RDC N3S-CE LM", vlr: 851.99 },
    { up: "EQT223", desc: "INST ESTR PRI RDC N3S-CE-PR LM", vlr: 1735.13 },
    { up: "EQT224", desc: "RET ESTR PRI RDC N3S-CE-PR LM", vlr: 902.31 },
    { up: "EQT225", desc: "INST ESTR PRI RDC DN-CE LM", vlr: 1356.89 },
    { up: "EQT226", desc: "RET ESTR PRI RDC DN-CE LM", vlr: 780.1 },
    { up: "EQT227", desc: "INST ESTR PRI RDC CE-DS/TS LM", vlr: 2173.1 },
    { up: "EQT228", desc: "RET ESTR PRI RDC CE-DS/TS LM", vlr: 1364.41 },
    { up: "EQT229", desc: "INST ESTR PRI RDC NS/BS (PR, CF, SU) LM", vlr: 937.06 },
    { up: "EQT230", desc: "RET ESTR PRI RDC NS/BS (PR, CF, SU) LM", vlr: 715.75 },
    { up: "EQT231", desc: "INST COND COBERTO RDC 35-70 MM2 LM", vlr: 10.59 },
    { up: "EQT232", desc: "RET COND COBERTO RDC 35-70 MM2 LM", vlr: 6.45 },
    { up: "EQT233", desc: "INST COND COBERTO RDC 95-185 MM2 LM", vlr: 14.95 },
    { up: "EQT234", desc: "RET COND COBERTO RDC 95-185 MM2 LM", vlr: 8.72 },
    { up: "EQT235", desc: "INST CABO MENSAGEIRO RDC LM", vlr: 10.38 },
    { up: "EQT236", desc: "RET CABO MENSAGEIRO RDC LM", vlr: 2.06 },
    { up: "EQT237", desc: "TENSIONAR COND MESAGEIRO RDC LM", vlr: 486.45 },
    { up: "EQT238", desc: "TENSIONAR COND PROTEGIDO RDC LM", vlr: 486.45 },
    { up: "EQT239", desc: "INST ESPACADOR LOSANGULAR RDC LM", vlr: 63.61 },
    { up: "EQT240", desc: "RET ESPACADOR LOSANGULAR RDC LM", vlr: 47.69 },
    { up: "EQT241", desc: "INST CONEX OU EMENDA DE CABO RDC LM", vlr: 142.19 },
    { up: "EQT242", desc: "INST DEFENSA CONC POSTE RETANG LM", vlr: 1052.74 },
    { up: "EQT243", desc: "INST DEFENSA CONC MANILHA INT 120CM LM", vlr: 1265.66 },
    { up: "EQT244", desc: "INST DEFENSA CONC MANILH BIPART 120CM LM", vlr: 1265.66 },
    { up: "EQT245", desc: "INST DEFENSA MET TIPO GUARD RAIL RD", vlr: 3667.6 },
    { up: "EQT246", desc: "INST CONJ MEDICAO ENCAPSULADO LM", vlr: 1431.51 },
    { up: "EQT247", desc: "RET CONJ MEDICAO ENCAPSULADO LM", vlr: 1144.83 },
    { up: "EQT248", desc: "INST MEDIDOR ELETRONICO LM", vlr: 79.54 },
    { up: "EQT249", desc: "RET MEDIDOR ELETRONICO LM", vlr: 55.68 },
    { up: "EQT250", desc: "INST RAMAL DE CONEXAO CONC/MULTIPLEX LM", vlr: 116.25 },
    { up: "EQT251", desc: "RET RAMAL DE CONEXAO CONC/MULTIPLEX LM", vlr: 81.38 },
    { up: "EQT252", desc: "NEGOCIAR E FINANCIAR PADRAO COMPLETO LM", vlr: 29.34 },
    { up: "EQT253", desc: "INST KIT INSTALAC INTERNA RESIDENCIAL LM", vlr: 310.82 },
    { up: "EQT254", desc: "INST CAIXA MEDICAO/PROTECAO NO POSTE LM", vlr: 105.18 },
    { up: "EQT255", desc: "RET CAIXA MEDICAO/PROTECAO NO POSTE LM", vlr: 73.63 },
    { up: "EQT256", desc: "INST PADRAO ENTRADA COMPLETO LM", vlr: 181.79 },
    { up: "EQT257", desc: "INST PADRAO ENTRADA PARCIAL LM", vlr: 105.18 },
    { up: "EQT258", desc: "AVISO ENTREGA CARTA DESLIG PROG S/ PROT", vlr: 4.8 },
    { up: "EQT259", desc: "AVISO ENTREGA CARTA DESLIG PROG C/ PROT", vlr: 5.61 },
    { up: "EQT260", desc: "INST CONEXAO RAMAL DE CONEXAO LM", vlr: 17.65 },
    { up: "EQT261", desc: "RET CONEXAO RAMAL DE CONEXAO LM", vlr: 13.21 },
    { up: "EQT262", desc: "TENSIONAR RAMAL DE CONEXAO LM", vlr: 30.35 },
    { up: "EQT263", desc: "INST ILUMINACAO PUBLICA LM", vlr: 644.39 },
    { up: "EQT264", desc: "RET ILUMINACAO PUBLICA LM", vlr: 305.5 },
    { up: "EQT265", desc: "INST CONEXAO ILUMINACAO PUBLICA LM", vlr: 92.22 },
    { up: "EQT266", desc: "RET CONEXAO ILUMINACAO PUBLICA LM", vlr: 58.2 },
    { up: "EQT267", desc: "INST/RET BIG JUMPER LM", vlr: 8308.4 },
    { up: "EQT268", desc: "GUARDA DE CONDUTOR BIG JUMPER LM", vlr: 917.77 },
    { up: "EQT269", desc: "INST CHAVE FUSIVEL 15/25KV LV", vlr: 407.06 },
    { up: "EQT270", desc: "RET CHAVE FUSIVEL 15/25KV LV", vlr: 362.09 },
    { up: "EQT271", desc: "INST CHAVE FUSIVEL 34,5KV LV", vlr: 407.06 },
    { up: "EQT272", desc: "RET CHAVE FUSIVEL 34,5KV LV", vlr: 362.09 },
    { up: "EQT273", desc: "INST CHAVE FACA LV", vlr: 407.06 },
    { up: "EQT274", desc: "RET CHAVE FACA LV", vlr: 362.09 },
    { up: "EQT275", desc: "TURMA LV INST CHAVE SECCION A SECO 3F LV", vlr: 637.89 },
    { up: "EQT276", desc: "TURMA LV RET CHAVE SECCION A SECO 3F LV", vlr: 409.29 },
    { up: "EQT277", desc: "INST CHAVE FUSIVEL RELIG LV", vlr: 637.89 },
    { up: "EQT278", desc: "RET CHAVE FUSIVEL RELIG LV", vlr: 409.29 },
    { up: "EQT279", desc: "INST ESTR CP CHAVE FUSIVEL RELIG 1F LV", vlr: 1525.63 },
    { up: "EQT280", desc: "RET ESTR CP CHAVE FUSIVEL RELIG 1F LV", vlr: 1068 },
    { up: "EQT281", desc: "INST ESTR CP CHAVE FUSIVEL RELIG 2/3F LV", vlr: 2313.41 },
    { up: "EQT282", desc: "RET ESTR CP CHAVE FUSIVEL RELIG 2/3F LV", vlr: 1533.8 },
    { up: "EQT283", desc: "INST CHAVE BY-PASS LV", vlr: 637.89 },
    { up: "EQT284", desc: "RET CHAVE BY-PASS LV", vlr: 409.29 },
    { up: "EQT285", desc: "INST SENSOR FALTA LV", vlr: 157.73 },
    { up: "EQT286", desc: "RET SENSOR FALTA LV", vlr: 111.02 },
    { up: "EQT287", desc: "INST ESTR CP SENSOR FALTA POSTE LV", vlr: 2167.38 },
    { up: "EQT288", desc: "RET ESTR CP SENSOR FALTA POSTE LV", vlr: 1354.81 },
    { up: "EQT289", desc: "INST RELIGADOR 1F POSTE LV", vlr: 1085.71 },
    { up: "EQT290", desc: "RET RELIGADOR 1F POSTE LV", vlr: 833.2 },
    { up: "EQT291", desc: "INST ESTR CP RELIGADOR 1F POSTE LV", vlr: 2489.84 },
    { up: "EQT292", desc: "RET ESTR CP RELIGADOR 1F POSTE LV", vlr: 1816.09 },
    { up: "EQT293", desc: "INST RELIGADOR DIST 1F BASE C LV", vlr: 739.34 },
    { up: "EQT294", desc: "RET RELIGADOR DIST 1F BASE C LV", vlr: 619.31 },
    { up: "EQT295", desc: "INST ESTR CP RELIG DIST 1F BASE C LV", vlr: 1496.26 },
    { up: "EQT296", desc: "RET ESTR CP RELIG DIST 1F BASE C LV", vlr: 1255.74 },
    { up: "EQT297", desc: "TURMA LV INST RELIGADOR/SECCIONAD 3F LV", vlr: 1744.49 },
    { up: "EQT298", desc: "TURMA LV RET RELIGADOR/SECCIONAD 3F LV", vlr: 1356.79 },
    { up: "EQT299", desc: "INST ESTR CP RELIGADOR/SECCIONADOR 3F LV", vlr: 2630.98 },
    { up: "EQT300", desc: "RET ESTR CP RELIGADOR/SECCIONADOR 3F LV", vlr: 2061.39 },
    { up: "EQT301", desc: "INST ESTR CP BCO REGULADOR POSTE LV", vlr: 3547.21 },
    { up: "EQT302", desc: "TURMA LV INST TRAFO DT LV", vlr: 877.92 },
    { up: "EQT303", desc: "TURMA LV RET TRAFO DT LV", vlr: 673.27 },
    { up: "EQT304", desc: "INST TRANSFORMADOR POTENCIAL (TP) LV", vlr: 505.37 },
    { up: "EQT305", desc: "RET TRANSFORMADOR POTENCIAL (TP) LV", vlr: 314.31 },
    { up: "EQT306", desc: "TURMA LV INST POSTE RELIGADOR/SECION LV", vlr: 1356.79 },
    { up: "EQT307", desc: "TURMA LV RET POSTE RELIGADOR/SECION LV", vlr: 1162.99 },
    { up: "EQT308", desc: "TURMA LV INST POSTE CHAVE SEC SECO 3F LV", vlr: 1356.79 },
    { up: "EQT309", desc: "TURMA LV RET POSTE CHAVE SEC SECO 3F LV", vlr: 1162.99 },
    { up: "EQT310", desc: "TURMA LV INST POSTE REGULADOR TENSAO LV", vlr: 1356.79 },
    { up: "EQT311", desc: "TURMA LV RET POSTE REGULADOR TENSAO LV", vlr: 1162.99 },
    { up: "EQT312", desc: "TURMA LV INST POSTE BCO CAPACITOR LV", vlr: 1356.79 },
    { up: "EQT313", desc: "TURMA LV RET POSTE BCO CAPACITOR LV", vlr: 1162.99 },
    { up: "EQT314", desc: "TURMA LV INST POSTE TRAFO LV", vlr: 1356.79 },
    { up: "EQT315", desc: "TURMA LV RET POSTE TRAFO LV", vlr: 1162.99 },
    { up: "EQT316", desc: "INST ESTAI AEREO LV", vlr: 581.49 },
    { up: "EQT317", desc: "RET ESTAI AEREO LV", vlr: 383.79 },
    { up: "EQT318", desc: "TENSIONAR ESTAI LV", vlr: 478.2 },
    { up: "EQT319", desc: "APRUMAR POSTE CONC/FIBRA LV", vlr: 628.7 },
    { up: "EQT320", desc: "INST COND NU COBRE > 50MM² LV", vlr: 9.58 },
    { up: "EQT321", desc: "RET COND NU COBRE > 50MM² LV", vlr: 6.06 },
    { up: "EQT322", desc: "INST COND NU COBRE <= 50MM² LV", vlr: 9.77 },
    { up: "EQT323", desc: "RET COND NU COBRE <= 50MM² LV", vlr: 4.1 },
    { up: "EQT324", desc: "INST COND NU ALUMINIO > 1/0 LV", vlr: 13.29 },
    { up: "EQT325", desc: "RET COND NU ALUMINIO > 1/0 LV", vlr: 9.39 },
    { up: "EQT326", desc: "INST COND NU ALUMINIO <= 1/0 LV", vlr: 9.77 },
    { up: "EQT327", desc: "RET COND NU ALUMINIO <= 1/0 LV", vlr: 7.62 },
    { up: "EQT328", desc: "TENSIONAR COND NU ALUMINIO/COBRE LV", vlr: 357.01 },
    { up: "EQT329", desc: "INST EMENDA COND NU AL/CU LV", vlr: 387.7 },
    { up: "EQT330", desc: "INST CONECTOR EM CONDUTOR LV", vlr: 289.97 },
    { up: "EQT331", desc: "RET CONECTOR EM CONDUTOR LV", vlr: 183.44 },
    { up: "EQT332", desc: "INST JUMPER EM CONDUTOR LV", vlr: 464.41 },
    { up: "EQT333", desc: "RET JUMPER EM CONDUTOR LV", vlr: 325.05 },
    { up: "EQT334", desc: "INST PASSAGEM DE NEUTRO LV", vlr: 576.82 },
    { up: "EQT335", desc: "RET PASSAGEM DE NEUTRO LV", vlr: 403.73 },
    { up: "EQT336", desc: "INST AMARRACAO COND NU/MULTIP/PROTEG LV", vlr: 339.43 },
    { up: "EQT337", desc: "INST FLY TAP/CRUZAM AEREO COND NU LV", vlr: 547.49 },
    { up: "EQT338", desc: "RET FLY TAP /CRUZAM AEREO COND NU LV", vlr: 352.02 },
    { up: "EQT339", desc: "INST ESPACADOR/AFASTADOR REDE PRI/SEC LV", vlr: 174.45 },
    { up: "EQT340", desc: "RET ESPACADOR/AFASTADOR REDE PRI/SEC LV", vlr: 122.06 },
    { up: "EQT341", desc: "INST ESTRIBO OU GRAMPO LINHA VIVA RD LV", vlr: 289.97 },
    { up: "EQT342", desc: "RET ESTRIBO OU GRAMPO LINHA VIVA RD LV", vlr: 183.44 },
    { up: "EQT343", desc: "RETIRAR OBJETO ESTRANHO REDE LV", vlr: 291.91 },
    { up: "EQT344", desc: "INST MUFLA RD CONDUTOR LV", vlr: 818.29 },
    { up: "EQT345", desc: "RET MUFLA RD CONDUTOR LV", vlr: 572.81 },
    { up: "EQT346", desc: "INST ESTR PRI 2/3F SUS/PAS SP CRUZ SP LV", vlr: 664.77 },
    { up: "EQT347", desc: "RET ESTR PRI 2/3F SUS/PAS SP CRUZ SP LV", vlr: 427.38 },
    { up: "EQT348", desc: "INST ESTR PRI 2/3F SUS/PAS DP CRUZ DP LV", vlr: 1186.55 },
    { up: "EQT349", desc: "RET ESTR PRI 2/3F SUS/PAS DP CRUZ DP LV", vlr: 762.75 },
    { up: "EQT350", desc: "INST ESTR PRI 2/3F ANC/AMA SP CRUZ DP LV", vlr: 1017.57 },
    { up: "EQT351", desc: "RET ESTR PRI 2/3F ANC/AMA SP CRUZ DP LV", vlr: 654.11 },
    { up: "EQT352", desc: "INST ESTR PRI 2/3F ANC/AMA DP CRUZ DP LV", vlr: 1695.1 },
    { up: "EQT353", desc: "RET ESTR PRI 2/3F ANC/AMA DP CRUZ DP LV", vlr: 1089.73 },
    { up: "EQT354", desc: "RET ESTR PRI 1F SUSP/PAS SP S/CRUZ LV", vlr: 128.23 },
    { up: "EQT355", desc: "INST ESTR PRI 1F SUSP/PAS DP S/CRUZ LV", vlr: 284.89 },
    { up: "EQT356", desc: "RET ESTR PRI 1F SUSP/PAS DP S/CRUZ LV", vlr: 183.15 },
    { up: "EQT357", desc: "INST ESTR PRI 1F ANC/AMA SP S/CRUZ LV", vlr: 264.56 },
    { up: "EQT358", desc: "RET ESTR PRI 1F ANC/AMA SP S/CRUZ LV", vlr: 170.14 },
    { up: "EQT359", desc: "INST ESTR PRI 1F ANC/AMA DP S/CRUZ LV", vlr: 406.94 },
    { up: "EQT360", desc: "RET ESTR PRI 1F ANC/AMA DP S/CRUZ LV", vlr: 261.62 },
    { up: "EQT361", desc: "INST ESTR PRI 2/3F SUS/PAS SP S/CRUZ LV", vlr: 466.46 },
    { up: "EQT362", desc: "RET ESTR PRI 2/3F SUS/PAS SP S/CRUZ LV", vlr: 299.83 },
    { up: "EQT363", desc: "INST ESTR PRI 2/3F ANC/AMA SP S/CRUZ LV", vlr: 666.42 },
    { up: "EQT364", desc: "RET ESTR PRI 2/3F ANC/AMA SP S/CRUZ LV", vlr: 428.36 },
    { up: "EQT365", desc: "INST ESTR PRI 2/3F ANC/AMA DP S/CRUZ LV", vlr: 1189.36 },
    { up: "EQT366", desc: "RET ESTR PRI 2/3F ANC/AMA DP S/CRUZ LV", vlr: 764.59 },
    { up: "EQT367", desc: "INST ESTR PRI 3F ANC/AMA CRUZ DP HT LV", vlr: 2179.47 },
    { up: "EQT368", desc: "RET ESTR PRI 3F ANC/AMA CRUZ DP HT LV", vlr: 1695.1 },
    { up: "EQT369", desc: "INST ESTR PRI 3F ANC/AMA S/CRUZ HTE LV", vlr: 1961.52 },
    { up: "EQT370", desc: "RET ESTR PRI 3F ANC/AMA HTE LV", vlr: 1525.5 },
    { up: "EQT371", desc: "TRANSF ESTR PRIM N2,B2,M2 P/ N4,B4,M4 LV", vlr: 896.33 },
    { up: "EQT372", desc: "TRANSF ESTR PRIM N3,B3,M3 P/ N4,B4,M4 LV", vlr: 639.92 },
    { up: "EQT373", desc: "TURMA LV INST POSTE ESTRUT PRIMARIA LV", vlr: 1356.79 },
    { up: "EQT374", desc: "TURMA LV RET POSTE ESTRUT PRIMARIA LV", vlr: 1162.99 },
    { up: "EQT375", desc: "NIVELAR CRUZETA LV", vlr: 565.17 },
    { up: "EQT376", desc: "INST MAO FRANCESA LV", vlr: 226.07 },
    { up: "EQT377", desc: "RET MAO FRANCESA LV", vlr: 158.25 },
    { up: "EQT378", desc: "REBAIXAR CRUZ 2/3F SUS/PAS SP CRUZ SP LV", vlr: 996.62 },
    { up: "EQT379", desc: "REBAIXAR CRUZ 2/3F SUS/PAS DP CRUZ DP LV", vlr: 1423.87 },
    { up: "EQT380", desc: "REBAIXAR CRUZ 2/3F ANC/AMA SP CRUZ DP LV", vlr: 1525.55 },
    { up: "EQT381", desc: "REBAIXAR CRUZ 2/3F ANC/AMA DP CRUZ DP LV", vlr: 2034.12 },
    { up: "EQT382", desc: "INST ISOLADOR PINO/PILAR LV", vlr: 347.92 },
    { up: "EQT383", desc: "RET ISOLADOR PINO/PILAR LV", vlr: 232.6 },
    { up: "EQT384", desc: "INST ISOLAD DISCO/ANCORAGEM LV", vlr: 388.18 },
    { up: "EQT385", desc: "RET ISOLAD DISCO/ANCORAGEM LV", vlr: 272.17 },
    { up: "EQT386", desc: "INST PARA-RAIOS MT LV", vlr: 417.81 },
    { up: "EQT387", desc: "RET PARA-RAIOS MT LV", vlr: 262.21 },
    { up: "EQT388", desc: "INST ESTR PRI RDC PASSANTE SIMPLES LV", vlr: 0 },
    { up: "EQT389", desc: "RET ESTR PRI RDC PASSANTE SIMPLES LV", vlr: 406.16 },
    { up: "EQT390", desc: "INST ESTR PRI RDC ANCORAGEM SIMPLES LV", vlr: 870.81 },
    { up: "EQT391", desc: "RET ESTR PRI RDC ANCORAGEM SIMPLES LV", vlr: 645.18 },
    { up: "EQT392", desc: "INST ESTR PRI RDC ANCORAGEM DUPLA LV", vlr: 1033.19 },
    { up: "EQT393", desc: "RET ESTR PRI RDC ANCORAGEM DUPLA LV", vlr: 707.68 },
    { up: "EQT394", desc: "INST ESTR PRI RDC N3S-CE LV", vlr: 1239.06 },
    { up: "EQT395", desc: "RET ESTR PRI RDC N3S-CE LV", vlr: 790.96 },
    { up: "EQT396", desc: "INST ESTR PRI RDC N3S-CE-PR LV", vlr: 1420.99 },
    { up: "EQT397", desc: "RET ESTR PRI RDC N3S-CE-PR LV", vlr: 826.85 },
    { up: "EQT398", desc: "INST ESTR PRI RDC DN-CE LV", vlr: 921.41 },
    { up: "EQT399", desc: "RET ESTR PRI RDC DN-CE LV", vlr: 592.05 },
    { up: "EQT400", desc: "INST ESTR PRI RDC CE-DS/TS LV", vlr: 1387.48 },
    { up: "EQT401", desc: "RET ESTR PRI RDC CE-DS/TS LV", vlr: 925.71 },
    { up: "EQT402", desc: "INST ESTR PRI RDC NS/BS (PR, CF, SU) LV", vlr: 851.64 },
    { up: "EQT403", desc: "RET ESTR PRI RDC NS/BS (PR, CF, SU) LV", vlr: 693.76 },
    { up: "EQT404", desc: "INST COND COBERTO RDC 35-70 MM2 LV", vlr: 11.93 },
    { up: "EQT405", desc: "RET COND COBERTO RDC 35-70 MM2 LV", vlr: 7.62 },
    { up: "EQT406", desc: "INST COND COBERTO RDC 95-185 MM2 LV", vlr: 15.44 },
    { up: "EQT407", desc: "RET COND COBERTO RDC 95-185 MM2 LV", vlr: 9.39 },
    { up: "EQT408", desc: "INST CABO MENSAGEIRO RDC LV", vlr: 11.53 },
    { up: "EQT409", desc: "RET CABO MENSAGEIRO RDC LV", vlr: 4.29 },
    { up: "EQT410", desc: "TENSIONAR COND MENSAGEIRO RDC LV", vlr: 326.62 },
    { up: "EQT411", desc: "TENSIONAR COND PROTEGIDO RDC LV", vlr: 326.62 },
    { up: "EQT412", desc: "INST ESPACADOR LOSANGULAR RDC LV", vlr: 174.45 },
    { up: "EQT413", desc: "RET ESPACADOR LOSANGULAR RDC LV", vlr: 122.11 },
    { up: "EQT414", desc: "INST/RET BIG JUMPER LV", vlr: 4886.54 },
    { up: "EQT415", desc: "ACAO PRODUTIVA CORTE BORNE MEDIDOR STC", vlr: 43.97 },
    { up: "EQT416", desc: "ACAO PRODUTIVA CORTE POSTE STC", vlr: 67.41 },
    { up: "EQT417", desc: "RET RAMAL CONC/MULTIPLEX COMERCIAL STC", vlr: 77.97 },
    { up: "EQT418", desc: "RET MEDIDOR ELETRONICO COMERCIAL STC", vlr: 122.58 },
    { up: "EQT419", desc: "ACAO PRODUTIVA CORTE DISJ STC", vlr: 35.17 },
    { up: "EQT420", desc: "ACAO IMPRODUTIVA DE COBRANCA STC", vlr: 29.32 },
    { up: "EQT421", desc: "DESLIGAMENTO A PEDIDO DO CLIENTE STC", vlr: 58.62 },
    { up: "EQT422", desc: "ACAO PRODUT RELIGACAO BORNE MEDIDOR STC", vlr: 43.97 },
    { up: "EQT423", desc: "ACAO PRODUTIVA RELIGACAO POSTE STC", vlr: 67.41 },
    { up: "EQT424", desc: "INST RAMAL CONC/MULTIPLEX COMERCIAL STC", vlr: 111.38 },
    { up: "EQT425", desc: "INST MEDIDOR ELETRONICO COMERCIAL STC", vlr: 175.14 },
    { up: "EQT426", desc: "ACAO PRODUTIVA CONFIRMAC PAG DEBITO STC", vlr: 58.62 },
    { up: "EQT427", desc: "INST CAIXA MEDICAO/PROTECAO NO POSTE STC", vlr: 231.58 },
    { up: "EQT428", desc: "RET CAIXA MEDICAO/PROTECAO NO POSTE STC", vlr: 162.1 },
    { up: "EQT429", desc: "INST CAIXA MEDICAO C/ SIST CP PAREDE STC", vlr: 400.24 },
    { up: "EQT430", desc: "RET CAIXA MEDICAO C/ ACESSOR PAREDE STC", vlr: 280.17 },
    { up: "EQT431", desc: "INST PADRAO ENTRADA COMPLETO STC", vlr: 400.24 },
    { up: "EQT432", desc: "RET PADRAO ENTRADA COMPLETO STC", vlr: 300.18 },
    { up: "EQT433", desc: "INST PADRAO ENTRADA PARCIAL STC", vlr: 231.58 },
    { up: "EQT434", desc: "RET PADRAO ENTRADA PARCIAL STC", vlr: 162.1 },
    { up: "EQT435", desc: "REATIVACAO UC S/ INST MEDIDOR E RAMAL", vlr: 58.62 },
    { up: "EQT436", desc: "LIGACAO OU MISCELANEA NAO EXECUTADA STC", vlr: 87.56 },
    { up: "EQT437", desc: "INST MEDIDOR ELETRONICO STC", vlr: 175.14 },
    { up: "EQT438", desc: "RET MEDIDOR ELETRONICO STC", vlr: 122.58 },
    { up: "EQT439", desc: "INST MEDIDOR ELETRONICO C/ FISCALIZ STC", vlr: 202.07 },
    { up: "EQT440", desc: "RET MEDIDOR ELETRONICO C/ FISCALIZ STC", vlr: 136.07 },
    { up: "EQT441", desc: "INST MEDIDOR COM TESTE INVERSOR STC", vlr: 195.34 },
    { up: "EQT442", desc: "INST RAMAL DE CONEXAO CONC/MULTIPLEX STC", vlr: 255.97 },
    { up: "EQT443", desc: "RET RAMAL DE CONEXAO CONC/MULTIPLEX STC", vlr: 179.17 },
    { up: "EQT444", desc: "INST RAMAL DE CONEXAO C/ FICALIZ STC", vlr: 282.9 },
    { up: "EQT445", desc: "RET RAMAL DE CONEXAO C/ FICALIZ STC", vlr: 192.64 },
    { up: "EQT446", desc: "SERV FISCALIZACAO INSPECAO UC STC", vlr: 400.24 },
    { up: "EQT447", desc: "NEGOCIACAO DEBITO UC INADIMPLENTE STC", vlr: 91.81 },
    { up: "EQT448", desc: "ATEND EMERG FALTA ENERGIA COLETIVA ALIME", vlr: 704.13 },
    { up: "EQT449", desc: "ATEND EMERG FALTA ENERGIA COLETIVA MT", vlr: 440.79 },
    { up: "EQT450", desc: "ATEND EMERG FALTA ENERGIA COLETIVA BT", vlr: 379.71 },
    { up: "EQT451", desc: "ATEND EMERG FALTA ENERGIA COLETIVA INDIV", vlr: 186.24 },
    { up: "EQT452", desc: "ATEND EMERG PODA DE ARVORE", vlr: 178.58 },
    { up: "EQT453", desc: "ATEND EMERG INST ANALISADOR QUALIDADE", vlr: 170.3 },
    { up: "EQT454", desc: "ATEND EMERG RET ANALISADOR QUALIDADE", vlr: 108.15 },
    { up: "EQT455", desc: "ATEND EMERG NIVEL DE TENSAO", vlr: 174.32 },
    { up: "EQT456", desc: "ATEND EMERG PARA RAIOS", vlr: 193.59 },
    { up: "EQT457", desc: "ATEND EMERG INST TRAFO ATE 15KVA", vlr: 264.2 },
    { up: "EQT458", desc: "ATEND EMERG RET TRAFO ATE 15KVA", vlr: 158.32 },
    { up: "EQT459", desc: "ATEND EMERG EMERGÊNCIA IMPRODUTIVA", vlr: 112.31 },
    { up: "EQT460", desc: "ATEND EMERG MISCEL CONEXAO", vlr: 22.64 },
    { up: "EQT461", desc: "ATEND EMERG MISCEL TECNICA", vlr: 113.12 },
    { up: "EQT462", desc: "HORA TRABALHADA EM ATENDIM EMERGENCIAL", vlr: 190.8 },
    { up: "EQT463", desc: "HORA EM DISPONIB ATENDIMENTO EMERGENCIAL", vlr: 190.8 },
    { up: "EQT464", desc: "HORA EM DISPONIB EQ COMERCIAL", vlr: 124.05 },
    { up: "EQT465", desc: "SERV NORMALIZACAO ESTRUTURACAO EQ LEVE", vlr: 288.49 },
    { up: "EQT466", desc: "SERV NORMALIZACAO ESTRUTURACAO EQ MEDIA", vlr: 288.5 },
    { up: "EQT467", desc: "SERV NORMALIZAC ESTRUTRAC SKY SIMP SMC", vlr: 288.5 },
    { up: "EQT468", desc: "SERV NORMALIZACAO ESTRUTURACAO EQ C ESC", vlr: 288.5 },
    { up: "EQT469", desc: "SERV NORMALIZAC ESTRUTRAC EQ 3H CESTO D.", vlr: 288.5 },
    { up: "EQT470", desc: "SERV NORMALIZAC ESTRUTRAC MINI SKY", vlr: 288.5 },
    { up: "EQT471", desc: "SERV NORMALIZAC ESTRUTRAC CAM F4000", vlr: 288.5 },
    { up: "EQT472", desc: "TURMA SEED MONEY 4X4 EM DISPONIBILIDADE", vlr: 124.05 },
    { up: "EQT473", desc: "HORA EM DISPONIBILIDADE COBRANÇA", vlr: 124.05 },
    { up: "EQT474", desc: "HORA EM DISPONIBILIDADE LIGAÇÃO NOVA", vlr: 353.31 },
    { up: "EQT475", desc: "INST MEDICAO FISCAL C/ LEVANT TRAFO STC", vlr: 2453.38 },
    { up: "EQT476", desc: "RET MEDICAO FISCAL TRAFO STC", vlr: 166.96 },
    { up: "EQT477", desc: "ELIMINAR RAMA TREPADEIRA TRP PO LM", vlr: 29.32 },
    { up: "EQT478", desc: "ELIMINAR ARV GRANDE PORTE 2GS PO LM", vlr: 351.77 },
    { up: "EQT479", desc: "ELIMINAR ARV MEDIO PORTE 2MS PO LM", vlr: 175.89 },
    { up: "EQT480", desc: "ELIMINAR ARV PEQUENO PORTE 2PS PO LM", vlr: 87.95 },
    { up: "EQT481", desc: "PODA ARV GRANDE PT >=12M LAT 2GL PO LM", vlr: 293.13 },
    { up: "EQT482", desc: "PODA ARV MEDIO PT >6<12M ELEV 2ME PO LM", vlr: 205.21 },
    { up: "EQT483", desc: "PODA ARV MEDIO PT >6<12M LATER 2ML PO LM", vlr: 234.52 },
    { up: "EQT484", desc: "PODA ARV MEDIO PT>6<12M REBAIX 2MR PO LM", vlr: 252.1 },
    { up: "EQT485", desc: "PODA ARV PEQ PT <=6M LATER 2PL PO LM", vlr: 146.57 },
    { up: "EQT486", desc: "PODA ARV PEQ PT <=6M REBAIX 2PR PO LM", vlr: 193.48 },
    { up: "EQT487", desc: "PODA ARV>6<12M REDE BT CENTRAL 2MC PO LM", vlr: 756.32 },
    { up: "EQT488", desc: "PODA ARV <6M REDE BT CENTRAL 2PC PO LM", vlr: 293.13 },
    { up: "EQT489", desc: "PODA GRAM>6<12M REDE MT REBAIX 3MR PO LM", vlr: 87.95 },
    { up: "EQT490", desc: "PODA PALMEIRA<6M REDE BT LATER 1PL PO LV", vlr: 115.72 },
    { up: "EQT491", desc: "PODA PALMEIRA>6<12M RED MT LAT 1ML PO LM", vlr: 105.54 },
    { up: "EQT492", desc: "PODA PALMEIRA<6M REDE BT LATER 1PL PO LM", vlr: 99.67 },
    { up: "EQT493", desc: "PODA GRAMINEA >12M REDE MT LAT 3GL PO LM", vlr: 46.9 },
    { up: "EQT494", desc: "PODA PALMEIRA >12M REDE MT LAT 1GL PO LM", vlr: 111.39 },
    { up: "EQT495", desc: "PODA ARV GRANDE PT >=12M ELEV 2GE PO LM", vlr: 351.77 },
    { up: "EQT496", desc: "PODA ARV BAMBU CORTE REBAIX BAM PO LM", vlr: 105.54 },
    { up: "EQT497", desc: "SERV CAMINHAO RECOLHE TRITURADOR/PODA", vlr: 586.29 },
    { up: "EQT498", desc: "SERV CAMINHAO RECOLHE S/ TRITURADOR/PODA", vlr: 586.29 },
    { up: "EQT499", desc: "TURMA PODA LEVE 3H DISPONIBILIDADE PO LM", vlr: 409.11 },
    { up: "EQT500", desc: "ELIMINAR RAMA TREPADEIRA TRP PO LV", vlr: 34.03 },
    { up: "EQT501", desc: "ELIMINAR ARV GRANDE PORTE 2GS PO LV", vlr: 462.84 },
    { up: "EQT502", desc: "ELIMINAR ARV MEDIO PORTE 2MS PO LV", vlr: 231.41 },
    { up: "EQT503", desc: "ELIMINAR ARV PEQUENO PORTE 2PS PO LV", vlr: 102.1 },
    { up: "EQT504", desc: "PODA ARV GRANDE PT >=12M LAT 2GL PO LV", vlr: 381.16 },
    { up: "EQT505", desc: "PODA ARV MEDIO PT >6<12M ELEV 2ME PO LV", vlr: 265.44 },
    { up: "EQT506", desc: "PODA ARV MEDIO PT >6<12M LATER 2ML PO LV", vlr: 299.48 },
    { up: "EQT507", desc: "PODA ARV MEDIO PT>6<12M REBAIX 2MR PO LV", vlr: 333.52 },
    { up: "EQT508", desc: "PODA ARV PEQ PT <=6M LATER 2PL PO LV", vlr: 170.15 },
    { up: "EQT509", desc: "PODA ARV PEQ PT <=6M REBAIX 2PR PO LV", vlr: 224.61 },
    { up: "EQT510", desc: "PODA ARV>6<12M REDE BT CENTRAL 2MC PO LV", vlr: 986.92 },
    { up: "EQT511", desc: "PODA ARV <6M REDE BT CENTRAL 2PC PO LV", vlr: 340.32 },
    { up: "EQT512", desc: "PODA GRAM>6<12M REDE MT REBAIX 3MR PO LV", vlr: 115.72 },
    { up: "EQT513", desc: "ROCO VEGET >6<12M REDE MT ROCO PO LM", vlr: 5.87 },
    { up: "EQT514", desc: "ROCO VEGET >6<12M REDE MT ROCO PO LV", vlr: 6.8 },
    { up: "EQT515", desc: "PODA PALMEIRA>6<12M RED MT LAT 1ML PO LV", vlr: 136.13 },
    { up: "EQT516", desc: "PODA GRAMINEA >12M REDE MT LAT 3GL PO LV", vlr: 61.26 },
    { up: "EQT517", desc: "PODA PALMEIRA >12M REDE MT LAT 1GL PO LV", vlr: 149.75 },
    { up: "EQT518", desc: "PODA ARV GRANDE PT >=12M ELEV 2GE PO LV", vlr: 456.03 },
    { up: "EQT519", desc: "PODA ARV BAMBU CORTE REBAIX BAM PO LV", vlr: 142.94 },
    { up: "EQT520", desc: "TURMA PODA DISPONIBILIDADE PO LV", vlr: 474.94 },
    { up: "EQT521", desc: "INST ESTR CP RELIG DIST 1F BASE C 2F LM", vlr: 795.25 },
    { up: "EQT522", desc: "RET ESTR CP RELIG DIST 1F BASE C 2F LM", vlr: 619.27 },
    { up: "EQT523", desc: "", vlr: 0 },
    { up: "EQT524", desc: "", vlr: 0 },
    { up: "EQT525", desc: "", vlr: 0 },
    { up: "EQT526", desc: "", vlr: 213.47 },
    { up: "EQT527", desc: "TURMA LM 2H CESTO ATEND EMERGENCIAL", vlr: 271.65 },
    { up: "EQT528", desc: "TURMA LM 5H CAM ATEND EMERGENCIAL", vlr: 1138.01 },
    { up: "EQT529", desc: "", vlr: 213.47 },
    { up: "EQT530", desc: "", vlr: 279.68 },
    { up: "EQT531", desc: "", vlr: 1194.29 },
    { up: "EQT532", desc: "", vlr: 0 },
    { up: "EQT533", desc: "", vlr: 0 },
    { up: "EQT534", desc: "", vlr: 0 },
    { up: "EQT535", desc: "", vlr: 0 },
    { up: "EQT536", desc: "", vlr: 124.05 },
    { up: "EQT537", desc: "", vlr: 0 },
    { up: "EQT538", desc: "", vlr: 0 },
    { up: "EQT539", desc: "", vlr: 0 },
    { up: "EQT540", desc: "", vlr: 0 },
    { up: "EQT541", desc: "", vlr: 0 },
    { up: "EQT542", desc: "", vlr: 0 },
    { up: "EQT543", desc: "", vlr: 0 },
    { up: "EQT544", desc: "TURMA LM 2H LEVE ATEND EMERGENCIAL HE25%", vlr: 266.85 },
    { up: "EQT545", desc: "TURMA LM 2H CEST ATEND EMERGENCIAL HE25%", vlr: 339.56 },
    { up: "EQT546", desc: "TURMA LM 5H CAM ATEND EMERGENCIAL HE25%", vlr: 1422.53 },
    { up: "EQT547", desc: "", vlr: 0 },
    { up: "EQT548", desc: "", vlr: 0 },
    { up: "EQT549", desc: "", vlr: 0 },
    { up: "EQT550", desc: "FISCALIZACAO DE OBRA LM", vlr: 3564.56 },
    { up: "EQT551", desc: "PROJETO ASBUILT LM", vlr: 299.49 },
    { up: "EQT552", desc: "COMISSIONAMENTO DE OBRA LM", vlr: 395.72 },
    { up: "EQT553", desc: "ENCERRAMENTO TECNICO DA OBRA LM", vlr: 1067.01 },
    { up: "EQT554", desc: "INST/RET POSTE TELESCOPICO EMERG LM", vlr: 201.9 },
    { up: "EQT555", desc: "", vlr: 0 },
    { up: "EQT556", desc: "", vlr: 0 },
    { up: "EQT557", desc: "", vlr: 0 },
    { up: "EQT558", desc: "", vlr: 0 },
    { up: "EQT559", desc: "", vlr: 0 },
    { up: "EQT560", desc: "ATEND EMERG ESPACADOR/AFAST REDE PRI/SEC", vlr: 64.84 },
    { up: "EQT561", desc: "INST RAMAL DE CONEXAO CONC/MULTIPLEX SRD", vlr: 103.16 },
    { up: "EQT562", desc: "RET RAMAL DE CONEXAO CONC/MULTIPLEX SRD", vlr: 72.21 },
    { up: "EQT563", desc: "INST CONEXAO RAMAL DE CONEXAO SRD", vlr: 15.66 },
    { up: "EQT564", desc: "RET CONEXAO RAMAL DE CONEXAO SRD", vlr: 11.72 },
    { up: "EQT565", desc: "INST COND 4PLEX BT 3X10(10)-3X120(70)SRD", vlr: 8.09 },
    { up: "EQT566", desc: "RET COND NU ALUMINIO <= 1/0 SRD", vlr: 0.58 },
    { up: "EQT567", desc: "PODA ARV MEDIO PT >6<12M LATER 2ML SRD", vlr: 69.98 },
    { up: "EQT568", desc: "INST ESTR CP RELIG DIST 1F BASE C 2F LV", vlr: 2480.12 },
    { up: "EQT569", desc: "RET ESTR CP RELIG DIST 1F BASE C 2F LV", vlr: 2217.32 },
    { up: "EQT570", desc: "", vlr: 2305.69 },
    { up: "EQT571", desc: "", vlr: 199.47 },
    { up: "EQT572", desc: "INST ESTR PRI 1F PAS SP LV", vlr: 490.54 },
    { up: "EQT573", desc: "TURMA LV ATE 36,2KV 3H CESTO SP EM DISP", vlr: 681.96 },
    { up: "EQT574", desc: "TURMA LV ATE 36,2KV 4H CESTO DP EM DISP", vlr: 852.01 },
    { up: "EQT575", desc: "", vlr: 35.17 },
    { up: "EQT576", desc: "", vlr: 124.05 },
    { up: "EQT577", desc: "", vlr: 0 },
    { up: "EQT578", desc: "", vlr: 0 },
    { up: "EQT579", desc: "", vlr: 0 },
    { up: "EQT580", desc: "", vlr: 0 },
    { up: "EQT581", desc: "", vlr: 0 },
    { up: "EQT582", desc: "", vlr: 0 },
    { up: "EQT583", desc: "", vlr: 0 },
    { up: "EQT584", desc: "", vlr: 0 },
    { up: "EQT585", desc: "", vlr: 0 },
    { up: "EQT586", desc: "", vlr: 0 },
    { up: "EQT587", desc: "", vlr: 0 },
    { up: "EQT588", desc: "", vlr: 0 },
    { up: "EQT589", desc: "", vlr: 0 },
    { up: "EQT590", desc: "", vlr: 0 },
    { up: "EQT591", desc: "", vlr: 0 },
    { up: "EQT592", desc: "", vlr: 2053.81 },
    { up: "EQT593", desc: "", vlr: 0 },
    { up: "EQT594", desc: "", vlr: 1022.79 },
    { up: "EQT595", desc: "", vlr: 0 },
    { up: "EQT596", desc: "", vlr: 0 },
    { up: "EQT597", desc: "", vlr: 0 },
    { up: "EQT598", desc: "", vlr: 12507.7 },
    { up: "EQT599", desc: "", vlr: 0 },
    { up: "EQT600", desc: "", vlr: 10227.97 },
    { up: "EQT601", desc: "", vlr: 0 },
    { up: "EQT602", desc: "", vlr: 0 },
    { up: "EQT603", desc: "", vlr: 0 },
    { up: "EQT604", desc: "", vlr: 0 },
    { up: "EQT605", desc: "", vlr: 0 },
    { up: "EQT606", desc: "", vlr: 0 },
    { up: "EQT607", desc: "", vlr: 0 },
    { up: "EQT608", desc: "", vlr: 0 },
    { up: "EQT609", desc: "", vlr: 0 },
    { up: "EQT610", desc: "INST CANALIZAÇÃO EM TERRA <1M LM SUB", vlr: 157.28 },
    { up: "EQT611", desc: "INST CANALIZAÇÃO TERRA >1M <1,5M LM SUB", vlr: 259.9 },
    { up: "EQT612", desc: "INST CANALIZAÇÃO <1,5M, SOLO<15CM LM SUB", vlr: 284.38 },
    { up: "EQT613", desc: "INST CANALIZAÇÃO <1,5M, SOLO>15CM LM SUB", vlr: 428.55 },
    { up: "EQT614", desc: "INST CANALIZAÇÃO VALA PRÉ-EXIST LM SUB", vlr: 7.8 },
    { up: "EQT615", desc: "RESTAURAR PASSEIO LADRILHO LM SUB", vlr: 150.05 },
    { up: "EQT616", desc: "RESTAURAR PASSEIO CONCRETO 20CM LM SUB", vlr: 210.27 },
    { up: "EQT617", desc: "RESTAURAR PASSEIO GRAMA LM SUB", vlr: 126.23 },
    { up: "EQT618", desc: "RESTAURAR PASSEIO ESPEC LADRILHO LM SUB", vlr: 208.44 },
    { up: "EQT619", desc: "RESTAURAR PASSEIO CONCRETO 10CM LM SUB", vlr: 140.03 },
    { up: "EQT620", desc: "RESTAURAR PASSEIO ASFALTO LM SUB", vlr: 455.6 },
    { up: "EQT621", desc: "RESTAURAR PASS. CONC 20CM >250KG LM SUB", vlr: 371.3 },
    { up: "EQT622", desc: "RESTAURAR PASS. CONC RÁPIDO 20CM LM SUB", vlr: 236.11 },
    { up: "EQT623", desc: "CONSTRUIR CAMARA/CAIXA CONC ARMAD LM SUB", vlr: 687.69 },
    { up: "EQT624", desc: "CONSTRUIR CÂMARA/CAIXA ALVENARIA LM SUB", vlr: 351.69 },
    { up: "EQT625", desc: "ESCAVAR E/OU MOVIMENTAR TERRA LM SUB", vlr: 123.62 },
    { up: "EQT626", desc: "INSP EM OBRA CAMARA SUBTERRÂNEA LM SUB", vlr: 171.15 },
    { up: "EQT627", desc: "LIMPAR CÂMARA BT LM SUB", vlr: 262.44 },
    { up: "EQT628", desc: "RET AGUA EM CÂMARAS SUBTERRÂNEAS LM SUB", vlr: 393.65 },
    { up: "EQT629", desc: "SELAR DUTOS EM CÂMARAS LM SUB", vlr: 65.21 },
    { up: "EQT630", desc: "INST CÂMARA MT PRÉ FABRICADA LM SUB", vlr: 1531.03 },
    { up: "EQT631", desc: "ESCAVAR SOLO PARA CÂMARA/GALERIA LM SUB", vlr: 126.98 },
    { up: "EQT632", desc: "CONSTRUIR EM ALVENARIA LM SUB", vlr: 565.62 },
    { up: "EQT633", desc: "INST FUSIVEIS MT LM SUB", vlr: 256.72 },
    { up: "EQT634", desc: "RET FUSIVEIS MT LM SUB", vlr: 85.57 },
    { up: "EQT635", desc: "INST FUSIVEIS BT LM SUB", vlr: 171.15 },
    { up: "EQT636", desc: "RET FUSIVEIS BT LM SUB", vlr: 71.31 },
    { up: "EQT637", desc: "INST CHAVE FUSÍVEIS MT LM SUB", vlr: 3434.43 },
    { up: "EQT638", desc: "RET CHAVE FUSÍVEIS MT LM SUB", vlr: 2943.8 },
    { up: "EQT639", desc: "RET COND MONOPOLAR BT LM SUB", vlr: 0.61 },
    { up: "EQT640", desc: "INST COND MONOPOLAR BT LM SUB", vlr: 1.02 },
    { up: "EQT641", desc: "TESTAR CONEXÃO CABO BT OU MT LM SUB", vlr: 328.03 },
    { up: "EQT642", desc: "INST BARRAMENTO LM SUB", vlr: 267.19 },
    { up: "EQT643", desc: "RET BARRAMENTO LM SUB", vlr: 160.32 },
    { up: "EQT644", desc: "INSP CAMARA SUBTERRÂNEA LM SUB", vlr: 570.5 },
    { up: "EQT645", desc: "INST MUFLA CONDUTOR LM SUB", vlr: 1632.04 },
    { up: "EQT646", desc: "RET MUFLA CONDUTOR LM SUB", vlr: 1309.61 },
    { up: "EQT647", desc: "INST CONECTOR EM CONDUTOR LM SUB", vlr: 374.82 },
    { up: "EQT648", desc: "RET CONECTOR EM CONDUTOR LM SUB", vlr: 306.87 },
    { up: "EQT649", desc: "INST EMENDA COND BT LM SUB", vlr: 213.94 },
    { up: "EQT650", desc: "INST EMENDA DERIVAÇÃO BT LM SUB", vlr: 527.71 },
    { up: "EQT651", desc: "INST EMENDA COND ISOL MT LM SUB", vlr: 784.44 },
    { up: "EQT652", desc: "INST EMENDA DERIVAÇÃO ISOL MT LM SUB", vlr: 1331.17 },
    { up: "EQT653", desc: "INST SECCIONADOR MT LM SUB", vlr: 1106.19 },
    { up: "EQT654", desc: "RET SECCIONADOR MT LM SUB", vlr: 360.71 },
    { up: "EQT655", desc: "INST CHAVE FUSÍVEIS BT LM SUB", vlr: 704.05 },
    { up: "EQT656", desc: "RET CHAVE FUSÍVEIS BT LM SUB", vlr: 589.16 },
    { up: "EQT657", desc: "INST CHAVE FACA LM SUB", vlr: 3149.17 },
    { up: "EQT658", desc: "RET CHAVE FACA LM SUB", vlr: 2658.54 },
    { up: "EQT659", desc: "INST PLACA IDENTF COMPONENTE LM SUB", vlr: 427.87 },
    { up: "EQT660", desc: "OPERAR CHAVE LM SUB", vlr: 157.46 },
    { up: "EQT661", desc: "OPERAR UNIDADE DESCONECTÁVEL LM SUB", vlr: 1180.94 },
    { up: "EQT662", desc: "ACAO PRODUTIVA CORTE LM SUB", vlr: 170.57 },
    { up: "EQT663", desc: "ACAO PRODUTIVA RELIGACAO LM SUB", vlr: 256.72 },
    { up: "EQT664", desc: "ENTREGAR CARTA DESLIG PROG S/ PROT SUB", vlr: 0.59 },
    { up: "EQT665", desc: "ENTREGAR CARTA DESLIG PROG C/ PROT SUB", vlr: 1.77 },
    { up: "EQT666", desc: "INST PORTA CENTRO TRANSF. LM SUB", vlr: 4208.89 },
    { up: "EQT667", desc: "RET PORTA CENTRO TRANSF. LM SUB", vlr: 1403.24 },
    { up: "EQT668", desc: "INST DISJ 3F BT LM SUB", vlr: 2226.39 },
    { up: "EQT669", desc: "RET DISJ 3F BT LM SUB", vlr: 1341.19 },
    { up: "EQT670", desc: "INST 1HASTE ADICIONAL ATERRAMENTO LM SUB", vlr: 443.8 },
    { up: "EQT671", desc: "INST ATERRAMENTO COMPL 1HASTE LM SUB", vlr: 887.76 },
    { up: "EQT672", desc: "INST ATERRAMENTO COMPL 5-8HASTE LM SUB", vlr: 3018.41 },
    { up: "EQT673", desc: "INST TRAFO DT SUBTERRÂNEO 3F LM SUB", vlr: 1631.23 },
    { up: "EQT674", desc: "RET TRAFO DT SUBTERRÂNEO 3F LM SUB", vlr: 1386.54 },
    { up: "EQT675", desc: "INSP CENTRO DE TRANSFORMAÇÃO LM SUB", vlr: 513.46 },
    { up: "EQT676", desc: "REVISAR CENTRO TRANSFORMAÇÃO LM SUB", vlr: 3885.13 },
    { up: "EQT677", desc: "ALTERAR TAP TRAFO LM SUB", vlr: 1568.89 },
    { up: "EQT678", desc: "OPERAR CABINE MT LM SUB", vlr: 399.35 },
    { up: "EQT679", desc: "HORA DISPONIBILIDADE TURMA SUBTERRANEO", vlr: 1194.29 },
    { up: "EQT680", desc: "REALIZAR TESTE HI-POT EM COND LM SUB", vlr: 427.87 },
    { up: "EQT681", desc: "REALIZAR TESTE RESISTIVIDADE COND LM SUB", vlr: 342.31 },
    { up: "EQT682", desc: "INST COND ISOL MT <= 50MM² LM SUB", vlr: 7.06 },
    { up: "EQT683", desc: "RET COND ISOL MT <= 50MM² LM SUB", vlr: 4.24 },
    { up: "EQT684", desc: "INST COND ISOL MT > 50MM² LM SUB", vlr: 9.41 },
    { up: "EQT685", desc: "RET COND ISOL MT > 50MM² LM SUB", vlr: 5.64 },
    { up: "EQT686", desc: "ACAO PRODUT CORTE BORNE MEDIDOR STC MOTO", vlr: 31.31 },
    { up: "EQT687", desc: "INST MEDIDOR ELETRON COMERCIAL STC MOTO", vlr: 54.28 },
    { up: "EQT688", desc: "RET MEDIDOR ELETRON COMERCIAL STC MOTO", vlr: 37.99 },
    { up: "EQT689", desc: "ACAO PRODUTIVA CORTE DISJ STC MOTO 1P", vlr: 12.53 },
    { up: "EQT690", desc: "ACAO PRODUT CORTE DISJ STC MOTO 2P", vlr: 25.04 },
    { up: "EQT691", desc: "ACAO IMPRODUT DE COBRANCA STC MOTO", vlr: 20.88 },
    { up: "EQT692", desc: "DESLIGAMENT A PEDIDO DO CLIENTE STC MOTO", vlr: 31.31 },
    { up: "EQT693", desc: "ACAO PRODUT RELIGAC BORNE MEDID STC MOTO", vlr: 31.31 },
    { up: "EQT694", desc: "ACAO PRODUT RELIGACAO DISJ STC MOTO 1P", vlr: 12.53 },
    { up: "EQT695", desc: "ACAO PRODUT RELIGACAO DISJ STC MOTO 2P", vlr: 25.04 },
    { up: "EQT696", desc: "ACAO PRODUT CONFIRM PAG DEBITO STC MOTO", vlr: 41.74 },
    { up: "EQT697", desc: "REATIVACAO UC S/ INST MEDIDOR STC MOTO", vlr: 41.74 }
]
// Função para ler arquivo Excel
function lerArquivoExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Pega a primeira planilha
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

                // Converte para JSON
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                // Remove linhas completamente vazias
                const dadosFiltrados = jsonData.filter(row =>
                    row && row.some(cell => cell !== null && cell !== undefined && cell !== '')
                );

                resolve(dadosFiltrados);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = function (e) {
            reject(e.target.error);
        };

        reader.readAsArrayBuffer(file);
    });
}

// Função para obter valor do UP automaticamente
function obterValorUP(codigoUP) {
    if (!codigoUP) return null;

    // Converte para string e remove espaços
    const codigo = codigoUP.toString().trim().toUpperCase();

    // Procura na tabela UPS
    const upEncontrado = ups.find(item => item.up === codigo);

    return upEncontrado ? {
        valor: upEncontrado.vlr,
        descricao: upEncontrado.desc
    } : null;
}

// Função para preencher a tabela com os dados do Excel
function preencherTabelaComExcel(dados) {
    const tableBody = document.getElementById('workDetailsBody');

    if (!tableBody) {
        console.error('Elemento tableBody não encontrado');
        return;
    }

    // Limpa a tabela atual
    tableBody.innerHTML = '';

    // Verifica se há dados
    if (!dados || dados.length === 0) {
        return;
    }

    // Assumindo que a primeira linha contém os cabeçalhos
    // Começa da linha 1 para pular os cabeçalhos
    for (let i = 1; i < dados.length; i++) {
        const linha = dados[i];

        // Verifica se a linha existe e não está vazia
        if (linha && linha.some(cell => cell !== null && cell !== undefined && cell !== '')) {
            const tr = document.createElement('tr');

            // Mapeia as colunas para as posições corretas
            const codigoUP = linha[0] || ''; // Código UP na primeira coluna
            const valorUPInfo = obterValorUP(codigoUP);

            // Se encontrou o UP, preenche automaticamente a descrição e valor
            if (valorUPInfo) {
                // Atualiza a linha com os dados automáticos
                // Assumindo que a descrição está na segunda coluna e o valor em alguma coluna posterior
                linha[1] = valorUPInfo.descricao; // Preenche descrição automática
                // Se houver uma coluna específica para valor, você pode preencher também
                // linha[6] = valorUPInfo.valor; // Exemplo: preenche valor na sétima coluna
            }

            const colunas = [
                linha[0] || '', // Nota/UP
                linha[1] || '', // Status Asbuilt/Descrição
                linha[2] || '', // Baixa Material
                linha[3] || '', // Cidade
                linha[4] || '', // Data Exe.
                linha[5] || '', // Tempo Resp.
                linha[6] || '', // Opex/Valor
                linha[7] || ''  // Resp.
            ];

            colunas.forEach((valor, index) => {
                const td = document.createElement('td');
                td.textContent = valor;

                // Adiciona classe especial se for valor preenchido automaticamente
                if (index === 1 && valorUPInfo) {
                    td.classList.add('auto-preenchido');
                    td.title = `Preenchido automaticamente da tabela UPS: R$ ${formatarMoeda(valorUPInfo.valor)}`;
                }

                tr.appendChild(td);
            });

            tableBody.appendChild(tr);
        }
    }
}

// Função para criar linha na tabela com preenchimento automático
function createLineTable(dataRow) {
    const tableBody = document.getElementById('workDetailsBody');
    if (tableBody) {
        const newRow = document.createElement('tr');

        // Converte para array se for objeto
        const rowData = Array.isArray(dataRow) ? dataRow : Object.values(dataRow);

        // Verifica se o primeiro item é um código UP
        const codigoUP = rowData[0] || '';
        const valorUPInfo = obterValorUP(codigoUP);

        // Se encontrou o UP, atualiza a descrição automaticamente
        if (valorUPInfo && rowData.length > 1) {
            rowData[1] = valorUPInfo.descricao; // Preenche descrição automática
        }

        rowData.forEach((cellData, index) => {
            const newCell = document.createElement('td');
            newCell.textContent = cellData;

            // Adiciona classe especial se for descrição preenchida automaticamente
            if (index === 1 && valorUPInfo) {
                newCell.classList.add('auto-preenchido');
                newCell.title = `Preenchido automaticamente da tabela UPS: R$ ${formatarMoeda(valorUPInfo.valor)}`;
            }

            newRow.appendChild(newCell);
        });

        tableBody.appendChild(newRow);
    }
}

// Função para configurar o input de arquivo Excel
function configurarInputExcel() {
    // Procura pelo input file existente no workConfig
    const workConfig = document.querySelector('.workConfig');

    if (workConfig) {
        const existingInput = workConfig.querySelector('input[type="file"]');

        if (existingInput) {
            // Configura o input existente
            existingInput.accept = '.xlsx,.xls,.csv';
            existingInput.setAttribute('accept', '.xlsx,.xls,.csv');

            // Remove qualquer listener anterior clonando e substituindo
            const newInput = existingInput.cloneNode(true);
            existingInput.parentNode.replaceChild(newInput, existingInput);

            // Adiciona o novo listener
            newInput.addEventListener('change', async function (event) {
                const file = event.target.files[0];

                if (file) {
                    try {
                        // Valida o tipo do arquivo
                        const validTypes = ['.xlsx', '.xls', '.csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
                        const fileType = file.type;
                        const fileName = file.name.toLowerCase();

                        if (!validTypes.some(type => fileName.endsWith(type.replace('.', '')) || fileType.includes(type))) {
                            criarMensagem(false, 'Por favor, selecione um arquivo Excel válido (.xlsx, .xls ou .csv)');
                            return;
                        }

                        criarMensagem(true, 'Processando arquivo...');

                        // Lê o arquivo Excel
                        const dados = await lerArquivoExcel(file);

                        // Armazena na variável global
                        dadosTableInportExcel = dados;

                        // Preenche a tabela (com preenchimento automático)
                        preencherTabelaComExcel(dados);

                        // Mostra mensagem de sucesso com contagem de UPs encontrados
                        const linhasImportadas = dados.length > 0 ? dados.length - 1 : 0;
                        const upsEncontrados = contarUPSEncontrados(dados);

                        criarMensagem(true, `Arquivo processado com sucesso! ${linhasImportadas} linhas importadas. ${upsEncontrados} UPs encontrados e preenchidos automaticamente.`);

                        console.log('Dados importados do Excel:', dadosTableInportExcel);
                        console.log('Valores preenchidos automaticamente baseados na tabela UPS');

                        // Limpa o input para permitir selecionar o mesmo arquivo novamente
                        event.target.value = '';

                    } catch (error) {
                        console.error('Erro ao processar arquivo:', error);
                        criarMensagem(false, 'Erro ao processar arquivo. Verifique se é um Excel válido.');

                        // Limpa o input em caso de erro
                        event.target.value = '';
                    }
                }
            });
        }
    }

    function createHead(dataRow) {
        const tableHead = document.getElementById('workDetailsHeader');
        if (tableHead) {
            const newRow = document.createElement('tr');
            Object.values(dataRow).forEach(cellData => {
                const newCell = document.createElement('th');
                newCell.textContent = cellData;
                newRow.appendChild(newCell);
            });
            tableHead.appendChild(newRow);
        }
    }

    // Configura o botão Processar
    const btnProcessar = document.getElementById('btnProcessar');
    if (btnProcessar) {
        // Remove listeners anteriores
        const newBtn = btnProcessar.cloneNode(true);
        btnProcessar.parentNode.replaceChild(newBtn, btnProcessar);

        newBtn.addEventListener('click', function () {
            if (dadosTableInportExcel && dadosTableInportExcel.length > 0) {
                console.log('Dados atuais na variável global:', dadosTableInportExcel);

                const upsEncontrados = contarUPSEncontrados(dadosTableInportExcel);
                criarMensagem(true, `${dadosTableInportExcel.length - 1} registros disponíveis. ${upsEncontrados} UPs encontrados e preenchidos automaticamente.`);

                //cria o cabeçalho da tabela
                createHead(dadosTableInportExcel[0]);

                // Aqui você pode adicionar a lógica para processar os dados
                dadosTableInportExcel.slice(1).forEach(row => {
                    createLineTable(row);
                });

                let valorProjeto = 0;
                let qtdServ = 0;
                let upsNaoEncontrados = [];

                dadosTableInportExcel.slice(1).forEach(row => {
                    const codigoUP = row[0];
                    if (codigoUP && codigoUP.toString().slice(0, 3) === "EQT") {
                        const upInfo = ups.find(up => up.up === codigoUP);
                        if (upInfo) {
                            qtdServ += 1;
                            valorProjeto += upInfo.vlr;
                        } else {
                            upsNaoEncontrados.push(codigoUP);
                        }
                    }
                });

                // Atualiza as informações da obra
                document.querySelector('.workInfo').innerHTML = `
                    <p>Valor dos serviços: ${formatarMoeda(valorProjeto)}</p>
                    <p>Quantidade de serviço: ${qtdServ}</p>
                    ${upsNaoEncontrados.length > 0 ?
                        `<p class="aviso">Atenção: ${upsNaoEncontrados.length} UPs não encontrados na tabela</p>` :
                        ''}
                `;

                let idObra = document.querySelector('.workDetailsContainer').getAttribute('id-open');

                for (let i = 0; i < dadosTable.length; i++) {
                    if (dadosTable[i].id == idObra) {
                        dadosTable[i].res_lista_ext = dadosTableInportExcel || [];
                        dadosTable[i].res_vlr_obra = valorProjeto.toFixed(2);
                    }
                }

                let t = dadosTable.find(obra => obra.id == idObra);

                atualizarDadosTabela(t);
            } else {
                criarMensagem(false, 'Nenhum dado importado. Selecione um arquivo Excel primeiro.');
            }
        });
    }
}

// Função auxiliar para contar UPs encontrados
function contarUPSEncontrados(dados) {
    if (!dados || dados.length < 2) return 0;

    let contador = 0;
    for (let i = 1; i < dados.length; i++) {
        const linha = dados[i];
        const codigoUP = linha[0];
        if (codigoUP && ups.some(up => up.up === codigoUP.toString().trim().toUpperCase())) {
            contador++;
        }
    }
    return contador;
}

// Função para formatar valor em moeda
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function openModal(id) {
    // Lógica para abrir o modal com base no ID
    console.log('Abrindo modal para o ID:', id);

    document.querySelector('.workDetailsContainer').classList.add('active');
    document.querySelector('.workDetailsContainer').setAttribute('id-open', id);

    let dt = dadosTable.find(obra => obra.id == id);

    if (dt.res_lista_ext && dt.res_lista_ext.length > 0) {
        // Preenche a tabela com os dados da obra (com preenchimento automático)
        dt.res_lista_ext.forEach(item => {
            createLineTable(item);
        });

        document.querySelector('.workInfo').innerHTML = `
                    <p>Valor dos serviços: ${formatarMoeda(dt.res_vlr_obra)}</p>
                    <p>Quantidade de serviço: ${dt.res_lista_ext.length || 0}</p>
                ''}
                `;
    }
}
function closeModal() {
    document.querySelector('.workDetailsContainer').classList.remove('active');
    document.querySelector('.workDetailsContainer').removeAttribute('id-open');
    document.getElementById('workDetailsBody').innerHTML = '';
    document.getElementById('workDetailsHeader').innerHTML = '';
    document.querySelector('.workInfo').innerHTML = '';
}
// Inicializa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function () {
    // Adiciona estilos para as mensagens e indicadores visuais
    if (!document.getElementById('excelImportStyles')) {
        const style = document.createElement('style');
        style.id = 'excelImportStyles';
        style.textContent = `
            @keyframes slideInMsg {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutMsg {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .auto-preenchido {
                background-color: #e8f5e813 !important;
                position: relative;
            }
            
            .auto-preenchido::after {
                content: "✓";
                position: absolute;
                right: 5px;
                top: 50%;
                transform: translateY(-50%);
                color: #4CAF50;
                font-weight: bold;
            }
            
            .aviso {
                color: #f57c00;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
    }

    // Configura o input Excel
    configurarInputExcel();
});

// Função para limpar os dados importados
window.limparDadosExcel = function () {
    dadosTableInportExcel = [];
    const tableBody = document.getElementById('workDetailsBody');
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    criarMensagem(true, 'Dados limpos com sucesso!');
};