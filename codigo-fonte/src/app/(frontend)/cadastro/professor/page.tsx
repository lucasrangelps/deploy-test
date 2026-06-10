'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Music } from 'lucide-react'
import {
  FieldErrorDisplay,
  getFieldErrors,
  getFormErrors,
  Toast,
  useToast
} from '@/components'

import type { FieldErrors } from '@/components'

const ESPECIALIDADES = ['Forró', 'Zouk', 'Sertanejo', 'Dança de Salão', 'Salsa', 'Samba', 'Bachata', 'Tango', 'Funk', 'Contemporâneo']

interface FormData {
  nomeCompleto: string
  email: string
  senha: string
  confirmarSenha: string
  cpf: string
  telefone: string
  dataNascimento: string
  endereco: string
  especialidades: string[]
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

export default function CadastroProfessorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [fieldErrors, setFieldErrors] =
  useState<FieldErrors>({})
  const { toast, showToast, hideToast } = useToast()

  const [form, setForm] = useState<FormData>({
    nomeCompleto: '', email: '', senha: '', confirmarSenha: '',
    cpf: '', telefone: '', dataNascimento: '', endereco: '',
    especialidades: [],
  })

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleEsp(nome: string) {
    setForm((prev) => ({
      ...prev,
      especialidades: prev.especialidades.includes(nome)
        ? prev.especialidades.filter((e) => e !== nome)
        : [...prev.especialidades, nome],
    }))
  }

  function formatCPF(v: string) {
    return v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').slice(0, 14)
  }

  function formatPhone(v: string) {
    return v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 15)
  }

  async function handleSubmit() {
    setErro('')
    setFieldErrors({})

    if (!form.nomeCompleto || !form.email || !form.senha) {
      setErro('Preencha todos os campos obrigatórios.')
      return
    }

    if (form.senha !== form.confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    if (form.senha.length < 8) {
      setErro('A senha deve ter no mínimo 8 caracteres.')
      return
    }

    if (form.especialidades.length === 0) {
      setErro('Selecione ao menos uma especialidade.')
      return
    }

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
          dataNascimento: form.dataNascimento || undefined,
          role: 'PROFESSOR',

          cpf: form.cpf ? form.cpf.replace(/\D/g, '') : undefined,
          endereco: form.endereco || undefined,

          especialidade: form.especialidades.join(', '),
        }),
      })

      const data = await res.json()
      console.log('Resposta da API:', data) // 🔥 MOSTRA O ERRO REAL
      if (!res.ok) {
        // Extrai fieldErrors e formErrors da resposta da API
        const errors = getFieldErrors(data)
        const formErrors = getFormErrors(data)

        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors)
          showToast('Existem erros, corrija-os e envie novamente', 'error')
        }
        if (formErrors.length > 0) {
          setErro(formErrors[0])
        }
        if (!Object.keys(errors).length && !formErrors.length) {
          setErro(data.erro || 'Erro ao cadastrar.')
        }
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))

      setSucesso(true)
      setTimeout(() => router.push('/dashboard'), 1500)

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
          <button onClick={() => router.push('/')} className="hover:text-[#6B1326] transition">Professores</button>
          <ChevronRight size={14} />
          <span className="text-gray-700 font-medium">Novo Registro</span>
        </div>

        {/* Título */}
        <div className="mb-4 relative">
          <div className="absolute -top-6 -right-6 w-64 h-64 bg-[#6B1326]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-10 right-20 w-40 h-40 bg-[#6B1326]/5 rounded-full blur-2xl pointer-events-none" />
          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#6B1326] leading-tight mb-3">
            Cadastro de Professor
          </h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-lg">
            Faça parte do time de instrutores do studio Isabel Wenccess. Preencha seus dados e especialidades para começar.
          </p>
        </div>

        {/* ── Informações Pessoais ── */}
        <SectionRow title="Informações Pessoais" subtitle="Dados básicos de identificação e contato.">
          <div className="flex flex-col gap-4">
            <div>
              <Label>Nome Completo</Label>
              <Input placeholder="Ex: João Carlos Silva" value={form.nomeCompleto} onChange={(e) => set('nomeCompleto', e.target.value)} />
              <div className="mt-2">
                <FieldErrorDisplay errors={fieldErrors} field="nomeCompleto" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>E-mail</Label>
                <Input type="email" placeholder="joao@exemplo.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
                <div className="mt-2">
                  <FieldErrorDisplay errors={fieldErrors} field="email" />
                </div>
              </div>
              <div>
                <Label>Telefone</Label>
                <Input placeholder="(11) 99999-9999" value={form.telefone} onChange={(e) => set('telefone', formatPhone(e.target.value))} />
                <div className="mt-2">
                  <FieldErrorDisplay errors={fieldErrors} field="telefone" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data de Nascimento</Label>
                <Input type="date" value={form.dataNascimento} onChange={(e) => set('dataNascimento', e.target.value)} />
                <div className="mt-2">
                  <FieldErrorDisplay errors={fieldErrors} field="dataNascimento" />
                </div>
              </div>
              <div>
                <Label>CPF</Label>
                <Input placeholder="000.000.000-00" value={form.cpf} onChange={(e) => set('cpf', formatCPF(e.target.value))} />
                <div className="mt-2">
                  <FieldErrorDisplay errors={fieldErrors} field="cpf" />
                </div>
              </div>
            </div>
            <div>
              <Label>Endereço completo</Label>
              <Input placeholder="Rua, número, bairro, cidade" value={form.endereco} onChange={(e) => set('endereco', e.target.value)} />
            </div>
          </div>
        </SectionRow>

        {/* ── Dados de Acesso ── */}
        <SectionRow title="Dados de Acesso" subtitle="Crie sua senha para acessar o painel do professor.">
          <div className="flex flex-col gap-4">
            <div>
              <Label>Senha</Label>
              <Input type="password" placeholder="Mínimo 8 caracteres" value={form.senha} onChange={(e) => set('senha', e.target.value)} />
              <div className="mt-2">
                <FieldErrorDisplay errors={fieldErrors} field="senha" />
              </div>
            </div>
            <div>
              <Label>Confirmar Senha</Label>
              <Input type="password" placeholder="Repita a senha" value={form.confirmarSenha} onChange={(e) => set('confirmarSenha', e.target.value)} />
            </div>
          </div>
        </SectionRow>

        {/* ── Especialidades ── */}
        <SectionRow title="Especialidades" subtitle="Selecione os ritmos que você ensina. Pode escolher mais de um.">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {ESPECIALIDADES.map((esp) => {
                const ativo = form.especialidades.includes(esp)
                return (
                  <button
                    key={esp}
                    type="button"
                    onClick={() => toggleEsp(esp)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                      ativo
                        ? 'bg-[#6B1326] text-white shadow-md shadow-[#6B1326]/20'
                        : 'bg-[#f5f0eb] text-gray-600 hover:text-[#6B1326]'
                    }`}
                  >
                    <Music size={12} />
                    {esp}
                  </button>
                )
              })}
            </div>
            {form.especialidades.length > 0 && (
              <p className="text-xs text-gray-400">
                Selecionadas: <span className="text-[#6B1326] font-semibold">{form.especialidades.join(', ')}</span>
              </p>
            )}
          </div>
        </SectionRow>

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

      {/* Toast de erro */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}