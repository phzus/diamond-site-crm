# Diamond CRM Admin — Design System

> Extraído da landing page (`apps/landing-page`) para garantir consistência visual entre os dois produtos. Qualquer decisão de cor, tipografia ou componente deve seguir este documento antes de criar algo novo.

---

## 1. Identidade Visual

A Diamond opera com uma estética **dark-first, monocromática** — preto e branco com escala de cinzas, sem cores de marca secundárias. O único "acento" vem de gradientes sutis e efeitos de glassmorphism.

No CRM admin, a paleta base é a mesma, com a adição de **cores funcionais** para os status dos leads (azul, amarelo, roxo, laranja, verde, vermelho). Essas cores de status são as únicas exceções à paleta monocromática.

---

## 2. Tokens de Cor

### 2.1 Paleta Base (Dark Mode — padrão)

```css
/* Fundos */
--background:   #000000;   /* fundo raiz */
--card:         #0a0a0a;   /* cards, painéis */
--secondary:    #1a1a1a;   /* fundos secundários, hover states */
--input:        #262626;   /* inputs, bordas */
--border:       #262626;   /* bordas gerais */

/* Texto */
--foreground:          #ffffff;   /* texto primário */
--muted-foreground:    #a0a0a0;   /* texto secundário, labels, placeholders */

/* Primário (ações) */
--primary:             #ffffff;
--primary-foreground:  #000000;

/* Destrutivo */
--destructive:         #ff3333;

/* Ring (focus) */
--ring: #ffffff;
```

### 2.2 Paleta Base (Light Mode — opcional)

```css
--background:          #ffffff;
--card:                #f5f5f5;
--secondary:           #e5e5e5;
--input:               #d4d4d4;
--border:              #d4d4d4;
--foreground:          #000000;
--muted-foreground:    #525252;
--primary:             #000000;
--primary-foreground:  #ffffff;
--destructive:         #dc2626;
--ring:                #000000;
```

### 2.3 Cores Funcionais — Status dos Leads

Estas cores **não existem na landing page** e são adicionadas exclusivamente para o CRM.

| Status | Label | Cor (badge bg) | Cor (texto) | Token |
|---|---|---|---|---|
| `new` | Novo | `#1d4ed8` (blue-700) | `#bfdbfe` (blue-100) | `--status-new` |
| `contacted` | Contactado | `#854d0e` (yellow-800) | `#fef08a` (yellow-200) | `--status-contacted` |
| `scheduled` | Visita Agendada | `#581c87` (purple-900) | `#e9d5ff` (purple-200) | `--status-scheduled` |
| `visited` | Visitou | `#9a3412` (orange-800) | `#fed7aa` (orange-200) | `--status-visited` |
| `converted` | Convertido | `#14532d` (green-900) | `#bbf7d0` (green-200) | `--status-converted` |
| `discarded` | Descartado | `#1c1c1c` | `#6b7280` (gray-500) | `--status-discarded` |

### 2.4 Cores Funcionais — Prioridade

| Prioridade | Cor (borda do card Kanban) | Token |
|---|---|---|
| `high` | `#ef4444` (red-500) | `--priority-high` |
| `medium` | `#f59e0b` (amber-500) | `--priority-medium` |
| `low` | `#6b7280` (gray-500) | `--priority-low` |

### 2.5 Gradientes

```css
/* Gradiente de texto (títulos de destaque) */
.text-gradient {
  background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Card glassmorphism */
.glass-card {
  background: radial-gradient(120.54% 92.13% at 94.63% 93.72%,
    rgba(65,65,65,0.6) 0%, rgba(32,32,32,0.6) 100%);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.2);
}
```

---

## 3. Tipografia

### 3.1 Fontes

| Fonte | Uso | Variável CSS | Localização |
|---|---|---|---|
| **Helvetica Now Display** | Corpo, UI, dados | `--font-helvetica` | `apps/landing-page/public/fonts/Helvetica Now Display/` |
| **Distrampler** | Títulos de marketing | `--font-distrample` | `apps/landing-page/public/fonts/Distrampler.ttf` |

