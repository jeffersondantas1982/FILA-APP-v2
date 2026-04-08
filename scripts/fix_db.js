const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function fixDB() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        console.log('Adicionando coluna print_enabled...');
        try {
            await connection.query("ALTER TABLE settings ADD COLUMN print_enabled TINYINT(1) DEFAULT 0 AFTER logo_url");
            console.log('Coluna adicionada com sucesso.');
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAME') {
                console.log('Coluna já existe.');
            } else {
                throw e;
            }
        }

        await connection.end();
    } catch (error) {
        console.error('Erro:', error.message);
        if (connection) await connection.end();
    }
}

fixDB();
