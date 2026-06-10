'use client'

import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'

type Turma = {
  id_turma: string
  nome: string
  dia_semana: string | null
  hora_inicio: string | null
  hora_fim: string | null
  ritmos: { nome: string } | null
  professores: { usuarios: { nome_completo: string } } | null
}

const DIAS = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo']

export default function HorariosPage() {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<string | null>(null)
  const [editDia, setEditDia] = useState('')
  const [editInicio, setEditInicio] = useState('')
  const [editFim, setEditFim] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [filtroDia, setFiltroDia] = useState('')

  useEffect(() => {
    fetch('/api/turmas')
      .then(r => r.json())
      .then(data => setTurmas(Array.isArray(data) ? data : []))
      .catch(err => console.error('[HORARIOS]', err))
      .finally(() => setLoading(false))
  }, [])

  function iniciarEdicao(turma: Turma) {
    setEditando(turma.id_turma)
    setEditDia(turma.dia_semana || '')
    setEditInicio(turma.hora_inicio?.slice(0, 5) || '')
    setEditFim(turma.hora_fim?.slice(0, 5) || '')
  }

  async function salvarEdicao(idTurma: string) {
    setSalvando(true)
    try {
      const res = await fetch(`/api/turmas/${idTurma}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dia_semana: editDia || null, hora_inicio: editInicio || null, hora_fim: editFim || null }),
      })
      if (res.ok) {
        setTurmas(prev => prev.map(t => t.id_turma === idTurma ? { ...t, dia_semana: editDia, hora_inicio: editInicio, hora_fim: editFim } : t))
        setEditando(null)
      }
    } catch (err) { console.error('[HORARIOS SAVE]', err) }
    finally { setSalvando(false) }
  }

  const turmasFiltradas = filtroDia ? turmas.filter(t => t.dia_semana === filtroDia) : turmas

  return (
    <div>
      <div className="page-header">
        <p className="page-label">Gestao</p>
        <h1 className="page-title">Horarios das Turmas</h1>
        <p className="page-subtitle">Clique em Editar para alterar o horario inline</p>
      </div>
      <div className="page-content">
        <div style={{ marginBottom: 16 }}>
          <select className="form-select" style={{ width: 180 }} value={filtroDia} onChange={e => setFiltroDia(e.target.value)}>
            <option value="">Todos os dias</option>
            {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="card">
          {loading ? <p style={{ color: '#6B6B6B', padding: 20 }}>Carregando...</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Turma</th><th>Ritmo</th><th>Professor</th><th>Dia</th><th>Inicio</th><th>Fim</th><th>Acoes</th></tr></thead>
                <tbody>
                  {turmasFiltradas.map(turma => (
                    <tr key={turma.id_turma}>
                      <td style={{ fontWeight: 600 }}>{turma.nome}</td>
                      <td><span className="badge badge-wine">{turma.ritmos?.nome || '-'}</span></td>
                      <td style={{ color: '#6B6B6B' }}>{turma.professores?.usuarios?.nome_completo || '-'}</td>
                      {editando === turma.id_turma ? (<>
                        <td><select className="form-select" style={{ width: 120, padding: '6px 8px', fontSize: 12 }} value={editDia} onChange={e => setEditDia(e.target.value)}><option value="">-</option>{DIAS.map(d => <option key={d} value={d}>{d}</option>)}</select></td>
                        <td><input type="time" className="form-input" style={{ width: 100, padding: '6px 8px', fontSize: 12 }} value={editInicio} onChange={e => setEditInicio(e.target.value)} /></td>
                        <td><input type="time" className="form-input" style={{ width: 100, padding: '6px 8px', fontSize: 12 }} value={editFim} onChange={e => setEditFim(e.target.value)} /></td>
                        <td><div style={{ display: 'flex', gap: 4 }}><button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2D6A4F' }} onClick={() => salvarEdicao(turma.id_turma)} disabled={salvando} title="Salvar"><Check size={18} /></button><button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B1A2F' }} onClick={() => setEditando(null)} title="Cancelar"><X size={18} /></button></div></td>
                      </>) : (<>
                        <td style={{ color: '#6B6B6B' }}>{turma.dia_semana || '-'}</td>
                        <td style={{ color: '#6B6B6B' }}>{turma.hora_inicio?.slice(0, 5) || '-'}</td>
                        <td style={{ color: '#6B6B6B' }}>{turma.hora_fim?.slice(0, 5) || '-'}</td>
                        <td><button className="btn-secondary" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => iniciarEdicao(turma)}>Editar</button></td>
                      </>)}
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