'use client'

import { useEffect, useState } from 'react'

type Aula = {
  id_aula_agenda?: string
  id_aula?: string
  data: string
  hora_inicio: string
  hora_fim: string
  cancelada?: boolean
  turmas: {
    nome: string
    nivel: string | null
    ritmos: { nome: string } | null
    professores: { usuarios: { nome_completo: string } } | null
  }
}

const HORAS = Array.from({ length: 15 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`)
const DIAS_LABEL = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']

function getInicioSemana(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDate(d: Date) {
  return d.toISOString().split('T')[0]
}

const CORES_RITMO: Record<string, string> = {
  'Funk': '#E8D5F5',
  'Salsa': '#FCE4EC',
  'Samba de Gafieira': '#FFF3E0',
  'Forro': '#E8F5E9',
  'Zouk': '#E3F2FD',
  'Sertanejo': '#FFF8E1',
  'Tango': '#FFEBEE',
  'Valsa': '#F3E5F5',
}

export default function AgendaPage() {
  const [aulas, setAulas] = useState<Aula[]>([])
  const [loading, setLoading] = useState(true)
  const [semanaInicio, setSemanaInicio] = useState(() => getInicioSemana(new Date()))

  useEffect(() => {
    const fim = new Date(semanaInicio)
    fim.setDate(fim.getDate() + 6)

    fetch(`/api/aulas-agenda?data_inicio=${formatDate(semanaInicio)}&data_fim=${formatDate(fim)}`)
      .then(r => r.json())
      .then(data => setAulas(Array.isArray(data) ? data : []))
      .catch(err => console.error('[AGENDA]', err))
      .finally(() => setLoading(false))
  }, [semanaInicio])

  function semanaAnterior() {
    const d = new Date(semanaInicio)
    d.setDate(d.getDate() - 7)
    setSemanaInicio(d)
    setLoading(true)
  }

  function proximaSemana() {
    const d = new Date(semanaInicio)
    d.setDate(d.getDate() + 7)
    setSemanaInicio(d)
    setLoading(true)
  }

  // Gera datas da semana
  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(semanaInicio)
    d.setDate(d.getDate() + i)
    return d
  })

  // Mapeia aulas por dia e hora
  function getAulasDia(dia: Date) {
    const diaStr = formatDate(dia)
    return aulas.filter(a => a.data === diaStr && !a.cancelada)
  }

  return (
    <div>
      <div className="page-header">
        <p className="page-label">Agenda</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="page-title">Agenda da Semana</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={semanaAnterior}>
              &larr; Anterior
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', minWidth: 200, textAlign: 'center' }}>
              {semanaInicio.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              {' - '}
              {diasSemana[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={proximaSemana}>
              Proxima &rarr;
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <p style={{ color: '#6B6B6B', padding: 20 }}>Carregando...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ width: 60, padding: '10px 8px', borderBottom: '1.5px solid #E8E0D8', color: '#6B6B6B', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>Hora</th>
                    {diasSemana.map((dia, i) => (
                      <th key={i} style={{ padding: '10px 8px', borderBottom: '1.5px solid #E8E0D8', borderLeft: '1px solid #F0EDE8', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#1A1A1A' }}>{DIAS_LABEL[i]}</div>
                        <div style={{ fontSize: 10, color: '#6B6B6B' }}>{dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HORAS.map(hora => (
                    <tr key={hora}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #F0EDE8', color: '#6B6B6B', fontWeight: 600, fontSize: 11, verticalAlign: 'top' }}>
                        {hora}
                      </td>
                      {diasSemana.map((dia, i) => {
                        const aulasDia = getAulasDia(dia).filter(a =>
                          a.hora_inicio?.slice(0, 2) === hora.slice(0, 2)
                        )

                        return (
                          <td key={i} style={{ padding: 4, borderBottom: '1px solid #F0EDE8', borderLeft: '1px solid #F0EDE8', verticalAlign: 'top', minHeight: 40 }}>
                            {aulasDia.map((aula, j) => {
                              const ritmoNome = aula.turmas?.ritmos?.nome || ''
                              const bg = CORES_RITMO[ritmoNome] || '#F5F0EB'
                              return (
                                <div key={j} style={{
                                  background: bg, borderRadius: 6, padding: '6px 8px',
                                  marginBottom: 2, borderLeft: '3px solid #8B1A2F',
                                }}>
                                  <p style={{ fontWeight: 700, fontSize: 11, color: '#1A1A1A' }}>{aula.turmas?.nome}</p>
                                  <p style={{ fontSize: 10, color: '#6B6B6B' }}>
                                    {aula.turmas?.professores?.usuarios?.nome_completo || ''}
                                  </p>
                                  <p style={{ fontSize: 9, color: '#8B1A2F' }}>
                                    {aula.hora_inicio?.slice(0, 5)}-{aula.hora_fim?.slice(0, 5)}
                                  </p>
                                </div>
                              )
                            })}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}