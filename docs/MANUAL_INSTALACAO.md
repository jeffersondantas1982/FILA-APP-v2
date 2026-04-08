# Manual de Instalação - FILA-APP

## 📋 Requisitos do Sistema

### Software Necessário
- **Node.js**: versão 14.x ou superior
- **MySQL**: versão 5.7 ou superior
- **Navegador Web**: Chrome, Firefox, Edge ou Safari (versão recente)

### Hardware Mínimo
- **Processador**: Dual-core 2.0 GHz
- **Memória RAM**: 2 GB
- **Espaço em Disco**: 500 MB

---

## 🚀 Instalação Passo a Passo

### Opção A: Instalação via Web (Recomendado)
1. **Inicie o servidor**: No terminal, execute `npm start`.
2. **Acesse o navegador**: Abra `http://localhost:3000`.
3. **Siga o assistente**: O sistema detectará a falta de configuração e abrirá o instalador automático.
4. **Preencha os dados**: Siga os passos na tela para configurar banco de dados e admin.

### Opção B: Instalação Manual
### 1. Preparar o Banco de Dados

#### 1.1. Criar o Banco de Dados
```sql
CREATE DATABASE fila_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 1.2. Criar as Tabelas
Execute o script SQL localizado em `database/schema.sql`:

```bash
mysql -u root -p fila_app < database/schema.sql
```

Ou execute manualmente via MySQL Workbench/phpMyAdmin.

---

### 2. Configurar o Servidor

#### 2.1. Instalar Dependências
Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

Este comando instalará todas as dependências necessárias listadas em `package.json`.

#### 2.2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
# Configurações do Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASS=sua_senha_aqui
DB_NAME=fila_app

# Configurações do Servidor
PORT=3000
JWT_SECRET=sua_chave_secreta_aqui_minimo_32_caracteres

# Ambiente
NODE_ENV=production
```

> **⚠️ IMPORTANTE**: Altere `DB_PASS` e `JWT_SECRET` para valores seguros!

---

### 3. Criar Usuário Inicial

Execute o script de criação do primeiro usuário:

```bash
node scripts/create-admin.js
```

Ou crie manualmente via SQL:

```sql
INSERT INTO users (username, password_hash, role) 
VALUES ('admin', '$2a$10$exemplo_hash_bcrypt', 'SUPER_ADMIN');
```

> **💡 Dica**: Use a função "Carregar Demo" após a instalação para criar usuários padrão automaticamente.

---

### 4. Iniciar o Servidor

#### Modo Desenvolvimento
```bash
npm run dev
```

#### Modo Produção
```bash
npm start
```

O servidor iniciará em `http://localhost:3000`

---

## 🔧 Configuração Inicial

### 1. Primeiro Acesso
1. Acesse `http://localhost:3000/login.html`
2. Faça login com o usuário criado
3. Acesse **Configurações** no menu lateral

### 2. Configurar Setores
1. Em **Configurações > Gerenciar Setores**, clique em **Novo Setor**
2. Preencha:
   - **Nome**: Ex: "Atendimento Geral"
   - **Sala**: Ex: "Sala 1"
   - **Prefixo**: Ex: "A" (usado nas senhas: A01, A02...)
3. Clique em **Salvar**

### 3. Configurar Nome da Instituição
1. Em **Configurações > Configurações Gerais**
2. Digite o nome da sua instituição
3. Clique em **Salvar**

### 4. Criar Usuários
1. Acesse **Gerenciar Usuários** (menu lateral)
2. Clique em **Novo Usuário**
3. Preencha os dados e selecione o perfil apropriado
4. Clique em **Salvar**

---

## 📱 Configuração de Telas

### Painel TV (Display Público)
1. Abra um navegador em modo fullscreen (F11)
2. Acesse `http://localhost:3000/panel.html`
3. O painel atualizará automaticamente quando senhas forem chamadas

### Totem de Autoatendimento
1. Configure um tablet/computador touch
2. Acesse `http://localhost:3000/totem.html`
3. Bloqueie a navegação para impedir saída da página

### Painel do Operador
1. Em cada guichê, acesse `http://localhost:3000/operator.html`
2. Faça login com credenciais de OPERADOR
3. Selecione o setor correspondente ao guichê

---

## 🔒 Segurança

### Recomendações
1. **Altere as senhas padrão** imediatamente
2. **Use HTTPS** em produção (configure certificado SSL)
3. **Firewall**: Libere apenas a porta 3000 na rede local
4. **Backup**: Configure backup automático do banco de dados

### Backup do Banco de Dados
```bash
# Criar backup
mysqldump -u root -p fila_app > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u root -p fila_app < backup_20260202.sql
```

---

## 🐛 Solução de Problemas

### Servidor não inicia
- Verifique se a porta 3000 está livre: `netstat -ano | findstr :3000`
- Confirme as credenciais do banco em `.env`
- Verifique logs de erro no terminal

### Erro de conexão com banco
- Teste a conexão: `mysql -u root -p`
- Verifique se o serviço MySQL está rodando
- Confirme nome do banco e credenciais

### Painel não atualiza
- Verifique conexão WebSocket no console do navegador (F12)
- Reinicie o servidor Node.js
- Limpe cache do navegador (Ctrl+Shift+Del)

---

## 📞 Suporte

Para problemas técnicos:
1. Verifique os logs do servidor no terminal
2. Consulte a documentação em `README.md`
3. Entre em contato com o suporte técnico

---

## 🔄 Atualizações

Para atualizar o sistema:

```bash
# 1. Fazer backup do banco
mysqldump -u root -p fila_app > backup_pre_update.sql

# 2. Parar o servidor
# (Ctrl+C no terminal)

# 3. Atualizar código
git pull origin main

# 4. Atualizar dependências
npm install

# 5. Executar migrações (se houver)
node scripts/migrate.js

# 6. Reiniciar servidor
npm start
```

---

**Versão**: 1.0  
**Última Atualização**: Fevereiro 2026
