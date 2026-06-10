'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import PageHeader from '@/components/dashboard/PageHeader'
import { Toast, useToast } from '@/components/Toast'
import { FieldErrorDisplay } from '@/components/FieldErrorDisplay'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  nomeCompleto: string
  email: string
  senha: string
  confirmarSenha: string
  telefone: string
  dataNascimento: string
  genero: string
  cpf: string
  endereco: string
  nomeMae: string
  profissao: string
  observacoes: string
  menorDeIdade: boolean
  nomeResponsavel: string
  telefoneResponsavel: string
  grauParentesco: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCPF(v: string) {
  return v
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14)
}

function formatPhone(v: string) {
  return v
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15)
}

// ─── Inline components (padrão do projeto) ───────────────────────────────────

function SectionRow({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start py-10 border-b border-[#E8E0D8] last:border-0">
      <div>
        <h3 className="text-base font-semibold text-[#8B1A2F] mb-1">{title}</h3>
        <p className="text-[#6B6B6B] text-sm leading-relaxed max-w-xs">{subtitle}</p>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E0D8]">{children}</div>
    </div>
  )
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
      {children}
      {required && <span className="text-[#8B1A2F] ml-0.5">*</span>}
    </label>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-[#F5F0EB] border border-[#E8E0D8] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#6B6B6B] outline-none focus:ring-2 focus:ring-[#8B1A2F]/20 focus:border-[#8B1A2F]/40 transition py-3.5 px-4 ${props.className ?? ''}`}
    />
  )
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full bg-[#F5F0EB] border border-[#E8E0D8] rounded-xl text-sm text-[#1A1A1A] outline-none focus:ring-2 focus:ring-[#8B1A2F]/20 focus:border-[#8B1A2F]/40 transition py-3.5 px-4 ${props.className ?? ''}`}
    />
  )
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full bg-[#F5F0EB] border border-[#E8E0D8] rounded-xl text-sm text-[#1A1A1A] placeholder:text-[#6B6B6B] outline-none focus:ring-2 focus:ring-[#8B1A2F]/20 focus:border-[#8B1A2F]/40 transition py-3.5 px-4 resize-none ${props.className ?? ''}`}
    />
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NovoAlunoPage() {
  const router = useRouter()
  const { toast, showToast, hideToast } = useToast()

  const [loading, setLoading] = useState(false)
  const [erroGlobal, setErroGlobal] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({})

  const [form, setForm] = useState<FormData>({
    nomeCompleto: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    dataNascimento: '',
    genero: '',
    cpf: '',
    endereco: '',
    nomeMae: '',
    profissao: '',
    observacoes: '',
    menorDeIdade: false,
    nomeResponsavel: '',
    telefoneResponsavel: '',
    grauParentesco: '',
  })

  // Guard: apenas ADMIN pode acessar esta página
  useEffect(() => {
    try {
      const raw = localStorage.getItem('usuario')
      if (!raw) {
        router.replace('/login')
        return
      }
      const usuario = JSON.parse(raw)
      if (usuario.tipo_perfil !== 'ADMIN') {
        router.replace('/acesso-negado')
      }
    } catch {
      router.replace('/login')
    }
  }, [router])

  function set(field: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Limpa erro do campo ao editar
    if (fieldErrors[field as string]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  async function handleSubmit() {
    setErroGlobal('')
    setFieldErrors({})

    // Validações client-side
    if (!form.nomeCompleto || !form.email || !form.senha || !form.telefone) {
      setErroGlobal('Preencha todos os campos obrigatórios.')
      return
    }
    if (form.senha !== form.confirmarSenha) {
      setErroGlobal('As senhas não coincidem.')
      return
    }
    if (form.senha.length < 8) {
      setErroGlobal('A senha deve ter no mínimo 8 caracteres.')
      return
    }
    if (form.menorDeIdade && (!form.nomeResponsavel || !form.telefoneResponsavel)) {
      setErroGlobal('Preencha os dados do responsável.')
      return
    }

    setLoading(true)
    try {
      const res = await fetchWithAuth('/api/admin/alunos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeCompleto: form.nomeCompleto,
          email: form.email,
          senha: form.senha,
          telefone: form.telefone,
          dataNascimento: form.dataNascimento || undefined,
          genero: form.genero || undefined,
          cpf: form.cpf ? form.cpf.replace(/\D/g, '') : undefined,
          endereco: form.endereco || undefined,
          nomeMae: form.nomeMae || undefined,
          profissao: form.profissao || undefined,
          observacoes: form.observacoes || undefined,
          menorIdade: form.menorDeIdade,
          nomeParente: form.menorDeIdade ? form.nomeResponsavel : undefined,
          telParente: form.menorDeIdade
            ? form.telefoneResponsavel
            : undefined,
          grauParentesco: form.menorDeIdade ? form.grauParentesco : undefined,
        }),
      })

      const data = await res.json()

      if (res.status === 409) {
        setErroGlobal(data.erro || 'E-mail já cadastrado no sistema.')
        return
      }

      if (res.status === 400) {
        setFieldErrors(data.fieldErrors ?? {})
        setErroGlobal(data.erro || 'Verifique os campos e tente novamente.')
        return
      }

      if (!res.ok) {
        setErroGlobal(data.erro || 'Erro ao matricular aluno. Tente novamente.')
        return
      }

      showToast('Aluno matriculado com sucesso!', 'success')
      setTimeout(() => {
        if (data.id_aluno) {
          router.push(`/dashboard/alunos/${data.id_aluno}`)
        } else {
          router.push('/dashboard/alunos')
        }
      }, 1200)
    } catch {
      setErroGlobal('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <PageHeader
        label="Alunos"
        title="Nova Matrícula"
        subtitle="Preencha os dados para matricular um novo aluno no sistema."
        action={{ label: 'Voltar', href: '/dashboard/alunos', icon: UserPlus }}
      />

      <div className="page-content" style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Erro global */}
        {erroGlobal && (
          <div
            className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6"
          >
            <span>{erroGlobal}</span>
          </div>
        )}

        {/* SEÇÃO 1 — INFORMAÇÕES PESSOAIS */}
        <SectionRow
          title="Informações Pessoais"
          subtitle="Dados básicos de identificação do aluno."
        >
          <div className="flex flex-col gap-4">
            <div>
              <Label required>Nome Completo</Label>
              <Input
                placeholder="Ex: Maria Silva Souza"
                value={form.nomeCompleto}
                onChange={(e) => set('nomeCompleto', e.target.value)}
              />
              <FieldErrorDisplay errors={fieldErrors} field="nomeCompleto" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>E-mail</Label>
                <Input
                  type="email"
                  placeholder="aluno@email.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                />
                <FieldErrorDisplay errors={fieldErrors} field="email" />
              </div>
              <div>
                <Label required>Telefone</Label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={form.telefone}
                  onChange={(e) => set('telefone', formatPhone(e.target.value))}
                />
                <FieldErrorDisplay errors={fieldErrors} field="telefone" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Data de Nascimento</Label>
                <Input
                  type="date"
                  value={form.dataNascimento}
                  onChange={(e) => set('dataNascimento', e.target.value)}
                />
                <FieldErrorDisplay errors={fieldErrors} field="dataNascimento" />
              </div>
              <div>
                <Label>Gênero</Label>
                <Select
                  value={form.genero}
                  onChange={(e) => set('genero', e.target.value)}
                >
                  <option value="">Selecione...</option>
                  <option value="feminino">Feminino</option>
                  <option value="masculino">Masculino</option>
                  <option value="outro">Outro</option>
                  <option value="prefiro_nao_dizer">Prefiro não dizer</option>
                </Select>
              </div>
            </div>
          </div>
        </SectionRow>

        {/* SEÇÃO 2 — DADOS DE ACESSO */}
        <SectionRow
          title="Dados de Acesso"
          subtitle="Senha inicial para o aluno acessar o sistema."
        >
          <div className="flex flex-col gap-4">
            <div>
              <Label required>Senha</Label>
              <Input
                type="password"
                placeholder="Mínimo 8 caracteres, 1 maiúscula e 1 número"
                value={form.senha}
                onChange={(e) => set('senha', e.target.value)}
              />
              <FieldErrorDisplay errors={fieldErrors} field="senha" />
            </div>
            <div>
              <Label required>Confirmar Senha</Label>
              <Input
                type="password"
                placeholder="Repita a senha"
                value={form.confirmarSenha}
                onChange={(e) => set('confirmarSenha', e.target.value)}
              />
            </div>
          </div>
        </SectionRow>

        {/* SEÇÃO 3 — DOCUMENTOS */}
        <SectionRow
          title="Documentos"
          subtitle="CPF e endereço do aluno para fins cadastrais."
        >
          <div className="flex flex-col gap-4">
            <div>
              <Label>CPF</Label>
              <Input
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={(e) => set('cpf', formatCPF(e.target.value))}
              />
              <FieldErrorDisplay errors={fieldErrors} field="cpf" />
            </div>
            <div>
              <Label>Endereço Completo</Label>
              <Input
                placeholder="Rua, número, bairro, cidade - UF"
                value={form.endereco}
                onChange={(e) => set('endereco', e.target.value)}
              />
            </div>
          </div>
        </SectionRow>

        {/* SEÇÃO 4 — DADOS ADICIONAIS */}
        <SectionRow
          title="Dados Adicionais"
          subtitle="Informações complementares do aluno."
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Nome da Mãe</Label>
                <Input
                  placeholder="Nome completo da mãe"
                  value={form.nomeMae}
                  onChange={(e) => set('nomeMae', e.target.value)}
                />
              </div>
              <div>
                <Label>Profissão</Label>
                <Input
                  placeholder="Ex: Professora, Estudante..."
                  value={form.profissao}
                  onChange={(e) => set('profissao', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                rows={3}
                placeholder="Anotações internas sobre o aluno..."
                value={form.observacoes}
                onChange={(e) => set('observacoes', e.target.value)}
              />
            </div>

            {/* Checkbox menor de idade */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.menorDeIdade}
                onChange={(e) => set('menorDeIdade', e.target.checked)}
                className="w-4 h-4 rounded accent-[#8B1A2F] cursor-pointer"
              />
              <span className="text-sm font-medium text-[#1A1A1A]">Menor de idade</span>
            </label>
          </div>
        </SectionRow>

        {/* SEÇÃO 5 — DADOS DO RESPONSÁVEL (condicional) */}
        {form.menorDeIdade && (
          <SectionRow
            title="Dados do Responsável"
            subtitle="Obrigatório para alunos menores de 18 anos."
          >
            <div className="flex flex-col gap-4">
              <div>
                <Label required>Nome do Responsável</Label>
                <Input
                  placeholder="Nome completo do responsável"
                  value={form.nomeResponsavel}
                  onChange={(e) => set('nomeResponsavel', e.target.value)}
                />
                <FieldErrorDisplay errors={fieldErrors} field="nomeParente" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label required>Telefone</Label>
                  <Input
                    placeholder="(11) 99999-9999"
                    value={form.telefoneResponsavel}
                    onChange={(e) => set('telefoneResponsavel', formatPhone(e.target.value))}
                  />
                  <FieldErrorDisplay errors={fieldErrors} field="telParente" />
                </div>
                <div>
                  <Label>Grau de Parentesco</Label>
                  <Select
                    value={form.grauParentesco}
                    onChange={(e) => set('grauParentesco', e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="pai">Pai</option>
                    <option value="mae">Mãe</option>
                    <option value="avo">Avó / Avô</option>
                    <option value="tio">Tio / Tia</option>
                    <option value="irmao">Irmão / Irmã</option>
                    <option value="responsavel_legal">Responsável Legal</option>
                    <option value="outro">Outro</option>
                  </Select>
                </div>
              </div>
            </div>
          </SectionRow>
        )}

        {/* AÇÕES */}
        <div className="flex items-center justify-end gap-3 pt-8">
          <button
            type="button"
            onClick={() => router.push('/dashboard/alunos')}
            disabled={loading}
            className="px-6 py-3 rounded-xl text-sm font-medium text-[#6B6B6B] bg-white border border-[#E8E0D8] hover:border-[#8B1A2F]/30 hover:text-[#8B1A2F] transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 rounded-xl text-sm font-semibold text-white bg-[#8B1A2F] hover:bg-[#B5283D] transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Matriculando...
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Matricular Aluno
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
