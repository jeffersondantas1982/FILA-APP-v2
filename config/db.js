const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

/**
 * Cria o pool de conexão apenas quando necessário.
 * Isso evita erros de "Access denied" durante a fase de instalação (Wizard).
 */
function getPool() {
    // Só retornamos o pool cacheado se ele já tiver sido inicializado com sucesso
    if (pool) return pool;

    // Se o arquivo .env não existir ou DB_NAME não estiver definido, 
    // retornamos um mock/objeto temporário que não será cacheado em 'pool'.
    if (!process.env.DB_NAME) {
        return {
            query: () => { throw new Error('O sistema não está configurado. Complete a instalação via /install.html.'); },
            execute: () => { throw new Error('O sistema não está configurado. Complete a instalação via /install.html.'); },
            getConnection: () => { throw new Error('O sistema não está configurado. Complete a instalação via /install.html.'); }
        };
    }

    pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
        queueLimit: 0
    });

    console.log('[DB] Pool de conexões MySQL iniciado com sucesso.');
    return pool;
}

// Exportamos um Proxy que invoca getPool() em qualquer acesso a propriedade
module.exports = new Proxy({}, {
    get: (target, prop) => {
        return getPool()[prop];
    }
});
