# PLAN.md — Módulo Admin: Financeiro + Alunos + Leads + Contratos
## Studio de Dança Isabel Wencces — Pessoa 5

> **Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 (CSS-first) · Supabase (PostgreSQL) · JWT · Zod · Lucide React

---

## 1. Design System de Referência

Todas as telas novas devem reutilizar as classes e tokens já definidos em
`src/app/(frontend)/dashboard/dashboard.css`. Nenhuma lib de componentes externa é necessária.

### 1.1 Tokens de Cor

| Token | Valor | Uso |
|---|---|---|
| Fundo da página | `#F5F0EB` | `.dashboard-main` background |
| Cards | `#FFFFFF` | Classe `.card` |
| Primária (Vinho) | `#8B1A2F` | Botões, badges ativos, sidebar ativo |
| Accent Dourado | `#C9A96E` | Labels de seção, bordas de foco |
| Escuro | `#1C0A0E` | Sidebar background |
| Linha de tabela hover | `#FAF7F4` | `.data-table tbody tr:hover td` |
| Borda padrão | `#E8E0D8` | Cards, inputs |

### 1.2 Classes CSS Existentes (reutilizar obrigatoriamente)

| Classe | Descrição |
|---|---|
| `.card` | Container branco, `border-radius: 12px`, borda `#E8E0D8` |
| `.card-header` | Flex row, space-between, `margin-bottom: 18px` |
| `.card-label` | Label dourada maiúscula, `font-size: 10px` |
| `.card-title` | Título serif `Georgia`, `font-size: 16px` |
| `.card-link` | Link vinho `#8B1A2F`, `font-size: 12px` |
| `.page-header` | Container de cabeçalho de página com padding |
| `.page-label` | Label dourada de seção |
| `.page-title` | Título grande serif |
| `.page-subtitle` | Subtítulo cinza |
| `.page-content` | Container de conteúdo com padding `0 32px 32px` |
| `.data-table` | Tabela full-width, `font-size: 13px`, `border-collapse: collapse` |
| `.data-table th` | Header com uppercase, `font-size: 11px`, borda inferior `#E8E0D8` |
| `.data-table td` | Célula com `padding: 12px 14px`, borda `#F0EDE8` |
| `.data-table tbody tr:hover td` | Hover `#FAF7F4` |
| `.badge` | Pill genérico, `border-radius: 20px`, `font-size: 11px`, `font-weight: 600` |
| `.badge-green` | `background: #DCFAE6; color: #1A7340` (ativo/pago) |
| `.badge-gray` | `background: #F0EDE8; color: #6B6B6B` (inativo/pendente) |
| `.badge-wine` | `background: rgba(139,26,47,0.1); color: #8B1A2F` |
| `.badge-gold` | `background: rgba(201,169,110,0.15); color: #7A5C1E` |
| `.badge-blue` | `background: #E6F1FB; color: #185FA5` |
| `.btn-primary` | Botão vinho, `border-radius: 8px`, `padding: 9px 18px` |
| `.btn-secondary` | Botão outline vinho |
| `.form-group` | Wrapper de campo, `flex-column`, `gap: 6px` |
| `.form-label` | Label `font-size: 12px`, `font-weight: 600` |
| `.form-input / .form-select / .form-textarea` | Inputs com borda `#E8E0D8`, focus `#8B1A2F` |
| `.form-error` | Mensagem de erro `color: #8B1A2F`, `font-size: 11px` |
| `.form-grid-2` | Grid 2 colunas para formulários |
| `.form-actions` | Flex row de botões com `gap: 12px` |
| `.kpi-grid` | Grid 4 colunas de KPI cards |
| `.kpi-card` | Card de KPI com ícone, valor, label, variação |
| `.kpi-icon` | Ícone com background colorido, `border-radius: 9px` |
| `.kpi-value` | Número grande serif |
| `.toggle-group / .toggle-btn` | Switcher de abas/filtros |

### 1.3 Classes a Criar (adicionar ao `dashboard.css`)

