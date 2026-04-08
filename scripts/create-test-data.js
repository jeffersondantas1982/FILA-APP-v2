const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTestData() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: 'fila_app'
        });

        console.log('=== CRIANDO DADOS DE TESTE PARA DASHBOARD ===\n');

        // Buscar setores e usuários
        const [sectors] = await connection.query('SELECT id FROM sectors LIMIT 3');
        const [users] = await connection.query('SELECT id FROM users WHERE role IN ("OPERADOR", "GERENTE") LIMIT 2');

        if (sectors.length === 0 || users.length === 0) {
            console.log('❌ Não há setores ou usuários suficientes');
            return;
        }

        const sectorId = sectors[0].id;
        const userId = users[0].id;

        // Criar 10 tickets completos com timestamps
        for (let i = 1; i <= 10; i++) {
            const createdAt = new Date(Date.now() - (60 * 60 * 1000 * i)); // i horas atrás
            const startedAt = new Date(createdAt.getTime() + (5 * 60 * 1000)); // 5 min depois
            const completedAt = new Date(startedAt.getTime() + (10 * 60 * 1000)); // 10 min depois

            await connection.query(`
                INSERT INTO tickets (number, sector_id, status, created_at, started_at, completed_at, created_by, attended_by)
                VALUES (?, ?, 'completed', ?, ?, ?, ?, ?)
            `, [`T${100 + i}`, sectorId, createdAt, startedAt, completedAt, userId, userId]);
        }

        console.log('✅ 10 tickets de teste criados com sucesso!');
        console.log('   - Status: completed');
        console.log('   - Com timestamps (created_at, started_at, completed_at)');
        console.log('   - Tempo de espera: ~5 min');
        console.log('   - Tempo de atendimento: ~10 min');

    } catch (error) {
        console.error('ERRO:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

createTestData();
