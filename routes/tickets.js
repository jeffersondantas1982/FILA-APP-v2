const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth'); // Importar middleware

// Migração em tempo de execução para a tabela tickets
(async () => {
    try {
        const [cols] = await pool.query("SHOW COLUMNS FROM tickets");
        const colNames = cols.map(c => c.Field);

        if (!colNames.includes('type')) {
            await pool.query("ALTER TABLE tickets ADD COLUMN type ENUM('normal', 'priority') DEFAULT 'normal' AFTER sector_id");
        }
        if (!colNames.includes('patient_name')) {
            await pool.query("ALTER TABLE tickets ADD COLUMN patient_name VARCHAR(255) NULL AFTER sector_id");
            console.log('[Migration] Coluna "patient_name" adicionada a tabela tickets.');
        }
        if (!colNames.includes('created_by')) {
            await pool.query("ALTER TABLE tickets ADD COLUMN created_by INT, ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL");
        }
        if (!colNames.includes('attended_by')) {
            await pool.query("ALTER TABLE tickets ADD COLUMN attended_by INT, ADD FOREIGN KEY (attended_by) REFERENCES users(id) ON DELETE SET NULL");
        }
        if (!colNames.includes('started_at')) {
            await pool.query("ALTER TABLE tickets ADD COLUMN started_at TIMESTAMP NULL");
        }
        if (!colNames.includes('completed_at')) {
            await pool.query("ALTER TABLE tickets ADD COLUMN completed_at TIMESTAMP NULL");
        }
    } catch (e) { /* Tabela pode não existir no setup */ }
})();

// Helper to get Last Reset Time
async function getLastResetTime() {
    const [rows] = await pool.query('SELECT last_reset FROM settings WHERE id = 1');
    return rows[0]?.last_reset || new Date(0); // Default to epoch if null
}

