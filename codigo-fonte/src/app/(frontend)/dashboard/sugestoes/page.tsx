'use client'

// src/app/dashboard/sugestoes/page.tsx

import { useState, useEffect, useCallback } from 'react'

interface Sugestao {
  id:        string
  titulo:    string
  mensagem:  string
  categoria: string
  status:    string
  resposta:  string | null
  criado_em: string
  alunos:    { usuarios: { nome_completo: string; email: string } } | null
}

const STATUS_BADGE: Record<string, string> = {
  aberto:     'badge-blue',
  em_analise: 'badge-gold',
  resolvido:  'badge-green',
}

const STATUS_LABEL: Record<string, string> = {
  aberto:     'Aberto',
  em_analise: 'Em análise',
  resolvido:  'Resolvido',
}

const STATUS_FILTROS = [
  { value: '',           label: 'Todas'      },
  { value: 'aberto',     label: 'Abertas'    },
  { value: 'em_analise', label: 'Em análise' },
  { value: 'resolvido',  label: 'Resolvidas' },
]

export default function CaixaSugestoesPage() {
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([])
  const [loading,   setLoading]   = useState(true)
  const [filtro,    setFiltro]    = useState('')
  const [aberta,    setAberta]    = useState<string | null>(null)
  const [resposta,  setResposta]  = useState('')
  const [salvando,  setSalvando]  = useState(false)
  const [erroResp,  setErroResp]  = useState('')

  const carregar = useCallback((status: string) => {
    setLoading(true)
    const qs = status ? `?status=${status}` : ''
    fetch(`/api/sugestoes${qs}`)
      .then(r => r.json())
      .then(({ data }) => { setSugestoes(data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { carregar('') }, [carregar])

  function toggleAbrir(id: string, respostaExistente: string | null) {
    if (aberta === id) { setAberta(null); setErroResp(''); return }
    setAberta(id)
    setResposta(respostaExistente ?? '')
    setErroResp('')
  }

  async function handleResponder(id: string) {
    if (!resposta.trim()) return
    setSalvando(true)
    setErroResp('')

    console.log('[PATCH] Enviando resposta para id:', id, '| resposta:', resposta)

    try {
      const res = await fetch('/api/sugestoes', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id, resposta }),
      })

      const json = await res.json()
      console.log('[PATCH] Resposta do servidor:', res.status, json)

      if (!res.ok) {
        setErroResp(json?.erro || 'Erro ao salvar resposta.')
        return
      }

      setAberta(null)
      setResposta('')
      carregar(filtro)

    } catch (e) {
      console.error('[PATCH] Erro de conexão:', e)
      setErroResp('Erro de conexão. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <p className="page-label">Dashboard</p>
        <h1 className="page-title">Caixa de Sugestões</h1>
      </div>

      <div className="page-content">

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
          <div className="toggle-group">
            {STATUS_FILTROS.map(f => (
              <button
                key={f.value}
                onClick={() => { setFiltro(f.value); carregar(f.value) }}
                className={`toggle-btn ${filtro === f.value ? 'active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6B6B6B' }}>
            {sugestoes.length} {sugestoes.length === 1 ? 'sugestão' : 'sugestões'}
          </span>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: '#6B6B6B', fontSize: 13 }}>
            Carregando...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sugestoes.map(s => {
              const isAberta = aberta === s.id
              return (
                <div
                  key={s.id}
                  className="card"
                  style={{ padding: 0, transition: 'border-color 0.15s', borderColor: isAberta ? '#8B1A2F' : '#E8E0D8' }}
                >
                  {/* Cabeçalho clicável */}
                  <button
                    onClick={() => toggleAbrir(s.id, s.resposta)}
                    style={{ width: '100%', textAlign: 'left', padding: 20, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#6B6B6B' }}>
                            {s.alunos?.usuarios?.nome_completo ?? 'Aluno'}
                          </span>
                          <span style={{ color: '#E8E0D8' }}>·</span>
                          <span style={{ fontSize: 11, color: '#6B6B6B' }}>{s.categoria}</span>
                        </div>
                        <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: 14 }}>{s.titulo}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <span className={`badge ${STATUS_BADGE[s.status] ?? 'badge-gray'}`}>
                          {STATUS_LABEL[s.status] ?? s.status}
                        </span>
                        <span style={{ color: '#6B6B6B', fontSize: 13 }}>{isAberta ? '∧' : '∨'}</span>
                      </div>
                    </div>
                  </button>

                  {/* Expandido */}
                  {isAberta && (
                    <div style={{ padding: '16px 20px 20px', borderTop: '1px solid #F0EDE8' }}>
                      <p style={{ color: '#6B6B6B', fontSize: 13, lineHeight: 1.7, marginBottom: 10 }}>
                        {s.mensagem}
                      </p>
                      <p style={{ fontSize: 11, color: '#6B6B6B', marginBottom: 16 }}>
                        {s.alunos?.usuarios?.email} · {new Date(s.criado_em).toLocaleDateString('pt-BR')}
                      </p>

                      {/* Resposta já existente */}
                      {s.resposta && (
                        <div style={{ marginBottom: 16, padding: '10px 14px', background: '#F0EDE8', borderRadius: 8, borderLeft: '3px solid #C9A96E' }}>
                          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 4 }}>
                            Resposta enviada
                          </p>
                          <p style={{ color: '#1A1A1A', fontSize: 13, lineHeight: 1.6 }}>{s.resposta}</p>
                        </div>
                      )}

                      <div className="form-group">
                        <label className="form-label">
                          {s.resposta ? 'Alterar resposta' : 'Resposta ao aluno'}
                        </label>
                        <textarea
                          className="form-textarea"
                          value={resposta}
                          onChange={e => setResposta(e.target.value)}
                          placeholder="Digite sua resposta..."
                          rows={3}
                        />
                      </div>

                      {erroResp && (
                        <p style={{ fontSize: 11, color: '#8B1A2F', marginBottom: 12 }}>{erroResp}</p>
                      )}

                      <div className="form-actions">
                        <button
                          onClick={() => handleResponder(s.id)}
                          disabled={salvando || !resposta.trim()}
                          className="btn-primary"
                          style={{ opacity: salvando || !resposta.trim() ? 0.5 : 1 }}
                        >
                          {salvando ? 'Salvando...' : 'Responder e resolver'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {sugestoes.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: 40, color: '#6B6B6B', fontSize: 13 }}>
                Nenhuma sugestão encontrada.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}