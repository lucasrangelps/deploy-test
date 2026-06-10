export type UserRole = 'ALUNO' | 'PROFESSOR' | 'ADMIN';

export interface User {
  id: string;
  nomeCompleto: string;
  email: string;
  senha: string;
  telefone: string;
  dataNascimento: string; // ISO 8601: YYYY-MM-DD
  genero?: string;
  role: UserRole;
  cpf?: string;
  endereco?: string;
  nomeMae?: string;
  profissao?: string;
  observacoes?: string;
  menorIdade?: boolean;
  nomeParente?: string;
  telParente?: string;
  grauParentesco?: string;
  anamnese?: Anamnese;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Anamnese {
  praticaAtividade: boolean;
  temLesao: boolean;
  descricaoLesao?: string;
  temDoencaCronica: boolean;
  descricaoDoenca?: string;
  usaMedicamento: boolean;
  descricaoMedicamento?: string;
  observacoes?: string;
}

export type CreateUserDTO = Omit<User, 'id' | 'criadoEm' | 'atualizadoEm'>;

export type UserPublic = Omit<User, 'senha'>;