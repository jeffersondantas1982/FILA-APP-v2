const pool = require('./config/db');

async function populateHistory() {
    try {
        console.log('🔄 Populando histórico de atendimentos...\n');

        // Get sectors
        const [sectors] = await pool.query('SELECT id, prefix FROM sectors');
        if (sectors.length === 0) {
            console.log('❌ Nenhum setor encontrado. Crie setores primeiro.');
            process.exit(1);
        }

        // Get users
        const [users] = await pool.query('SELECT id FROM users LIMIT 3');
        if (users.length === 0) {
            console.log('❌ Nenhum usuário encontrado.');
            process.exit(1);
        }

        const statuses = ['completed', 'canceled', 'not_shown'];
        let totalInserted = 0;

        // Generate tickets for the last 7 days
        for (let daysAgo = 7; daysAgo >= 1; daysAgo--) {
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            const dateStr = date.toISOString().split('T')[0];

            console.log(`📅 Gerando dados para ${dateStr}...`);

            // Generate 20-40 tickets per day
            const ticketsPerDay = Math.floor(Math.random() * 20) + 20;

            for (let i = 0; i < ticketsPerDay; i++) {
                const sector = sectors[Math.floor(Math.random() * sectors.length)];
                const user = users[Math.floor(Math.random() * users.length)];
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                // Random time during business hours (8h-17h)
                const hour = Math.floor(Math.random() * 9) + 8;
                const minute = Math.floor(Math.random() * 60);
                const second = Math.floor(Math.random() * 60);

                const createdAt = `${dateStr} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;

                // Ticket number
                const ticketNumber = `${sector.prefix}${(i + 1).toString().padStart(2, '0')}`;

                // Random wait time (1-45 min)
                const waitMinutes = Math.floor(Math.random() * 45) + 1;
                const startedAt = new Date(new Date(createdAt).getTime() + waitMinutes * 60000);

                // Random service time (5-30 min)
                const serviceMinutes = Math.floor(Math.random() * 25) + 5;
                const completedAt = new Date(startedAt.getTime() + serviceMinutes * 60000);

                await pool.query(`
                    INSERT INTO tickets (number, sector_id, status, created_by, attended_by, created_at, started_at, completed_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    ticketNumber,
                    sector.id,
                    status,
                    user.id,
                    user.id,
                    createdAt,
                    status === 'completed' ? startedAt : null,
                    status === 'completed' ? completedAt : null,
                    status === 'completed' ? completedAt : createdAt
                ]);

                totalInserted++;
            }

            console.log(`   ✅ ${ticketsPerDay} senhas inseridas`);
        }

        console.log(`\n✨ Concluído! Total de ${totalInserted} senhas históricas criadas.`);
        console.log('📊 Agora você pode testar os filtros semanais/mensais no Dashboard!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

populateHistory();
