const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsers() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: 'fila_app'
        });

        console.log('=== USUÁRIOS NO BANCO ===');
        const [users] = await connection.query('SELECT id, username, role FROM users');
        console.table(users);

        // Verificar se superadmin existe
        const [superadmin] = await connection.query('SELECT * FROM users WHERE username = ?', ['superadmin']);

        if (superadmin.length === 0) {
            console.log('\n⚠️  SUPERADMIN NÃO ENCONTRADO! Criando...');
            const bcrypt = require('bcryptjs');
            const hash = await bcrypt.hash('123456', 10);

            await connection.query(
                'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
                ['superadmin', hash, 'SUPER_ADMIN']
            );
            console.log('✅ Superadmin criado com sucesso!');
        } else {
            console.log('\n✅ Superadmin já existe!');
        }

    } catch (error) {
        console.error('ERRO:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

checkUsers();
