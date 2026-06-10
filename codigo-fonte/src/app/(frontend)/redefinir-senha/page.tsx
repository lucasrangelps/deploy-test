'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Lock, CheckCircle, XCircle } from 'lucide-react'

function RedefinirSenhaForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    if (!token) {
      setErro('Link inválido. Solicite um novo.')
    }
  }, [token])

  async function handleSubmit() {
    setErro('')

    if (!novaSenha || !confirmarSenha) {
      setErro('Preencha os dois campos.')
      return
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    if (novaSenha.length < 8) {
      setErro('A senha deve ter no mínimo 8 caracteres.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/redefinir-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.erro || 'Erro ao redefinir senha.')
        return
      }

      setSucesso(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <XCircle size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-3">Link inválido</h2>
        <p className="text-sm text-gray-500 mb-8">
          Este link é inválido ou expirou. Solicite um novo.
        </p>
        <button
          onClick={() => router.push('/esqueci-senha')}
          className="w-full bg-[#6B1326] hover:bg-[#8a1a30] text-white font-bold text-sm tracking-widest uppercase rounded-xl py-3.5 transition shadow-lg shadow-[#6B1326]/25"
        >
          Solicitar novo link
        </button>
      </div>
    )
  }

  if (sucesso) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
          Senha redefinida!
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          Sua senha foi atualizada com sucesso. Redirecionando para o login...
        </p>
        <button
          onClick={() => router.push('/login')}
          className="w-full bg-[#6B1326] hover:bg-[#8a1a30] text-white font-bold text-sm tracking-widest uppercase rounded-xl py-3.5 transition shadow-lg shadow-[#6B1326]/25"
        >
          Ir para o login
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">

      {/* Ícone */}
      <div className="w-14 h-14 rounded-2xl bg-[#6B1326]/10 flex items-center justify-center mb-6">
        <Lock size={24} className="text-[#6B1326]" />
      </div>

      {/* Título */}
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
        Crie uma nova senha
      </h1>
      <p className="text-sm text-gray-500 leading-relaxed mb-8">
        Sua nova senha deve ter no mínimo 8 caracteres.
      </p>

      {/* Campos */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
            Nova senha
          </label>
          <input
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#6B1326]/20 focus:border-[#6B1326]/40 transition py-3.5 px-4"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
            Confirmar nova senha
          </label>
          <input
            type="password"
            placeholder="Repita a senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#6B1326]/20 focus:border-[#6B1326]/40 transition py-3.5 px-4"
          />
        </div>
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
        {loading ? 'Salvando...' : 'Salvar nova senha'}
      </button>

    </div>
  )
}

export default function RedefinirSenhaPage() {
  const router = useRouter()

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
          <Suspense fallback={<div className="bg-white rounded-2xl p-8 shadow-sm text-center text-gray-400">Carregando...</div>}>
            <RedefinirSenhaForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}