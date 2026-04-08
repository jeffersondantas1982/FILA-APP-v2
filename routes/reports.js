const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Middleware: Gerentes e Super Admins podem acessar relatórios
router.use(authenticateToken, authorizeRole(['GERENTE', 'SUPER_ADMIN']));

router.get('/advanced', async (req, res) => {
    try {
        const { period } = req.query; // daily, weekly, monthly, yearly

        let dateFilter = '1=1';
        if (period === 'daily') dateFilter = 't.created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)';
        if (period === 'weekly') dateFilter = 't.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
        if (period === 'biweekly') dateFilter = 't.created_at >= DATE_SUB(NOW(), INTERVAL 2 WEEK)';
        if (period === 'monthly') dateFilter = 't.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
        if (period === 'yearly') dateFilter = 't.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';

        // Contagem Fila Atual (Independente do filtro de data)
        const [waitingData] = await pool.query('SELECT COUNT(*) as current_waiting FROM tickets WHERE status = "pending"');
        const current_waiting = waitingData[0].current_waiting;

        // Médias Gerais
        const [general] = await pool.query(`
            SELECT 
                COUNT(*) as total_tickets,
                AVG(TIMESTAMPDIFF(MINUTE, t.created_at, t.started_at)) as avg_wait_time,
                AVG(TIMESTAMPDIFF(MINUTE, t.started_at, t.completed_at)) as avg_service_time
            FROM tickets t
            WHERE t.status = 'completed' AND ${dateFilter}
        `);

        // Por Setor
        const [bySector] = await pool.query(`
            SELECT 
                s.name as sector_name,
                COUNT(*) as count,
                AVG(TIMESTAMPDIFF(MINUTE, t.created_at, t.started_at)) as avg_wait,
                AVG(TIMESTAMPDIFF(MINUTE, t.started_at, t.completed_at)) as avg_service
            FROM tickets t
            JOIN sectors s ON t.sector_id = s.id
            WHERE t.status = 'completed' AND ${dateFilter}
            GROUP BY s.id
        `);

        // Por Usuário (Produtividade)
        const [byUser] = await pool.query(`
            SELECT 
                u.username,
                COUNT(*) as count,
                AVG(TIMESTAMPDIFF(MINUTE, t.started_at, t.completed_at)) as avg_service
            FROM tickets t
            JOIN users u ON t.attended_by = u.id
            WHERE t.status = 'completed' AND ${dateFilter}
            GROUP BY u.id
        `);

        // 5. Fluxo por Horário (Hourly Flow)
        const [hourlyFlow] = await pool.query(`
            SELECT HOUR(created_at) as hour, COUNT(*) as count 
            FROM tickets t 
            WHERE ${dateFilter}
            GROUP BY hour
            ORDER BY hour
        `);

        // 6. Distribuição de Paciência (Wait Time Distribution)
        const [waitDistribution] = await pool.query(`
            SELECT 
                CASE 
                    WHEN TIMESTAMPDIFF(MINUTE, created_at, started_at) <= 15 THEN 'Rápido (<15m)'
                    WHEN TIMESTAMPDIFF(MINUTE, created_at, started_at) <= 45 THEN 'Médio (15-45m)'
                    ELSE 'Crítico (>45m)'
                END as category,
                COUNT(*) as count
            FROM tickets t
            WHERE t.status = 'completed' AND ${dateFilter}
            GROUP BY category
        `);

        // 7. Taxa de Desistência
        const [abandonment] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status IN ('canceled', 'not_shown') THEN 1 ELSE 0 END) as abandoned
            FROM tickets t
            WHERE ${dateFilter}
        `);

        // 8. Ranking de Agilidade (< 15 min de atendimento)
        const [agility] = await pool.query(`
            SELECT 
                u.username,
                COUNT(*) as fast_tickets
            FROM tickets t
            JOIN users u ON t.attended_by = u.id
            WHERE t.status = 'completed' 
            AND TIMESTAMPDIFF(MINUTE, t.started_at, t.completed_at) <= 15
            AND ${dateFilter}
            GROUP BY u.id
            ORDER BY fast_tickets DESC
            LIMIT 5
        `);

        // 9. Distribuição por Tipo (Normal vs Priority)
        const [byType] = await pool.query(`
            SELECT type, COUNT(*) as count 
            FROM tickets t 
            WHERE ${dateFilter}
            GROUP BY type
        `);

        res.json({
            general: { ...general[0], current_waiting },
            bySector,
            byUser,
            byType, // Nova estatística
            hourlyFlow,
            waitDistribution,
            abandonment: abandonment[0],
            agility
        });

    } catch (error) {
        require('fs').writeFileSync('error_log.txt', `[${new Date().toISOString()}] ${error.message}\n${error.stack}\n`, { flag: 'a' });
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
