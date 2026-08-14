# Especificação Técnica — Sistema de Log de Atividades

## 1. Visão geral

Sistema pessoal, web, para registro diário de atividades de trabalho em texto livre, convertido automaticamente em dados estruturados por IA, com geração de resumos (diário/semanal/quinzenal/mensal) sob demanda, organizado por contexto (ex: Indicium, pessoal, estudos) e categoria (ex: bug, feature).

Princípios norteadores:
- IA usada **apenas sob demanda** (parsing de entrada e geração de resumo) — nunca em background/agendada.
- Custo de tokens otimizado: código faz toda a filtragem/organização determinística; a IA só processa o texto que realmente precisa interpretar ou narrar.
- Acesso simples: web deployado, com atalho salvo (PWA-like), acessível de desktop e celular, protegido por login único.

---

## 2. Stack técnica sugerida

| Camada | Escolha | Motivo |
|---|---|---|
| Frontend + Backend | **Next.js 14+ (App Router)** | Fullstack num único projeto, API routes/server actions, deploy simples, PWA fácil de configurar |
| Banco de dados | **PostgreSQL via Supabase** | Free tier, gerenciado, sem filesystem efêmero, SQL relacional (bom para filtros por data/contexto) |
| Autenticação | **Supabase Auth** (magic link ou email+senha) | Login único, sessão persistente, sem construir auth do zero |
| ORM | **Drizzle ORM** ou Prisma | Tipagem forte, migrations simples |
| IA | **Gemini API (Flash)** | Já definido pelo usuário; modelo mais barato da linha Gemini |
| Deploy | **Vercel** (free tier) | Integração nativa com Next.js, deploy automático via git |
| Estilo/UI | **Tailwind CSS + shadcn/ui** | Componentes prontos, visual limpo, rápido de montar telas |

> Observação: Next.js + Vercel + Supabase é uma combinação comum e bem documentada — ajuda o agente de coding (Antigravity) a ter bastante contexto de referência ao gerar código.

---

## 3. Modelo de dados (schema do banco)

### 3.1. Tabela `contexts` (contextos: Indicium, Pessoal, Estudos...)
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | |
| name | text | único, ex: "Indicium" |
| color | text | cor hex, para diferenciação visual na UI |
| created_at | timestamptz | |
| archived | boolean | soft-delete, default false |

### 3.2. Tabela `categories` (categorias: bug, feature, reunião, estudo...)
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | |
| name | text | único, ex: "Bug" |
| color | text | |
| created_at | timestamptz | |
| archived | boolean | soft-delete, default false |

> Ambas as tabelas são gerenciadas pelo painel admin (CRUD simples). "Archived" em vez de exclusão física evita quebrar entradas antigas que referenciam a tag.

### 3.3. Tabela `entries` (entrada bruta de log, o texto livre original)
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | |
| raw_text | text | o texto livre digitado pelo usuário, preservado integralmente |
| entry_date | date | data a que a entrada se refere (pode ser diferente da data de criação, se o usuário logar retroativamente) |
| context_id | uuid (FK → contexts) | nullable inicialmente, pode ser inferido pela IA ou escolhido manualmente |
| created_at | timestamptz | data/hora real de criação do registro |
| parsed | boolean | se já foi processado pela IA (parsing) |

### 3.4. Tabela `activity_items` (itens extraídos de uma entrada — um por linha/bullet de cada textarea)
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | |
| entry_id | uuid (FK → entries) | |
| type | enum: `done_today`, `plan_tomorrow`, `blocker`, `comment` | corresponde a cada textarea do formulário; `artifact` sai daqui e vira tabela própria (ver 3.4b) |
| description | text | texto literal do bullet, direto do textarea (sem interpretação de IA — é split determinístico por linha) |
| title | text | gerado pela IA (única chamada de IA neste fluxo) — nome curto da atividade |
| created_at | timestamptz | |