> No admin, **usar apenas Helvetica Now Display** para toda a interface. Distrampler é fonte de marketing e não se aplica a UI de dados.

### 3.2 Copiar Fontes para o Admin

```
apps/landing-page/public/fonts/ → apps/admin/public/fonts/
```

Copiar apenas:
- `Helvetica Now Display/HelveticaNowDisplay-Light.woff2`
- `Helvetica Now Display/HelveticaNowDisplay-Regular.woff2`
- `Helvetica Now Display/HelveticaNowDisplay-Medium.woff2`
- `Helvetica Now Display/HelveticaNowDisplay-Bold.woff2`

### 3.3 Escala Tipográfica no Admin

| Uso | Classe Tailwind | Peso | Observação |
|---|---|---|---|
| Título de página | `text-2xl` | `font-semibold` | Ex: "Leads", "Dashboard" |
| Título de card/seção | `text-lg` | `font-medium` | Ex: cabeçalhos de card |
| Label de campo | `text-sm` | `font-medium` | Labels de formulário |
| Dado/Valor | `text-sm` | `font-normal` | Conteúdo de tabelas |
| Texto auxiliar | `text-xs` | `font-normal` | `text-muted-foreground` |
| Badge | `text-xs` | `font-medium` | Status, prioridade |

---

## 4. Logo e Assets

### 4.1 Arquivos de Logo

| Arquivo | Dimensão | Uso |
|---|---|---|
| `apps/landing-page/public/logo.svg` | 140×40px | Sidebar do admin (desktop) |
| `apps/landing-page/public/símbolo.svg` | 40×40px | Sidebar colapsada (ícone) |

Copiar para `apps/admin/public/`.

### 4.2 Favicon

Copiar de `apps/landing-page/src/app/`:
- `favicon-dark-mode.svg` → usar como favicon padrão do admin (interface dark)
- `favicon-light-mode.svg` → alternativo

---

## 5. Componentes Base

### 5.1 Botões

```
Primário:  bg-white text-black rounded-full font-medium text-sm
           hover: scale-105, shadow glow branco
           shadow: 0 0 20px -5px rgba(255,255,255,0.3)

Secundário: border border-white/20 text-white rounded-full
            hover: border-white bg-white/5

Destrutivo: bg-destructive text-white rounded-lg
            (em dialogs de confirmação)
```

### 5.2 Badges de Status

```tsx
// Estrutura base de todos os badges
<span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
```

Mapeamento de classes por status:

```ts
const statusClasses = {
  new:        'bg-blue-700/20  text-blue-200  border border-blue-700/30',
  contacted:  'bg-yellow-800/20 text-yellow-200 border border-yellow-700/30',
  scheduled:  'bg-purple-900/20 text-purple-200 border border-purple-700/30',
  visited:    'bg-orange-800/20 text-orange-200 border border-orange-700/30',
  converted:  'bg-green-900/20  text-green-200  border border-green-700/30',
  discarded:  'bg-white/5       text-gray-500   border border-white/10',
}

const priorityClasses = {
  high:   'border-l-2 border-l-red-500',
  medium: 'border-l-2 border-l-amber-500',
  low:    'border-l-2 border-l-gray-500',
}
```

### 5.3 Cards / Painéis

```
Fundo padrão:   bg-card (#0a0a0a)
Borda:          border border-border (#262626)
Border-radius:  rounded-xl (12px)
Padding:        p-4 sm:p-6

Hover (cards clicáveis): hover:bg-secondary/50 transition-colors
```

### 5.4 Inputs

```
bg-input border-border text-foreground
placeholder: text-muted-foreground
focus: ring-1 ring-ring
border-radius: rounded-lg
```

### 5.5 Navbar/Header do Admin

```
fixed top-0, z-50
h-16
bg-black/50 backdrop-blur-[8px]
border-b border-white/[0.12]
```

### 5.6 Sidebar

```
bg-card (#0a0a0a)
border-r border-border
width: 240px (expanded), 64px (collapsed)

Item ativo:   bg-secondary text-foreground
Item hover:   hover:bg-secondary/60
Item texto:   text-sm font-medium
```

