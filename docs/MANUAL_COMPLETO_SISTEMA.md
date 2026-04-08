# Manual Completo do Sistema - FILA-APP

## 🏥 Unidade de Saúde
### Gestão e Tecnologia

---

## 🚀 Inovação em Gestão de Saúde

> "Transformando a espera em cuidado, e a gestão em eficiência."

O **FILA-APP** representa o ápice da inovação na gestão de atendimentos em saúde. Desenvolvido para humanizar o atendimento e otimizar a jornada do paciente, o sistema substitui processos manuais por uma plataforma digital de alta performance.

### Diferenciais da Versão v1.0
- **Controle em Tempo Real**: Monitoramento constante do fluxo de atendimento.
- **Métricas de Guerra**: Dashboard gerencial inspirado em centros de comando.
- **Humanização**: Redução do estresse de espera através de informação clara.
- **Sustentabilidade**: Eliminação de senhas de papel via painéis digitais.

---

## 🛠️ Especificações Técnicas (Stack)

O sistema foi construído sobre uma base tecnológica robusta e moderna:

| Camada | Tecnologia |
|--------|------------|
| **Backend** | Node.js + Express.js |
| **Banco de Dados** | MySQL 5.7+ |
| **Frontend** | HTML5, JavaScript (Vanilla), CSS3 |
| **Comunicação** | Socket.IO (Tempo Real via WebSockets) |
| **Gráficos** | Chart.js 4.x |
| **Segurança** | JWT (Auth) + Bcrypt (Criptografia) |

---

## 👥 Créditos de Desenvolvimento

Este projeto é fruto do talento e dedicação dos profissionais:

- **Jefferson Carvalho Dantas**
  - *Analista de Sistemas*
  - Responsável pela arquitetura, desenvolvimento backend e lógica de negócios.
  - [LinkedIn](https://www.linkedin.com/in/jeffersondantas/)

- **Carlos André de Santana**
  - *Quality Assurance (QA)*
  - Responsável pela garantia de qualidade, testes e validação de fluxos.
  - [LinkedIn](https://www.linkedin.com/in/carlosandre81/)

---

## 📖 Módulos do Sistema

### 1. 🎯 Dashboard Gerencial
O "coração" administrativo do sistema.
- **KPIs**: Senhas na fila, tempo médio de espera e atendimento.
- **Fluxo Horário**: Gráfico de linha mostrando picos de demanda.
- **Paciência**: Classificação visual (Verde/Amarelo/Vermelho) do tempo de espera.
- **Ranking de Agilidade**: Medalhas para os operadores mais produtivos.
- **Customização**: Arraste, redimensione e oculte quadros conforme sua necessidade.

### 2. 🎧 Painel do Operador
Ferramenta de trabalho diário.
- **Fluxo Simples**: Botões de "Chamar Próximo", "Iniciar" e "Concluir".
- **Gestão de Exceções**: Opções de "Não Compareceu", "Cancelar" ou "Redirecionar".
- **Aviso Sonoro**: Gatilho automático para o Painel TV.

### 3. 📺 Painel TV (Display Público)
O ponto de contato visual com o paciente.
- **Chamadas de Voz**: Som de alerta ao chamar nova senha.
- **Display Grande**: Destaque para a senha atual e mesa/sala de destino.
- **Histórico**: Lista das últimas senhas chamadas para referência.

### 4. 📱 Totem e Recepção
Porta de entrada do paciente.
- **Autoatendimento (Totem)**: O paciente seleciona o setor e retira sua senha digital.
- **Monitoramento do Porteiro**: Exibição em tempo real da senha "Em Atendimento" em cada card, servindo como referência visual rápida para o controle da entrada.
- **Recepção**: Emissão manual de senhas se necessário.

---

## ⚙️ Controles Administrativos de Elite

Pensado para o ambiente hospitalar real:

- **Reset de Fila Diário**: Limpeza automática às 06:00 (ajustável).
- **Soft Reset**: Reinicia a numeração (A01, B01...) preservando os relatórios para auditoria.
- **Carregamento de Demo**: Popula o sistema com centenas de dados para treinamento instantâneo.
- **Zerar Tudo**: Função de segurança para preparar o sistema antes de entrar em produção real.

---

## 🔒 Segurança e Acessos

- **SUPER_ADMIN**: Controle total de usuários e sistema.
- **GERENTE**: Gestão de filas, configurações e relatórios.
- **OPERADOR**: Atendimento direto.
- **RECEPCIONISTA**: Emissão de senhas.

---

## 📞 Suporte e Contato

Para manutenção, suporte ou dúvidas técnicas:

- **Suporte Técnico - FILA-APP**
- **WhatsApp**: (98) 98102-5255
- **Horário**: Segunda a Sexta, 08h às 18h.

---

**FILA-APP v1.0**  
*Inovação e Saúde caminhando juntos.*