> Como não há mais parsing por IA de texto livre único, a quebra em itens é 100% determinística: cada linha não-vazia de cada textarea vira um `activity_item` do `type` correspondente. A única chamada de IA neste fluxo é para gerar o `title` de cada item (ver Fluxo 1 revisado, seção 4.1).

### 3.4b. Tabela `artifacts` (links de artefatos, 0 a N por entrada)
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | |
| entry_id | uuid (FK → entries) | |
| url | text | link do artefato (PR, doc, RFC, etc.) |
| label | text | rótulo curto opcional (ex: "PR #123"), pode ser digitado pelo usuário ou inferido da URL |
| created_at | timestamptz | |

> Campo dinâmico na UI: botão "+ adicionar artefato" cria uma nova linha (label + url); nenhum obrigatório.

### 3.4c. Tabela `entry_categories` (associação N:N entre entradas e categorias)
| Campo | Tipo | Notas |
|---|---|---|
| entry_id | uuid (FK → entries) | |
| category_id | uuid (FK → categories) | |

> Permite múltiplas categorias por entrada (chips selecionáveis na UI, ex: uma entrada pode ser "Bug" + "Urgente"), aplicadas ao dia inteiro — não por item individual. Chave primária composta (`entry_id`, `category_id`).

> Por que separar `entries` (bruto) de `activity_items` (estruturado)? Porque preserva o texto original de cada campo, permite reprocessar título/categorias sem perder o dado-fonte, e permite consultas estruturadas eficientes (filtrar por tipo, categoria, data) sem depender de IA para a extração em si.

### 3.5. Tabela `summaries` (cache de resumos gerados)
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | |
| period_type | enum: `daily`, `weekly`, `biweekly`, `monthly` | |
| period_start | date | |
| period_end | date | |
| context_id | uuid (FK → contexts, nullable) | null = todos os contextos |
| content | text | resumo narrativo gerado pela IA (markdown) |
| insights_json | jsonb | análise gerada pela IA: `went_well`, `gaps`, `blockers_notes` |
| metrics_json | jsonb | métricas calculadas localmente (contagens, etc.) — não prioritário, mas já modelado |
| is_closed_period | boolean | true se o período já terminou (elegível a cache); false = período corrente, sempre reprocessado |
| generated_at | timestamptz | |
| regenerated_count | int | quantas vezes foi regenerado manualmente, default 0 |

**Regra de cache:**
- Se `is_closed_period = true` e já existe um `summaries` para aquele `period_type + period_start + period_end + context_id`: retorna o cache, sem chamar IA.
- Se `is_closed_period = false` (período corrente): sempre reprocessa, ignora cache, e sobrescreve (ou salva um novo registro) — nunca serve do cache.
- Botão "Regenerar" na UI força nova chamada à IA mesmo com cache existente (incrementa `regenerated_count`, atualiza `content` e `generated_at`).

---

## 4. Fluxos de IA

### 4.1. Fluxo 1 — Geração de título curto por item (não há mais parsing de texto livre)

Como o formulário já usa textareas separados por tipo (`done_today`, `plan_tomorrow`, `blocker`, `comment`) mais um bloco dinâmico de artefatos, a quebra em itens é feita por **script determinístico** (split por linha/bullet, sem IA):

```python
# esboço da lógica (roda no backend, sem IA)
def split_textarea(text: str) -> list[str]:
    lines = text.strip().split("\n")
    return [l.lstrip("-*• ").strip() for l in lines if l.strip()]
```

Cada linha não vazia vira um `activity_item` com `description` = texto literal da linha.

**Gatilho da IA:** após o split determinístico, o backend faz **uma única chamada de IA por entrada salva** (não uma por item — todos os itens da entrada vão juntos numa lista, para minimizar chamadas), pedindo apenas o `title` de cada um.

