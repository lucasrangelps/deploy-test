'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Mail, Phone, Calendar, Users, Music2 } from 'lucide-react'

type ProfessorDetalhe = {
  id_professor: string
  especialidade?: string
  especialidades?: string
  telefone: string | null
  bio: string | null
  ativo: boolean
  usuarios: { id_usuario: string; nome_completo: string; email: string; criado_em?: string }
  turmas: Array<{
    id_turma: string
    nome: string
    nivel: string | null
    dias_semana: string | null
    hora_inicio: string | null
    hora_fim: string | null
    ativo: boolean
    ritmos: { nome: string } | null
    total_alunos?: number
  }>
  total_turmas_ativas: number
  total_alunos?: number
}

export default function FichaProfessorPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [prof, setProf] = useState<ProfessorDetalhe | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/professores/${id}`)
      .then(r => r.json())
      .then(data => setProf(data))
      .catch(err => console.error('[PROF DETALHE]', err))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="page-content"><p style={{ color: '#6B6B6B' }}>Carregando...</p></div>
  if (!prof) return <div className="page-content"><p style={{ color: '#8B1A2F' }}>Professor nao encontrado.</p></div>

  const especialidades = (prof.especialidade || prof.especialidades || '').split(',').map(s => s.trim()).filter(Boolean)

  return (
    <div>
      <div className="page-header">
        <button
          onClick={() => router.push('/dashboard/professores')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#6B6B6B', fontSize: 13, marginBottom: 8 }}
        >
          <ArrowLeft size={16} /> Voltar para Professores
        </button>
        <h1 className="page-title">Ficha do Professor</h1>
      </div>

      <div className="page-content">

        {/* Card perfil */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: '#8B1A2F',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#F5F0EB', fontWeight: 700, fontSize: 28, flexShrink: 0,
            }}>
              {prof.usuarios?.nome_completo?.charAt(0).toUpperCase() || 'P'}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Georgia, serif', color: '#1A1A1A' }}>
                    {prof.usuarios?.nome_completo}
                  </h2>
                  <span className={`badge ${prof.ativo ? 'badge-green' : 'badge-gray'}`}>
                    {prof.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              {/* Especialidades */}
              {especialidades.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {especialidades.map((esp, i) => (
                    <span key={i} className="badge badge-wine">{esp}</span>
                  ))}
                </div>
              )}

              {/* Bio */}
              {prof.bio && (
                <p style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.6, marginBottom: 12 }}>{prof.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Grid dados + stats */}
        <div className="dashboard-grid" style={{ marginBottom: 20 }}>
          {/* Dados pessoais */}
          <div className="card">
            <p className="card-label">Informacoes</p>
            <h2 className="card-title" style={{ marginBottom: 16 }}>Dados Pessoais</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={16} color="#6B6B6B" />
                <div>
                  <p style={{ fontSize: 11, color: '#6B6B6B' }}>E-mail</p>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{prof.usuarios?.email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Phone size={16} color="#6B6B6B" />
                <div>
                  <p style={{ fontSize: 11, color: '#6B6B6B' }}>Telefone</p>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{prof.telefone || 'Nao informado'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Calendar size={16} color="#6B6B6B" />
                <div>
                  <p style={{ fontSize: 11, color: '#6B6B6B' }}>Cadastrado em</p>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>
                    {prof.usuarios?.criado_em
                      ? new Date(prof.usuarios.criado_em).toLocaleDateString('pt-BR')
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo numerico */}
          <div className="card">
            <p className="card-label">Resumo</p>
            <h2 className="card-title" style={{ marginBottom: 16 }}>Numeros</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(139,26,47,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Music2 size={18} color="#8B1A2F" />
                </div>
                <div>
                  <p style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Georgia, serif' }}>{prof.total_turmas_ativas}</p>
                  <p style={{ fontSize: 12, color: '#6B6B6B' }}>Turmas ativas</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(45,106,79,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} color="#2D6A4F" />
                </div>
                <div>
                  <p style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Georgia, serif' }}>{prof.total_alunos || 0}</p>
                  <p style={{ fontSize: 12, color: '#6B6B6B' }}>Alunos no total</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Turmas atribuidas */}
        <div className="card">
          <div className="card-header">
            <div>
              <p className="card-label">Atribuicoes</p>
              <h2 className="card-title">Turmas do Professor</h2>
            </div>
          </div>

          {prof.turmas && prof.turmas.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Turma</th>
                  <th>Ritmo</th>
                  <th>Nivel</th>
                  <th>Horario</th>
                  <th>Alunos</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {prof.turmas.map(turma => (
                  <tr key={turma.id_turma} style={{ cursor: 'pointer' }} onClick={() => router.push(`/dashboard/turmas/${turma.id_turma}`)}>
                    <td style={{ fontWeight: 600 }}>{turma.nome}</td>
                    <td><span className="badge badge-wine">{turma.ritmos?.nome || '-'}</span></td>
                    <td style={{ color: '#6B6B6B' }}>{turma.nivel || '-'}</td>
                    <td style={{ color: '#6B6B6B', fontSize: 12 }}>
                      {turma.dias_semana && turma.hora_inicio
                        ? `${turma.dias_semana} ${turma.hora_inicio?.slice(0, 5)}-${turma.hora_fim?.slice(0, 5)}`
                        : '-'}
                    </td>
                    <td><span className="badge badge-blue">{turma.total_alunos || 0}</span></td>
                    <td>
                      <span className={`badge ${turma.ativo ? 'badge-green' : 'badge-gray'}`}>
                        {turma.ativo ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#6B6B6B', fontSize: 13 }}>Nenhuma turma atribuida.</p>
          )}
        </div>

      </div>
    </div>
  )
}