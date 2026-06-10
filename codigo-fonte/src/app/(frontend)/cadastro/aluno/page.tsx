'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

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
  ehMenor: boolean
  nomeResponsavel: string
  telefoneResponsavel: string
  grauParentesco: string
}

function SectionRow({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start py-12 border-b border-gray-200 last:border-0">
      <div>
        <h3 className="text-xl font-bold text-[#6B1326] mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{subtitle}</p>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm">{children}</div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1.5">{children}</label>
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-[#f5f0eb] border-0 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#6B1326]/20 transition py-3.5 px-4 ${props.className ?? ''}`}
    />
  )
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full bg-[#f5f0eb] border-0 rounded-xl text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#6B1326]/20 transition py-3.5 px-4 ${props.className ?? ''}`}
    />
  )
}

export default function CadastroAlunoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  const [form, setForm] = useState<FormData>({
    nomeCompleto: '', email: '', senha: '', confirmarSenha: '',
    telefone: '', dataNascimento: '', genero: '', cpf: '',
    endereco: '', nomeMae: '', profissao: '', ehMenor: false,
    nomeResponsavel: '', telefoneResponsavel: '', grauParentesco: '',
  })

  function set(field: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function formatCPF(v: string) {
    return v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').slice(0, 14)
  }

  function formatPhone(v: string) {
    return v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 15)
  }

  async function handleSubmit() {
    setErro('')
    if (!form.nomeCompleto || !form.email || !form.senha) return setErro('Preencha todos os campos obrigatórios.')
    if (form.senha !== form.confirmarSenha) return setErro('As senhas não coincidem.')
    if (form.senha.length < 8) return setErro('A senha deve ter no mínimo 8 caracteres.')
    if (form.ehMenor && (!form.nomeResponsavel || !form.telefoneResponsavel)) return setErro('Preencha os dados do responsável.')

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeCompleto: form.nomeCompleto,
          email: form.email,
          senha: form.senha,
          telefone: form.telefone,
          dataNascimento: form.dataNascimento,
          role: 'ALUNO',

          cpf: form.cpf ? form.cpf.replace(/\D/g, '') : undefined,
          endereco: form.endereco || undefined,
          nomeMae: form.nomeMae || undefined,
          profissao: form.profissao || undefined,
          menorIdade: form.ehMenor,

          telParente: form.ehMenor && form.telefoneResponsavel
            ? form.telefoneResponsavel
            : undefined,

          nomeParente: form.ehMenor ? form.nomeResponsavel : undefined,
          grauParentesco: form.ehMenor ? form.grauParentesco : undefined,
        })
      })
      const data = await res.json()
      if (!res.ok) return setErro(data.erro || 'Erro ao cadastrar.')
      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      setSucesso(true)
      setTimeout(() => router.push('/login'), 1500)
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0eb] animate-slide-up">

      {/* Header */}
      <header className="bg-[#f5f0eb]/80 border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="font-extrabold text-[#6B1326] text-sm tracking-widest uppercase">
            Isabel Wenccess
          </button>
          <button onClick={() => router.push('/login')} className="text-sm text-gray-500 hover:text-[#6B1326] transition">
            Já tenho conta
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <button onClick={() => router.push('/')} className="hover:text-[#6B1326] transition">Alunos</button>
          <ChevronRight size={14} />
          <span className="text-gray-700 font-medium">Novo Registro</span>
        </div>

        {/* Título */}
        <div className="mb-4 relative">
          <div className="absolute -top-6 -right-6 w-64 h-64 bg-[#6B1326]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-10 right-20 w-40 h-40 bg-[#6B1326]/5 rounded-full blur-2xl pointer-events-none" />
          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#6B1326] leading-tight mb-3">
            Matrícula de Novo Aluno
          </h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-lg">
            Inicie a jornada artística do seu aluno. Preencha cuidadosamente os detalhes abaixo para garantir uma experiência personalizada e segura.
          </p>
        </div>

        {/* ── Informações Pessoais ── */}
        <SectionRow title="Informações Pessoais" subtitle="Dados básicos de identificação e contato para comunicação direta.">
          <div className="flex flex-col gap-4">
            <div>
              <Label>Nome Completo</Label>
              <Input placeholder="Ex: Maria Eduarda Silva" value={form.nomeCompleto} onChange={(e) => set('nomeCompleto', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>E-mail</Label>
                <Input type="email" placeholder="maria@exemplo.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input placeholder="(11) 99999-9999" value={form.telefone} onChange={(e) => set('telefone', formatPhone(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data de Nascimento</Label>
                <Input type="date" value={form.dataNascimento} onChange={(e) => set('dataNascimento', e.target.value)} />
              </div>
              <div>
                <Label>Gênero</Label>
                <Select value={form.genero} onChange={(e) => set('genero', e.target.value)}>
                  <option value="">Selecione</option>
                  <option value="feminino">Feminino</option>
                  <option value="masculino">Masculino</option>
                  <option value="outro">Outro</option>
                  <option value="prefiro_nao_dizer">Prefiro não dizer</option>
                </Select>
              </div>
            </div>
          </div>
        </SectionRow>

        {/* ── Dados de Acesso ── */}
        <SectionRow title="Dados de Acesso" subtitle="Crie sua senha para acessar a área do aluno.">
          <div className="flex flex-col gap-4">
            <div>
              <Label>Senha</Label>
              <Input type="password" placeholder="Mínimo 8 caracteres" value={form.senha} onChange={(e) => set('senha', e.target.value)} />
            </div>
            <div>
              <Label>Confirmar Senha</Label>
              <Input type="password" placeholder="Repita a senha" value={form.confirmarSenha} onChange={(e) => set('confirmarSenha', e.target.value)} />
            </div>
          </div>
        </SectionRow>

        {/* ── Documentos ── */}
        <SectionRow title="Documentos" subtitle="Informações de identificação civil do aluno.">
          <div className="flex flex-col gap-4">
            <div>
              <Label>CPF</Label>
              <Input placeholder="000.000.000-00" value={form.cpf} onChange={(e) => set('cpf', formatCPF(e.target.value))} />
            </div>
            <div>
              <Label>Endereço completo</Label>
              <Input placeholder="Rua, número, bairro, cidade" value={form.endereco} onChange={(e) => set('endereco', e.target.value)} />
            </div>
          </div>
        </SectionRow>

        {/* ── Dados Adicionais ── */}
        <SectionRow title="Dados Adicionais" subtitle="Informações complementares para o cadastro completo.">
          <div className="flex flex-col gap-4">
            <div>
              <Label>Nome da Mãe</Label>
              <Input placeholder="Nome completo da mãe" value={form.nomeMae} onChange={(e) => set('nomeMae', e.target.value)} />
            </div>
            <div>
              <Label>Profissão</Label>
              <Input placeholder="Sua profissão" value={form.profissao} onChange={(e) => set('profissao', e.target.value)} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer bg-[#f5f0eb] rounded-xl px-4 py-3">
              <input
                type="checkbox"
                checked={form.ehMenor}
                onChange={(e) => set('ehMenor', e.target.checked)}
                className="w-4 h-4 accent-[#6B1326] cursor-pointer"
              />
              <div>
                <p className="text-sm font-semibold text-gray-700">Menor de idade</p>
                <p className="text-xs text-gray-400">Marque se o aluno tiver menos de 18 anos</p>
              </div>
            </label>
          </div>
        </SectionRow>

        {/* ── Responsável (condicional) ── */}
        {form.ehMenor && (
          <SectionRow title="Dados do Responsável" subtitle="Obrigatório para alunos menores de 18 anos.">
            <div className="flex flex-col gap-4">
              <div>
                <Label>Nome do Responsável</Label>
                <Input placeholder="Nome completo" value={form.nomeResponsavel} onChange={(e) => set('nomeResponsavel', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Telefone</Label>
                  <Input placeholder="(11) 99999-9999" value={form.telefoneResponsavel} onChange={(e) => set('telefoneResponsavel', formatPhone(e.target.value))} />
                </div>
                <div>
                  <Label>Grau de Parentesco</Label>
                  <Select value={form.grauParentesco} onChange={(e) => set('grauParentesco', e.target.value)}>
                    <option value="">Selecione</option>
                    <option value="pai">Pai</option>
                    <option value="mae">Mãe</option>
                    <option value="avo">Avô / Avó</option>
                    <option value="tio">Tio / Tia</option>
                    <option value="irmao">Irmão / Irmã</option>
                    <option value="outro">Outro</option>
                  </Select>
                </div>
              </div>
            </div>
          </SectionRow>
        )}

        {/* Erro / Sucesso */}
        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-6">
            <p className="text-sm text-red-600">{erro}</p>
          </div>
        )}
        {sucesso && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mt-6">
            <p className="text-sm text-green-600">✅ Cadastro realizado! Redirecionando...</p>
          </div>
        )}

        {/* Botão */}
        <div className="flex justify-end py-10">
          <button
            onClick={handleSubmit}
            disabled={loading || sucesso}
            className="bg-[#6B1326] hover:bg-[#8a1a30] disabled:opacity-60 text-white font-bold text-sm tracking-widest uppercase rounded-2xl px-12 py-4 transition shadow-lg shadow-[#6B1326]/25"
          >
            {loading ? 'Cadastrando...' : 'Criar minha conta'}
          </button>
        </div>

      </div>
    </div>
  )
}