'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Mail, Lock, LogIn, Star, X, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const slides = [
  {
    image: '/images/danca_salao.jpg',
    title: 'Isabel\nWenccess',
    subtitle: 'A arte do movimento em sua forma mais sublime.',
  },
  {
    image: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=1200&q=80',
    title: 'Isabel\nWenccess',
    subtitle: 'Técnica, expressão e paixão em cada aula.',
  },
  {
    image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=1200&q=80',
    title: 'Cada Passo,\nUma História',
    subtitle: 'Do iniciante ao avançado, nossa escola transforma movimentos em arte.',
  },
  {
    image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=1200&q=80',
    title: 'Sinta o\nRitmo',
    subtitle: 'Forró, Samba, Salsa, Sertanejo e Zouk: descubra seu estilo e dance com a gente.',
  },
]

// ─── Input Field ──────────────────────────────────────────────────────────────

function InputField({
  label, type = 'text', placeholder, icon: Icon, rightLabel, value, onChange,
}: {
  label: string
  type?: string
  placeholder: string
  icon: React.ElementType
  rightLabel?: React.ReactNode
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">{label}</label>
        {rightLabel}
      </div>
      <div className="relative">
        <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={isPassword && showPassword ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full bg-gray-100 rounded-lg pl-10 pr-10 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#5C1022]/30 transition"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs transition"
          >
            {showPassword ? 'ocultar' : 'ver'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Modal Esqueci Senha ──────────────────────────────────────────────────────

function ModalEsqueciSenha({ onClose }: { onClose: () => void }) {
  const [emailRecuperacao, setEmailRecuperacao] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [enviado, setEnviado] = useState(false)

  async function handleEnviar() {
    setErro('')
    if (!emailRecuperacao) {
      setErro('Digite seu e-mail.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/esqueci-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailRecuperacao }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.erro || 'Erro ao enviar e-mail.')
        return
      }
      setEnviado(true)
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">

        {/* Header do modal */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900">Esqueceu sua senha?</h3>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Digite seu e-mail e enviaremos um link para redefinir sua senha.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition ml-4 mt-1 flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="px-6 pb-6">
          {!enviado ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                  E-mail
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="seu@email.com.br"
                    value={emailRecuperacao}
                    onChange={(e) => setEmailRecuperacao(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEnviar()}
                    autoFocus
                    className="w-full bg-gray-100 rounded-lg pl-10 pr-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#5C1022]/30 transition"
                  />
                </div>
              </div>

              {erro && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{erro}</p>
              )}

              <button
                onClick={handleEnviar}
                disabled={loading}
                className="w-full bg-[#5C1022] hover:bg-[#7a1630] disabled:opacity-60 text-white font-bold text-sm tracking-widest uppercase rounded-xl py-3.5 transition shadow-lg shadow-[#5C1022]/25"
              >
                {loading ? 'Enviando...' : 'Enviar link'}
              </button>

              <button
                onClick={onClose}
                className="w-full text-sm text-gray-400 hover:text-gray-600 transition"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">E-mail enviado!</h4>
              <p className="text-sm text-gray-500 leading-relaxed mb-1">
                Se <span className="font-semibold text-gray-700">{emailRecuperacao}</span> estiver cadastrado, você receberá as instruções em breve.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Verifique também a caixa de spam. O link expira em 1 hora.
              </p>
              <button
                onClick={onClose}
                className="w-full bg-[#5C1022] hover:bg-[#7a1630] text-white font-bold text-sm tracking-widest uppercase rounded-xl py-3.5 transition"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Página de Login ──────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true)
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length)
        setAnimating(false)
      }, 600)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const slide = slides[current]

  async function handleLogin() {
    setErro('')
    if (!email || !senha) {
      setErro('Preencha e-mail e senha.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.erro || 'Erro ao fazer login.')
        return
      }
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
        localStorage.setItem('supabase_session', JSON.stringify(data.session))
        // Armazenar o access_token para usar em requisições
        localStorage.setItem('token', data.session.access_token)
      }
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      const role = data.usuario?.tipo_perfil
      if (role === 'ADMIN') {
        router.push('/dashboard')
      } else if (role === 'PROFESSOR') {
        router.push('/area-professor')
      } else {
        router.push('/area-aluno')
      }
    } catch (err) {
      console.error(err)
      setErro('Erro de conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Modal Esqueci Senha */}
      {modalAberto && <ModalEsqueciSenha onClose={() => setModalAberto(false)} />}

      <div className="min-h-screen flex flex-col lg:flex-row">

        {/* ── Coluna Esquerda — Slideshow ── */}
        <div className="relative lg:w-1/2 h-64 lg:h-auto overflow-hidden flex-shrink-0">
          {slides.map((s, i) => (
            <img
              key={i}
              src={s.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700"
              style={{ opacity: i === current ? 1 : 0 }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2a0510]/95 via-[#5C1022]/55 to-[#2a0510]/20" />
          <div className="relative z-10 h-full flex flex-col justify-end p-8 lg:p-12">
            <div className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-yellow-500/30 rounded-full px-3 py-1.5 mb-5 w-fit">
              <Star size={12} fill="#EAB308" className="text-yellow-500" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-yellow-400 uppercase">
                Premium Experience
              </span>
            </div>
            <div
              className="transition-all duration-500"
              style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(12px)' : 'translateY(0)' }}
            >
              <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight mb-3 whitespace-pre-line">
                {slide.title}
              </h1>
              <p className="text-gray-200/80 text-sm lg:text-base leading-relaxed max-w-sm">
                {slide.subtitle}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setAnimating(true); setTimeout(() => { setCurrent(i); setAnimating(false) }, 300) }}
                  className="rounded-full bg-white transition-all duration-300"
                  style={{ width: i === current ? '24px' : '6px', height: '6px', opacity: i === current ? 1 : 0.4 }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Coluna Direita — Formulário ── */}
        <div className="flex-1 bg-white flex flex-col min-h-screen lg:min-h-0">
          <div className="p-6 lg:p-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition group"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              Voltar
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24 pb-8">
            <div className="w-full max-w-sm mx-auto">

              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Seja bem-vindo</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Insira suas credenciais para acessar sua conta exclusiva.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <InputField
                  label="Email"
                  type="email"
                  placeholder="seu@email.com.br"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <InputField
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  rightLabel={
                    <button
                      type="button"
                      onClick={() => setModalAberto(true)}
                      className="text-[11px] text-[#5C1022] hover:text-[#7a1630] transition font-medium"
                    >
                      Esqueceu a senha?
                    </button>
                  }
                />

                {erro && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{erro}</p>
                )}

                <label className="flex items-center gap-2.5 cursor-pointer mt-1">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#5C1022] cursor-pointer" />
                  <span className="text-sm text-gray-600">Lembrar de mim</span>
                </label>

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="mt-2 w-full flex items-center justify-center gap-2 bg-[#5C1022] hover:bg-[#7a1630] active:bg-[#3d0a17] disabled:opacity-60 text-white text-sm font-semibold py-3.5 rounded-lg transition-all duration-200 shadow-lg shadow-[#5C1022]/25"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                  {!loading && <LogIn size={16} />}
                </button>
              </div>

              <div className="my-7 flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">Não possui uma conta?</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.push('/cadastro/aluno')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-[#5C1022] text-sm font-semibold py-3 rounded-full transition-all duration-200"
                >
                  Tornar-se Novo Aluno
                </button>
                <button
                  onClick={() => router.push('/cadastro/professor')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-[#5C1022] text-sm font-semibold py-3 rounded-full transition-all duration-200"
                >
                  Tornar-se Professor
                </button>
              </div>
            </div>
          </div>

          <div className="px-8 py-5 text-center">
            <p className="text-[10px] tracking-widest uppercase text-gray-300">
              © 2024 Isabel Wenccess Studio
            </p>
          </div>
        </div>
      </div>
    </>
  )
}