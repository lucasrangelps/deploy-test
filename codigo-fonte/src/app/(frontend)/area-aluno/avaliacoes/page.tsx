'use client'

// src/app/(frontend)/area-aluno/avaliacoes/page.tsx

import { useState, useEffect } from 'react'
import { useIdAluno } from '@/hooks/useIdAluno'

interface Turma {
  id_turma: string
  nome: string
  dia_semana: string
  ritmos: { nome: string } | null
}

interface EstadoTurma {
  nota: number
  comentario: string
  salvando: boolean
  salvo: boolean
  erro: string
}

const RITMO_EMOJI: Record<string, string> = {
  'Valsa': '🎻', 'Tango': '🌹', 'Forró': '🪗', 'Samba': '🥁',
  'Salsa': '💃', 'Bachata': '🎸', 'Zouk': '🎶', 'Sertanejo': '🤠',
  'Dança de Salão': '👑',
}

export default function AvaliarAulasPage() {
  const { idAluno, loading: loadingAluno } = useIdAluno()
  const [turmas, setTurmas]   = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [estados, setEstados] = useState<Record<string, EstadoTurma>>({})

  useEffect(() => {
    console.log('[avaliacoes] loadingAluno:', loadingAluno, '| idAluno:', idAluno)
    if (loadingAluno) return
    if (!idAluno) { setLoading(false); return }

    Promise.all([
      fetch(`/api/avaliacoes?id_aluno=${idAluno}`).then(r => r.json()),
      fetch(`/api/turmas/aluno?id_aluno=${idAluno}`).then(r => r.json()),
    ]).then(([avRes, turmasRes]) => {
      console.log('[avaliacoes] avRes:', JSON.stringify(avRes))
  console.log('[avaliacoes] turmasRes:', JSON.stringify(turmasRes))
      const avaliacoes = avRes.data ?? []
      const t: Turma[] = turmasRes.data ?? []
      const init: Record<string, EstadoTurma> = {}
      t.forEach(turma => {
        const av = avaliacoes.find((a: { id_turma: string }) => a.id_turma === turma.id_turma)
        init[turma.id_turma] = {
          nota: av?.nota ? Number(av.nota) : 0,
          comentario: av?.comentario ?? '',
          salvando: false,
          salvo: !!av,
          erro: '',
        }
      })
      setTurmas(t); setEstados(init); setLoading(false)
    }).catch(() => setLoading(false))
  }, [idAluno, loadingAluno])

  function set(id: string, campo: keyof EstadoTurma, valor: string | number | boolean) {
    setEstados(prev => ({ ...prev, [id]: { ...prev[id], [campo]: valor } }))
  }

  async function handleSubmit(id_turma: string) {
    if (!idAluno) return
    const e = estados[id_turma]
    if (!e.nota) { set(id_turma, 'erro', 'Selecione uma nota.'); return }
    set(id_turma, 'salvando', true); set(id_turma, 'erro', '')
    try {
      const res = await fetch('/api/avaliacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_aluno: idAluno,
          id_turma,
          nota: e.nota,
          comentario: e.comentario || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { set(id_turma, 'erro', data.erro || 'Erro ao salvar.'); return }
      set(id_turma, 'salvo', true)
      set(id_turma, 'erro', '')
    } catch {
      set(id_turma, 'erro', 'Erro de conexão.')
    } finally {
      set(id_turma, 'salvando', false)
    }
  }

  return (
    <>
      <div style={{ padding: '28px 32px 0', marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 4 }}>Área do Aluno</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2 }}>Avaliar Aulas</h1>
        <p style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4 }}>Compartilhe sua experiência! Suas avaliações ajudam outros alunos. 💬</p>
      </div>

      <div style={{ padding: '0 32px 32px' }}>
        {loading || loadingAluno ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D8', padding: 40, textAlign: 'center', color: '#6B6B6B', fontSize: 13 }}>
            Carregando turmas...
          </div>
        ) : turmas.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D8', padding: 40, textAlign: 'center', color: '#6B6B6B', fontSize: 13 }}>
            Você não está matriculado em nenhuma turma.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {turmas.map(turma => {
              const e = estados[turma.id_turma]
              if (!e) return null
              const emoji = RITMO_EMOJI[turma.ritmos?.nome ?? ''] ?? '💃'
              return (
                <div key={turma.id_turma} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D8', padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#8B1A2F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                        {emoji}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: '#1A1A1A', fontSize: 15 }}>{turma.nome}</p>
                        <p style={{ color: '#6B6B6B', fontSize: 13, marginTop: 2 }}>{turma.ritmos?.nome} · {turma.dia_semana}</p>
                      </div>
                    </div>
                    {e.salvo && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#1A7340', background: '#DCFAE6', padding: '3px 10px', borderRadius: 20 }}>
                        AVALIADA ✓
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 10 }}>Sua Nota</p>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => set(turma.id_turma, 'nota', n)}
                        style={{ fontSize: 32, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: n <= e.nota ? '#C9A96E' : '#E8E0D8', transition: 'transform 0.15s' }}
                        onMouseEnter={el => el.currentTarget.style.transform = 'scale(1.15)'}
                        onMouseLeave={el => el.currentTarget.style.transform = 'scale(1)'}
                      >★</button>
                    ))}
                  </div>

                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 8 }}>Comentário</p>
                  <textarea
                    value={e.comentario}
                    onChange={el => set(turma.id_turma, 'comentario', el.target.value)}
                    placeholder="Compartilhe sua experiência com esta aula..."
                    rows={3}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E8E0D8', borderRadius: 8, fontSize: 13, color: '#1A1A1A', background: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                    onFocus={el => el.currentTarget.style.borderColor = '#8B1A2F'}
                    onBlur={el => el.currentTarget.style.borderColor = '#E8E0D8'}
                  />

                  {e.erro && <p style={{ fontSize: 11, color: '#8B1A2F', marginTop: 6 }}>{e.erro}</p>}

                  <button onClick={() => handleSubmit(turma.id_turma)} disabled={e.salvando}
                    style={{ marginTop: 16, background: '#8B1A2F', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: e.salvando ? 0.6 : 1, transition: 'background 0.15s' }}
                    onMouseEnter={el => el.currentTarget.style.background = '#B5283D'}
                    onMouseLeave={el => el.currentTarget.style.background = '#8B1A2F'}
                  >
                    {e.salvando ? 'Salvando...' : e.salvo ? '✏️ Atualizar Avaliação' : '⭐ Enviar Avaliação'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