| Classe | Valor CSS |
|---|---|
| `.badge-red` | `background: #FEE2E2; color: #991B1B` |
| `.badge-orange` | `background: #FEF3C7; color: #92400E` |
| `.alert-danger` | `background: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #991B1B` |
| `.tabs` | `display: flex; gap: 4px; border-bottom: 2px solid #E8E0D8; margin-bottom: 24px` |
| `.tab-item` | `padding: 8px 16px; font-size: 13px; font-weight: 600; color: #6B6B6B; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px` |
| `.tab-item.active` | `color: #8B1A2F; border-bottom-color: #8B1A2F` |
| `.detail-section` | `margin-bottom: 24px` |
| `.detail-field` | `display: flex; flex-direction: column; gap: 2px` — label `font-size: 11px; color: #6B6B6B; text-transform: uppercase` — value `font-size: 13px; font-weight: 600` |
| `.modal-overlay` | `position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100` |
| `.modal-box` | `background: #FFFFFF; border-radius: 12px; padding: 28px; width: 480px; max-width: 90vw` |
| `.step-indicator` | `display: flex; gap: 8px; margin-bottom: 28px; align-items: center` |

### 1.4 Tipografia

| Uso | Fonte |
|---|---|
| Títulos de página | Playfair Display / Georgia — classes `.page-title`, `.card-title`, `.kpi-value` (já usam `'Georgia', serif`) |
| Corpo / labels | Inter / system-ui — padrão do `body` |

---

## 2. Banco de Dados — Migrações Necessárias

O arquivo `src/bd/banco.sql` está quase completo. A tabela `anamneses` já existe.
Faltam **2 tabelas** que devem ser adicionadas ao final do arquivo.

### 2.1 Tabela `leads` (AUSENTE)

```sql
-- Potenciais alunos captados
CREATE TABLE leads (
  id_lead               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                  VARCHAR(150) NOT NULL,
  email                 VARCHAR(150),
  telefone              VARCHAR(20),
  ritmo_interesse       VARCHAR(50),
  status                VARCHAR(20) NOT NULL DEFAULT 'novo'
                          CHECK (status IN ('novo', 'em_contato', 'convertido', 'perdido')),
  origem                VARCHAR(50),
  observacoes           TEXT,
  criado_em             TIMESTAMP NOT NULL DEFAULT NOW(),
  convertido_em         TIMESTAMP,
  id_usuario_convertido UUID REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);
```

### 2.2 Tabela `contratos_template` (AUSENTE)

```sql
-- Versionamento do Termo de Aceite
CREATE TABLE contratos_template (
  id_template UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  versao      INTEGER NOT NULL,
  conteudo    TEXT NOT NULL,
  ativo       BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em   TIMESTAMP NOT NULL DEFAULT NOW(),
  criado_por  UUID REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);
```

---

## 3. Novas API Routes

Padrão de implementação: seguir exatamente o modelo de `src/app/api/turmas/route.ts` —
validação Zod + `supabaseAdmin` + respostas `NextResponse.json`.

| Arquivo a Criar | Métodos | Descrição |
|---|---|---|
| `src/app/api/alunos/route.ts` | `GET` | Lista alunos com busca por nome/CPF/email; inclui `status_financeiro` calculado |
| `src/app/api/alunos/[id]/route.ts` | `GET`, `PUT` | Ficha completa: usuário + aluno + anamnese + matrículas + parcelas |
| `src/app/api/pagamentos/route.ts` | `GET` | Lista parcelas com filtros + KPIs agregados |
| `src/app/api/pagamentos/[id]/route.ts` | `GET`, `PUT` | Detalhe; PUT = baixa manual (INSERT em `pagamentos` + UPDATE `parcelas.status`) |
| `src/app/api/notas-fiscais/route.ts` | `POST` | Recebe `{ id_pagamento }`, insere em `notas_fiscais` |
| `src/app/api/contratos/template/route.ts` | `GET`, `PUT` | GET = versão ativa; PUT = salva nova versão em transação |
| `src/app/api/leads/route.ts` | `GET`, `POST` | Lista com filtros; criação de lead |
| `src/app/api/leads/[id]/route.ts` | `GET`, `PUT` | Detalhe; conversão seta `convertido_em = NOW()` |

### 3.1 Estruturas de Dados das Respostas

#### `GET /api/alunos` → `AlunoListItem[]`
```typescript
interface AlunoListItem {
  id_aluno: string
  nome_completo: string
  email: string
  cpf: string | null
  telefone: string | null
  status_financeiro: 'em_dia' | 'inadimplente'  // calculado: parcelas com status='atrasado'
  turmas_ativas: number                           // count de matriculas_turmas onde status='ativa'
  criado_em: string
}
```

