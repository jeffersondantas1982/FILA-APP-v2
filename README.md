# FILA-APP 🏥

**FILA-APP** é um sistema inteligente e moderno de gerenciamento de filas de atendimento, desenvolvido especificamente para o ambiente de saúde do **Hospital Presidente Vargas**. O sistema visa otimizar o fluxo de pacientes, reduzir a ansiedade na espera e fornecer métricas precisas para a gestão hospitalar.

---

## 🚀 Principais Funcionalidades

- **📱 Totem de Autoatendimento**: Interface intuitiva para o paciente emitir sua própria senha por setor.
- **🎧 Painel do Operador**: Controle total sobre a chamada de senhas, início e conclusão de atendimentos.
- **📺 Painel TV (Público)**: Visual moderno com alertas sonoros e chamada por voz (TTS) para os pacientes.
- **📊 Dashboard Gerencial**: Acompanhamento em tempo real de KPIs, mapas de calor de horários de pico e produtividade da equipe.
- **📈 Relatórios Avançados**: Histórico completo com exportação para CSV (Excel) para auditoria e análise.
- **🔔 Notificações Inteligentes**: Alertas no desktop e "piscar de guia" no navegador para os operadores.

---

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Banco de Dados**: MySQL
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript
- **Real-time**: Socket.IO
- **Gráficos**: Chart.js

---

## 📦 Como Instalar e Executar

### Pré-requisitos
- Node.js instalado
- MySQL Server rodando

### Passos
1. **Configurar o Banco de Dados**:
   - Execute o script `docs/database.sql` no seu servidor MySQL.
   - Configure as credenciais no arquivo `.env` (use o `.env.example` como base).

2. **Instalar Dependências**:
   ```bash
   npm install
   ```

3. **Iniciar o Sistema**:
   ```bash
   npm start
   ```

4. **Scripts de Atalho (Windows)**:
   - `1-INSTALAR.bat`: Instala as dependências.
   - `2-INICIALIZAR_BANCO.bat`: Configura a estrutura inicial.
   - `3-START.bat`: Inicia o servidor.

---

## 👨‍💻 Autor e Instituição

- **Autor**: Jefferson Carvalho Dantas
- **Instituição**: Hospital Presidente Vargas, São Luís - MA
- **Endereço**: Rua 5 de Janeiro, 166, Bairro Jordoa, São Luís/MA - CEP: 65040-450

---

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia o arquivo [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre nosso código de conduta e o processo para nos enviar pedidos de pull request.

---

## ⚖️ Licença

Este projeto está licenciado sob a licença **GNU General Public License v3 (GPL v3)** - veja o arquivo [LICENSE](LICENSE) para detalhes.
