

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Usuários (autenticação)
CREATE TABLE usuarios (
  id_usuario      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id    UUID UNIQUE,
  nome_completo   VARCHAR(150) NOT NULL,
  email           VARCHAR(150) NOT NULL UNIQUE,
  senha_hash      VARCHAR(255) NOT NULL,
  tipo_perfil     VARCHAR(20)  NOT NULL CHECK (tipo_perfil IN ('ALUNO', 'PROFESSOR', 'ADMIN')),
  criado_em       TIMESTAMP    NOT NULL DEFAULT NOW(),
  criado_por      UUID REFERENCES usuarios(id_usuario)
);

-- Migração para bases existentes:
-- ALTER TABLE usuarios ADD COLUMN criado_por UUID REFERENCES usuarios(id_usuario);

-- Admins
CREATE TABLE admins (
  id_admin    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario  UUID NOT NULL UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Professores
CREATE TABLE professores (
  id_professor    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario      UUID NOT NULL UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  especialidades  TEXT
);

-- Ritmos de dança
CREATE TABLE ritmos (
  id_ritmo  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome      VARCHAR(50) NOT NULL UNIQUE
);

-- Turmas
CREATE TABLE turmas (
  id_turma          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_ritmo          UUID NOT NULL REFERENCES ritmos(id_ritmo),
  nome              VARCHAR(100) NOT NULL,
  capacidade_maxima INTEGER NOT NULL
);

-- Aulas agendadas
CREATE TABLE aulas_agenda (
  id_aula           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_professor      UUID NOT NULL REFERENCES professores(id_professor),
  id_turma          UUID NOT NULL REFERENCES turmas(id_turma),
  tipo_aula         VARCHAR(20) NOT NULL,
  data_hora_inicio  TIMESTAMP NOT NULL,
  data_hora_fim     TIMESTAMP NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'agendada'
);

-- Alunos
CREATE TABLE alunos (
  id_aluno          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario        UUID NOT NULL UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  cpf               VARCHAR(14) UNIQUE,
  telefone          VARCHAR(20),
  endereco          VARCHAR(255),
  data_nascimento   DATE,
  nome_mae          VARCHAR(150),
  profissao         VARCHAR(150),
  tel_parente       VARCHAR(20),
  nome_parente      VARCHAR(255),
  grau_parentesco   VARCHAR(20)
);

-- Anamneses
CREATE TABLE anamneses (
  id_anamnese         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_aluno            UUID NOT NULL REFERENCES alunos(id_aluno) ON DELETE CASCADE,
  dados_questionario  JSON,
  data_preenchimento  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Ritmos dos alunos
CREATE TABLE alunos_ritmo (
  id_aluno  UUID NOT NULL REFERENCES alunos(id_aluno) ON DELETE CASCADE,
  id_ritmo  UUID NOT NULL REFERENCES ritmos(id_ritmo) ON DELETE CASCADE,
  PRIMARY KEY (id_aluno, id_ritmo)
);

-- Agendamento de aulas
CREATE TABLE agendamento_aulas (
  id_agendamento    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_aula           UUID NOT NULL REFERENCES aulas_agenda(id_aula),
  id_aluno          UUID NOT NULL REFERENCES alunos(id_aluno),
  status_presenca   VARCHAR(20) NOT NULL DEFAULT 'pendente',
  data_agendamento  TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (id_aula, id_aluno)
);

-- Matrículas em turmas
CREATE TABLE matriculas_turmas (
  id_matricula  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_aluno      UUID NOT NULL REFERENCES alunos(id_aluno),
  id_turma      UUID NOT NULL REFERENCES turmas(id_turma),
  status        VARCHAR(20) NOT NULL DEFAULT 'ativa',
  UNIQUE (id_aluno, id_turma)
);

-- Planos
CREATE TABLE planos (
  id_plano             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                 VARCHAR(50) NOT NULL UNIQUE,
  ciclo_meses          INTEGER NOT NULL,
  valor_base           DECIMAL(10,2) NOT NULL,
  percentual_desconto  DECIMAL(5,2) NOT NULL DEFAULT 0
);

-- Contratos
CREATE TABLE contratos (
  id_contrato       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_aluno          UUID NOT NULL REFERENCES alunos(id_aluno),
  id_plano          UUID NOT NULL REFERENCES planos(id_plano),
  forma_pgto_padrao VARCHAR(20) NOT NULL,
  criado_em         TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Parcelas
CREATE TABLE parcelas (
  id_parcela      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_contrato     UUID NOT NULL REFERENCES contratos(id_contrato),
  numero_parcela  INTEGER NOT NULL,
  valor_cobrado   DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pendente',
  UNIQUE (id_contrato, numero_parcela)
);

-- Pagamentos
CREATE TABLE pagamentos (
  id_pagamento    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_parcela      UUID NOT NULL REFERENCES parcelas(id_parcela),
  metodo          VARCHAR(20) NOT NULL,
  data_pagamento  TIMESTAMP NOT NULL DEFAULT NOW(),
  valor_pago      DECIMAL(10,2) NOT NULL,
  id_gateway      VARCHAR(100)
);

-- Notas fiscais
CREATE TABLE notas_fiscais (
  id_nota         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_pagamento    UUID NOT NULL UNIQUE REFERENCES pagamentos(id_pagamento),
  numero_nfse     VARCHAR(50),
  status_emissao  VARCHAR(20) NOT NULL DEFAULT 'pendente',
  xml_link        VARCHAR(255),
  data_emissao    TIMESTAMP
);

-- Notificações WhatsApp
CREATE TABLE notificacoes_whatsapp (
  id_notificacao  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario      UUID NOT NULL REFERENCES usuarios(id_usuario),
  tipo_gatilho    VARCHAR(30) NOT NULL,
  mensagem        TEXT NOT NULL,
  data_envio      TIMESTAMP,
  status_envio    VARCHAR(20) NOT NULL DEFAULT 'pendente'
);

CREATE TABLE tokens_redefinicao_senha (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario  UUID NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  token       VARCHAR(255) NOT NULL UNIQUE,
  expira_em   TIMESTAMP NOT NULL,
  usado       BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Leads (potenciais alunos captados)
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

-- Versionamento do Termo de Aceite
CREATE TABLE contratos_template (
  id_template UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  versao      INTEGER NOT NULL,
  conteudo    TEXT NOT NULL,
  ativo       BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em   TIMESTAMP NOT NULL DEFAULT NOW(),
  criado_por  UUID REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);