#### `GET /api/alunos/:id` → `AlunoCompleto`
```typescript
interface AlunoCompleto {
  // De 'usuarios'
  id_usuario: string
  nome_completo: string
  email: string
  // De 'alunos'
  id_aluno: string
  cpf: string | null
  telefone: string | null
  endereco: string | null
  data_nascimento: string | null
  nome_mae: string | null
  profissao: string | null
  tel_parente: string | null
  nome_parente: string | null
  grau_parentesco: string | null
  // De 'anamneses' (join)
  anamnese: { dados_questionario: object; data_preenchimento: string } | null
  // De 'matriculas_turmas' (join turmas + ritmos)
  matriculas: { id_matricula: string; nome_turma: string; ritmo: string; status: string }[]
  // De 'contratos' > 'parcelas' (join)
  parcelas: { id_parcela: string; numero_parcela: number; valor_cobrado: number; data_vencimento: string; status: string }[]
}
```

#### `GET /api/pagamentos` → `{ kpis: FinanceiroKpis; parcelas: ParcelaListItem[] }`
```typescript
interface FinanceiroKpis {
  receita_mes: number       // sum(valor_pago) de pagamentos do mês atual
  parcelas_pendentes: number // count parcelas com status='pendente'
  valor_em_atraso: number   // sum(valor_cobrado) de parcelas com status='atrasado'
  taxa_inadimplencia: number // % alunos com pelo menos uma parcela atrasada
}

interface ParcelaListItem {
  id_parcela: string
  numero_parcela: number
  valor_cobrado: number
  data_vencimento: string
  status: 'pendente' | 'pago' | 'atrasado'
  nome_aluno: string
  id_aluno: string
}
```

#### `GET /api/leads` → `Lead[]`
```typescript
interface Lead {
  id_lead: string
  nome: string
  email: string | null
  telefone: string | null
  ritmo_interesse: string | null
  status: 'novo' | 'em_contato' | 'convertido' | 'perdido'
  origem: string | null
  observacoes: string | null
  criado_em: string
  convertido_em: string | null
}
```

#### `GET /api/contratos/template` → `ContratoTemplate`
```typescript
interface ContratoTemplate {
  id_template: string
  versao: number
  conteudo: string
  ativo: boolean
  criado_em: string
}
```

---

## 4. Componentes React a Criar

Localização: `src/components/dashboard/`

### 4.1 `StatusBadge.tsx`

```typescript
type BadgeStatus =
  | 'ativo' | 'inativo'
  | 'em_dia' | 'inadimplente'
  | 'pago' | 'pendente' | 'atrasado'
  | 'novo' | 'em_contato' | 'convertido' | 'perdido'
  | 'emitida' | 'erro'

interface StatusBadgeProps {
  status: BadgeStatus
  label?: string  // override do texto padrão
}
```

**Mapeamento status → classe CSS:**

| Status | Classe | Texto padrão |
|---|---|---|
| `pago / ativo / em_dia / emitida` | `.badge .badge-green` | Pago / Ativo / Em Dia / Emitida |
| `pendente / em_contato` | `.badge .badge-orange` (nova) | Pendente / Em Contato |
| `atrasado / inadimplente / erro` | `.badge .badge-red` (nova) | Atrasado / Inadimplente / Erro |
| `novo` | `.badge .badge-gold` | Novo |
| `convertido` | `.badge .badge-wine` | Convertido |
| `inativo / perdido` | `.badge .badge-gray` | Inativo / Perdido |

---

### 4.2 `PageHeader.tsx`

```typescript
interface PageHeaderProps {
  label: string        // ex: "Gestão"
  title: string        // ex: "Alunos"
  subtitle?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
    icon?: LucideIcon
  }
}
```

Estrutura: `<div className="page-header">` com `.page-label`, `.page-title`, `.page-subtitle`
e botão `.btn-primary` à direita via `flex justify-between`.

---

### 4.3 `SearchBar.tsx`

```typescript
interface SearchBarProps {
  placeholder?: string
  onSearch: (term: string) => void
  debounceMs?: number  // padrão: 300
}
```

`useEffect` com `setTimeout` para debounce. Ícone `Search` do Lucide.
Focus: `border-color: #C9A96E`.

---

### 4.4 `FinancialKpiCard.tsx`