---

## 6. Efeitos Visuais

### 6.1 Blur / Glass

```css
/* Navbar e modais */
backdrop-blur-[8px]

/* Sheet/Drawer overlay */
backdrop-blur-md

/* Glassmorphism card (uso sparingly no admin) */
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.2);
```

### 6.2 Sombras

```css
/* Botão CTA (uso em botões primários de destaque) */
box-shadow: 0 0 20px -5px rgba(255,255,255,0.3);

/* Hover */
box-shadow: 0 0 30px -5px rgba(255,255,255,0.5);
```

### 6.3 Opacidade/Transparência

```
Bordas sutis:    rgba(255,255,255,0.12) = border-white/[0.12]
Hover state:     rgba(255,255,255,0.05) = bg-white/5
Hover ativo:     rgba(255,255,255,0.10) = bg-white/10
Overlay escuro:  rgba(0,0,0,0.50)      = bg-black/50
```

---

## 7. Animações (Framer Motion)

### 7.1 Padrões usados na Landing

```ts
// Easing padrão Diamond
const easeSmooth = [0.22, 1, 0.36, 1]
const easeGentle = [0.16, 1, 0.3, 1]

// Entrada de página / hero content
{ y: 20, opacity: 0 } → { y: 0, opacity: 1 }
duration: 0.6, ease: easeSmooth

// Navbar
{ y: -20, opacity: 0 } → { y: 0, opacity: 1 }
duration: 0.8, ease: easeSmooth
```

### 7.2 Padrões para o Admin

```ts
// Transição de página (layout)
{ opacity: 0, y: 8 } → { opacity: 1, y: 0 }
duration: 0.3, ease: easeSmooth

// Aparição de cards/listas
{ opacity: 0, y: 4 } → { opacity: 1, y: 0 }
duration: 0.2, staggerChildren: 0.05

// Sheet (Drawer) — usar o Framer Motion do Radix/Shadcn, não customizar
```

---

## 8. Layout e Espaçamento

### 8.1 Container

```css
/* Landing page usa: */
.container-diamond {
  max-width: 1280px; /* 7xl */
  padding: 16px (mobile) / 24px (sm) / 32px (lg);
}

/* Admin usa layout sidebar+content, sem container global */
/* Conteúdo principal: */
.main-content {
  padding: 24px; /* p-6 */
  max-width: 100%; /* preenche o espaço restante da sidebar */
}
```

### 8.2 Border Radius

```
rounded-full → botões, avatares
rounded-xl   → cards, imagens, icon containers (12px)
rounded-lg   → inputs, selects, dropdowns (8px)
rounded-md   → badges, tooltips (6px)
```

### 8.3 Espaçamento Vertical

```
Entre seções:     gap-6 (24px) ou gap-8 (32px)
Dentro de cards:  p-4 (16px) ou p-6 (24px)
Entre itens:      gap-3 (12px) ou gap-4 (16px)
```

---

## 9. Shadcn/UI — Configuração para Diamond

Ao inicializar o Shadcn no admin, **não usar o tema padrão Zinc**. Substituir o `globals.css` gerado pelos tokens acima.

Configuração recomendada no `shadcn init`:
- Style: `Default`
- Base color: `Neutral` (mais próximo da paleta Diamond)
- CSS variables: `Yes`

Após o init, **sobrescrever** as variáveis de cor no `globals.css` com os valores da seção 2 deste documento.

---

## 10. Referências de Arquivos na Landing Page

| Asset | Caminho na Landing Page |
|---|---|
| globals.css | `apps/landing-page/src/app/globals.css` |
| Fontes | `apps/landing-page/public/fonts/` |
| logo.svg | `apps/landing-page/public/logo.svg` |
| símbolo.svg | `apps/landing-page/public/símbolo.svg` |
| favicon (dark) | `apps/landing-page/src/app/favicon-dark-mode.svg` |

---

*Versão 1.0 — Criado em 15/03/2026. Extraído da landing page Diamond para padronização do CRM admin.*
