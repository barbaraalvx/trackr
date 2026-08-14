# Especificação de Identidade Visual — trackr

Complementar à spec técnica (`spec-log-atividades.md`). Define os tokens visuais para orientar a implementação de UI no Antigravity, substituindo o estilo padrão (roxo/verde vibrante, cantos muito arredondados) por uma identidade própria, mais madura.

---

## 1. Direção de estilo

**Editorial sóbrio**, com leve suavização de cantos:
- Fundo claro, neutro e levemente quente (não branco puro, não cinza frio).
- Tipografia com um toque editorial no que for título/identidade (serifada), mantendo sans-serif no restante da UI (inputs, labels, corpo).
- Cor usada com moderação — grandes áreas neutras, cor concentrada em chips, badges e acentos pontuais.
- Cantos levemente arredondados (não retos como um terminal, não "pílula" como o padrão anterior).

---

## 2. Tokens de layout

| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | 6px | inputs, botões pequenos |
| `--radius-md` | 8px | cards, chips, containers |
| `--radius-lg` | 10px | painéis maiores, modais |
| `--border-width` | 0.5px | bordas padrão (hairline) |
| `--border-width-accent` | 1px | bordas de destaque (ex: chip selecionado) |

> Nada de `border-radius` acima de 10px — evita o efeito "pílula" do estilo anterior.

---

## 3. Cores base (superfícies e texto)

| Token | Hex | Uso |
|---|---|---|
| `--surface-page` | `#FAF9F6` | fundo da página |
| `--surface-card` | `#FFFFFF` | cards, painéis |
| `--border-default` | `#D3D1C7` | borda padrão |
| `--border-strong` | `#B4B2A9` | borda em hover/foco |
| `--text-primary` | `#2C2C2A` | texto principal |
| `--text-secondary` | `#5F5E5A` | texto secundário/labels |
| `--text-muted` | `#888780` | placeholders, hints |
| `--accent-primary` | `#712B13` | cor de destaque única do produto (títulos com ícone, links, botão principal) — tom coral escuro |

> `--accent-primary` é a única cor "de marca" do trackr — usada com moderação (ícones de seção, CTA principal). As demais cores (seção 4) são exclusivas para chips de contexto/categoria, nunca para elementos estruturais da UI.

### Modo escuro (opcional, futuro)
Os tokens acima devem ter contraparte dark (ex: `--surface-page` → `#1A1A19`, `--text-primary` → `#F1EFE8`), seguindo a mesma lógica de ramps da seção 4. Não é prioridade da v1, mas o schema de cores já foi pensado para suportar isso (ver seção 4).

---

## 4. Paleta de chips (contexto e categoria)

8 famílias de cor, cada uma com 2 tons (claro/médio) — 16 combinações no total. Todas seguem o padrão: **fundo do tom escolhido + texto no tom mais escuro da mesma família** (nunca preto genérico), garantindo legibilidade e coerência com o fundo claro do produto.

| Família | Tom claro (bg) | Texto (tom claro) | Tom médio (bg) | Texto (tom médio) |
|---|---|---|---|---|
| Coral | `#F5C4B3` | `#4A1B0C` | `#F0997B` | `#4A1B0C` |
| Teal | `#9FE1CB` | `#04342C` | `#5DCAA5` | `#04342C` |
| Pink | `#F4C0D1` | `#4B1528` | `#ED93B1` | `#4B1528` |
| Roxo | `#CECBF6` | `#26215C` | `#AFA9EC` | `#26215C` |
| Âmbar | `#FAC775` | `#412402` | `#EF9F27` | `#412402` |
| Gray | `#D3D1C7` | `#2C2C2A` | `#B4B2A9` | `#2C2C2A` |
| Azul | `#B5D4F4` | `#042C53` | `#85B7EB` | `#042C53` |
| Verde | `#C0DD97` | `#173404` | `#97C459` | `#173404` |

**Convenção de uso sugerida:**
- Tom **claro** → chips de **contexto** (Indicium, Pessoal, Estudos).
- Tom **médio** → chips de **categoria** (Bug, Feature, Reunião).

Essa distinção sutil (mesma família de cor, intensidade diferente) ajuda a diferenciar visualmente contexto de categoria sem precisar de duas paletas totalmente separadas — e evita que a tela fique com "excesso de cores diferentes" quando há vários chips juntos.

**Atribuição de cor:** ao criar um novo contexto ou categoria, a cor pode ser escolhida livremente pelo usuário dentre as 8 famílias (seletor de cor no admin, como já existe hoje), aplicando automaticamente o tom correspondente (claro para contexto, médio para categoria).

---

## 5. Tipografia

| Token | Valor | Uso |
|---|---|---|
| `--font-sans` | Inter, system-ui, sans-serif | corpo, labels, inputs, botões |
| `--font-serif` | "Source Serif 4", Georgia, serif | títulos de seção (ex: "Contextos", "Categorias"), título de resumos/retros |
| Peso | 400 (regular) / 500 (medium) | apenas dois pesos — nunca bold 600/700, para manter leveza editorial |
| Tamanho corpo | 14–16px | |
| Tamanho título de seção | 15–16px, serifada | |
| Caixa | sentence case sempre | nunca Title Case nem CAIXA ALTA |

---

## 6. Componentes-chave

### Input (contexto/categoria/entrada)
- Fundo `--surface-card`, borda `0.5px solid --border-default`, `border-radius: var(--radius-sm)`.
- Foco: borda `--border-strong` ou leve anel de foco na cor `--accent-primary`.

### Chip (contexto/categoria)
- `border-radius: var(--radius-md)` (8px — nem reto, nem pílula).
- Padding `5px 11px` a `6px 10px`.
- Fonte 11–12px, peso 500.
- Cor conforme seção 4.

### Botão primário ("+ Criar", "Salvar")
- Fundo transparente, borda `0.5px solid --accent-primary`, texto `--accent-primary`.
- Hover: fundo levemente tingido com a cor de destaque (ex: `--accent-primary` a 8-10% de opacidade).
- Evitar botões "cheios"/sólidos como CTA padrão — reforça o tom sóbrio/editorial (botão sólido fica reservado para 1 ação principal por tela, se necessário).

### Card (painel de contexto/categoria, resumo, etc.)
- Fundo `--surface-card`, borda `0.5px solid --border-default`, `border-radius: var(--radius-lg)` (10px), padding `16px`.

### Ícones
- Estilo outline (não preenchido), tamanho 15–16px inline junto a títulos, cor `--accent-primary` quando acompanha título de seção, `--text-secondary` em contextos neutros.

---

## 7. O que evitar (vindo do estado atual)

- Cores vibrantes/saturadas em blocos grandes (ex: botão roxo sólido, botão verde sólido) — substituídas por bordas/acentos sutis.
- `border-radius` alto (pílula) em inputs e botões — usar no máximo 10px.
- Múltiplas cores fortes concorrendo na mesma tela (ex: roxo + verde + botões coloridos todos juntos) — a cor de marca é só `--accent-primary`; as demais cores ficam restritas aos chips.

---

## 8. Aplicação no Antigravity

Sugestão de organização:
- Definir os tokens da seção 2–4 como variáveis CSS globais (ex: `globals.css` ou config do Tailwind, se o projeto usar Tailwind).
- Mapear a paleta de 16 combinações (seção 4) como um array/enum de opções de cor reutilizável no seletor de cor do admin (contexto e categoria), assim como já existe hoje — só trocando os valores de cor.
- Aplicar `--font-serif` apenas em títulos de seção e cabeçalhos de resumo/retro; manter o restante da UI em `--font-sans`.
