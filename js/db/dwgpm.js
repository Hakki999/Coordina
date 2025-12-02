const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Cria a instância do cliente
const gpmClient = new Client({
    host: process.env.GPM_URL,
    port: process.env.GPM_PORT,
    user: process.env.GPM_USER,
    password: process.env.GPM_PASSWORD,
    database: process.env.GPM_DATABASE,
    ssl: true
});

// Variável para controlar o estado da conexão
let isConnected = false;
let connectionPromise = null;

// Função para conectar (será chamada apenas uma vez)
async function connectGPM() {
    if (isConnected) {
        console.log('✅ Already connected to GPM database');
        return;
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    connectionPromise = (async () => {
        try {
            await gpmClient.connect();
            isConnected = true;
            console.log('✅ Connected to GPM database successfully.');
            
            // Listeners para eventos de conexão
            gpmClient.on('error', (err) => {
                console.error('❌ Database connection error:', err);
                isConnected = false;
                connectionPromise = null;
            });

            gpmClient.on('end', () => {
                console.log('🔌 Database connection ended');
                isConnected = false;
                connectionPromise = null;
            });

        } catch (err) {
            console.error('❌ Error connecting to GPM database:', err);
            isConnected = false;
            connectionPromise = null;
            throw err;
        }
    })();

    return connectionPromise;
}

// Função para fechar a conexão (apenas quando necessário)
async function closeGPM() {
    try {
        if (isConnected) {
            await gpmClient.end();
            isConnected = false;
            connectionPromise = null;
            console.log('✅ Disconnected from GPM database successfully.');
        }
    } catch (err) {
        console.error('❌ Error disconnecting from GPM database:', err);
    }
}

// Função para verificar e garantir a conexão
async function ensureConnection() {
    if (!isConnected) {
        await connectGPM();
    }
    
    // Verifica se a conexão ainda está ativa
    try {
        await gpmClient.query('SELECT 1');
    } catch (err) {
        console.log('🔄 Connection lost, reconnecting...');
        isConnected = false;
        connectionPromise = null;
        await connectGPM();
    }
}

// Função principal de busca
async function gpmSearch(params) {
    const { table, filters } = params;

    if (!table || !filters || typeof filters !== "object") {
        throw new Error("Parâmetros inválidos: 'table' e 'filters' são obrigatórios.");
    }

    const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

    // Valida nome da tabela
    if (!identifierRegex.test(table)) {
        throw new Error("Nome da tabela inválido");
    }

    // Prepara arrays para SQL e valores
    const whereClauses = [];
    const values = [];
    let index = 1;

    for (const field in filters) {
        if (!identifierRegex.test(field)) {
            throw new Error(`Nome de campo inválido: ${field}`);
        }

        whereClauses.push(`${field} = $${index}`);
        values.push(filters[field]);
        index++;
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    try {
        // Garante que a conexão está ativa antes de executar a query
        await ensureConnection();

        const sql = `SELECT * FROM ${table} ${whereSQL};`;
        const result = await gpmClient.query(sql, values);
        return result.rows;
    } catch (error) {
        console.error("❌ Erro na consulta:", error);
        throw new Error(`Falha na busca: ${error.message}`);
    }
    // NÃO fechamos a conexão aqui - ela permanece aberta para próxima requisição
}

// Função para verificar o status da conexão
function getConnectionStatus() {
    return {
        isConnected,
        connectionPromise: !!connectionPromise
    };
}

// Conecta automaticamente quando o módulo é carregado
connectGPM().catch(err => {
    console.error('❌ Failed to establish initial connection:', err);
});

module.exports = { 
    gpmSearch, 
    connectGPM, 
    closeGPM,
    getConnectionStatus 
};