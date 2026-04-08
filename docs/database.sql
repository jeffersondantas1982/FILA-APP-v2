-- Script de criação do banco de dados FILA-APP

-- 1. Tabela de Usuários (Deve vir antes pois outras tabelas referenciam ela)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('SUPER_ADMIN', 'GERENTE', 'OPERADOR', 'PORTEIRO', 'RECEPCIONISTA') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Atualizar ENUM caso a tabela já exista
ALTER TABLE users MODIFY COLUMN role ENUM('SUPER_ADMIN', 'GERENTE', 'OPERADOR', 'PORTEIRO', 'RECEPCIONISTA') NOT NULL;

-- 2. Tabela de Configurações
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY DEFAULT 1,
    institution_name VARCHAR(255) DEFAULT 'FILA-APP',
    logo_url TEXT,
    last_reset DATETIME DEFAULT NULL,
    print_enabled TINYINT(1) DEFAULT 0,
    CHECK (id = 1)
);

-- Garantir colunas na tabela settings (Migrações Retroativas)
SET @has_last_reset = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'settings' AND COLUMN_NAME = 'last_reset' AND TABLE_SCHEMA = DATABASE());
SET @sql_reset = IF(@has_last_reset > 0, 'SELECT 1', 'ALTER TABLE settings ADD COLUMN last_reset DATETIME DEFAULT NULL');
PREPARE stmt_reset FROM @sql_reset;
EXECUTE stmt_reset;
DEALLOCATE PREPARE stmt_reset;

SET @has_print = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'settings' AND COLUMN_NAME = 'print_enabled' AND TABLE_SCHEMA = DATABASE());
SET @sql_print = IF(@has_print > 0, 'SELECT 1', 'ALTER TABLE settings ADD COLUMN print_enabled TINYINT(1) DEFAULT 0');
PREPARE stmt_print FROM @sql_print;
EXECUTE stmt_print;
DEALLOCATE PREPARE stmt_print;

INSERT IGNORE INTO settings (id, institution_name) VALUES (1, 'FILA-APP');

-- 3. Tabela de Setores/Salas
CREATE TABLE IF NOT EXISTS sectors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    room VARCHAR(50),
    prefix CHAR(1) NOT NULL DEFAULT 'A',
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_sector (name, room)
);

-- Migrações para setores
SET @has_prefix = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'sectors' AND COLUMN_NAME = 'prefix' AND TABLE_SCHEMA = DATABASE());
SET @sql_prefix = IF(@has_prefix > 0, 'SELECT 1', 'ALTER TABLE sectors ADD COLUMN prefix CHAR(1) NOT NULL DEFAULT "A" AFTER room');
PREPARE stmt_p FROM @sql_prefix;
EXECUTE stmt_p;
DEALLOCATE PREPARE stmt_p;

SET @has_active = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'sectors' AND COLUMN_NAME = 'active' AND TABLE_SCHEMA = DATABASE());
SET @sql_active = IF(@has_active > 0, 'SELECT 1', 'ALTER TABLE sectors ADD COLUMN active TINYINT(1) DEFAULT 1 AFTER prefix');
PREPARE stmt_a FROM @sql_active;
EXECUTE stmt_a;
DEALLOCATE PREPARE stmt_a;

-- 4. Tabela de Senhas (Tickets)
CREATE TABLE IF NOT EXISTS tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(10) NOT NULL,
    sector_id INT,
    type ENUM('normal', 'priority') DEFAULT 'normal',
    status ENUM('pending', 'calling', 'in_service', 'completed', 'redirected', 'canceled', 'not_shown') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_by INT,
    attended_by INT,
    FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (attended_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Garantir colunas e chaves na tabela tickets
ALTER TABLE tickets MODIFY COLUMN status ENUM('pending', 'calling', 'in_service', 'completed', 'redirected', 'canceled', 'not_shown') DEFAULT 'pending';

-- Migração: type
SET @has_t_type = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'tickets' AND COLUMN_NAME = 'type' AND TABLE_SCHEMA = DATABASE());
SET @sql_t_type = IF(@has_t_type > 0, 'SELECT 1', 'ALTER TABLE tickets ADD COLUMN type ENUM("normal", "priority") DEFAULT "normal" AFTER sector_id');
PREPARE stmt_tt FROM @sql_t_type;
EXECUTE stmt_tt;
DEALLOCATE PREPARE stmt_tt;

-- Migração: Auditoria e FKs (Apenas se a coluna não existir, evita erro de FK duplicada)
SET @has_c_by = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'tickets' AND COLUMN_NAME = 'created_by' AND TABLE_SCHEMA = DATABASE());
SET @sql_c_by = IF(@has_c_by > 0, 'SELECT 1', 'ALTER TABLE tickets ADD COLUMN created_by INT, ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL');
PREPARE stmt_cb FROM @sql_c_by;
EXECUTE stmt_cb;
DEALLOCATE PREPARE stmt_cb;

SET @has_a_by = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'tickets' AND COLUMN_NAME = 'attended_by' AND TABLE_SCHEMA = DATABASE());
SET @sql_a_by = IF(@has_a_by > 0, 'SELECT 1', 'ALTER TABLE tickets ADD COLUMN attended_by INT, ADD FOREIGN KEY (attended_by) REFERENCES users(id) ON DELETE SET NULL');
PREPARE stmt_ab FROM @sql_a_by;
EXECUTE stmt_ab;
DEALLOCATE PREPARE stmt_ab;

-- Timestamps
SET @has_start = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'tickets' AND COLUMN_NAME = 'started_at' AND TABLE_SCHEMA = DATABASE());
SET @sql_start = IF(@has_start > 0, 'SELECT 1', 'ALTER TABLE tickets ADD COLUMN started_at TIMESTAMP NULL');
PREPARE stmt_s FROM @sql_start;
EXECUTE stmt_s;
DEALLOCATE PREPARE stmt_s;

SET @has_comp = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'tickets' AND COLUMN_NAME = 'completed_at' AND TABLE_SCHEMA = DATABASE());
SET @sql_comp = IF(@has_comp > 0, 'SELECT 1', 'ALTER TABLE tickets ADD COLUMN completed_at TIMESTAMP NULL');
PREPARE stmt_c FROM @sql_comp;
EXECUTE stmt_c;
DEALLOCATE PREPARE stmt_c;

-- 5. Inserção de setores iniciais
INSERT IGNORE INTO sectors (name, room, prefix, active) VALUES 
('FARMACIA SAE', 'SAE', 'F', 1),
('CONSULTORIO DT', 'DT', 'D', 1),
('CONSULTORIO ENFERMAGEM 01', '01', 'E', 1),
('CONSULTORIO ENFERMAGEM 02', '02', 'E', 1),
('CONSULTORIO ENFERMAGEM 03', '03', 'E', 1),
('CONSULTORIO MEDICO 01', '01', 'M', 1),
('CONSULTORIO MEDICO 02', '02', 'M', 1),
('CONSULTORIO MEDICO 03', '03', 'M', 1),
('CONSULTORIO MEDICO 04', '04', 'M', 1),
('CONSULTORIO MEDICO 05', '05', 'M', 1),
('COORDENAÇÃO', 'COORD', 'C', 1),
('CPD', 'CPD', 'P', 1),
('SERVIÇO SOCIAL', 'SOCIAL', 'S', 1),
('ODONTOLOGIA', 'ODONTO', 'O', 1),
('RX', 'RX', 'R', 1),
('COLETA', 'COLETA', 'L', 1),
('CURATIVO', 'CURATIVO', 'U', 1);
