'use client'

// src/app/dashboard/avaliacoes/[id]/page.tsx

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Avaliacao {
  id_avaliacao: string
  nota: number
  comentario: string | null
  criado_em: string
  alunos: { usuarios: { nome_completo: string } } | null
}

export default function DetalheAvaliacoesPage() {
  const { id }   = useParams<{ id: string }>()
  const router   = useRouter()
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [loading, setLoading]       = useState(true)
  const [filtroNota, setFiltroNota] = useState<number | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/avaliacoes?id_turma=${id}`)
      .then(r => r.json())
      .then(({ data }) => { setAvaliacoes(data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const filtradas     = filtroNota ? avaliacoes.filter(a => a.nota === filtroNota) : avaliacoes
  const media         = avaliacoes.length ? (avaliacoes.reduce((s, a) => s + a.nota, 0) / avaliacoes.length).toFixed(1) : '—'
  const comComentario = avaliacoes.filter(a => a.comentario).length

  return (
    <div>
      <div className="page-header">
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6B6B6B', marginBottom: 10, padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = '#8B1A2F'}
          onMouseLeave={e => e.currentTarget.style.color = '#6B6B6B'}
        >
          ← Voltar
        </button>
        <p className="page-label">Detalhe</p>
        <h1 className="page-title">Avaliações da Turma</h1>
      </div>

      <div className="page-content">

        {/* KPIs */}
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { label: 'Média',          value: media,             color: '#C9A96E', bg: 'rgba(201,169,110,0.1)' },
            { label: 'Avaliações',     value: avaliacoes.length, color: '#8B1A2F', bg: 'rgba(139,26,47,0.08)'  },
            { label: 'Com comentário', value: comComentario,     color: '#2D6A4F', bg: 'rgba(45,106,79,0.08)'  },
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

        {/* Filtro por estrela */}
        <div className="toggle-group" style={{ marginBottom: 20, width: 'fit-content' }}>
          {[null, 5, 4, 3, 2, 1].map(n => (
            <button
              key={n ?? 'todas'}
              onClick={() => setFiltroNota(n)}
              className={`toggle-btn ${filtroNota === n ? 'active' : ''}`}
            >
              {n === null ? 'Todas' : '★'.repeat(n)}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: '#6B6B6B', fontSize: 13 }}>
            Carregando...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtradas.map(a => (
              <div key={a.id_avaliacao} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: 14 }}>
                      {a.alunos?.usuarios?.nome_completo ?? 'Aluno'}
                    </p>
                    <p className="kpi-label" style={{ marginTop: 2 }}>
                      {new Date(a.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1,2,3,4,5].map(n => (
                      <span key={n} style={{ fontSize: 18, color: n <= a.nota ? '#C9A96E' : '#E8E0D8' }}>★</span>
                    ))}
                  </div>
                </div>
                {a.comentario && (
                  <p style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F0EDE8', color: '#6B6B6B', fontSize: 13, lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{a.comentario}"
                  </p>
                )}
              </div>
            ))}
            {filtradas.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: 40, color: '#6B6B6B', fontSize: 13 }}>
                Nenhuma avaliação encontrada.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
