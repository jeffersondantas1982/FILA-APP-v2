# Manual do Usuário - FILA-APP

## 📖 Índice
1. [Introdução](#introdução)
2. [Perfis de Usuário](#perfis-de-usuário)
3. [Recepção](#recepção)
4. [Painel do Operador](#painel-do-operador)
5. [Dashboard Gerencial](#dashboard-gerencial)
6. [Relatórios](#relatórios)
7. [Configurações](#configurações)
8. [Gerenciamento de Usuários](#gerenciamento-de-usuários)

---

## 🎯 Introdução

O **FILA-APP** é um sistema completo de gerenciamento de filas de atendimento, desenvolvido para otimizar o fluxo de clientes em unidades de saúde, clínicas, órgãos públicos e empresas em geral.

### Principais Funcionalidades
- ✅ Emissão de senhas por setor
- ✅ Painel de TV para chamadas
- ✅ Totem de autoatendimento
- ✅ Controle de operadores
- ✅ Relatórios e métricas avançadas
- ✅ Dashboard em tempo real

---

## 👥 Perfis de Usuário

### SUPER_ADMIN
**Acesso Total ao Sistema**
- Gerenciar usuários
- Configurar setores
- Carregar dados demo
- Zerar sistema para produção
- Acesso a todos os relatórios

### GERENTE
**Gestão e Relatórios**
- Visualizar dashboard
- Gerar relatórios
- Resetar fila
- Configurar setores
- Emitir senhas manualmente

### OPERADOR
**Atendimento**
- Chamar senhas
- Iniciar/concluir atendimentos
- Cancelar/redirecionar senhas
- Visualizar fila do setor

### RECEPCIONISTA
**Emissão de Senhas**
- Emitir senhas manualmente
- Visualizar senhas aguardando
- Acesso à tela de recepção

---

## 🏢 Recepção e Triagem

### Acessar
`http://localhost:3000/index.html`

### Emitir Senha Manual
1. Selecione o **Setor** no dropdown
2. O sistema sugere automaticamente o próximo número
3. Clique em **Emitir Senha**
4. A senha é exibida na tela e enviada ao painel

### Visualizar Fila
- **Na Fila**: Senhas aguardando atendimento
- **Chamando**: Senhas sendo chamadas no momento
- **Em Atendimento**: Senhas em processo de atendimento

---

## 🎧 Painel do Operador

### Acessar
`http://localhost:3000/operator.html`

### Fluxo de Trabalho

#### 1. Login
- Digite **usuário** e **senha**
- Clique em **Entrar**

#### 2. Selecionar Setor
- Escolha o setor do seu guichê
- Clique em **Confirmar**

#### 3. Chamar Próxima Senha
- Clique em **Chamar Próximo**
- A senha aparece na tela grande
- Som de alerta toca no painel TV

#### 4. Iniciar Atendimento
- Clique em **Iniciar Atendimento**
- O cronômetro começa a contar

#### 5. Finalizar
Opções disponíveis:
- **Concluir**: Atendimento finalizado com sucesso
- **Cancelar**: Cliente desistiu
- **Não Compareceu**: Cliente não apareceu
- **Redirecionar**: Enviar para outro setor

#### 6. Chamar Novamente
- Se o cliente não ouviu, clique em **Chamar Novamente**
- O som toca novamente no painel

---

## 📊 Dashboard Gerencial

### Acessar
`http://localhost:3000/dashboard.html`

### Visão Geral

#### KPIs Principais
- **Na Fila**: Senhas aguardando agora
- **Total Hoje**: Senhas emitidas no dia
- **Tempo Médio Espera**: Em minutos
- **Tempo Médio Atendimento**: Em minutos

#### Gráficos Disponíveis

**1. Atendimentos por Setor**
- Distribuição de senhas por setor
- Gráfico de rosca (doughnut)

**2. Tempo Médio por Setor**
- Comparação de tempos de espera e atendimento
- Gráfico de barras

**3. Fluxo por Horário**
- Picos de atendimento ao longo do dia
- Gráfico de linha

**4. Distribuição de Paciência**
- Classificação por tempo de espera:
  - 🟢 Rápido (< 15 min)
  - 🟡 Médio (15-45 min)
  - 🔴 Crítico (> 45 min)

**5. Produtividade Geral**
- Ranking de operadores por volume
- Tempo médio de cada operador

**6. Top Agilidade**
- Operadores com mais atendimentos rápidos (< 15 min)
- Medalhas: 🥇 🥈 🥉

### Filtros de Período
- **Hoje**: Dados do dia atual
- **Semana**: Últimos 7 dias
- **Mês**: Últimos 30 dias

### Personalização do Dashboard

#### Modo Fullscreen
- Clique no ícone **☰** (menu) para ocultar a barra lateral
- Ideal para exibição em monitores dedicados

#### Reorganizar Quadros
- Arraste os quadros pelo ícone de **grip** (≡)
- Solte na posição desejada

#### Redimensionar Gráficos
- Passe o mouse na borda do quadro
- Arraste para aumentar/diminuir

#### Ocultar Widgets
- Clique no ícone de **olho** (👁️) no topo
- Desmarque os quadros que não deseja ver
- Útil para focar em métricas específicas

#### Restaurar Layout Padrão
- Clique no ícone de **desfazer** (↶)
- Confirme para resetar para o layout original

### Auto-Atualização
- Dashboard atualiza automaticamente a cada **30 segundos**
- Indicador mostra hora da última atualização

---

## 📈 Relatórios

### Acessar
`http://localhost:3000/reports.html`

### Filtros Disponíveis

#### Por Período
- **Data Início**: Selecione a data inicial
- **Data Fim**: Selecione a data final

#### Por Setor
- Escolha um setor específico ou "Todos"

#### Por Status
- **Todos**: Todas as senhas
- **Concluído**: Atendimentos finalizados
- **Cancelado**: Senhas canceladas
- **Não Compareceu**: Clientes que não apareceram

### Gerar Relatório
1. Configure os filtros desejados
2. Clique em **Gerar Relatório**
3. A tabela será preenchida com os dados

### Informações Exibidas
- Número da senha
- Setor
- Status
- Data/hora de criação
- Data/hora de atualização
- Operador responsável

### Exportar (Futuro)
- PDF
- Excel
- CSV

---

## ⚙️ Configurações

### Acessar
`http://localhost:3000/settings.html`

**Acesso**: GERENTE e SUPER_ADMIN

### Configurações Gerais

#### Nome da Instituição
- Digite o nome que aparecerá no Totem e Painel TV
- Clique em **Salvar**

### Gerenciar Setores

#### Criar Novo Setor
1. Clique em **Novo Setor**
2. Preencha:
   - **Nome**: Ex: "Atendimento Geral"
   - **Sala**: Ex: "Sala 1" ou "Guichê 3"
   - **Prefixo**: Uma letra (A-Z)
3. Clique em **Salvar**

#### Editar Setor
1. Clique no botão **✏️** (editar)
2. Modifique os dados
3. Clique em **Salvar**

#### Deletar Setor
1. Clique no botão **🗑️** (deletar)
2. Confirme a exclusão
> ⚠️ **Atenção**: Isso pode afetar históricos!

### Zona de Perigo

#### Resetar Fila (GERENTE + SUPER_ADMIN)
**Quando usar**: Início de novo turno ou período

**O que faz**:
- ✅ Reinicia contagem de senhas (volta ao 01)
- ✅ Cancela senhas ativas
- ✅ **Preserva histórico** para relatórios

**Como usar**:
1. Clique em **Resetar Fila**
2. Confirme a ação
3. Próxima senha será 01

#### Carregar Demo (SUPER_ADMIN apenas)
**Quando usar**: Apresentações, treinamentos, testes

**O que faz**:
- Cria 5 usuários padrão:
  - `admin` / `admin123` (SUPER_ADMIN)
  - `gerente` / `gerente123` (GERENTE)
  - `operador1` / `op123` (OPERADOR)
  - `operador2` / `op123` (OPERADOR)
  - `operador3` / `op123` (OPERADOR)
- Popula ~200 senhas históricas (últimos 7 dias)
- Dados realistas com horários variados

**Como usar**:
1. Clique em **Carregar Demo**
2. Confirme
3. Aguarde conclusão (~10 segundos)

#### Zerar Tudo (SUPER_ADMIN apenas)
**Quando usar**: Após demonstrações, antes de produção

**O que faz**:
- ⚠️ Remove **PERMANENTEMENTE** todos os registros de senhas
- ⚠️ Ação **IRREVERSÍVEL**
- Limpa sistema para início limpo

**Como usar**:
1. Clique em **Zerar Tudo**
2. Digite exatamente: `ZERAR TUDO`
3. Confirme
4. Sistema será completamente limpo

---

## 👤 Gerenciamento de Usuários

### Acessar
`http://localhost:3000/users.html`

**Acesso**: SUPER_ADMIN apenas

### Criar Novo Usuário
1. Clique em **Novo Usuário**
2. Preencha:
   - **Nome de Usuário**: Login do usuário
   - **Senha**: Mínimo 6 caracteres
   - **Perfil**: Selecione o nível de acesso
3. Clique em **Salvar**

### Editar Usuário
1. Clique no botão **✏️** (editar)
2. Modifique os dados
3. Deixe senha em branco para manter a atual
4. Clique em **Salvar**

### Deletar Usuário
1. Clique no botão **🗑️** (deletar)
2. Confirme a exclusão
> ⚠️ **Atenção**: Você não pode deletar sua própria conta!

---

## 📺 Painel TV (Display Público)

### Acessar
`http://localhost:3000/panel.html`

### Características
- **Atualização Automática**: Via WebSocket em tempo real
- **Som de Alerta**: Toca quando senha é chamada
- **Exibição**:
  - Senha sendo chamada (grande)
  - Setor/Sala
  - Senhas em atendimento (lista)

### Configuração Recomendada
1. Use TV/Monitor dedicado
2. Configure navegador em **modo fullscreen** (F11)
3. Desabilite proteção de tela
4. Configure inicialização automática do navegador

---

## 📱 Totem de Autoatendimento

### Acessar
`http://localhost:3000/totem.html`

### Fluxo do Cliente
1. Cliente toca na tela
2. Seleciona o setor desejado
3. Senha é emitida automaticamente
4. Senha aparece na tela grande
5. Cliente aguarda chamada no painel

### Configuração Recomendada
1. Use tablet ou computador touch
2. Configure modo **kiosk** (navegador bloqueado)
3. Posicione em local de fácil acesso
4. Adicione instruções visuais

---

## 💡 Dicas e Boas Práticas

### Para Operadores
- ✅ Sempre clique em "Iniciar Atendimento" para cronometrar corretamente
- ✅ Use "Chamar Novamente" se o cliente não ouvir
- ✅ Redirecione senhas ao invés de cancelar quando possível
- ✅ Finalize corretamente (Concluir/Cancelar/Não Compareceu)

### Para Gerentes
- ✅ Monitore o dashboard regularmente
- ✅ Use filtros semanais para identificar padrões
- ✅ Observe picos de horário para dimensionar equipe
- ✅ Acompanhe ranking de agilidade para reconhecer bons operadores

### Para Administradores
- ✅ Faça backup do banco de dados regularmente
- ✅ Use "Resetar Fila" diariamente ou por turno
- ✅ Mantenha senhas seguras
- ✅ Treine operadores antes de colocar em produção

---

## ❓ Perguntas Frequentes

### Como reiniciar a numeração das senhas?
Use **Resetar Fila** em Configurações. A próxima senha será 01.

### Os relatórios somem quando reseto a fila?
Não! O "Resetar Fila" preserva todo o histórico. Apenas "Zerar Tudo" remove dados.

### Posso ter mais de um operador no mesmo setor?
Sim! Vários operadores podem atender o mesmo setor simultaneamente.

### Como adicionar um novo setor?
Acesse Configurações > Gerenciar Setores > Novo Setor.

### O que fazer se o painel não atualizar?
1. Verifique conexão de rede
2. Recarregue a página (F5)
3. Verifique se o servidor está rodando

### Como exportar relatórios?
Atualmente, use a função de impressão do navegador (Ctrl+P) e salve como PDF.

---

## 🔐 Segurança

### Recomendações
- 🔒 Altere senhas padrão imediatamente
- 🔒 Não compartilhe credenciais de SUPER_ADMIN
- 🔒 Faça logout ao sair
- 🔒 Use senhas fortes (mínimo 8 caracteres)
- 🔒 Revise usuários periodicamente

---

## 📞 Suporte

### Em caso de problemas:
1. Consulte este manual
2. Verifique o Manual de Instalação
3. Entre em contato com o administrador do sistema
4. Relate bugs detalhadamente (tela, ação, erro)

---

**Versão**: 1.0  
**Última Atualização**: Março 2026  
**Licença**: MIT  
**Desenvolvido para**: Gestão de Unidades de Saúde e Atendimento Geral
