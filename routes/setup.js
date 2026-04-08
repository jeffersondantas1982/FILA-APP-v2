const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Rota para verificar o status da instalação
 */
router.get('/status', (req, res) => {
    const envExists = fs.existsSync(path.join(__dirname, '..', '.env'));
    res.json({ installed: envExists });
});

/**
 * Rota para verificar se os pré-requisitos estão instalados no sistema
 */
router.get('/check-requirements', async (req, res) => {
    const results = {
        node: false,
        mysql: false
    };

    const checkCommand = async (cmd) => {
        try {
            await execPromise(cmd);
            return true;
        } catch (e) {
            return false;
        }
    };

    try {
        // 1. Verificar Node.js (PATH ou caminhos comuns)
        results.node = await checkCommand('node -v');
        if (!results.node) {
            const nodePaths = [
                'C:\\Program Files\\nodejs\\node.exe',
                'C:\\Program Files (x86)\\nodejs\\node.exe'
            ];
            for (const p of nodePaths) {
                if (fs.existsSync(p)) { results.node = true; break; }
            }
        }

        // 2. Verificar MySQL (PATH ou caminhos comuns ou Serviço)
        results.mysql = await checkCommand('mysql --version') || await checkCommand('mysqld --version');
        if (!results.mysql) {
            const mysqlPaths = [
                'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
                'C:\\Program Files\\MySQL\\MySQL Server 8.1\\bin\\mysql.exe',
                'C:\\Program Files\\MySQL\\MySQL Server 5.7\\bin\\mysql.exe',
                'C:\\xampp\\mysql\\bin\\mysql.exe'
            ];
            for (const p of mysqlPaths) {
                if (fs.existsSync(p)) { results.mysql = true; break; }
            }
        }

        // 3. Fallback: verificar se o serviço MySQL existe no Windows
        if (!results.mysql && process.platform === 'win32') {
            try {
                const { stdout } = await execPromise('sc query mysql');
                if (stdout.includes('SERVICE_NAME')) results.mysql = true;
            } catch (e) { /* ignore */ }
        }

        res.json({ success: true, requirements: results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Rota para testar a conexão com o banco de dados
 */
router.post('/test-db', async (req, res) => {
    const { host, user, password, database } = req.body;
    let connection;
    try {
        // Conecta ao host sem especificar o banco de dados para validar credenciais
        connection = await mysql.createConnection({ host, user, password });

        // Verifica se o banco de dados existe
        const [rows] = await connection.query(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`, [database]);

        const exists = rows.length > 0;

        res.json({
            success: true,
            exists: exists,
            message: exists
                ? 'Conexão bem-sucedida! O banco de dados já existe.'
                : 'Conexão bem-sucedida! O banco de dados não existe e será criado.'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: `Erro de credenciais ou host: ${error.message}` });
    } finally {
        if (connection) await connection.end();
    }
});

/**
 * Rota para executar a instalação
 */
router.post('/install', async (req, res) => {
    let { dbConfig, includeDemo } = req.body;
    includeDemo = includeDemo === true || includeDemo === 'true';
    console.log(`[Setup] Iniciando instalação. Demo: ${includeDemo}`);

    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
        return res.status(400).json({ success: false, message: 'O sistema já está instalado.' });
    }

    let connection;
    const progress = [];

    try {
        // 1. Conexão ao MySQL
        progress.push({ step: 'Conectando ao MySQL...', status: 'success' });
        connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            multipleStatements: true
        });

        // 2. Criar Banco de Dados
        console.log(`[Setup] Criando banco de dados: ${dbConfig.database}`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        await connection.query(`USE \`${dbConfig.database}\``);
        progress.push({ step: 'Banco de dados verificado/criado.', status: 'success' });

        // 3. Executar Tabelas
        const sqlPath = path.join(__dirname, '..', 'docs', 'database.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('[Setup] Executando script SQL de tabelas...');
        await connection.query(sql);
        progress.push({ step: 'Tabelas do sistema geradas com sucesso.', status: 'success' });

        // 4. Seeding de Usuários Padrão
        console.log('[Setup] Semeando perfis padrão...');
        const commonPasswordHash = await bcrypt.hash('123456', 10);
        const usersToSeed = [
            ['admin', commonPasswordHash, 'SUPER_ADMIN'],
            ['gerente', commonPasswordHash, 'GERENTE'],
            ['operador', commonPasswordHash, 'OPERADOR'],
            ['porteiro', commonPasswordHash, 'PORTEIRO'],
            ['recepcao', commonPasswordHash, 'RECEPCIONISTA']
        ];

        for (const user of usersToSeed) {
            await connection.query(
                'INSERT IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)',
                user
            );
        }
        progress.push({ step: 'Perfis padrão criados (Senha: 123456).', status: 'success' });

        // 5. Seeding de Dados Demo (Opcional)
        if (includeDemo) {
            console.log('[Setup] Processando dados demo...');
            const [sectors] = await connection.query('SELECT id FROM sectors');
            const [users] = await connection.query('SELECT id FROM users WHERE role = "OPERADOR" LIMIT 1');

            console.log(`[Setup] Setores encontrados: ${sectors.length}, Operadores: ${users.length}`);

            if (sectors.length > 0 && users.length > 0) {
                const sectorIds = sectors.map(s => s.id);
                const userId = users[0].id;

                for (let i = 0; i < 50; i++) {
                    const date = new Date();
                    date.setDate(date.getDate() - Math.floor(Math.random() * 5));
                    date.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));

                    const sectorId = sectorIds[Math.floor(Math.random() * sectorIds.length)];
                    const status = Math.random() > 0.2 ? 'completed' : (Math.random() > 0.5 ? 'canceled' : 'not_shown');

                    await connection.query(
                        'INSERT INTO tickets (number, sector_id, status, created_at, started_at, completed_at, attended_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [`D${100 + i}`, sectorId, status, date, date, status === 'completed' ? new Date(date.getTime() + 10 * 60000) : null, userId]
                    );
                }
                progress.push({ step: 'Dados de demonstração populados.', status: 'success' });
            } else {
                console.warn('[Setup] Demo solicitado mas falhou por falta de setores ou operadores.');
                if (sectors.length === 0) progress.push({ step: 'Aviso: Setores iniciais não foram encontrados para o demo.', status: 'warning' });
            }
        }

        // 6. Salvar .env
        const jwtSecret = require('crypto').randomBytes(32).toString('hex');
        const envContent = `# Configurações do Banco de Dados
DB_HOST=${dbConfig.host}
DB_USER=${dbConfig.user}
DB_PASS=${dbConfig.password}
DB_NAME=${dbConfig.database}

# Configurações do Servidor
PORT=3000
JWT_SECRET=${jwtSecret}

# Ambiente
NODE_ENV=production
`;
        fs.writeFileSync(envPath, envContent);
        progress.push({ step: 'Arquivo de configuração .env gerado.', status: 'success' });

        // Recarregar variáveis de ambiente no processo atual para permitir uso imediato do pool
        require('dotenv').config({ override: true });

        res.json({
            success: true,
            progress: progress,
            message: 'Instalação concluída com sucesso!'
        });

    } catch (error) {
        console.error('[Setup] Erro na instalação:', error);
        res.status(500).json({
            success: false,
            message: `Erro: ${error.message}`,
            progress: progress
        });
    } finally {
        if (connection) await connection.end();
    }
});

module.exports = router;
