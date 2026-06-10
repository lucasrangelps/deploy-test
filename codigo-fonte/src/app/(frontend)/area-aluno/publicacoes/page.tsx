'use client'

// src/app/(frontend)/area-aluno/publicacoes/page.tsx

import { useState, useEffect } from 'react'
import { useIdAluno } from '@/hooks/useIdAluno'

interface Publicacao {
  id_publicacao: string
  titulo:        string
  conteudo:      string
  categoria:     string
  destaque:      boolean
  criado_em:     string
  professores:   { usuarios: { nome_completo: string } } | null
  turmas:        { nome: string } | null
}

const CATEGORIA_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  comunicado: { label: 'Comunicado',    emoji: '📢', color: '#8B1A2F', bg: 'rgba(139,26,47,0.1)' },
  aviso:      { label: 'Aviso',         emoji: '⚠️', color: '#92400e', bg: '#fef3c7'              },
  evento:     { label: 'Evento',        emoji: '🗓',  color: '#1A7340', bg: '#DCFAE6'             },
  dica:       { label: 'Dica de Dança', emoji: '💃',  color: '#8B1A2F', bg: 'rgba(139,26,47,0.1)' },
}

export default function PublicacoesPage() {
  const { idAluno, loading: loadingAluno } = useIdAluno()

  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([])
  const [loading,     setLoading]     = useState(true)
  const [filtro,      setFiltro]      = useState('todos')
  const [expandida,   setExpandida]   = useState<string | null>(null)

  useEffect(() => {
    if (loadingAluno || !idAluno) { setLoading(false); return }
    fetch(`/api/publicacoes?id_aluno=${idAluno}`)
      .then(r => r.json())
      .then(({ data }) => { setPublicacoes(data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [idAluno, loadingAluno])

  const categorias  = ['todos', ...Array.from(new Set(publicacoes.map(p => p.categoria)))]
  const filtradas   = filtro === 'todos' ? publicacoes : publicacoes.filter(p => p.categoria === filtro)
  const ordenadas   = [...filtradas.filter(p => p.destaque), ...filtradas.filter(p => !p.destaque)]

  return (
    <>
      <div style={{ padding: '28px 32px 0', marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 4 }}>
          Área do Aluno
        </p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1A1A1A' }}>
          Publicações
        </h1>
      </div>

      <div style={{ padding: '0 32px 32px' }}>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {categorias.map(cat => {
            const cfg   = CATEGORIA_CONFIG[cat]
            const count = cat === 'todos' ? publicacoes.length : publicacoes.filter(p => p.categoria === cat).length
            const label = cat === 'todos'
              ? `TODOS (${count})`
              : `${cfg?.emoji} ${cfg?.label.toUpperCase()} (${count})`
            const active = filtro === cat
            return (
              <button
                key={cat}
                onClick={() => setFiltro(cat)}
                style={{
                  padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: active ? '#8B1A2F' : 'transparent',
                  color:      active ? '#fff'    : '#8B1A2F',
                  border: '1.5px solid #8B1A2F',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {loading || loadingAluno ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D8', padding: 40, textAlign: 'center', color: '#6B6B6B', fontSize: 13 }}>
            Carregando publicações...
          </div>
        ) : ordenadas.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D8', padding: 40, textAlign: 'center', color: '#6B6B6B', fontSize: 13 }}>
            Nenhuma publicação encontrada.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ordenadas.map(pub => {
              const cfg    = CATEGORIA_CONFIG[pub.categoria] ?? CATEGORIA_CONFIG.comunicado
              const isOpen = expandida === pub.id_publicacao
              return (
                <div
                  key={pub.id_publicacao}
                  style={{
                    background: '#fff', borderRadius: 12,
                    border: `1px solid ${pub.destaque ? 'rgba(201,169,110,0.4)' : '#E8E0D8'}`,
                    overflow: 'hidden', display: 'grid', gridTemplateColumns: '240px 1fr',
                  }}
                >
                  {/* Esquerda */}
                  <div style={{ background: 'linear-gradient(135deg, #8B1A2F 0%, #3d0a1a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 130, fontSize: 48 }}>
                    {cfg.emoji}
                  </div>

                  {/* Direita */}
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.8px', color: cfg.color, background: cfg.bg, padding: '3px 9px', borderRadius: 20 }}>
                        {cfg.emoji} {cfg.label.toUpperCase()}
                      </span>
                      {pub.destaque && (
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#92400e', background: '#fef3c7', padding: '3px 9px', borderRadius: 20 }}>
                          ⭐ DESTAQUE
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1A1A1A', fontSize: 16, marginBottom: 6, lineHeight: 1.3 }}>
                      {pub.titulo}
                    </h3>

                    <p style={{ color: '#6B6B6B', fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
                      {isOpen ? pub.conteudo : `${pub.conteudo.slice(0, 80)}${pub.conteudo.length > 80 ? '...' : ''}`}
                    </p>

                    {isOpen && (
                      <p style={{ color: '#6B6B6B', fontSize: 11, marginBottom: 12 }}>
                        Por {pub.professores?.usuarios?.nome_completo ?? 'Professor'}
                        {pub.turmas ? ` · ${pub.turmas.nome}` : ' · Todas as turmas'}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ color: '#6B6B6B', fontSize: 12 }}>
                        📅 {new Date(pub.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => setExpandida(isOpen ? null : pub.id_publicacao)}
                        style={{ background: '#8B1A2F', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#B5283D'}
                        onMouseLeave={e => e.currentTarget.style.background = '#8B1A2F'}
                      >
                        {isOpen ? 'FECHAR' : 'LER MAIS →'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}