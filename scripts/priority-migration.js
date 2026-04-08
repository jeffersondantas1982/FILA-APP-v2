const pool = require('../config/db');

async function runMigration() {
    try {
        console.log('Iniciando migração de prioridade...');

        // Adicionar coluna type (Fallback no catch se já existir)
        await pool.query(`
            ALTER TABLE tickets 
            ADD COLUMN type ENUM('normal', 'priority') DEFAULT 'normal' AFTER sector_id
        `);

        console.log('✅ Coluna "type" adicionada com sucesso!');
        process.exit(0);
    } catch (error) {
        // Fallback para versões do MySQL que não suportam ADD COLUMN IF NOT EXISTS
        if (error.code === 'ER_DUP_COLUMN_NAME' || error.errno === 1060) {
            console.log('ℹ️ Coluna "type" já existe.');
            process.exit(0);
        }
        console.error('❌ Erro na migração:', error);
        process.exit(1);
    }
}

runMigration();
