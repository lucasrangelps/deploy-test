'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy, Check } from 'lucide-react'
import { fetchWithAuth } from '@/lib/fetchWithAuth'
import { Toast, useToast } from '@/components/Toast'

export default function NovoAdminPage() {
  const router = useRouter()
  const { toast, showToast, hideToast } = useToast()

  const [nomeCompleto, setNomeCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [senhaGerada, setSenhaGerada] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  function gerarSenha(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let senha = ''
    for (let i = 0; i < 10; i++) senha += chars.charAt(Math.floor(Math.random() * chars.length))
    return senha + 'A1'
  }

  async function copiarSenha() {
    await navigator.clipboard.writeText(senhaGerada)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFieldErrors({})

    const senha = gerarSenha()

    setLoading(true)
    try {
      const res = await fetchWithAuth('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeCompleto, email, telefone, dataNascimento, senha }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 400 && data.fieldErrors) {
          setFieldErrors(data.fieldErrors)
          showToast('Corrija os erros no formulário.', 'error')
          return
        }
        if (res.status === 409) {
          showToast('E-mail já cadastrado no sistema.', 'error')
          return
        }
        showToast(data.erro || 'Erro ao criar administrador.', 'error')
        return
      }

      setSenhaGerada(senha)
      setSucesso(true)
    } catch {
      showToast('Erro de conexão. Tente novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (sucesso) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Administrador Criado!</h1>
        </div>
        <div className="page-content">
          <div className="card" style={{ maxWidth: 500 }}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#DCFAE6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Check size={28} color="#2D6A4F" />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{nomeCompleto}</p>
              <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 20 }}>{email}</p>

              <div style={{ background: '#FAF7F4', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                <p style={{ fontSize: 11, color: '#6B6B6B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>Senha provisória</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <code style={{ fontSize: 18, fontWeight: 700, color: '#8B1A2F', letterSpacing: 1 }}>{senhaGerada}</code>
                  <button onClick={copiarSenha} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B' }}>
                    {copiado ? <Check size={16} color="#2D6A4F" /> : <Copy size={16} />}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: '#6B6B6B', marginTop: 8 }}>Envie esta senha ao novo administrador para o primeiro acesso.</p>
              </div>

              <button className="btn-primary" onClick={() => router.push('/dashboard/admins')}>
                Voltar para Administradores
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <div className="page-header">
        <button
          onClick={() => router.push('/dashboard/admins')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 8, padding: 0 }}
        >
          <ArrowLeft size={14} /> Voltar
        </button>
        <p className="page-label">Gestão</p>
        <h1 className="page-title">Novo Administrador</h1>
      </div>

      <div className="page-content">
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ maxWidth: 560 }}>

            {/* Nome Completo */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Nome Completo *
              </label>
              <input
                type="text"
                value={nomeCompleto}
                onChange={e => setNomeCompleto(e.target.value)}
                placeholder="Nome completo do administrador"
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E8E0D8', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
              {fieldErrors.nomeCompleto && (
                <p style={{ color: '#DC2626', fontSize: 12, marginTop: 4 }}>
                  {fieldErrors.nomeCompleto[0]}
                </p>
              )}
            </div>

            {/* E-mail */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                E-mail *
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E8E0D8', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
              {fieldErrors.email && (
                <p style={{ color: '#DC2626', fontSize: 12, marginTop: 4 }}>
                  {fieldErrors.email[0]}
                </p>
              )}
            </div>

            {/* Telefone */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Telefone *
              </label>
              <input
                type="tel"
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                placeholder="(71) 99999-9999"
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E8E0D8', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
              {fieldErrors.telefone && (
                <p style={{ color: '#DC2626', fontSize: 12, marginTop: 4 }}>
                  {fieldErrors.telefone[0]}
                </p>
              )}
            </div>

            {/* Data de Nascimento */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Data de Nascimento *
              </label>
              <input
                type="date"
                value={dataNascimento}
                onChange={e => setDataNascimento(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E8E0D8', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
              {fieldErrors.dataNascimento && (
                <p style={{ color: '#DC2626', fontSize: 12, marginTop: 4 }}>
                  {fieldErrors.dataNascimento[0]}
                </p>
              )}
            </div>

            <div style={{ background: '#FFF9E6', border: '1px solid #F0D070', borderRadius: 8, padding: '12px 16px', marginBottom: 24 }}>
              <p style={{ margin: 0, fontSize: 12, color: '#92740A', lineHeight: 1.5 }}>
                🔒 Uma senha provisória será gerada automaticamente. Guarde-a para repassar ao novo administrador.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => router.push('/dashboard/admins')}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? 'Criando...' : 'Criar Administrador'}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}
