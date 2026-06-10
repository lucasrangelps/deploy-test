'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy, Check } from 'lucide-react'

type Ritmo = { id_ritmo: string; nome: string }

export default function NovoProfessorPage() {
  const router = useRouter()

  const [ritmos, setRitmos] = useState<Ritmo[]>([])
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [especialidades, setEspecialidades] = useState<string[]>([])
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [senhaGerada, setSenhaGerada] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    fetch('/api/ritmos')
      .then(r => r.json())
      .then(data => setRitmos(Array.isArray(data) ? data : []))
  }, [])

  function gerarSenha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let senha = ''
    for (let i = 0; i < 10; i++) senha += chars.charAt(Math.floor(Math.random() * chars.length))
    return senha + 'A1'
  }

  function toggleEspecialidade(ritmo: string) {
    setEspecialidades(prev =>
      prev.includes(ritmo) ? prev.filter(r => r !== ritmo) : [...prev, ritmo]
    )
  }

  async function copiarSenha() {
    await navigator.clipboard.writeText(senhaGerada)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  async function handleSubmit() {
    setErro('')

    if (!nome.trim() || !email.trim() || !telefone.trim() || !dataNascimento) {
      setErro('Nome, email, telefone e data de nascimento sao obrigatorios.')
      return
    }

    const senha = gerarSenha()
    setSenhaGerada(senha)

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeCompleto: nome.trim(),
          email: email.trim(),
          senha,
          telefone: telefone.trim(),
          dataNascimento,
          role: 'PROFESSOR',
          especialidade: especialidades.join(', '),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.erro || 'Erro ao cadastrar.')
        setSenhaGerada('')
        return
      }

      setSucesso(true)
    } catch {
      setErro('Erro de conexao.')
      setSenhaGerada('')
    } finally {
      setLoading(false)
    }
  }

  if (sucesso) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Professor Cadastrado!</h1>
        </div>
        <div className="page-content">
          <div className="card" style={{ maxWidth: 500 }}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#DCFAE6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Check size={28} color="#2D6A4F" />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{nome}</p>
              <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 20 }}>{email}</p>

              <div style={{ background: '#FAF7F4', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                <p style={{ fontSize: 11, color: '#6B6B6B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>Senha provisoria</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <code style={{ fontSize: 18, fontWeight: 700, color: '#8B1A2F', letterSpacing: 1 }}>{senhaGerada}</code>
                  <button onClick={copiarSenha} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B' }}>
                    {copiado ? <Check size={16} color="#2D6A4F" /> : <Copy size={16} />}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: '#6B6B6B', marginTop: 8 }}>Envie esta senha ao professor para o primeiro acesso.</p>
              </div>

              <button className="btn-primary" onClick={() => router.push('/dashboard/professores')}>
                Voltar para Professores
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <button
          onClick={() => router.push('/dashboard/professores')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#6B6B6B', fontSize: 13, marginBottom: 8 }}
        >
          <ArrowLeft size={16} /> Voltar para Professores
        </button>
        <h1 className="page-title">Cadastrar Professor</h1>
      </div>

      <div className="page-content">
        <div className="card" style={{ maxWidth: 600 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div className="form-group">
              <label className="form-label">Nome completo *</label>
              <input className="form-input" placeholder="Nome do professor" value={nome} onChange={e => setNome(e.target.value)} />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">E-mail *</label>
                <input className="form-input" type="email" placeholder="professor@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone / WhatsApp *</label>
                <input className="form-input" placeholder="(71) 99999-0000" value={telefone} onChange={e => setTelefone(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Data de nascimento *</label>
              <input className="form-input" type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Especialidades</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ritmos.map(r => (
                  <button
                    key={r.id_ritmo}
                    type="button"
                    onClick={() => toggleEspecialidade(r.nome)}
                    style={{
                      padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      border: '1.5px solid', cursor: 'pointer', transition: 'all 0.15s',
                      background: especialidades.includes(r.nome) ? '#8B1A2F' : '#FFFFFF',
                      color: especialidades.includes(r.nome) ? '#FFFFFF' : '#8B1A2F',
                      borderColor: '#8B1A2F',
                    }}
                  >
                    {r.nome}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bio / Apresentacao</label>
              <textarea className="form-textarea" placeholder="Breve descricao sobre o professor..." value={bio} onChange={e => setBio(e.target.value)} />
            </div>

            <div style={{ background: '#FAF7F4', borderRadius: 8, padding: '12px 16px' }}>
              <p style={{ fontSize: 12, color: '#6B6B6B' }}>
                Uma senha provisoria sera gerada automaticamente ao cadastrar. Envie ao professor para o primeiro acesso.
              </p>
            </div>

            {erro && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px' }}>
                <p className="form-error">{erro}</p>
              </div>
            )}

            <div className="form-actions">
              <button className="btn-secondary" onClick={() => router.push('/dashboard/professores')}>Cancelar</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Cadastrando...' : 'Cadastrar Professor'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}