'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'

export default function EsqueciSenhaPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [enviado, setEnviado] = useState(false)

  async function handleSubmit() {
    setErro('')

    if (!email) {
      setErro('Digite seu e-mail.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/esqueci-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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
    <div className="min-h-screen bg-[#f5f0eb] flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/login')}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="font-extrabold text-[#6B1326] text-sm tracking-widest uppercase">
            Isabel Wenccess
          </span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">

          {!enviado ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm">

              {/* Ícone */}
              <div className="w-14 h-14 rounded-2xl bg-[#6B1326]/10 flex items-center justify-center mb-6">
                <Mail size={24} className="text-[#6B1326]" />
              </div>

              {/* Título */}
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
                Esqueceu sua senha?
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-8">
                Digite o e-mail cadastrado e enviaremos um link para você criar uma nova senha.
              </p>

              {/* Campo */}
              <div className="flex flex-col gap-1.5 mb-6">
                <label className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#6B1326]/20 focus:border-[#6B1326]/40 transition py-3.5 px-4"
                />
              </div>

              {/* Erro */}
              {erro && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
                  <p className="text-sm text-red-600">{erro}</p>
                </div>
              )}

              {/* Botão */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#6B1326] hover:bg-[#8a1a30] disabled:opacity-60 text-white font-bold text-sm tracking-widest uppercase rounded-xl py-3.5 transition shadow-lg shadow-[#6B1326]/25"
              >
                {loading ? 'Enviando...' : 'Enviar link de redefinição'}
              </button>

              {/* Voltar */}
              <button
                onClick={() => router.push('/login')}
                className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 transition"
              >
                Voltar para o login
              </button>

            </div>
          ) : (

            /* Estado de sucesso */
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
                E-mail enviado!
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-2">
                Se <span className="font-semibold text-gray-700">{email}</span> estiver cadastrado, você receberá as instruções em breve.
              </p>
              <p className="text-xs text-gray-400 mb-8">
                Verifique também a caixa de spam. O link expira em 1 hora.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-[#6B1326] hover:bg-[#8a1a30] text-white font-bold text-sm tracking-widest uppercase rounded-xl py-3.5 transition shadow-lg shadow-[#6B1326]/25"
              >
                Voltar para o login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}