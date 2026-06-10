'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Users, Clock, Music2, GraduationCap, CheckCircle, XCircle } from 'lucide-react'

type Matricula = {
  id_matricula: string
  status: string
  alunos: {
    id_aluno: string
    usuarios: { nome_completo: string; email: string }
  }
}

type TurmaDetalhe = {
  id_turma: string
  nome: string
  capacidade_maxima: number
  dia_semana: string | null
  hora_inicio: string | null
  hora_fim: string | null
  nivel: string | null
  status: string
  descricao: string | null
  ritmos: { id_ritmo: string; nome: string } | null
  professores: {
    id_professor: string
    usuarios: { nome_completo: string; email: string }
  } | null
  matriculas: Matricula[]
  vagas_ocupadas: number
  vagas_disponiveis: number
}

type Presenca = {
  id_aluno: string
  status_presenca: string
}

export default function TurmaDetalhePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [turma, setTurma] = useState<TurmaDetalhe | null>(null)
  const [loading, setLoading] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState<'alunos' | 'presenca'>('alunos')

  // Presenca
  const [dataPresenca, setDataPresenca] = useState(() => new Date().toISOString().split('T')[0])
  const [presencas, setPresencas] = useState<Record<string, string>>({})
  const [salvandoPresenca, setSalvandoPresenca] = useState(false)
  const [presencaSalva, setPresencaSalva] = useState(false)

  useEffect(() => {
    fetch(`/api/turmas/${id}`)
      .then(r => r.json())
      .then(data => {
        setTurma(data)
        // Inicializa presencas com todos os alunos como 'pendente'
        const initial: Record<string, string> = {}
        data.matriculas?.forEach((m: Matricula) => {
          if (m.alunos?.id_aluno) {
            initial[m.alunos.id_aluno] = 'pendente'
          }
        })
        setPresencas(initial)
      })
      .catch(err => console.error('[TURMA DETALHE]', err))
      .finally(() => setLoading(false))
  }, [id])

  function togglePresenca(idAluno: string) {
    setPresencas(prev => ({
      ...prev,
      [idAluno]: prev[idAluno] === 'presente' ? 'ausente' : 'presente',
    }))
    setPresencaSalva(false)
  }

  async function salvarPresenca() {
    setSalvandoPresenca(true)
    try {
      const lista = Object.entries(presencas).map(([id_aluno, status_presenca]) => ({
        id_aluno,
        status_presenca,
      }))

      await fetch('/api/presenca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_aula: `${id}-${dataPresenca}`,
          presencas: lista,
        }),
      })

      setPresencaSalva(true)
      setTimeout(() => setPresencaSalva(false), 3000)
    } catch (err) {
      console.error('[PRESENCA]', err)
    } finally {
      setSalvandoPresenca(false)
    }
  }

  if (loading) {
    return (
      <div className="page-content">
        <p style={{ color: '#6B6B6B' }}>Carregando...</p>
      </div>
    )
  }

  if (!turma) {
    return (
      <div className="page-content">
        <p style={{ color: '#8B1A2F' }}>Turma nao encontrada.</p>
      </div>
    )
  }

  const matriculasAtivas = turma.matriculas?.filter(m =>
    m.status === 'ativo' || m.status === 'ativa' || m.status === 'ATIVO'
  ) || []

  return (
    <div>
      <div className="page-header">
        <button
          onClick={() => router.push('/dashboard/turmas')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#6B6B6B', fontSize: 13, marginBottom: 8 }}
        >
          <ArrowLeft size={16} /> Voltar para Turmas
        </button>
        <h1 className="page-title">{turma.nome}</h1>
      </div>

      <div className="page-content">

        {/* Card resumo */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(139,26,47,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Music2 size={18} color="#8B1A2F" />
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: 0.8 }}>Ritmo</p>
                <p style={{ fontSize: 14, fontWeight: 700 }}>{turma.ritmos?.nome || '-'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(45,106,79,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={18} color="#2D6A4F" />
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: 0.8 }}>Professor</p>
                <p style={{ fontSize: 14, fontWeight: 700 }}>{turma.professores?.usuarios?.nome_completo || 'Nao atribuido'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(201,169,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} color="#C9A96E" />
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: 0.8 }}>Horario</p>
                <p style={{ fontSize: 14, fontWeight: 700 }}>
                  {turma.dia_semana && turma.hora_inicio
                    ? `${turma.dia_semana} ${turma.hora_inicio?.slice(0, 5)}-${turma.hora_fim?.slice(0, 5)}`
                    : 'Nao definido'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(107,91,149,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={18} color="#6B5B95" />
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: 0.8 }}>Vagas</p>
                <p style={{ fontSize: 14, fontWeight: 700 }}>
                  {matriculasAtivas.length}/{turma.capacidade_maxima}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="toggle-group" style={{ marginBottom: 20, width: 'fit-content' }}>
          <button
            className={`toggle-btn ${abaAtiva === 'alunos' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('alunos')}
          >
            Alunos Matriculados
          </button>
          <button
            className={`toggle-btn ${abaAtiva === 'presenca' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('presenca')}
          >
            Lista de Presenca
          </button>
        </div>

        {/* Aba: Alunos */}
        {abaAtiva === 'alunos' && (
          <div className="card">
            <div className="card-header">
              <div>
                <p className="card-label">Matriculados</p>
                <h2 className="card-title">{matriculasAtivas.length} aluno{matriculasAtivas.length !== 1 ? 's' : ''}</h2>
              </div>
            </div>

            {matriculasAtivas.length === 0 ? (
              <p style={{ color: '#6B6B6B', fontSize: 13 }}>Nenhum aluno matriculado nesta turma.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {turma.matriculas?.map(m => (
                    <tr key={m.id_matricula}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', background: '#8B1A2F',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#F5F0EB', fontWeight: 700, fontSize: 13, flexShrink: 0,
                          }}>
                            {m.alunos?.usuarios?.nome_completo?.charAt(0).toUpperCase() || '?'}
                          </div>
                          {m.alunos?.usuarios?.nome_completo || '-'}
                        </div>
                      </td>
                      <td style={{ color: '#6B6B6B' }}>{m.alunos?.usuarios?.email || '-'}</td>
                      <td>
                        <span className={`badge ${m.status === 'ativo' || m.status === 'ativa' ? 'badge-green' : 'badge-gray'}`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Aba: Presenca */}
        {abaAtiva === 'presenca' && (
          <div className="card">
            <div className="card-header">
              <div>
                <p className="card-label">Chamada</p>
                <h2 className="card-title">Lista de Presenca</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="date"
                  className="form-input"
                  style={{ width: 160 }}
                  value={dataPresenca}
                  onChange={e => setDataPresenca(e.target.value)}
                />
              </div>
            </div>

            {matriculasAtivas.length === 0 ? (
              <p style={{ color: '#6B6B6B', fontSize: 13 }}>Nenhum aluno matriculado para registrar presenca.</p>
            ) : (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Aluno</th>
                      <th style={{ textAlign: 'center' }}>Presente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matriculasAtivas.map(m => {
                      const idAluno = m.alunos?.id_aluno
                      const statusP = idAluno ? presencas[idAluno] : 'pendente'

                      return (
                        <tr key={m.id_matricula}>
                          <td style={{ fontWeight: 600 }}>
                            {m.alunos?.usuarios?.nome_completo || '-'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => idAluno && togglePresenca(idAluno)}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                              }}
                            >
                              {statusP === 'presente' ? (
                                <CheckCircle size={22} color="#2D6A4F" fill="#DCFAE6" />
                              ) : statusP === 'ausente' ? (
                                <XCircle size={22} color="#8B1A2F" fill="#FEF2F2" />
                              ) : (
                                <div style={{
                                  width: 22, height: 22, borderRadius: '50%',
                                  border: '2px solid #E8E0D8',
                                }} />
                              )}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
                  <button
                    className="btn-primary"
                    onClick={salvarPresenca}
                    disabled={salvandoPresenca}
                  >
                    {salvandoPresenca ? 'Salvando...' : 'Salvar Presenca'}
                  </button>
                  {presencaSalva && (
                    <span style={{ fontSize: 13, color: '#2D6A4F', fontWeight: 600 }}>
                      Presenca salva com sucesso!
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}