const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkData() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: 'fila_app'
        });

        console.log('=== VERIFICANDO DADOS PARA DASHBOARD ===\n');

        // Total de tickets
        const [total] = await connection.query('SELECT COUNT(*) as total FROM tickets');
        console.log('Total de tickets:', total[0].total);

        // Tickets completos
        const [completed] = await connection.query('SELECT COUNT(*) as total FROM tickets WHERE status = "completed"');
        console.log('Tickets completos:', completed[0].total);

        // Tickets com timestamps
        const [withTime] = await connection.query('SELECT COUNT(*) as total FROM tickets WHERE started_at IS NOT NULL AND completed_at IS NOT NULL');
        console.log('Tickets com timestamps:', withTime[0].total);

        // Amostra de tickets
        console.log('\n=== AMOSTRA DE TICKETS ===');
        const [sample] = await connection.query('SELECT id, number, status, created_at, started_at, completed_at FROM tickets LIMIT 5');
        console.table(sample);

    } catch (error) {
        console.error('ERRO:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

checkData();
