-- Migração: Adicionar funcionalidade de Nome do Paciente
-- Execute este script no seu banco de dados MySQL

-- 1. Adicionar coluna collect_patient_name na tabela sectors
ALTER TABLE sectors 
ADD COLUMN IF NOT EXISTS collect_patient_name TINYINT(1) DEFAULT 0 AFTER active;

-- 2. Adicionar coluna patient_name na tabela tickets
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS patient_name VARCHAR(255) NULL AFTER sector_id;

-- Verificar se as colunas foram criadas
SELECT 
    'sectors' as tabela,
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'sectors'
  AND COLUMN_NAME = 'collect_patient_name'
UNION ALL
SELECT 
    'tickets' as tabela,
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'tickets'
  AND COLUMN_NAME = 'patient_name';
