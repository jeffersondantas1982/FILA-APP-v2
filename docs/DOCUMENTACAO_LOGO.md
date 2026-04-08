# Documentação da Identidade Visual - FILA-APP

## 🎨 Logo do Sistema

### Visão Geral

A logo do FILA-APP foi desenvolvida para representar visualmente o conceito de gerenciamento de filas de atendimento, combinando elementos modernos e profissionais que transmitem organização, fluxo e eficiência.

---

## 📐 Especificações Técnicas

### Arquivo
- **Nome**: `logo_.png`
- **Formato**: PNG com transparência (canal alpha)
- **Localização**: `public/img/logo_.png`
- **Tamanho**: ~238 KB
- **Dimensões**: Escalável (uso recomendado: 140px de largura)

### Elementos Visuais

#### 1. Ticket Central
- Representa a senha/número de atendimento
- Símbolo "1" destacado no centro
- Formato retangular arredondado

#### 2. Pessoas em Fila
- Círculos representando clientes/pacientes
- Dispostos ao redor do ticket
- Simbolizam organização e fluxo

#### 3. Setas de Movimento
- Indicam direção e fluxo contínuo
- Sugerem dinamismo e eficiência
- Reforçam conceito de gerenciamento ativo

#### 4. Badge Arredondado
- Formato de ícone moderno (rounded square)
- Bordas suaves e profissionais
- Fácil reconhecimento em diferentes tamanhos

---

## 🎨 Paleta de Cores

### Gradiente Principal
```css
background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
```

| Cor | Código Hex | RGB | Uso |
|-----|------------|-----|-----|
| **Azul Primário** | `#3b82f6` | rgb(59, 130, 246) | Início do gradiente, elementos principais |
| **Roxo Acento** | `#8b5cf6` | rgb(139, 92, 246) | Fim do gradiente, destaques |

### Significado das Cores
- **Azul**: Confiança, profissionalismo, tecnologia
- **Roxo**: Inovação, modernidade, qualidade

---

## 📏 Guia de Uso

### Tamanhos Recomendados

| Contexto | Largura | Altura | Uso |
|----------|---------|--------|-----|
| **Login** | 140px | Auto | Tela de autenticação |
| **Sidebar** | 48px | Auto | Menu lateral (futuro) |
| **Favicon** | 32px | 32px | Ícone do navegador |
| **Mobile** | 80px | Auto | Aplicativo móvel |
| **Impressão** | 300px | Auto | Documentos oficiais |

### Espaçamento Mínimo
- Manter área livre ao redor da logo de pelo menos **20% da largura** da imagem
- Não sobrepor texto ou elementos gráficos muito próximos

---

## 💻 Implementação no Código

### HTML
```html
<img src="img/logo_.png" alt="FILA-APP Logo" class="logo">
```

### CSS - Tela de Login
```css
.logo {
    width: 140px;
    height: auto;
    margin-bottom: 16px;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
    animation: fadeIn 0.8s ease-out 0.2s both;
}

@keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
}
```

### Efeitos Aplicados
- **Drop Shadow**: Sombra suave para destaque
- **Animação FadeIn**: Entrada suave ao carregar
- **Responsive**: Escala automaticamente (height: auto)

---

## 🔄 Variações e Adaptações

### Fundos Diferentes

#### Fundo Claro (Branco/Cinza Claro)
✅ **Recomendado** - Logo possui contraste natural
- Usar versão padrão colorida
- Sombra sutil para profundidade

#### Fundo Escuro (Preto/Azul Escuro)
✅ **Funciona bem** - Gradiente se destaca
- Usar versão padrão colorida
- Considerar aumentar brilho se necessário

#### Fundo Colorido
⚠️ **Atenção** - Testar contraste
- Verificar legibilidade
- Pode necessitar versão monocromática

### Versões Alternativas (Futuras)

#### Monocromática Branca
- Para fundos escuros/coloridos
- Manter apenas contorno e formas
- Cor: `#FFFFFF` com opacidade 90%

#### Monocromática Preta
- Para impressão P&B
- Documentos oficiais
- Cor: `#1e293b`

#### Versão Simplificada
- Apenas o ticket central
- Para ícones muito pequenos (< 32px)
- Favicon do navegador

---

## 📱 Aplicações no Sistema

### Implementado
- ✅ **Tela de Login** (`login.html`)
  - Tamanho: 140px
  - Posição: Centro superior do card
  - Animação: FadeIn suave

### Recomendado para Implementação Futura

#### Painel TV (`panel.html`)
```html
<img src="img/logo_.png" alt="FILA-APP" style="width: 80px;">
```

#### Totem (`totem.html`)
```html
<img src="img/logo_.png" alt="FILA-APP" style="width: 120px;">
```

#### Dashboard (`dashboard.html`)
```html
<!-- Sidebar -->
<img src="img/logo_.png" alt="FILA-APP" style="width: 48px;">
```

#### Favicon
```html
<link rel="icon" type="image/png" href="img/logo_.png">
```

---

## 🎯 Diretrizes de Marca

### ✅ Permitido
- Redimensionar proporcionalmente
- Aplicar sombras suaves
- Usar em fundos claros ou escuros
- Adicionar animações sutis (fade, scale)

### ❌ Não Permitido
- Distorcer ou esticar desproporcionalmente
- Alterar cores do gradiente
- Adicionar bordas ou contornos extras
- Rotacionar em ângulos não-padrão
- Sobrepor com outros elementos gráficos
- Usar em baixa resolução (pixelado)

---

## 🔧 Manutenção e Atualização

### Substituir a Logo
1. Criar novo arquivo PNG com fundo transparente
2. Nomear como `logo_.png`
3. Substituir em `public/img/logo_.png`
4. Limpar cache do navegador (`Ctrl + F5`)

### Criar Variações
1. Editar arquivo original em editor gráfico (Photopea, GIMP, Photoshop)
2. Manter proporções e conceito visual
3. Exportar em PNG com transparência
4. Testar em diferentes fundos

### Otimização
```bash
# Comprimir PNG sem perder qualidade
# Usar ferramentas como TinyPNG ou ImageOptim
# Manter tamanho < 300 KB para web
```

---

## 📊 Checklist de Qualidade

Ao criar ou atualizar a logo, verificar:

- [ ] Fundo transparente (canal alpha)
- [ ] Formato PNG
- [ ] Tamanho otimizado (< 300 KB)
- [ ] Dimensões mínimas 512x512px
- [ ] Cores corretas (#3b82f6 → #8b5cf6)
- [ ] Elementos centralizados
- [ ] Bordas suaves (anti-aliasing)
- [ ] Testada em fundo claro
- [ ] Testada em fundo escuro
- [ ] Legível em tamanhos pequenos (48px)

---

## 🎨 Identidade Complementar

### Tipografia
- **Fonte Principal**: Inter (Google Fonts)
- **Pesos**: 300, 400, 500, 600, 700, 800
- **Uso**: Interface, textos, títulos

### Nome da Marca
```css
.brand-name {
    font-size: 28px;
    font-weight: 800;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
}
```

### Tagline
**"Sistema de Gerenciamento de Filas"**
- Fonte: Inter, 14px, peso 500
- Cor: `#64748b` (cinza médio)

---

**Desenvolvido para**: Ambientes de Unidade de Saúde  
**Licença**: MIT  
**Versão**: 1.0  
**Data**: Março 2026

---

A logo do FILA-APP é licenciada sob os termos da Licença MIT para uso no ecossistema do sistema de gerenciamento de filas.

---

**Versão da Documentação**: 1.0  
**Última Atualização**: Fevereiro 2026