```typescript
interface FinancialKpiCardProps {
  label: string
  value: string
  icon: LucideIcon
  variant: 'primary' | 'gold' | 'danger' | 'neutral'
  trend?: { direction: 'up' | 'down'; label: string }
}
```

Mapeia `variant` para cor do ícone e background:
- `primary` → `color: #8B1A2F`, `bg: rgba(139,26,47,0.08)`
- `gold`    → `color: #C9A96E`, `bg: rgba(201,169,110,0.1)`
- `danger`  → `color: #EF4444`, `bg: rgba(239,68,68,0.08)`
- `neutral` → `color: #6B6B6B`, `bg: #F0EDE8`

Reutiliza a estrutura `.kpi-card` já existente em `dashboard/page.tsx`.

---

### 4.5 `ConfirmModal.tsx`

```typescript
interface ConfirmModalProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string  // padrão: "Confirmar"
  onConfirm: () => void
  onCancel: () => void
  variant?: 'default' | 'danger'
}
```

Usa `.modal-overlay` e `.modal-box` (novas classes).
`variant: 'danger'` → botão de confirmação com `background: #EF4444`.

---

## 5. Atualização da Sidebar

**Arquivo:** `src/components/dashboard/Sidebar.tsx`

Adicionar ao array `navItems` após `{ href: '/dashboard/planos', ... }`:

```typescript
// Importações a adicionar:
import { UserCircle, DollarSign, UserPlus, FileText } from 'lucide-react'

// Itens a adicionar ao navItems:
{ href: '/dashboard/alunos',              label: 'Alunos',     icon: UserCircle },
{ href: '/dashboard/financeiro',          label: 'Financeiro', icon: DollarSign },
{ href: '/dashboard/leads',              label: 'Leads',      icon: UserPlus   },
{ href: '/dashboard/contratos/template', label: 'Contratos',  icon: FileText   },
```

---

## 6. Fase 0 — Banco de Dados + API Foundation

> **Pré-requisito de todas as fases.** Execute as migrações SQL antes de iniciar as páginas.

- [ ] **0.1** Adicionar SQL das tabelas `leads` e `contratos_template` ao final de `src/bd/banco.sql`
- [ ] **0.2** Executar as migrações no painel do Supabase (SQL Editor)
- [ ] **0.3** Criar `src/app/api/alunos/route.ts` — GET com busca + `status_financeiro` calculado
- [ ] **0.4** Criar `src/app/api/alunos/[id]/route.ts` — GET joins completos; PUT atualiza dados do aluno
- [ ] **0.5** Criar `src/app/api/pagamentos/route.ts` — GET com KPIs agregados e lista filtrada
- [ ] **0.6** Criar `src/app/api/pagamentos/[id]/route.ts` — GET detalhe; PUT baixa manual
- [ ] **0.7** Criar `src/app/api/notas-fiscais/route.ts` — POST recebe `{ id_pagamento }`
- [ ] **0.8** Criar `src/app/api/contratos/template/route.ts` — GET versão ativa; PUT nova versão em transação
- [ ] **0.9** Criar `src/app/api/leads/route.ts` — GET com filtros; POST cria lead
- [ ] **0.10** Criar `src/app/api/leads/[id]/route.ts` — GET detalhe; PUT atualiza/converte
- [ ] **0.11** Atualizar `src/components/dashboard/Sidebar.tsx` com os 4 novos itens de navegação
- [ ] **0.12** Adicionar ao `dashboard.css` as 8 novas classes: `.badge-red`, `.badge-orange`, `.alert-danger`, `.tabs`, `.tab-item`, `.tab-item.active`, `.detail-section`, `.detail-field`, `.modal-overlay`, `.modal-box`, `.step-indicator`
- [ ] **0.13** Adicionar `LeadSchema`, `BaixaManualSchema`, `ContratoTemplateSchema` ao `src/lib/validations.ts`

---

## 7. Fase 1 — Componentes de UI Compartilhados

> Paralela com Fase 0. Não depende das API routes, apenas do CSS.

- [ ] **1.1** Criar `src/components/dashboard/StatusBadge.tsx`
- [ ] **1.2** Criar `src/components/dashboard/PageHeader.tsx`
- [ ] **1.3** Criar `src/components/dashboard/SearchBar.tsx`
- [ ] **1.4** Criar `src/components/dashboard/FinancialKpiCard.tsx`
- [ ] **1.5** Criar `src/components/dashboard/ConfirmModal.tsx`

