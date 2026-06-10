import { z } from 'zod';

export const AnamneseSchema = z.object({
  praticaAtividade: z.boolean(),
  temLesao: z.boolean(),
  descricaoLesao: z.string().optional(),
  temDoencaCronica: z.boolean(),
  descricaoDoenca: z.string().optional(),
  usaMedicamento: z.boolean(),
  descricaoMedicamento: z.string().optional(),
  observacoes: z.string().max(500).optional(),
});

export const AnamnesePostSchema = z.object({
  id_aluno: z.string().uuid('id_aluno deve ser um UUID válido'),
  dados_questionario: z.record(z.string(), z.any()).default({}),
});

export const RegisterSchema = z.object({
  nomeCompleto: z
    .string()
    .min(3, 'Nome deve ter ao menos 3 caracteres')
    .max(100),

  email: z.string().email('E-mail inválido'),

  senha: z
    .string()
    .min(8, 'Senha deve ter ao menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter ao menos um número'),

  telefone: z
    .string()
    .regex(/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/, 'Telefone inválido'),

  dataNascimento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),

  role: z.enum(['ALUNO', 'PROFESSOR', 'ADMIN']).default('ALUNO'),

  anamnese: AnamneseSchema.optional(),

  // 👨‍🎓 CAMPOS DO ALUNO
  cpf: z
    .string()
    .regex(/^\d{11}$/, 'CPF deve conter 11 números')
    .optional(),

  endereco: z.string().max(255).optional(),

  nomeMae: z.string().max(100).optional(),

  profissao: z.string().max(100).optional(),

  menorIdade: z.boolean().optional(),

  telParente: z
    .string()
    .regex(/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/, 'Telefone do responsável inválido')
    .optional(),

  nomeParente: z.string().max(100).optional(),

  grauParentesco: z.string().max(50).optional(),

  // CAMPO DO PROFESSOR
  especialidade: z.string().max(100).optional(),

  // CAMPOS OPCIONAIS ADICIONAIS
  genero: z.string().max(30).optional(),

  observacoes: z.string().max(1000).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

export const UsuarioSchema = z.object({
  id_usuario: z.string().uuid(),
  nome_completo: z.string(),
  email: z.string().email(),
  tipo_perfil: z.enum(['ALUNO', 'PROFESSOR', 'ADMIN']),
  telefone: z.string().optional(),
  id_aluno: z.string().uuid().optional(),
  cpf: z.string().optional(),
  data_nascimento: z.string().optional(),
  endereco: z.string().optional(),
  profissao: z.string().optional(),
  nome_parente: z.string().optional(),
  tel_parente: z.string().optional(),
  grau_parentesco: z.string().optional(),
});

export const UsuarioUpdateSchema = z.object({
  telefone: z.union([z.string().min(10).max(20), z.literal(''), z.null()]).optional(),
  endereco: z.union([z.string().max(255), z.literal(''), z.null()]).optional(),
  profissao: z.union([z.string().max(100), z.literal(''), z.null()]).optional(),
  tel_parente: z.union([z.string().min(10).max(20), z.literal(''), z.null()]).optional(),
  nome_parente: z.union([z.string().max(100), z.literal(''), z.null()]).optional(),
  grau_parentesco: z.union([z.string().max(50), z.literal(''), z.null()]).optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UsuarioInput = z.infer<typeof UsuarioSchema>;
export type UsuarioUpdateInput = z.infer<typeof UsuarioUpdateSchema>;

export const AceiteContratoSchema = z.object({
  id_aluno: z.string().uuid('id_aluno deve ser um UUID válido'),
  id_contrato_template: z.string().uuid('id_contrato_template deve ser um UUID válido'),
  aceito: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar o contrato para continuar'
  }),
});

export type AceiteContratoInput = z.infer<typeof AceiteContratoSchema>;