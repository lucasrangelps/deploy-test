# Documentação de Segurança e Regras aplicadas Banco de Dados

A arquitetura do banco de dados foi projetada para oferecer segurança, escalabilidade e consistência, utilizando recursos modernos do **PostgreSQL** gerenciado com a plataforma **Supabase**.

O sistema segue uma abordagem orientada a boas práticas de backend, garantindo integração direta com aplicações web via **Next.js 16 (App Router)** e **Prisma 7**, além de controle refinado de acesso aos dados.

## Visão Geral

Este documento descreve:

* Regras de segurança (RLS – Row Level Security)
* Permissões por perfil (professor e aluno)
* Regras de integridade e consistência
* Regras de duplicidade

**Importante:**
A estrutura das tabelas não está detalhada aqui — pode ser acessada no item 2 especificação do Projeto pelo link abaixo contendo Modelo da Base de Dados e MER (Modelo Entidade-Relacionamento) para mais detalhes.
> - [Modelo da Base de Dados](https://github.com/ICEI-PUC-Minas-PMV-ADS/pmv-ads-2026-1-e5-proj-empext-t2-dancasalaowenccess/blob/main/documentos/02-Especifica%C3%A7%C3%A3o%20do%20Projeto.md#modelo-da-base-de-dados)
> - [MER (Modelo Entidade-Relacionamento)](https://github.com/ICEI-PUC-Minas-PMV-ADS/pmv-ads-2026-1-e5-proj-empext-t2-dancasalaowenccess/blob/main/documentos/02-Especifica%C3%A7%C3%A3o%20do%20Projeto.md#mer-modelo-entidade-relacionamento)

---

## Perfis do Sistema

| Perfil    | Descrição                    | Nível de Acesso             |
| --------- | ---------------------------- | --------------------------- |
| ADMIN     | Administrador do sistema     | Total                       |
| PROFESSOR | Instrutor de dança           | Total (equivalente a admin) |
| ALUNO     | Usuário final                | Restrito aos próprios dados |

---

## Tabelas do Banco de Dados

| Tabela                  | Descrição                                          |
| ----------------------- | -------------------------------------------------- |
| `usuarios`              | Dados de autenticação e perfil de todos os usuários |
| `admins`                | Dados específicos do perfil administrador          |
| `professores`           | Dados específicos dos professores                  |
| `alunos`                | Dados cadastrais dos alunos                        |
| `anamneses`             | Questionário de saúde dos alunos                   |
| `ritmos`                | Modalidades de dança oferecidas                    |
| `alunos_ritmo`          | Relacionamento entre alunos e ritmos               |
| `turmas`                | Turmas por modalidade                              |
| `matriculas_turmas`     | Matrículas dos alunos nas turmas                   |
| `aulas_agenda`          | Aulas agendadas pelos professores                  |
| `agendamento_aulas`     | Presença dos alunos nas aulas                      |
| `planos`                | Planos de pagamento disponíveis                    |
| `contratos`             | Contratos firmados entre alunos e o estúdio        |
| `parcelas`              | Parcelas dos contratos                             |
| `pagamentos`            | Registro de pagamentos realizados                  |
| `notas_fiscais`         | Notas fiscais vinculadas aos pagamentos            |
| `notificacoes_whatsapp` | Notificações enviadas via WhatsApp                 |

---

## Segurança (RLS – Row Level Security)

Todas as tabelas possuem RLS ativado. Nenhum acesso é permitido sem uma policy explícita.

### Funções auxiliares

| Função            | Descrição                                     |
| ----------------- | --------------------------------------------- |
| `get_user_id()`   | Retorna o `id_usuario` com base no `auth.uid()` |
| `get_user_role()` | Retorna o `tipo_perfil` do usuário autenticado |

---

## Permissões – ADMIN e PROFESSOR

Os perfis ADMIN e PROFESSOR possuem **acesso total ao sistema**, equivalente a um superadmin, sem restrições de acesso impostas pelas regras de negócio aplicadas aos demais usuários.

| Ação   | Permissão |
| ------ | --------- |
| SELECT | Sim       |
| INSERT | Sim       |
| UPDATE | Sim       |
| DELETE | Sim       |

Aplicado em **todas as tabelas**:

* `usuarios`
* `admins`
* `alunos`
* `professores`
* `turmas`
* `ritmos`
* `alunos_ritmo`
* `matriculas_turmas`
* `aulas_agenda`
* `agendamento_aulas`
* `contratos`
* `parcelas`
* `pagamentos`
* `planos`
* `anamneses`
* `notificacoes_whatsapp`
* `notas_fiscais`

---

## Permissões – ALUNO

O aluno possui acesso restrito e controlado, limitado exclusivamente aos seus próprios dados, garantindo privacidade, segurança e isolamento total entre usuários.

| Tipo de acesso           | Permissão |
| ------------------------ | --------- |
| Dados próprios           | Sim       |
| Dados de outros usuários | Não       |
| Inserção controlada      | Sim       |
| Atualização própria      | Sim       |

---

## Regras de Duplicidade

| Regra               | Descrição                                    |
| ------------------- | -------------------------------------------- |
| Email único         | Um usuário por e-mail                        |
| CPF único           | Um aluno por CPF                             |
| Usuario ↔ Aluno     | Relação 1:1                                  |
| Usuario ↔ Professor | Relação 1:1                                  |
| Usuario ↔ Admin     | Relação 1:1                                  |
| Matrícula única     | Aluno não pode ser matriculado duas vezes na mesma turma |
| Parcela única       | Número de parcela único por contrato         |
| Agendamento único   | Um aluno por aula, sem duplicidade           |
| Nota fiscal         | Relação 1:1 com pagamento                    |

---

## Regras de Integridade

### Relacionamentos

* Todas as FKs são obrigatórias onde necessário
* Uso de `ON DELETE CASCADE` em relações críticas (ex: exclusão de usuário remove aluno/professor vinculado)

### Regras de data

| Regra    | Descrição                            |
| -------- | ------------------------------------ |
| Aula     | `data_hora_fim` > `data_hora_inicio` |
| Parcelas | `data_vencimento` obrigatória        |

### Regras financeiras

| Regra              | Descrição                      |
| ------------------ | ------------------------------ |
| `valor_pago` ≥ 0   | Não permite valores negativos  |
| `valor_base` ≥ 0   | Não permite valores negativos  |
| `percentual_desconto` ≥ 0 | Sem valores inválidos   |

### Regras numéricas

| Campo                      | Regra |
| -------------------------- | ----- |
| `capacidade_maxima` (turma) | > 0  |
| `ciclo_meses` (plano)       | > 0  |

---

## Integração com o Backend

O banco de dados é acessado pelo backend **Next.js 16** através do ORM **Prisma 7** com o adapter `@prisma/adapter-pg`, utilizando conexão direta ao PostgreSQL do Supabase via pool de conexões.

```
Aplicação Next.js
      │
      ▼
  Prisma 7 (ORM)
      │
      ▼
 PrismaPg Adapter
      │
      ▼
PostgreSQL (Supabase)
```

### Autenticação

O sistema utiliza **JWT** gerado pelo backend (não pelo Supabase Auth), com as seguintes características:

* Token gerado no login via `POST /api/auth/login`
* Expiração de 7 dias
* Payload contém: `id`, `email` e `role` do usuário
* Senhas armazenadas com hash `bcryptjs` (12 rounds)

---

## Princípios de Segurança Aplicados

* RLS ativado em todas as tabelas
* Nenhum acesso sem policy explícita
* Isolamento total de dados por usuário
* Controle de acesso baseado em perfil (`tipo_perfil`)
* Senhas nunca armazenadas em texto puro
* Tokens JWT assinados com chave secreta via variável de ambiente

---

## Fluxo de Segurança

1. Usuário autentica via `POST /api/auth/login`
2. Backend valida credenciais e gera token JWT
3. Token é enviado no header `Authorization: Bearer <token>` nas requisições
4. `proxy.ts` intercepta rotas protegidas e verifica o token
5. Role do usuário é injetada no header da requisição
6. Rotas verificam a role antes de executar operações no banco
7. Prisma executa a query no Supabase com as permissões corretas