---

## 8. Fase 2 — Fluxo de Alunos

> Depende das Fases 0 e 1.

### 8.1 `/dashboard/alunos` — Listagem

**Arquivo:** `src/app/(frontend)/dashboard/alunos/page.tsx`

**Dados:** `GET /api/alunos?search=`

**Estrutura:**
- `PageHeader` label="Gestão" title="Alunos" action `{ label: "Nova Matrícula", href: "/dashboard/alunos/novo", icon: UserPlus }`
- `SearchBar` debounce 300ms
- `.card` wrapping `.data-table`:

| Coluna | Campo | Renderização |
|---|---|---|
| Aluno | `nome_completo` | `font-weight: 600` |
| CPF | `cpf` | Mascarado `000.000.000-00` |
| Email | `email` | `color: #6B6B6B` |
| Telefone | `telefone` | — |
| Status | `status_financeiro` | `<StatusBadge>` |
| Turmas | `turmas_ativas` | Número simples |
| Ações | — | Link "Ver ficha →" |

**Regra:** linha `inadimplente` → `style={{ background: '#FFF5F5' }}` na `<tr>`.

---

### 8.2 `/dashboard/alunos/novo` — Formulário Multi-step

**Arquivo:** `src/app/(frontend)/dashboard/alunos/novo/page.tsx`

**Dados necessários:**
- `GET /api/planos` — seleção de plano
- `GET /api/contratos/template` — preview do contrato
- `GET /api/leads/:id` — se `?from_lead=:id` na URL

**Etapas** (`.step-indicator` com 3 passos):

**Etapa 1 — Dados Pessoais** (campos de `RegisterSchema` em `validations.ts`)
- `.form-grid-2`: Nome Completo, Email
- `.form-grid-2`: CPF, Telefone
- `.form-grid-2`: Data de Nascimento, Profissão
- Endereço (full width), Nome da Mãe (full width)
- Toggle "Menor de Idade" → exibe condicionalmente Nome do Responsável, Grau de Parentesco, Telefone do Responsável

**Etapa 2 — Anamnese** (`AnamneseSchema` de `validations.ts`)
- 4 checkboxes booleanos: pratica atividade / tem lesão / tem doença crônica / usa medicamento
- Textarea condicional para descrição quando marcado positivo
- Observações gerais

**Etapa 3 — Contrato & Plano**
- `<select>` de plano carregado de `GET /api/planos`
- `<select>` forma de pagamento: PIX / Cartão / Dinheiro / Boleto
- Preview do contrato ativo em `<div>` com `white-space: pre-wrap`, `max-height: 200px`, `overflow-y: auto`
- Checkbox "Li e aceito o Termo de Aceite"

**Submit:** `POST /api/auth/register` com `role: 'ALUNO'`

**Regra `?from_lead=:id`:** `GET /api/leads/:id` → pré-preenche Nome, Email, Telefone.
Após submit bem-sucedido → `PUT /api/leads/:id { status: 'convertido' }`.

---

### 8.3 `/dashboard/alunos/[id]` — Ficha Completa

**Arquivo:** `src/app/(frontend)/dashboard/alunos/[id]/page.tsx`

**Dados:** `GET /api/alunos/:id`

**Estrutura:**
- `PageHeader` com `nome_completo` como title
- `.alert-danger` se `status_financeiro === 'inadimplente'`
- 4 abas (`.tabs` + `.tab-item`):

**Aba 1 — Dados Pessoais:** formulário editável → `PUT /api/alunos/:id`

**Aba 2 — Anamnese:** exibe `dados_questionario` da tabela `anamneses` em leitura

**Aba 3 — Matrículas:** `.data-table` com Turma / Ritmo / Status (`StatusBadge`) / botão Desativar

**Aba 4 — Financeiro:**
- `.data-table` com Parcela # / Valor / Vencimento / Status (`StatusBadge`) / Link
- Linha `atrasado` → `style={{ background: '#FFF5F5' }}`
- "Ver detalhes →" → `/dashboard/financeiro/:id_parcela`

---

## 9. Fase 3 — Fluxo Financeiro

> Depende das Fases 0 e 1. Paralela com Fase 2.

### 9.1 `/dashboard/financeiro` — Dashboard Financeiro

