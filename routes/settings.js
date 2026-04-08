const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Obter configurações
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM settings WHERE id = 1');
        res.json(rows[0] || { institution_name: 'FILA-APP', logo_url: '', print_enabled: 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Atualizar configurações
router.post('/', async (req, res) => {
    const { institution_name, logo_url, print_enabled, last_reset } = req.body;
    try {
        if (last_reset) {
            await pool.query(
                'INSERT INTO settings (id, last_reset) VALUES (1, ?) ON DUPLICATE KEY UPDATE last_reset = ?',
                [last_reset, last_reset]
            );
        } else {
            // Get current values to avoid overwritting with undefined
            const [current] = await pool.query('SELECT * FROM settings WHERE id = 1');
            const name = institution_name !== undefined ? institution_name : (current[0]?.institution_name || 'FILA-APP');
            const logo = logo_url !== undefined ? logo_url : (current[0]?.logo_url || '');
            const print = print_enabled !== undefined ? print_enabled : (current[0]?.print_enabled || 0);

            await pool.query(
                `INSERT INTO settings (id, institution_name, logo_url, print_enabled) 
                 VALUES (1, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE institution_name = ?, logo_url = ?, print_enabled = ?`,
                [name, logo, print, name, logo, print]
            );
        }
        res.json({ message: 'Configurações atualizadas' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
