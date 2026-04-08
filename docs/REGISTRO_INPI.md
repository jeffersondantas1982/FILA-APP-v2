# Dossiê Técnico para Registro de Software (INPI)

Este documento contém todas as informações técnicas necessárias para preencher o formulário de Pedido de Registro de Programa de Computador no portal do **INPI**.

---

## 📋 1. Dados do Programa
- **Nome do Software**: FILA-APP
- **Título Completo**: Sistema de Gerenciamento de Filas Digital
- **Versão Atual**: 1.0.0
- **Data de Conclusão**: 05/02/2026
- **Linguagem de Programação**: JavaScript (Node.js), HTML5, CSS3
- **Sistema Operacional**: Multiplataforma (Windows/Linux/macOS) via Browser

---

## ⚙️ 2. Especificações Técnicas (Campo: Resumo)
**Resumo para o INPI (Sugestão - Copiar e Colar):**
> "O FILA-APP é um software de gerenciamento de filas de atendimento em tempo real, desenvolvido em arquitetura cliente-servidor (Node.js). O sistema utiliza comunicação via WebSockets (Socket.io) para sincronização instantânea entre a emissão de senhas (Totem), a gestão de chamadas (Painel do Operador) e a visualização pública (Painel de TV). Inclui módulos de administração para controle de setores, permissões de usuários via RBAC (Role-Based Access Control) e geração de relatórios estatísticos de produtividade. O armazenamento de dados é estruturado em MySQL com persistência de auditoria."

---

## 🛠️ 3. Tecnologias e Dependências
Para o registro, declare que o software é um "Desenvolvimento Original" utilizando as seguintes tecnologias:
- **Backend**: Express Framework, MySQL2, Bcryptjs (Criptografia), JWT (Autenticação).
- **Frontend**: Vanilla JS (ES6+), Inter Font Engine, FontAwesome.
- **Protocolos**: HTTP/HTTPS, WebSockets.

---

## 🔒 4. Integridade e Segurança (Resumo Digital - Hash)
Para o INPI, você deve gerar um código **SHA-256** do código-fonte compactado (.zip).

**Como gerar o código para o registro:**
1. Compacte as pastas `routes`, `public`, `config`, `docs` e os arquivos `server.js`, `package.json` em um arquivo chamado `FILA-APP-SOURCE.zip`.
2. No Windows (PowerShell), rode o comando:
   ```powershell
   Get-FileHash .\FILA-APP-SOURCE.zip -Algorithm SHA256
   ```
3. O código longo (64 caracteres) que aparecerá é o que deve ser inserido no campo **"Resumo Digital"** do INPI.

---

## ⚖️ 5. Titularidade e Direitos
- **Titular (Proprietário)**: Jefferson Carvalho Dantas (Pessoa Física / Autor)
- **Modalidade**: Registro em nome próprio com cessão de direito de uso para terceiros.
- **Autores**: 
    - Jefferson Carvalho Dantas (Desenvolvimento Core & DevOps)
    - Débora Kallyne Pinheiro (Requisitos & Fluxos)
    - Carlos Andre de Santana (Infraestrutura & QA)
- **Licença Base**: GNU GPL v3 (Software Livre com proteção de autoria).

---

## 📄 6. Estratégia de Cessão de Uso
Como você é o dono e irá ceder o uso à empresa, o caminho legal recomendado é:
1.  **Registro INPI**: No seu CPF como Titular.
2.  **Instrumento Jurídico**: Um "Termo de Cessão de Uso de Software" assinado entre você (Cedente) e a Empresa (Cessionária).
3.  **Vantagem**: Você mantém a propriedade intelectual e controla onde o software é instalado.

---

> [!IMPORTANT]
> **Aviso Legal**: O registro no INPI garante a proteção do código-fonte (propriedade intelectual) por 50 anos em 176 países (Convenção de Berna). Mantenha uma cópia deste dossiê junto com o comprovante de pagamento da GRU.
