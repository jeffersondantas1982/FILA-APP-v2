const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Garantir colunas 'active' e 'collect_patient_name' (Migração em tempo de execução)
(async () => {
    try {
        const [activeColumns] = await pool.query("SHOW COLUMNS FROM sectors LIKE 'active'");
        if (activeColumns.length === 0) {
            await pool.query("ALTER TABLE sectors ADD COLUMN active TINYINT(1) DEFAULT 1 AFTER prefix");
            console.log('[Migration] Coluna "active" adicionada a tabela sectors.');
        }

        const [collectNameColumns] = await pool.query("SHOW COLUMNS FROM sectors LIKE 'collect_patient_name'");
        if (collectNameColumns.length === 0) {
            await pool.query("ALTER TABLE sectors ADD COLUMN collect_patient_name TINYINT(1) DEFAULT 0 AFTER active");
            console.log('[Migration] Coluna "collect_patient_name" adicionada a tabela sectors.');
        }
    } catch (e) { /* Tabela pode não existir ainda no setup */ }
})();

// Listar todos os setores (Público)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM sectors ORDER BY active DESC, name ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Criar novo setor (Apenas Admin/Gerente)
router.post('/', authenticateToken, authorizeRole(['SUPER_ADMIN', 'GERENTE']), async (req, res) => {
    const { name, room, prefix, active, collect_patient_name } = req.body;
    if (!name || !prefix) return res.status(400).json({ error: 'Nome e Prefixo são obrigatórios' });

    try {
        const [result] = await pool.query('INSERT INTO sectors (name, room, prefix, active, collect_patient_name) VALUES (?, ?, ?, ?, ?)', [name, room, prefix, active !== undefined ? active : 1, collect_patient_name !== undefined ? collect_patient_name : 0]);
        res.status(201).json({ id: result.insertId, name, room, prefix, active: active !== undefined ? active : 1, collect_patient_name: collect_patient_name !== undefined ? collect_patient_name : 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Atualizar setor (Apenas Admin/Gerente)
router.put('/:id', authenticateToken, authorizeRole(['SUPER_ADMIN', 'GERENTE']), async (req, res) => {
    const { id } = req.params;
    const { name, room, prefix, active, collect_patient_name } = req.body;

    if (!name || !prefix) return res.status(400).json({ error: 'Nome e Prefixo são obrigatórios' });

    try {
        await pool.query('UPDATE sectors SET name = ?, room = ?, prefix = ?, active = ?, collect_patient_name = ? WHERE id = ?', [name, room, prefix, active !== undefined ? active : 1, collect_patient_name !== undefined ? collect_patient_name : 0, id]);
        res.json({ id, name, room, prefix, active, collect_patient_name });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Deletar setor (Apenas Admin/Gerente)
router.delete('/:id', authenticateToken, authorizeRole(['SUPER_ADMIN', 'GERENTE']), async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM sectors WHERE id = ?', [id]);
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
