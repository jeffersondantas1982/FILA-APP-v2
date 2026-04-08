const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Middleware: Apenas SUPER_ADMIN pode gerenciar usuários
router.use(authenticateToken, authorizeRole(['SUPER_ADMIN']));

// Listar todos os usuários
router.get('/', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Criar novo usuário
router.post('/', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        const validRoles = ['SUPER_ADMIN', 'GERENTE', 'OPERADOR', 'PORTEIRO', 'RECEPCIONISTA'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Perfil inválido' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
            [username, password_hash, role]
        );

        res.json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Nome de usuário já existe' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Atualizar usuário
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, role } = req.body;

        if (!username || !role) {
            return res.status(400).json({ error: 'Username e role são obrigatórios' });
        }

        const validRoles = ['SUPER_ADMIN', 'GERENTE', 'OPERADOR', 'PORTEIRO', 'RECEPCIONISTA'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Perfil inválido' });
        }

        // Se senha foi fornecida, atualizar também
        if (password) {
            const password_hash = await bcrypt.hash(password, 10);
            await pool.query(
                'UPDATE users SET username = ?, password_hash = ?, role = ? WHERE id = ?',
                [username, password_hash, role, id]
            );
        } else {
            await pool.query(
                'UPDATE users SET username = ?, role = ? WHERE id = ?',
                [username, role, id]
            );
        }

        res.json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Nome de usuário já existe' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Deletar usuário
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Impedir que o próprio usuário se delete
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'Você não pode deletar sua própria conta' });
        }

        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
