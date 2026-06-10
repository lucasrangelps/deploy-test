# Instruções de utilização

O sistema **Isabel Wenccess** é uma aplicação web para gerenciamento de alunos, professores e administradores de um studio de dança.

## Pré-requisitos

| Tecnologia | Versão mínima |
|---|---|
| Node.js | 18.17 ou superior |
| Next.js | 16.2.1 |
| npm | 9.0 ou superior |
| PostgreSQL | 14 ou superior (produção) |

## Instalação e execução local

```bash
cd codigo-fonte
npm install
cp .env.example .env   # configure as variáveis de ambiente
npm run dev
```

Acesse em: `http://localhost:3000`

## Variáveis de ambiente

Crie um arquivo `.env` na raiz da pasta `codigo-fonte`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/isabel_db"
JWT_SECRET="chave-secreta-longa-e-aleatoria"
NODE_ENV="development"
```

## Endpoints da API

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| POST | `/api/auth/register` | Cadastro de novo usuário | Não |
| POST | `/api/auth/login` | Login e geração de token JWT | Não |
| GET | `/api/users` | Listagem de usuários | Sim (ADMIN) |

## Perfis de acesso

| Perfil | Permissões |
|---|---|
| ALUNO | Acessa e edita o próprio perfil |
| PROFESSOR | Acessa alunos vinculados às suas turmas |
| ADMIN | Acesso total ao sistema |

---

## Implantação

### Stack tecnológica

| Camada | Tecnologia | Finalidade |
|---|---|---|
| Frontend / Backend | Next.js 16 (App Router) | Framework full-stack React com SSR e API Routes |
| ORM | Prisma 7 | Migrations e acesso ao banco de dados |
| Banco de dados | PostgreSQL | Armazenamento persistente de dados |
| Autenticação | JWT + bcryptjs | Tokens de sessão e hash de senhas |
| Validação | Zod | Validação de schemas e tipagem segura |
| Estilização | Tailwind CSS | Utilitários CSS para o frontend |
| Versionamento | Git + GitHub | Controle de versão e repositório remoto |

### Estrutura de pastas

```
codigo-fonte/
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   └── register/route.ts
│   │   │   └── users/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   ├── auth.ts            # JWT helpers
│   │   ├── db.ts              # Conexão com banco / mock
│   │   └── validations.ts     # Schemas Zod
│   ├── models/
│   │   └── user.ts            # Tipos e interfaces
│   └── proxy.ts               # Proteção de rotas
├── .env                       # Variáveis de ambiente (não versionar)
├── .env.example               # Modelo de variáveis
├── prisma.config.ts           # Configuração do Prisma 7
└── package.json
```

---

## Histórico de versões

### [0.1.0] - 22/03/2026
#### Adicionado
- Estrutura inicial do projeto Next.js 16 com App Router e TypeScript
- Configuração do Tailwind CSS para estilização do frontend
- Modelo de dados para usuários com roles: ALUNO, PROFESSOR e ADMIN
- Modelo de Anamnese inicial vinculado ao cadastro do aluno
- Schema do banco de dados com Prisma 7 (tabelas `usuarios` e `anamneses`)
- Configuração do `prisma.config.ts` para ambiente Prisma 7
- API Route `POST /api/auth/register` — cadastro de novo usuário com hash de senha
- API Route `POST /api/auth/login` — autenticação com retorno de token JWT
- API Route `GET /api/users` — listagem de usuários com restrição de acesso (somente ADMIN)
- Proteção de rotas via `src/proxy.ts` com verificação de token JWT e role
- Validação de dados com Zod — schemas para registro e login
- Mock em memória (`mockUsers`) para desenvolvimento sem banco de dados configurado
- Arquivo `.env.example` com modelo de variáveis de ambiente
- Documentação inicial no `README.md` com instruções de instalação e exemplos de uso da API
- Repositório inicializado no GitHub com `.gitignore` configurado