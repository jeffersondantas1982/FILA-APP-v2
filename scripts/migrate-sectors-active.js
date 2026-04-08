const pool = require('../config/db');

async function migrate() {
    try {
        console.log('--- Iniciando migração de status de setores ---');

        // Verificar se a coluna já existe
        const [columns] = await pool.query('SHOW COLUMNS FROM sectors LIKE "active"');

        if (columns.length === 0) {
            console.log('Adicionando coluna "active" na tabela sectors...');
            await pool.query('ALTER TABLE sectors ADD COLUMN active TINYINT(1) DEFAULT 1 AFTER prefix');
            console.log('Coluna "active" adicionada com sucesso.');
        } else {
            console.log('A coluna "active" já existe.');
        }

        console.log('--- Migração concluída com sucesso ---');
        process.exit(0);
    } catch (error) {
        console.error('Erro na migração:', error);
        process.exit(1);
    }
}

migrate();