**Prompt (esboço):**
```
Você vai receber uma lista de itens de log de atividades de trabalho, em português.
Para cada item, gere um "title" curto (até 8 palavras), objetivo, que nomeie a atividade.
Não altere nem resuma a descrição original — ela não deve ser retornada, apenas o title, na mesma ordem dos itens recebidos.
Responda apenas em JSON: [{"index": 0, "title": "..."}, ...]
```

**Output esperado:** lista de `title`s na mesma ordem dos itens enviados — o backend faz o merge com os `activity_items` já persistidos (por índice).

**Custo:** muito baixo — uma única chamada por entrada salva (todos os itens do dia juntos), input pequeno (só as descrições), output pequeno (só títulos).

**Confirmação opcional:** se `settings.require_confirmation_before_save = true` (configurável no painel admin), a tela mostra os itens com os títulos gerados para revisão/edição antes de persistir definitivamente. Se `false`, salva direto.

### 4.2. Fluxo 2 — Geração de resumo (retro/review)

**Gatilho:** usuário seleciona um período (dia, semana, quinzena, mês) e um contexto (ou "todos"), e clica em "Gerar resumo".

**Passo 1 (determinístico, sem IA):**
- Backend consulta `activity_items` filtrando por `entry_date` dentro do período e por `context_id` (se selecionado).
- Agrupa por dia, mantendo a estrutura completa (todos os `title` + `description` de cada tipo), sem cortar ou resumir texto.
- Calcula métricas simples em paralelo (contagem de itens por tipo/categoria, bloqueios recorrentes por texto similar) — usadas na seção de métricas da UI, não substituem a narrativa.

**Passo 2 (IA):**
- Envia à IA a lista organizada (json compacto, sem indentação) de todos os itens do período, já agrupados por dia.
- Prompt pede duas partes no output: (1) uma narrativa corrida cobrindo o que foi feito, evolução ao longo do período, bloqueios e como foram resolvidos (se foram), principais artefatos/entregas; (2) uma seção de **análise/insights**, com a IA inferindo: o que deu certo (padrões de boa entrega, resolução ágil de bloqueios, etc.), o que pareceu faltar (ex: bloqueios recorrentes não resolvidos, lacunas de acompanhamento), e observações sobre os bloqueios do período.

**Prompt (esboço):**
```
Você vai receber os registros estruturados de atividades de um período de trabalho, agrupados por dia.
Gere um resumo narrativo em português, em texto corrido, cobrindo:
- principais atividades e evolução do período
- bloqueios encontrados e se/como foram resolvidos
- principais artefatos/entregas
Use apenas as informações fornecidas. Não invente. Não omita bloqueios ou entregas relevantes.

Em seguida, gere uma seção de análise/insights, inferida a partir dos dados (não peça informação adicional ao usuário), cobrindo:
- o que deu certo no período (padrões positivos, boas entregas, bloqueios resolvidos rapidamente)
- o que pareceu faltar (lacunas, bloqueios recorrentes ou não resolvidos, sinais de possível gargalo)
- observações gerais sobre os bloqueios do período

Responda em JSON: {"summary": "...", "insights": {"went_well": "...", "gaps": "...", "blockers_notes": "..."}}
```

**Passo 3:** resultado salvo em `summaries` — `content` guarda a narrativa, e um novo campo `insights_json` guarda a seção de análise estruturada (respeitando a regra de cache/período fechado descrita na seção 3.5).

**Custo:** varia com o tamanho do período, mas ainda barato porque o input já vem pré-filtrado e compacto (json sem indentação, sem campos redundantes), e roda só sob demanda — nunca em loop nem automaticamente.

---

## 5. Painel Admin (tags + configurações)

### 5.1. Tabela `settings` (configurações globais, linha única já que é usuário único)
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | linha fixa/única |
| require_confirmation_before_save | boolean | default `true` — se ativo, mostra tela de revisão dos itens (com título gerado) antes de persistir |

### 5.2. CRUD de tags
- **Contextos:** nome, cor, arquivar/desarquivar.
- **Categorias:** nome, cor, arquivar/desarquivar.