**Arquivo:** `src/app/(frontend)/dashboard/financeiro/page.tsx`

**Dados:** `GET /api/pagamentos?mes=&ano=&status=&aluno=`

**Estrutura:**
- `PageHeader` label="Financeiro" title="Controle de Pagamentos"
- 4 `FinancialKpiCard`:
  1. Receita do Mês — `DollarSign` — variant `gold`
  2. Parcelas Pendentes — `Clock` — variant `neutral`
  3. Em Atraso (R$) — `AlertTriangle` — variant `danger`
  4. Inadimplência (%) — `TrendingDown` — variant `danger`
- Filtros: `.toggle-group` por status + inputs mês/ano + `SearchBar` por aluno
- `.card` > `.data-table`: Aluno (link) | Parcela # | Valor | Vencimento | Status | "Detalhes →"

---

### 9.2 `/dashboard/financeiro/[id]` — Detalhe da Parcela

**Arquivo:** `src/app/(frontend)/dashboard/financeiro/[id]/page.tsx`

**Dados:** `GET /api/pagamentos/:id`

**Estrutura:**
- `PageHeader` com link breadcrumb para `/dashboard/financeiro`
- `.card` com `.detail-section`: Aluno, Contrato, Plano, Valor, Vencimento, Status
- **Seção "Baixa Manual"** — visível se `status !== 'pago'`:
  - `.form-grid-2`: Método de Pagamento + Data do Pagamento
  - Valor Pago (pré-preenchido com `valor_cobrado`)
  - "Confirmar Baixa" → `ConfirmModal` → `PUT /api/pagamentos/:id`
- **Seção "Nota Fiscal"** — visível se `status === 'pago'`:
  - `StatusBadge` do status de emissão
  - Botão "Emitir Nota Fiscal" (desabilitado se `status_emissao !== 'pendente'`) → `POST /api/notas-fiscais { id_pagamento }`
  - Link para XML se `status_emissao === 'emitida'`

---

## 10. Fase 4 — Fluxo de Leads & Contratos

> Depende das Fases 0 e 1. Paralela com Fases 2 e 3.

### 10.1 `/dashboard/leads` — Gestão de Leads

**Arquivo:** `src/app/(frontend)/dashboard/leads/page.tsx`

**Dados:** `GET /api/leads?status=&ritmo=`

**Estrutura:**
- `PageHeader` label="Captação" title="Leads" action="Novo Lead" (abre modal)
- `.toggle-group` filtro: Todos / Novo / Em Contato / Convertido / Perdido
- `.card` > `.data-table`:

| Coluna | Campo | Renderização |
|---|---|---|
| Nome | `nome` | `font-weight: 600` |
| Contato | `email` + `telefone` | Empilhado em coluna |
| Ritmo | `ritmo_interesse` | `.badge .badge-gold` |
| Origem | `origem` | Texto simples |
| Status | `status` | `<StatusBadge>` |
| Captado em | `criado_em` | `DD/MM/YYYY` |
| Ações | — | Botões |

**Ações por linha:**
- "Converter em Aluno" → `/dashboard/alunos/novo?from_lead=:id_lead` (desabilitado se `status === 'convertido'`)
- "Marcar como Perdido" → `ConfirmModal` → `PUT /api/leads/:id { status: 'perdido' }`

**Modal "Novo Lead"** (`.modal-overlay` + `.modal-box`):
- Campos: Nome*, Email, Telefone, Ritmo (`GET /api/ritmos`), Origem, Observações
- Submit: `POST /api/leads`

---

### 10.2 `/dashboard/contratos/template` — Editor de Contrato

**Arquivo:** `src/app/(frontend)/dashboard/contratos/template/page.tsx`

**Dados:** `GET /api/contratos/template`

**Estrutura:**
- `PageHeader` label="Configurações" title="Termo de Aceite"
- `.card` com metadados: Versão #N, data de criação, `<StatusBadge status="ativo" />`
- `.form-grid-2`: textarea de edição (`min-height: 400px`) + preview `white-space: pre-wrap`
- "Salvar Nova Versão" → `ConfirmModal` "Uma nova versão será ativada para todas as próximas matrículas." → `PUT /api/contratos/template { conteudo }`
- Tabela histórico de versões (somente leitura)

---

## 11. Novos Schemas Zod

