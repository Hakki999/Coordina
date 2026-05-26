require("dotenv").config();
const { Pool } = require("pg");

const redshift = new Pool({
  host: process.env.REDSHIFT_HOST,
  port: Number(process.env.REDSHIFT_PORT || 5439),
  database: process.env.REDSHIFT_DATABASE,
  user: process.env.REDSHIFT_USER,
  password: process.env.REDSHIFT_PASSWORD,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
  statement_timeout: 120000,
  query_timeout: 120000,
  keepAlive: true
});

function gerarResumoBI(dados) {
  const meses = {};

  for (const item of dados) {
    const data = new Date(item.dta_exec_rcb);
    if (isNaN(data)) continue;

    const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;

    const equipe = item.des_equipe_rcb || "SEM EQUIPE";
    const tipoEquipe = item.des_tip_eqp_rcb || "SEM TIPO";
    const projeto = item.num_nota_rcb || item.cod_serv_rcb || "SEM PROJETO";
    const valor = Number(item.vlr_total_serv_rcb || 0);

    if (!meses[mes]) {
      meses[mes] = {
        mes,
        producaoTotal: 0,
        quantidadeServicos: 0,
        projetos: new Set(),
        equipes: {},
        tiposEquipe: {}
      };
    }

    const ref = meses[mes];

    ref.producaoTotal += valor;
    ref.quantidadeServicos++;
    ref.projetos.add(projeto);

    if (!ref.equipes[equipe]) {
      ref.equipes[equipe] = {
        equipe,
        tipoEquipe,
        producaoTotal: 0,
        quantidadeServicos: 0,
        projetos: new Set()
      };
    }

    ref.equipes[equipe].producaoTotal += valor;
    ref.equipes[equipe].quantidadeServicos++;
    ref.equipes[equipe].projetos.add(projeto);

    if (!ref.tiposEquipe[tipoEquipe]) {
      ref.tiposEquipe[tipoEquipe] = {
        tipoEquipe,
        producaoTotal: 0,
        quantidadeServicos: 0
      };
    }

    ref.tiposEquipe[tipoEquipe].producaoTotal += valor;
    ref.tiposEquipe[tipoEquipe].quantidadeServicos++;
  }

  return Object.values(meses).map(mes => {
    const equipes = Object.values(mes.equipes).map(eq => ({
      equipe: eq.equipe,
      tipoEquipe: eq.tipoEquipe,
      producaoTotal: Number(eq.producaoTotal.toFixed(2)),
      quantidadeServicos: eq.quantidadeServicos,
      quantidadeProjetos: eq.projetos.size,
      mediaPorServico: Number((eq.producaoTotal / eq.quantidadeServicos).toFixed(2)),
      mediaPorProjeto: Number((eq.producaoTotal / eq.projetos.size).toFixed(2))
    }));

    const tiposEquipe = Object.values(mes.tiposEquipe).map(tipo => ({
      tipoEquipe: tipo.tipoEquipe,
      producaoTotal: Number(tipo.producaoTotal.toFixed(2)),
      quantidadeServicos: tipo.quantidadeServicos,
      mediaPorServico: Number((tipo.producaoTotal / tipo.quantidadeServicos).toFixed(2))
    }));

    return {
      mes: mes.mes,

      cards: {
        producaoTotal: Number(mes.producaoTotal.toFixed(2)),
        mediaPorProjeto: Number((mes.producaoTotal / mes.projetos.size).toFixed(2)),
        mediaPorServico: Number((mes.producaoTotal / mes.quantidadeServicos).toFixed(2)),
        quantidadeServicos: mes.quantidadeServicos,
        quantidadeProjetos: mes.projetos.size,
        quantidadeEquipes: equipes.length
      },

      top10MaioresEquipes: equipes
        .sort((a, b) => b.producaoTotal - a.producaoTotal)
        .slice(0, 10),

      top10MenoresEquipes: equipes
        .filter(e => e.producaoTotal > 0)
        .sort((a, b) => a.producaoTotal - b.producaoTotal)
        .slice(0, 10),

      producaoPorTipoEquipe: tiposEquipe
        .sort((a, b) => b.producaoTotal - a.producaoTotal),

      rankingGeralEquipes: equipes
        .sort((a, b) => b.producaoTotal - a.producaoTotal)
    };
  });
}


module.exports = {
    redshift,
    gerarResumoBI
};