Sem necessidade de permissões complexas (usuário único). Apenas confirmação antes de arquivar uma tag em uso.

### 5.3. Toggle de confirmação
Checkbox simples "Revisar itens antes de salvar" — liga/desliga `settings.require_confirmation_before_save`.

---

## 6. Telas (fluxo de UI)

1. **Login** — magic link ou email/senha via Supabase Auth.
2. **Home / Nova entrada** — formulário com:
   - Textarea "O que fiz hoje?" (um bullet por linha)
   - Textarea "O que vou fazer amanhã?"
   - Textarea "Bloqueios/impedimentos"
   - Textarea "Comentários extra"
   - Bloco dinâmico "Artefatos" — botão "+ adicionar artefato", cada linha com campos `label` (opcional) + `url`; 0 a N artefatos
   - Seletor de chips "Categoria" — multi-seleção, aplicada à entrada inteira (não por item)
   - Seletor de contexto (dropdown único)
   - Seletor de data (default: hoje)
   - Botão "Salvar"
   
   Ao salvar: split determinístico por linha → chamada de IA (título por item) → se `require_confirmation_before_save`, mostra tela de revisão (itens + títulos editáveis, categorias já fixadas para a entrada inteira) antes de persistir; senão, salva direto.
3. **Timeline** — lista cronológica das entradas (com filtro por contexto/categoria/data), mostrando os itens estruturados de forma visual (ex: cards ou seções por tipo: feito, planejado, bloqueios, artefatos).
4. **Resumos** — seletor de período (dia/semana/quinzena/mês) + contexto, botão "Gerar resumo" (ou "Ver resumo" se já em cache), exibição da narrativa + seção de análise/insights (o que deu certo, o que faltou, observações sobre bloqueios) + métricas (contagens, gráfico simples opcional), botão "Regenerar".
5. **Admin** — CRUD de contextos e categorias.

---

## 7. Considerações de custo/performance de IA

- Título: 1 chamada pequena por entrada salva, cobrindo todos os itens daquele dia juntos (não 1 chamada por item) — não há mais parsing de texto livre, já que o split é determinístico via textareas separados.
- Resumo: 1 chamada por período solicitado, com cache para períodos fechados (evita reprocessar retros antigas repetidamente).
- Modelo: Gemini Flash para ambos os fluxos (mais barato, suficiente para nomear itens e gerar narrativa objetiva).
- Nunca há chamada de IA automática/agendada — tudo é acionado por ação explícita do usuário.
- ORM escolhido: **Drizzle** (leve, tipagem forte, integra bem com Postgres/Supabase e é direto de o agente de coding gerar migrations a partir do schema).

---

## 8. Sobre o uso do Antigravity (agentic coding)

Sugestões práticas para o desenvolvimento assistido:
- Peça para o agente montar primeiro o schema (migrations) e a estrutura de pastas do Next.js, antes de qualquer tela.
- Implemente o Fluxo 1 (parsing) isoladamente e teste com exemplos reais de log (como o que você mandou) antes de partir para os resumos.
- Deixe os prompts de IA em arquivos separados (ex: `/lib/prompts/parsing.ts`, `/lib/prompts/summary.ts`), fáceis de ajustar sem mexer na lógica de negócio.
- Configure variáveis de ambiente (`GEMINI_API_KEY`, credenciais Supabase) desde o início, nunca hardcoded.

---

## 9. Próximos passos sugeridos

1. Criar projeto Supabase (banco + auth) e projeto Vercel.
2. Rodar as migrations do schema (seção 3).
3. Implementar tela de login + nova entrada + Fluxo 1 (parsing).
4. Validar o parsing com logs reais antigos seus (teste de qualidade da extração).
5. Implementar timeline de visualização.
6. Implementar Fluxo 2 (resumos) + cache.
7. Implementar painel admin.
8. Polimento visual (Tailwind/shadcn) e configuração de PWA (atalho de tela inicial no celular).
