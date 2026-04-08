const express = require('express');
// Force Restart 2
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const path = require('path');
const pool = require('./config/db');
const cron = require('node-cron');

const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, SECRET_KEY } = require('./middleware/auth');
const setupCheck = require('./middleware/setupCheck');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Prevenir cache de páginas autenticadas (segurança)
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// Middleware de verificação de instalação
app.use(setupCheck);

app.use(express.static(path.join(__dirname, 'public')));

// Expor Socket.io para as rotas
app.set('io', io);

// Rota de Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) return res.status(401).json({ error: 'Usuário ou senha inválidos' });

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ error: 'Usuário ou senha inválidos' });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '8h' });

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 8 * 3600 * 1000, // 8 horas
            sameSite: 'lax',
            secure: false
        });
        res.json({ message: 'Login realizado', user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logout realizado' });
});

app.get('/api/me', authenticateToken, (req, res) => {
    res.json(req.user);
});

// Rotas
const sectorRoutes = require('./routes/sectors');
const ticketRoutes = require('./routes/tickets');
const settingsRoutes = require('./routes/settings');
const reportsRoutes = require('./routes/reports');
const usersRoutes = require('./routes/users');
const setupRoutes = require('./routes/setup');

app.use('/api/sectors', sectorRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/setup', setupRoutes);

// Rota de teste de conexão com o Banco
app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        res.json({ status: 'OK', message: 'Conectado ao MySQL!', db: rows[0].result });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
});

io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // Operador entra em um setor (para monitorar presença)
    socket.on('join-operator-sector', (sectorId) => {
        // Sai de setores anteriores se houver
        socket.rooms.forEach(room => {
            if (room.startsWith('operator-sector-')) {
                socket.leave(room);
            }
        });
        socket.join(`operator-sector-${sectorId}`);
        console.log(`Operador ${socket.id} entrou no setor ${sectorId}`);
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});

// CRON JOB: Zerar fila todo dia às 06:00 (Reset Suave para preservar histórico)
cron.schedule('0 6 * * *', async () => {
    const timestamp = new Date().toLocaleString('pt-BR');
    const logMessage = `[${timestamp}] Executando reinicialização automática (Soft Reset)...`;
    console.log(logMessage);

    try {
        // 1. Marcar data do reset em settings (para reiniciar contagem de senhas)
        await pool.query(
            'INSERT INTO settings (id, last_reset) VALUES (1, NOW()) ON DUPLICATE KEY UPDATE last_reset = NOW()'
        );

        // 2. Cancelar senhas ativas para limpar o painel público
        const [result] = await pool.query('UPDATE tickets SET status = "canceled" WHERE status IN ("pending", "calling", "in_service")');

        // 3. Registrar no log persistente
        const fs = require('fs');
        const logPath = path.join(__dirname, 'docs', 'reset_history.log');
        const fileLog = `[${timestamp}] SUCESSO: Contagem reiniciada. ${result.affectedRows} senhas ativas canceladas.\n`;
        fs.appendFileSync(logPath, fileLog);

        io.emit('queue_reset');
        console.log('✅ Fila reiniciada automaticamente com sucesso!');
    } catch (error) {
        const errorMsg = `❌ Erro ao zerar fila automaticamente: ${error.message}`;
        console.error(errorMsg);

        try {
            const fs = require('fs');
            const logPath = path.join(__dirname, 'docs', 'reset_history.log');
            fs.appendFileSync(logPath, `[${timestamp}] ERRO: ${error.message}\n`);
        } catch (logErr) {
            console.error('Erro ao gravar log de reset:', logErr);
        }
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});
