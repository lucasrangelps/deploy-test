'use client'

// src/app/dashboard/avaliacoes/page.tsx

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Media {
  id_turma: string
  turma_nome: string
  professor_nome: string
  ritmo: string
  total_avaliacoes: number
  media_nota: number
  cinco_estrelas: number
  quatro_estrelas: number
  ate_tres_estrelas: number
}

export default function GestaoAvaliacoesPage() {
  const router = useRouter()
  const [medias, setMedias]   = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca]     = useState('')
  const [ordenar, setOrdenar] = useState<'media' | 'total' | 'nome'>('media')

  useEffect(() => {
    fetch('/api/avaliacoes?medias=true')
      .then(r => r.json())
      .then(({ data }) => { setMedias(data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtradas = medias
    .filter(m =>
      m.turma_nome?.toLowerCase().includes(busca.toLowerCase()) ||
      m.professor_nome?.toLowerCase().includes(busca.toLowerCase()) ||
      m.ritmo?.toLowerCase().includes(busca.toLowerCase())
    )
    .sort((a, b) => {
      if (ordenar === 'media') return (b.media_nota ?? 0) - (a.media_nota ?? 0)
      if (ordenar === 'total') return b.total_avaliacoes - a.total_avaliacoes
      return a.turma_nome?.localeCompare(b.turma_nome)
    })

  const mediaGeral      = medias.length ? (medias.reduce((s, m) => s + (m.media_nota ?? 0), 0) / medias.length).toFixed(1) : '—'
  const totalAvaliacoes = medias.reduce((s, m) => s + m.total_avaliacoes, 0)

  return (
    <div>
      <div className="page-header">
        <p className="page-label">Dashboard</p>
        <h1 className="page-title">Gestão de Avaliações</h1>
      </div>

      <div className="page-content">

        {/* KPIs */}
        <div className="kpi-grid">
          {[
            { label: 'Média Geral',      value: mediaGeral,                                              color: '#C9A96E', bg: 'rgba(201,169,110,0.1)' },
            { label: 'Total Avaliações', value: totalAvaliacoes,                                         color: '#8B1A2F', bg: 'rgba(139,26,47,0.08)'  },
            { label: 'Turmas Avaliadas', value: medias.filter(m => m.total_avaliacoes > 0).length,       color: '#2D6A4F', bg: 'rgba(45,106,79,0.08)'  },
            { label: 'Professores',      value: [...new Set(medias.map(m => m.professor_nome))].length,  color: '#6B5B95', bg: 'rgba(107,91,149,0.08)' },
          ].map(k => (
            <div key={k.label} className="card kpi-card">
              <div className="kpi-icon" style={{ background: k.bg }}>
                <span style={{ fontSize: 16, color: k.color }}>★</span>
              </div>
              <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
              <div className="kpi-label">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Buscar turma, professor ou ritmo..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="form-input"
            style={{ flex: 1, minWidth: 200 }}
          />
          <select
            value={ordenar}
            onChange={e => setOrdenar(e.target.value as typeof ordenar)}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="media">Maior nota</option>
            <option value="total">Mais avaliadas</option>
            <option value="nome">Nome</option>
          </select>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: '#6B6B6B', fontSize: 13 }}>
            Carregando...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtradas.map(m => (
              <div
                key={m.id_turma}
                className="card"
                onClick={() => router.push(`/dashboard/avaliacoes/${m.id_turma}`)}
                style={{ cursor: 'pointer', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#8B1A2F'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#E8E0D8'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <span className="badge badge-gray" style={{ marginBottom: 8, display: 'inline-block' }}>{m.ritmo}</span>
                    <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: 15, marginBottom: 2 }}>{m.turma_nome}</p>
                    <p style={{ color: '#6B6B6B', fontSize: 13 }}>{m.professor_nome}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="kpi-value" style={{ color: '#C9A96E', fontSize: 28 }}>{m.media_nota?.toFixed(1) ?? '—'}</div>
                    <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end', marginTop: 2 }}>
                      {[1,2,3,4,5].map(n => (
                        <span key={n} style={{ fontSize: 13, color: n <= Math.round(m.media_nota ?? 0) ? '#C9A96E' : '#E8E0D8' }}>★</span>
                      ))}
                    </div>
                    <p style={{ color: '#6B6B6B', fontSize: 11, marginTop: 4 }}>{m.total_avaliacoes} avaliações</p>
                  </div>
                </div>

                {m.total_avaliacoes > 0 && (
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {[
                      { label: '5★', valor: m.cinco_estrelas,    opacity: 1   },
                      { label: '4★', valor: m.quatro_estrelas,   opacity: 0.6 },
                      { label: '≤3★',valor: m.ate_tres_estrelas, opacity: 0.3 },
                    ].map(b => {
                      const pct = m.total_avaliacoes > 0 ? Math.round((b.valor / m.total_avaliacoes) * 100) : 0
                      return (
                        <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                          <span style={{ color: '#6B6B6B', width: 24, textAlign: 'right' }}>{b.label}</span>
                          <div className="chart-bar-track" style={{ flex: 1, height: 6 }}>
                            <div className="chart-bar-fill" style={{ height: 6, width: `${pct}%`, opacity: b.opacity }} />
                          </div>
                          <span style={{ color: '#6B6B6B', width: 28 }}>{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
            {filtradas.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: 40, color: '#6B6B6B', fontSize: 13 }}>
                Nenhuma turma encontrada.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