Adicionar ao final de `src/lib/validations.ts`:

```typescript
// ─── Lead ───
export const LeadSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório').max(150),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  telefone: z
    .string()
    .regex(/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/, 'Telefone inválido')
    .optional()
    .or(z.literal('')),
  ritmo_interesse: z.string().max(50).optional(),
  status: z.enum(['novo', 'em_contato', 'convertido', 'perdido']).default('novo'),
  origem: z.enum(['Indicação', 'Instagram', 'Site', 'WhatsApp', 'Outro']).optional(),
  observacoes: z.string().max(500).optional(),
})

// ─── Baixa Manual de Parcela ───
export const BaixaManualSchema = z.object({
  metodo: z.enum(['PIX', 'Cartão', 'Dinheiro', 'Boleto']),
  data_pagamento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  valor_pago: z.number().positive('Valor deve ser positivo'),
})

// ─── Contrato Template ───
export const ContratoTemplateSchema = z.object({
  conteudo: z.string().min(50, 'O contrato deve ter ao menos 50 caracteres'),
})

export type LeadInput = z.infer<typeof LeadSchema>
export type BaixaManualInput = z.infer<typeof BaixaManualSchema>
export type ContratoTemplateInput = z.infer<typeof ContratoTemplateSchema>
```

---

## 12. Checklist de Verificação

### Banco de Dados
- [ ] Tabela `leads` criada com 10 campos e constraints corretos
- [ ] Tabela `contratos_template` criada com versionamento
- [ ] `GET /api/alunos?search=joao` retorna `status_financeiro` calculado
- [ ] `PUT /api/pagamentos/:id` cria registro em `pagamentos` E atualiza `parcelas.status = 'pago'`
- [ ] `PUT /api/contratos/template` cria versão N+1 como `ativo: true` e marca versão N como `ativo: false`
- [ ] `PUT /api/leads/:id { status: 'convertido' }` persiste `convertido_em = NOW()`

### Frontend
- [ ] `/dashboard/alunos` — busca filtra em tempo real (debounce 300ms)
- [ ] Linha inadimplente exibe `background: #FFF5F5` + `StatusBadge` correto
- [ ] `/dashboard/alunos/novo?from_lead=:id` — campos Nome/Email/Telefone pré-preenchidos
- [ ] Validação por etapa antes de avançar no formulário multi-step
- [ ] `/dashboard/financeiro` — KPI cards carregam valores corretos
- [ ] Botão "Emitir NFS-e" aparece APENAS após baixa manual confirmada
- [ ] Botão "Converter em Aluno" desabilitado para leads já convertidos
- [ ] Editor de contrato exibe "Versão #X ativa" após salvar
- [ ] Todos os 4 novos itens da Sidebar ficam ativos com `pathname.startsWith(href)`

---

## 13. Sumário de Arquivos

### Criar
```
src/bd/banco.sql                                         ← +2 tabelas ao final
src/app/api/alunos/route.ts
src/app/api/alunos/[id]/route.ts
src/app/api/pagamentos/route.ts
src/app/api/pagamentos/[id]/route.ts
src/app/api/notas-fiscais/route.ts
src/app/api/contratos/template/route.ts
src/app/api/leads/route.ts
src/app/api/leads/[id]/route.ts
src/components/dashboard/StatusBadge.tsx
src/components/dashboard/PageHeader.tsx
src/components/dashboard/SearchBar.tsx
src/components/dashboard/FinancialKpiCard.tsx
src/components/dashboard/ConfirmModal.tsx
src/app/(frontend)/dashboard/alunos/page.tsx
src/app/(frontend)/dashboard/alunos/novo/page.tsx
src/app/(frontend)/dashboard/alunos/[id]/page.tsx
src/app/(frontend)/dashboard/financeiro/page.tsx
src/app/(frontend)/dashboard/financeiro/[id]/page.tsx
src/app/(frontend)/dashboard/leads/page.tsx
src/app/(frontend)/dashboard/contratos/template/page.tsx
```

### Modificar
```
src/components/dashboard/Sidebar.tsx       ← +4 itens + 4 imports Lucide
src/app/(frontend)/dashboard/dashboard.css ← +8 novas classes CSS
src/lib/validations.ts                     ← +3 schemas Zod
```

---

*Gerado em: 27/04/2026 — Studio de Dança Isabel Wencces*
