const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function migrate() {
    let connection;
    try {
        console.log('--- INICIANDO CONFIGURAÇÃO DO BANCO DE DADOS ---');

        // Conecta sem banco para garantir que ele exista
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            multipleStatements: true
        });

        const sqlPath = path.join(__dirname, 'database.sql');
        if (!fs.existsSync(sqlPath)) {
            throw new Error('Arquivo database.sql não encontrado!');
        }

        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Executando script SQL...');

        await connection.query(sql);

        // Seeding de Usuários
        console.log('Verificando usuários...');
        const [users] = await connection.query('SELECT count(*) as count FROM users');

        if (users[0].count === 0) {
            console.log('Criando usuários padrão...');
            const bcrypt = require('bcryptjs');
            const hash = await bcrypt.hash('123456', 10);

            const defaultUsers = [
                ['superadmin', hash, 'SUPER_ADMIN'],
                ['admin', hash, 'GERENTE'],
                ['operador', hash, 'OPERADOR'],
                ['recepcao', hash, 'RECEPCIONISTA'],
                ['porteiro', hash, 'PORTEIRO']
            ];

            await connection.query(
                'INSERT INTO users (username, password_hash, role) VALUES ?',
                [defaultUsers]
            );
            console.log('Usuários padrão criados (Senha: 123456)');
        }

        console.log('Banco de dados configurado e populado com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('ERRO NA CONFIGURAÇÃO:', error.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
