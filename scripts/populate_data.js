const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'fila_app'
};

async function populate() {
    try {
        const pool = mysql.createPool(dbConfig);
        console.log("Conectado ao banco de dados.");

        // 1. Obter IDs
        const [sectors] = await pool.query('SELECT id FROM sectors');
        const [users] = await pool.query('SELECT id FROM users');

        if (sectors.length === 0 || users.length === 0) {
            console.error("Necessário ter setores e usuários.");
            process.exit(1);
        }

        const sectorIds = sectors.map(s => s.id);
        const userIds = users.map(u => u.id);

        // 2. Gerar Tickets Diversos
        const ticketsToCreate = 100;
        console.log(`Gerando ${ticketsToCreate} tickets variados...`);

        for (let i = 0; i < ticketsToCreate; i++) {
            // Data aleatória (70% hoje, 30% últimos 7 dias)
            const isToday = Math.random() > 0.3;
            const date = new Date();
            if (!isToday) date.setDate(date.getDate() - Math.floor(Math.random() * 7));

            // Horário comercial (08 - 18)
            const hour = 8 + Math.floor(Math.random() * 11);
            date.setHours(hour, Math.floor(Math.random() * 60), 0);

            const createdAt = new Date(date);
            const sectorId = sectorIds[Math.floor(Math.random() * sectorIds.length)];
            const userId = userIds[Math.floor(Math.random() * userIds.length)];
            const number = `P${1000 + i}`;

            // Determinar Status aleatório
            const rand = Math.random();
            let status = 'completed';
            if (rand > 0.7 && rand <= 0.85) status = 'canceled';
            if (rand > 0.85) status = 'not_shown';

            // Tempos
            const waitTime = Math.floor(Math.random() * 60);
            const serviceTime = Math.floor(Math.random() * 30);

            const startedAt = new Date(createdAt.getTime() + waitTime * 60000);
            const completedAt = status === 'completed' ? new Date(startedAt.getTime() + serviceTime * 60000) : null;

            await pool.query(
                `INSERT INTO tickets (number, sector_id, status, created_at, started_at, completed_at, attended_by) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [number, sectorId, status, createdAt, startedAt, completedAt, userId]
            );
        }

        console.log("✅ Dados populados!");
        process.exit(0);

    } catch (error) {
        console.error("Erro:", error);
        process.exit(1);
    }
}

populate();
