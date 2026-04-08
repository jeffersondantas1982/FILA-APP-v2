const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkDB() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        console.log('--- Colunas da tabela settings ---');
        const [columns] = await connection.query('SHOW COLUMNS FROM settings');
        console.table(columns);

        console.log('\n--- Dados da tabela settings ---');
        const [rows] = await connection.query('SELECT * FROM settings LIMIT 1');
        console.log(rows[0]);

        await connection.end();
    } catch (error) {
        console.error('Erro:', error.message);
        if (connection) await connection.end();
    }
}

checkDB();
