'use client'

// src/app/(frontend)/area-aluno/turmas/page.tsx

import { useState, useEffect } from 'react'
import { useIdAluno } from '@/hooks/useIdAluno'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

interface Turma {
  id_turma: string
  nome: string
  ritmo: string
  professor: string
  dias_semana?: string[] | string
  hora_inicio?: string
  hora_fim?: string
  capacidade_maxima?: number
  alunos_matriculados?: number
  vagas_disponiveis?: number
  valor_avulso?: string
  descricao?: string
  ativo?: boolean
}

export default function TurmasDisponiveisPage() {
  const { idAluno, idUsuario, loading: loadingAluno } = useIdAluno()
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [turmasMatriculadas, setTurmasMatriculadas] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [filtroRitmo, setFiltroRitmo] = useState<string>('')
  const [matriculando, setMatriculando] = useState<string>('')
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

  useEffect(() => {
    if (loadingAluno) return
    if (!idAluno) { setLoading(false); return }

    Promise.all([
      fetch('/api/turmas').then(r => r.json()),
      fetchWithAuth(`/api/alunos/${idAluno}/turmas-matriculadas`).then(r => r.json()),
    ]).then(([turmasRes, matriculadosRes]) => {
      const t: Turma[] = Array.isArray(turmasRes)
        ? turmasRes
        : Array.isArray(turmasRes?.data)
          ? turmasRes.data
          : []

      const matriculadosArray = Array.isArray(matriculadosRes)
        ? matriculadosRes
        : Array.isArray(matriculadosRes?.data)
          ? matriculadosRes.data
          : []
      const mapaMatriculas: Record<string, string> = {}
      matriculadosArray.forEach((m: any) => {
        if (m.id_turma) mapaMatriculas[m.id_turma] = m.status ?? 'pendente'
      })

      setTurmas(t)
      setTurmasMatriculadas(mapaMatriculas)
      setLoading(false)
    }).catch(err => {
      console.error('[turmas]', err)
      setLoading(false)
    })
  }, [idAluno, loadingAluno])

  // Ritmos disponíveis derivados das turmas carregadas (sem chamada extra à API)
  const ritmosDisponiveis = Array.from(
    new Set(turmas.map(t => t.ritmo).filter(Boolean))
  ).sort()

  const turmasFiltradas = filtroRitmo
    ? turmas.filter(t => t.ritmo === filtroRitmo)
    : turmas

  const formatarDias = (dias: string[] | string | undefined) => {
    if (Array.isArray(dias)) return dias.join(', ')
    if (typeof dias === 'string') return dias
    return 'Sem horário'
  }

  async function handleMatricula(turma: Turma) {
    if (!idAluno || !idUsuario) return

    if (turma.id_turma in turmasMatriculadas) {
      setMensagem({ tipo: 'erro', texto: 'Você já está matriculado nesta turma.' })
      return
    }

    // Verificar se aluno preencheu anamnese
    try {
      const anamneseRes = await fetchWithAuth(`/api/usuarios/${idUsuario}`)
      const userData = await anamneseRes.json()

      if (!userData.anamnese_preenchida) {
        setMensagem({ tipo: 'erro', texto: 'Complete o questionário de saúde (Anamnese) antes de se matricular.' })
        return
      }
    } catch (err) {
      console.error('Erro ao verificar anamnese', err)
    }

    setMatriculando(turma.id_turma)

    try {
      const res = await fetchWithAuth('/api/matriculas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_aluno: idAluno,
          id_turma: turma.id_turma,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        const mensagemErro = data.erro || 'Erro ao matricular.'
        if (res.status === 409) setMensagem({ tipo: 'erro', texto: 'Você já está matriculado nesta turma.' })
        else if (res.status === 400) setMensagem({ tipo: 'erro', texto: 'Sem vagas disponíveis nesta turma.' })
        else setMensagem({ tipo: 'erro', texto: mensagemErro })
        return
      }

      setMensagem({ tipo: 'sucesso', texto: `Matrícula realizada com sucesso em ${turma.nome}!` })
      setTurmasMatriculadas(prev => ({ ...prev, [turma.id_turma]: 'pendente' }))
    } catch (err) {
      console.error('[matricula]', err)
      setMensagem({ tipo: 'erro', texto: 'Erro de conexão.' })
    } finally {
      setMatriculando('')
    }
  }

  return (
    <>
      <div style={{ padding: '28px 32px 0', marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 4 }}>Área do Aluno</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2 }}>Turmas Disponíveis</h1>
        <p style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4 }}>Explore e inscreva-se nas turmas que mais combinam com você. 💃</p>
      </div>

      {mensagem && (
        <div style={{ padding: '0 32px 16px', margin: 0 }}>
          <div style={{
            background: mensagem.tipo === 'sucesso' ? '#DCFAE6' : '#FEE2E2',
            border: `1px solid ${mensagem.tipo === 'sucesso' ? '#86EFAC' : '#FECACA'}`,
            borderRadius: 8,
            padding: '12px 16px',
            fontSize: 13,
            color: mensagem.tipo === 'sucesso' ? '#166534' : '#991B1B',
          }}>
            {mensagem.texto}
          </div>
        </div>
      )}

      <div style={{ padding: '0 32px 32px' }}>
        {/* Filtro por Ritmo — derivado das turmas carregadas */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#C9A96E', display: 'block', marginBottom: 8 }}>Filtrar por Ritmo</label>
          <select
            value={filtroRitmo}
            onChange={(e) => setFiltroRitmo(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1.5px solid #E8E0D8',
              borderRadius: 8,
              fontSize: 13,
              color: '#1A1A1A',
              background: '#fff',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="">Todos os Ritmos</option>
            {ritmosDisponiveis.map(nome => (
              <option key={nome} value={nome}>{nome}</option>
            ))}
          </select>
        </div>

        {/* Lista de Turmas */}
        {loading || loadingAluno ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D8', padding: 40, textAlign: 'center', color: '#6B6B6B', fontSize: 13 }}>
            Carregando turmas...
          </div>
        ) : turmasFiltradas.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D8', padding: 40, textAlign: 'center', color: '#6B6B6B', fontSize: 13 }}>
            Nenhuma turma disponível no momento.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {turmasFiltradas.map(turma => {
              const statusMatricula = turmasMatriculadas[turma.id_turma]
              const isAtiva    = statusMatricula === 'ativa'
              const isPendente = statusMatricula === 'pendente'
              const semVagas = (turma.vagas_disponiveis ?? 0) === 0

              const cardBorder = isAtiva
                ? '1.5px solid #86EFAC'
                : isPendente
                  ? '1.5px solid #FCD34D'
                  : '1px solid #E8E0D8'

              return (
                <div
                  key={turma.id_turma}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    border: cardBorder,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    transition: 'box-shadow 0.15s',
                  }}
                  onMouseEnter={(el) => {
                    if (el.currentTarget instanceof HTMLElement) {
                      el.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 19, 38, 0.1)'
                    }
                  }}
                  onMouseLeave={(el) => {
                    if (el.currentTarget instanceof HTMLElement) {
                      el.currentTarget.style.boxShadow = 'none'
                    }
                  }}
                >
                  {/* Cabeçalho */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{turma.nome}</p>
                      {isAtiva && (
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          color: '#15803D', background: '#DCFCE7',
                          border: '1px solid #86EFAC',
                          borderRadius: 4, padding: '2px 8px',
                          letterSpacing: '0.5px', textTransform: 'uppercase',
                        }}>
                          Inscrito
                        </span>
                      )}
                      {isPendente && (
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          color: '#92400E', background: '#FFFBEB',
                          border: '1px solid #FCD34D',
                          borderRadius: 4, padding: '2px 8px',
                          letterSpacing: '0.5px', textTransform: 'uppercase',
                        }}>
                          Pend. pagamento
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>
                      {turma.ritmo} • Prof. {turma.professor}
                    </p>
                  </div>

                  {/* Horário */}
                  <div style={{ background: '#F5F0EB', borderRadius: 8, padding: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 4 }}>Horário</p>
                    <p style={{ fontSize: 13, color: '#1A1A1A', margin: 0 }}>
                      {formatarDias(turma.dias_semana)} · {turma.hora_inicio || '--'} - {turma.hora_fim || '--'}
                    </p>
                  </div>

                  {/* Vagas */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ background: '#F5F0EB', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 4, margin: 0 }}>Vagas</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: semVagas ? '#992B2B' : '#1A7340', margin: 0 }}>
                        {turma.vagas_disponiveis ?? 0}
                      </p>
                    </div>
                    <div style={{ background: '#F5F0EB', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 4, margin: 0 }}>Valor</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>R$ {turma.valor_avulso || '--'}</p>
                    </div>
                  </div>

                  {/* Descrição */}
                  {turma.descricao && (
                    <p style={{ fontSize: 12, color: '#6B6B6B', margin: 0, lineHeight: 1.5 }}>
                      {turma.descricao.substring(0, 100)}...
                    </p>
                  )}

                  {/* Botão — 3 estados: ativa / pendente / disponível */}
                  {isAtiva ? (
                    <button disabled aria-disabled="true" style={{
                      background: '#F0FDF4', color: '#15803D',
                      border: '1.5px solid #86EFAC', borderRadius: 8,
                      padding: '10px 16px', fontSize: 13, fontWeight: 600,
                      cursor: 'not-allowed', pointerEvents: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                      <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <circle cx="10" cy="10" r="9" stroke="#16A34A" strokeWidth="1.5" fill="#DCFCE7" />
                        <path d="M6 10.5l3 3 5-5.5" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Já Matriculado
                    </button>
                  ) : isPendente ? (
                    <button disabled aria-disabled="true" style={{
                      background: '#FFFBEB', color: '#92400E',
                      border: '1.5px solid #FCD34D', borderRadius: 8,
                      padding: '10px 16px', fontSize: 13, fontWeight: 600,
                      cursor: 'not-allowed', pointerEvents: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                      <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <circle cx="10" cy="10" r="9" stroke="#D97706" strokeWidth="1.5" fill="#FEF3C7" />
                        <path d="M10 6.5v3.5l2 1.5" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Aguardando Pagamento
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMatricula(turma)}
                      disabled={matriculando === turma.id_turma || semVagas}
                      style={{
                        background: semVagas ? '#C9A96E' : '#8B1A2F',
                        color: '#fff', border: 'none', borderRadius: 8,
                        padding: '10px 16px', fontSize: 13, fontWeight: 600,
                        cursor: semVagas ? 'not-allowed' : 'pointer',
                        opacity: matriculando === turma.id_turma ? 0.6 : 1,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(el) => {
                        if (!semVagas && matriculando !== turma.id_turma)
                          el.currentTarget.style.background = '#B5283D'
                      }}
                      onMouseLeave={(el) => {
                        if (!semVagas) el.currentTarget.style.background = '#8B1A2F'
                      }}
                    >
                      {matriculando === turma.id_turma ? 'Inscrevendo...' : semVagas ? 'Sem Vagas' : 'Inscrever-se'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