// Rota para emitir uma nova senha (Autenticado)
router.post('/', authenticateToken, async (req, res) => {
    const { number, sector_id, type, patient_name } = req.body;
    if (!number || !sector_id) return res.status(400).json({ error: 'Número e Setor são obrigatórios' });

    try {
        const [result] = await pool.query(
            'INSERT INTO tickets (number, sector_id, type, status, created_by, patient_name) VALUES (?, ?, ?, ?, ?, ?)',
            [number, sector_id, type || 'normal', 'pending', req.user.id, patient_name || null]
        );

        const [rows] = await pool.query(
            'SELECT t.*, s.name as sector_name FROM tickets t JOIN sectors s ON t.sector_id = s.id WHERE t.id = ?',
            [result.insertId]
        );

        const io = req.app.get('io');
        if (io) io.emit('new_ticket', rows[0]);

        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ... (existing GET routes) ...

// Obter sugestão de próxima senha
router.get('/next/:sectorId', async (req, res) => {
    try {
        const { type } = req.query; // normal ou priority
        const [sector] = await pool.query('SELECT prefix FROM sectors WHERE id = ?', [req.params.sectorId]);
        if (sector.length === 0) return res.status(404).json({ error: 'Setor não encontrado' });

        const prefix = sector[0].prefix;
        const lastReset = await getLastResetTime();

        // Count only tickets of the SAME TYPE AFTER last reset
        const [lastTicket] = await pool.query(
            'SELECT number FROM tickets WHERE sector_id = ? AND type = ? AND created_at > ? ORDER BY id DESC LIMIT 1',
            [req.params.sectorId, type || 'normal', lastReset]
        );

        let nextNumber = 1;
        if (lastTicket.length > 0) {
            const lastNumberStr = lastTicket[0].number.replace(/\D/g, '');
            const lastNum = parseInt(lastNumberStr) || 0;
            nextNumber = (lastNum % 100) + 1;
        }

        // Se for prioridade, adicionamos um 'P' ao final para distinção visual clara
        const suffix = type === 'priority' ? 'P' : '';
        const formattedNumber = `${prefix}${nextNumber.toString().padStart(2, '0')}${suffix}`;
        res.json({ nextNumber: formattedNumber });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ... (other routes) ...

// Zerar Fila (Soft Reset - Reinicia contagem, mantém histórico)
router.post('/reset', authenticateToken, async (req, res) => {
    try {
        // 1. Marcar data do reset
        await pool.query(
            'INSERT INTO settings (id, last_reset) VALUES (1, NOW()) ON DUPLICATE KEY UPDATE last_reset = NOW()'
        );

        // 2. Cancelar/Concluir senhas ativas para limpar painel
        await pool.query('UPDATE tickets SET status = "canceled" WHERE status IN ("pending", "calling", "in_service")');

        const io = req.app.get('io');
        if (io) io.emit('queue_reset');

        res.json({ message: 'Fila Reiniciada (Contagem resetada, Histórico salvo)' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/pending/:sectorId', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM tickets WHERE sector_id = ? AND status = "pending" ORDER BY created_at ASC',
            [req.params.sectorId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Listar TODAS as senhas ativas de um setor (Pending + Calling + In Service) - Usado pelo Operador
router.get('/sector/:sectorId', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM tickets WHERE sector_id = ? AND status IN ("pending", "calling", "in_service") ORDER BY created_at ASC',
            [req.params.sectorId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Chamar o PRÓXIMO da fila (Autenticado - Auditoria)
router.post('/call-next', authenticateToken, async (req, res) => {
    const { sector_id } = req.body;
    if (!sector_id) return res.status(400).json({ error: 'Setor é obrigatório' });

    try {
        // Encontrar a próxima senha (Prioritária primeiro, depois Normal)
        const [nextTickets] = await pool.query(
            `SELECT id FROM tickets 
             WHERE sector_id = ? AND status = "pending" 
             ORDER BY type = 'priority' DESC, created_at ASC LIMIT 1`,
            [sector_id]
        );

        if (nextTickets.length === 0) {
            return res.status(404).json({ error: 'Nenhuma senha aguardando neste setor' });
        }

        const ticket_id = nextTickets[0].id;

        // Atualizar status
        await pool.query('UPDATE tickets SET status = "calling", attended_by = ? WHERE id = ?', [req.user.id, ticket_id]);

        // Obter dados completos para o evento
        const [rows] = await pool.query(
            'SELECT t.*, s.name as sector_name, s.room as sector_room FROM tickets t JOIN sectors s ON t.sector_id = s.id WHERE t.id = ?',
            [ticket_id]
        );

        // Emitir evento
        const io = req.app.get('io');
        if (io) {
            console.log(`[SOCKET] Emitting ticket_called for ticket ${ticket_id}`, rows[0]);
            io.emit('ticket_called', rows[0]);
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('[Call Next Error]', error);
        res.status(500).json({ error: error.message });
    }
});

// Chamar senha ESPECÍFICA (Autenticado - Auditoria)
router.post('/call', authenticateToken, async (req, res) => {
    const { ticket_id } = req.body;
    try {
        await pool.query('UPDATE tickets SET status = "calling", attended_by = ? WHERE id = ?', [req.user.id, ticket_id]);
        const [rows] = await pool.query(
            'SELECT t.*, s.name as sector_name, s.room as sector_room FROM tickets t JOIN sectors s ON t.sector_id = s.id WHERE t.id = ?',
            [ticket_id]
        );

        const io = req.app.get('io');
        if (io) {
            console.log(`[SOCKET] Emitting ticket_called for ticket ${ticket_id}`, rows[0]);
            io.emit('ticket_called', rows[0]);
        } else {
            console.error('[SOCKET] IO instance not found in req.app');
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('[Req Call Error]', error);
        res.status(500).json({ error: error.message });
    }
});

// Iniciar atendimento (Autenticado - Auditoria)
router.post('/start', authenticateToken, async (req, res) => {
    const { ticket_id } = req.body;
    try {
        await pool.query('UPDATE tickets SET status = "in_service", attended_by = ?, started_at = NOW() WHERE id = ?', [req.user.id, ticket_id]);

        const [rows] = await pool.query(
            'SELECT t.*, s.name as sector_name, s.room as sector_room FROM tickets t JOIN sectors s ON t.sector_id = s.id WHERE t.id = ?',
            [ticket_id]
        );

        const io = req.app.get('io');
        if (io) io.emit('ticket_started', rows[0]);

        res.json({ message: 'Atendimento iniciado', ticket: rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Concluir atendimento (Autenticado - Auditoria)
router.post('/complete', authenticateToken, async (req, res) => {
    const { ticket_id } = req.body;
    try {
        await pool.query('UPDATE tickets SET status = "completed", attended_by = ?, completed_at = NOW() WHERE id = ?', [req.user.id, ticket_id]);

        const io = req.app.get('io');
        if (io) io.emit('ticket_completed', { id: ticket_id });

        res.json({ message: 'Atendimento concluído' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Redirecionar senha (Autenticado)
router.post('/redirect', authenticateToken, async (req, res) => {
    const { ticket_id, new_sector_id } = req.body;
    try {
        await pool.query('UPDATE tickets SET sector_id = ?, status = "pending" WHERE id = ?', [new_sector_id, ticket_id]);
        res.json({ message: 'Senha redirecionada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obter relatório de atendimentos
router.get('/report/list', authenticateToken, async (req, res) => {
    try {
        const { start, end, sector, status, type } = req.query;

        let query = `
            SELECT t.number, t.type, s.name as sector_name, t.status, t.created_at, t.updated_at, u.username as attendant_name
            FROM tickets t 
            JOIN sectors s ON t.sector_id = s.id 
            LEFT JOIN users u ON t.attended_by = u.id
            WHERE 1=1
        `;

        const params = [];

        if (start) {
            query += ' AND t.created_at >= ?';
            params.push(`${start} 00:00:00`);
        }
        if (end) {
            query += ' AND t.created_at <= ?';
            params.push(`${end} 23:59:59`);
        }
        if (sector) {
            query += ' AND t.sector_id = ?';
            params.push(sector);
        }
        if (status) {
            query += ' AND t.status = ?';
            params.push(status);
        }
        if (type) {
            query += ' AND t.type = ?';
            params.push(type);
        }

        query += ' ORDER BY t.updated_at DESC';

        // Log para debug
        console.log('[REPORT] Query:', query.replace(/\s+/g, ' ').trim());
        console.log('[REPORT] Params:', params);

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('[REPORT ERROR]', error);
        res.status(500).json({ error: error.message });
    }
});

// Chamar novamente (Recall) - Autenticado
router.post('/recall', authenticateToken, async (req, res) => {
    const { ticket_id } = req.body;
    try {
        const [rows] = await pool.query(
            'SELECT t.*, s.name as sector_name, s.room as sector_room FROM tickets t JOIN sectors s ON t.sector_id = s.id WHERE t.id = ?',
            [ticket_id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Senha não encontrada' });

        const io = req.app.get('io');
        if (io) io.emit('ticket_called', rows[0]);

        res.json({ message: 'Chamada repetida com sucesso', ticket: rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cancelar senha - Autenticado
router.post('/cancel', authenticateToken, async (req, res) => {
    const { ticket_id } = req.body;
    try {
        await pool.query('UPDATE tickets SET status = "canceled", attended_by = ? WHERE id = ?', [req.user.id, ticket_id]);
        res.json({ message: 'Senha cancelada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Atendimento não compareceu - Autenticado
router.post('/not-shown', authenticateToken, async (req, res) => {
    const { ticket_id } = req.body;
    try {
        await pool.query('UPDATE tickets SET status = "not_shown", attended_by = ? WHERE id = ?', [req.user.id, ticket_id]);
        res.json({ message: 'Paciente marcado como não compareceu' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reativar senha - Autenticado
router.post('/reactivate', authenticateToken, async (req, res) => {
    const { ticket_id } = req.body;
    try {
        await pool.query('UPDATE tickets SET status = "pending" WHERE id = ?', [ticket_id]);
        res.json({ message: 'Senha reativada e enviada para a fila' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Gerar lote de 10 senhas - Autenticado
router.post('/batch', authenticateToken, async (req, res) => {
    const { sector_id, count } = req.body;
    const numToGenerate = count || 10;

    try {
        const [sector] = await pool.query('SELECT prefix FROM sectors WHERE id = ?', [sector_id]);
        if (sector.length === 0) return res.status(404).json({ error: 'Setor não encontrado' });
        const prefix = sector[0].prefix;

        const tickets = [];
        for (let i = 0; i < numToGenerate; i++) {
            const [lastTicket] = await pool.query(
                'SELECT number FROM tickets WHERE sector_id = ? ORDER BY id DESC LIMIT 1',
                [sector_id]
            );

            let nextNumber = 1;
            if (lastTicket.length > 0) {
                const lastNumberStr = lastTicket[0].number.replace(/\D/g, '');
                const lastNum = parseInt(lastNumberStr) || 0;
                nextNumber = (lastNum % 100) + 1;
            }

            const formattedNumber = `${prefix}${nextNumber.toString().padStart(2, '0')}`;
            const [result] = await pool.query(
                'INSERT INTO tickets (number, sector_id, status, created_by) VALUES (?, ?, ?, ?)',
                [formattedNumber, sector_id, 'pending', req.user.id]
            );

            tickets.push({ id: result.insertId, number: formattedNumber });
        }

        const io = req.app.get('io');
        if (io) io.emit('batch_created', { sector_id, tickets });

        res.status(201).json({ message: `${numToGenerate} senhas geradas`, tickets });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Histórico recente (Read-only) - Autenticado
router.get('/history/:sectorId', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM tickets WHERE sector_id = ? AND status IN ("completed", "canceled", "not_shown", "redirected") ORDER BY updated_at DESC LIMIT 10',
            [req.params.sectorId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Stats (Read-only)
router.get('/stats', async (req, res) => {
    try {
        const [waiting] = await pool.query('SELECT sector_id, COUNT(*) as count FROM tickets WHERE status = "pending" GROUP BY sector_id');
        const [completed] = await pool.query('SELECT sector_id, COUNT(*) as count FROM tickets WHERE status = "completed" GROUP BY sector_id');
        const [active] = await pool.query('SELECT sector_id, COUNT(*) as count, GROUP_CONCAT(number ORDER BY updated_at DESC SEPARATOR ", ") as tickets FROM tickets WHERE status IN ("calling", "in_service") GROUP BY sector_id');

        const io = req.app.get('io');
        const stats = {};

        const addStat = (id, type, val) => {
            if (!stats[id]) {
                // Check if any operator is in the room for this sector
                const roomName = `operator-sector-${id}`;
                const hasOperator = io.sockets.adapter.rooms.get(roomName)?.size > 0;
                stats[id] = { waiting: 0, completed: 0, active: 0, current: '--', has_operator: hasOperator };
            }
            stats[id][type] = val;
        };

        // Initialize all sectors that have waiting, completed or active tickets
        waiting.forEach(row => addStat(row.sector_id, 'waiting', row.count));
        completed.forEach(row => addStat(row.sector_id, 'completed', row.count));
        active.forEach(row => {
            addStat(row.sector_id, 'active', row.count);
            const numbers = row.tickets.split(', ');
            addStat(row.sector_id, 'current', numbers[0]);
        });

        // Also ensure sectors with operators but NO tickets are included
        if (io) {
            const rooms = io.sockets.adapter.rooms;
            rooms.forEach((members, roomName) => {
                if (roomName.startsWith('operator-sector-') && members.size > 0) {
                    const sectorId = roomName.replace('operator-sector-', '');
                    if (!stats[sectorId]) {
                        stats[sectorId] = { waiting: 0, completed: 0, active: 0, current: '--', has_operator: true };
                    } else {
                        stats[sectorId].has_operator = true;
                    }
                }
            });
        }

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/stats/:sectorId', async (req, res) => {
    try {
        const [waiting] = await pool.query('SELECT COUNT(*) as count FROM tickets WHERE sector_id = ? AND status = "pending"', [req.params.sectorId]);
        const [completed] = await pool.query('SELECT COUNT(*) as count FROM tickets WHERE sector_id = ? AND status = "completed"', [req.params.sectorId]);
        const [active] = await pool.query('SELECT number FROM tickets WHERE sector_id = ? AND status IN ("calling", "in_service") ORDER BY updated_at DESC LIMIT 1', [req.params.sectorId]);

        res.json({
            waiting: waiting[0].count,
            completed: completed[0].count,
            current: active.length > 0 ? active[0].number : '--'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Active tickets (Panel)
router.get('/active', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT t.*, s.name as sector_name, s.room as sector_room 
            FROM tickets t 
            JOIN sectors s ON t.sector_id = s.id 
            WHERE t.status = "in_service"
            ORDER BY t.updated_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Load Demo Data (SUPER_ADMIN only)
router.post('/load-demo', authenticateToken, async (req, res) => {
    try {
        // Check if user is SUPER_ADMIN
        if (req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Acesso negado: Apenas Super Admin' });
        }

        const bcrypt = require('bcryptjs');
        let summary = {
            users: 0,
            tickets: 0
        };

        // 1. Create Demo Users (if they don't exist)
        const demoUsers = [
            { username: 'admin', password: 'admin123', role: 'SUPER_ADMIN' },
            { username: 'gerente', password: 'gerente123', role: 'GERENTE' },
            { username: 'operador1', password: 'op123', role: 'OPERADOR' },
            { username: 'operador2', password: 'op123', role: 'OPERADOR' },
            { username: 'operador3', password: 'op123', role: 'OPERADOR' }
        ];

        for (const user of demoUsers) {
            try {
                const password_hash = await bcrypt.hash(user.password, 10);
                await pool.query(
                    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
                    [user.username, password_hash, user.role]
                );
                summary.users++;
            } catch (error) {
                // Ignore duplicate entry errors (user already exists)
                if (error.code !== 'ER_DUP_ENTRY') {
                    throw error;
                }
            }
        }

        // 2. Get sectors
        const [sectors] = await pool.query('SELECT id, prefix FROM sectors');
        if (sectors.length === 0) {
            return res.status(400).json({ error: 'Crie setores primeiro' });
        }

        // 3. Get users for ticket assignment
        const [users] = await pool.query('SELECT id FROM users WHERE role IN ("OPERADOR", "GERENTE") LIMIT 5');
        if (users.length === 0) {
            return res.status(400).json({ error: 'Nenhum operador encontrado' });
        }

        const statuses = ['completed', 'canceled', 'not_shown'];

        // 4. Generate tickets for the last 7 days
        for (let daysAgo = 7; daysAgo >= 1; daysAgo--) {
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            const dateStr = date.toISOString().split('T')[0];

            const ticketsPerDay = Math.floor(Math.random() * 20) + 20;

            for (let i = 0; i < ticketsPerDay; i++) {
                const sector = sectors[Math.floor(Math.random() * sectors.length)];
                const user = users[Math.floor(Math.random() * users.length)];
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                const hour = Math.floor(Math.random() * 9) + 8;
                const minute = Math.floor(Math.random() * 60);
                const second = Math.floor(Math.random() * 60);

                const createdAt = `${dateStr} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
                const ticketNumber = `${sector.prefix}${(i + 1).toString().padStart(2, '0')}`;

                const waitMinutes = Math.floor(Math.random() * 45) + 1;
                const startedAt = new Date(new Date(createdAt).getTime() + waitMinutes * 60000);

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

                summary.tickets++;
            }
        }

        res.json({
            message: 'Dados demo carregados',
            users: summary.users,
            tickets: summary.tickets
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Full Reset - Delete ALL tickets (SUPER_ADMIN only)
router.post('/full-reset', authenticateToken, async (req, res) => {
    try {
        console.log('[Full Reset] Iniciando limpeza total do sistema por:', req.user.username);

        // Check if user is SUPER_ADMIN
        if (req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Acesso negado: Apenas Super Admin' });
        }

        // 1. Limpar tickets (Critical)
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        await pool.query('DELETE FROM tickets');
        console.log('[Full Reset] Senhas removidas.');

        // 2. Resetar Auto-incremento (Non-critical)
        try {
            await pool.query('ALTER TABLE tickets AUTO_INCREMENT = 1');
            console.log('[Full Reset] Auto-incremento resetado.');
        } catch (e) { console.warn('[Full Reset] Aviso ao resetar auto-incremento:', e.message); }

        await pool.query('SET FOREIGN_KEY_CHECKS = 1');

        // 3. Resetar timestamp de reset (Non-critical)
        try {
            await pool.query('UPDATE settings SET last_reset = NULL WHERE id = 1');
            console.log('[Full Reset] Timestamp de reset limpo.');
        } catch (e) { console.warn('[Full Reset] Aviso ao limpar last_reset:', e.message); }

        const io = req.app.get('io');
        if (io) io.emit('queue_reset');

        res.json({ success: true, message: 'Sistema completamente zerado' });
    } catch (error) {
        console.error('[Full Reset ERROR]', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
