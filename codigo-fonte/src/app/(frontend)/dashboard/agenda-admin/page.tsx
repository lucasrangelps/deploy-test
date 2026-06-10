'use client'

import { useEffect, useState } from 'react'
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'

type Aula = {
  id_aula_agenda?: string
  id_aula?: string
  data: string
  hora_inicio: string
  hora_fim: string
  cancelada?: boolean
  observacao?: string
  turmas: {
    id_turma: string
    nome: string
    ritmos: { nome: string } | null
    professores: { usuarios: { nome_completo: string } } | null
  }
}

type Turma = {
  id_turma: string
  nome: string
  ritmos: { nome: string } | null
}

export default function AgendaAdminPage() {
  const [aulas, setAulas] = useState<Aula[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [mesAtual, setMesAtual] = useState(() => new Date())
  const [modalAula, setModalAula] = useState<Aula | null>(null)
  const [modalNova, setModalNova] = useState(false)

  // Form nova aula
  const [novaIdTurma, setNovaIdTurma] = useState('')
  const [novaData, setNovaData] = useState('')
  const [novaInicio, setNovaInicio] = useState('')
  const [novaFim, setNovaFim] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  function carregarAulas() {
    const inicio = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1)
    const fim = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0)

    fetch(`/api/aulas-agenda?data_inicio=${formatDate(inicio)}&data_fim=${formatDate(fim)}`)
      .then(r => r.json())
      .then(data => setAulas(Array.isArray(data) ? data : []))
      .catch(err => console.error('[AGENDA-ADMIN]', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setLoading(true)
    carregarAulas()
    fetch('/api/turmas').then(r => r.json()).then(data => setTurmas(Array.isArray(data) ? data : []))
  }, [mesAtual])

  function formatDate(d: Date) { return d.toISOString().split('T')[0] }

  function mesAnterior() { setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1)) }
  function proximoMes() { setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1)) }

  // Gera grid do calendario
  const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1)
  const ultimoDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0)
  const diasNoMes = ultimoDia.getDate()
  const diaInicio = primeiroDia.getDay() === 0 ? 6 : primeiroDia.getDay() - 1

  const cells: (number | null)[] = []
  for (let i = 0; i < diaInicio; i++) cells.push(null)
  for (let d = 1; d <= diasNoMes; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  function getAulasDia(dia: number) {
    const dStr = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    return aulas.filter(a => a.data === dStr && !a.cancelada)
  }

  async function criarAula() {
    setErro('')
    if (!novaIdTurma || !novaData || !novaInicio || !novaFim) {
      setErro('Preencha todos os campos.')
      return
    }
    setSalvando(true)
    try {
      const res = await fetch('/api/aulas-agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_turma: novaIdTurma, data: novaData, hora_inicio: novaInicio, hora_fim: novaFim }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.erro || 'Erro ao criar.'); return }
      setModalNova(false)
      setNovaIdTurma(''); setNovaData(''); setNovaInicio(''); setNovaFim('')
      carregarAulas()
    } catch { setErro('Erro de conexao.') }
    finally { setSalvando(false) }
  }

  async function cancelarAula(aula: Aula) {
    const id = aula.id_aula_agenda || aula.id_aula
    if (!id) return
    await fetch(`/api/aulas-agenda/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancelada: true }),
    })
    setModalAula(null)
    carregarAulas()
  }

  return (
    <div>
      <div className="page-header">
        <p className="page-label">Agenda</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="page-title">Agenda Geral do Studio</h1>
          <button className="btn-primary" onClick={() => setModalNova(true)}>
            <Plus size={16} /> Nova Aula Avulsa
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Navegacao do mes */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
          <button onClick={mesAnterior} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B' }}>
            <ChevronLeft size={20} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', fontFamily: 'Georgia, serif', textTransform: 'capitalize', minWidth: 200, textAlign: 'center' }}>
            {mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={proximoMes} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B' }}>
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendario */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? <p style={{ color: '#6B6B6B', padding: 20 }}>Carregando...</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map(d => (
                <div key={d} style={{ padding: '10px 8px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#6B6B6B', borderBottom: '1.5px solid #E8E0D8', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {d}
                </div>
              ))}
              {cells.map((dia, i) => {
                const aulasD = dia ? getAulasDia(dia) : []
                const isHoje = dia && new Date().getDate() === dia && new Date().getMonth() === mesAtual.getMonth() && new Date().getFullYear() === mesAtual.getFullYear()

                return (
                  <div key={i} style={{
                    minHeight: 90, padding: 4, borderBottom: '1px solid #F0EDE8',
                    borderRight: (i + 1) % 7 !== 0 ? '1px solid #F0EDE8' : 'none',
                    background: dia ? '#FFFFFF' : '#FAF7F4',
                  }}>
                    {dia && (
                      <>
                        <div style={{
                          fontSize: 12, fontWeight: isHoje ? 800 : 500,
                          color: isHoje ? '#FFFFFF' : '#1A1A1A',
                          background: isHoje ? '#8B1A2F' : 'transparent',
                          width: 24, height: 24, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginBottom: 4,
                        }}>
                          {dia}
                        </div>
                        {aulasD.slice(0, 3).map((aula, j) => (
                          <div
                            key={j}
                            onClick={() => setModalAula(aula)}
                            style={{
                              background: '#FFF0F2', borderLeft: '2px solid #8B1A2F',
                              borderRadius: 4, padding: '3px 6px', marginBottom: 2,
                              cursor: 'pointer', transition: 'background 0.15s',
                            }}
                          >
                            <p style={{ fontSize: 10, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>{aula.turmas?.nome}</p>
                            <p style={{ fontSize: 9, color: '#6B6B6B' }}>{aula.hora_inicio?.slice(0, 5)}</p>
                          </div>
                        ))}
                        {aulasD.length > 3 && <p style={{ fontSize: 9, color: '#8B1A2F', fontWeight: 600 }}>+{aulasD.length - 3} mais</p>}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal detalhe aula */}
      {modalAula && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setModalAula(null)}>
          <div className="card" style={{ width: 400, position: 'relative' }}>
            <button onClick={() => setModalAula(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B' }}><X size={18} /></button>
            <p className="card-label">Detalhe da Aula</p>
            <h2 className="card-title" style={{ marginBottom: 16 }}>{modalAula.turmas?.nome}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <div><strong>Ritmo:</strong> {modalAula.turmas?.ritmos?.nome || '-'}</div>
              <div><strong>Professor:</strong> {modalAula.turmas?.professores?.usuarios?.nome_completo || '-'}</div>
              <div><strong>Data:</strong> {modalAula.data}</div>
              <div><strong>Horario:</strong> {modalAula.hora_inicio?.slice(0, 5)} - {modalAula.hora_fim?.slice(0, 5)}</div>
            </div>
            <div className="form-actions" style={{ marginTop: 20 }}>
              <button className="btn-secondary" onClick={() => setModalAula(null)}>Fechar</button>
              <button className="btn-primary" style={{ background: '#DC3545' }} onClick={() => cancelarAula(modalAula)}>Cancelar Aula</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nova aula */}
      {modalNova && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setModalNova(false)}>
          <div className="card" style={{ width: 420, position: 'relative' }}>
            <button onClick={() => setModalNova(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B' }}><X size={18} /></button>
            <p className="card-label">Nova</p>
            <h2 className="card-title" style={{ marginBottom: 16 }}>Agendar Aula Avulsa</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Turma *</label>
                <select className="form-select" value={novaIdTurma} onChange={e => setNovaIdTurma(e.target.value)}>
                  <option value="">Selecione...</option>
                  {turmas.map(t => <option key={t.id_turma} value={t.id_turma}>{t.nome} ({t.ritmos?.nome})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Data *</label>
                <input type="date" className="form-input" value={novaData} onChange={e => setNovaData(e.target.value)} />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Inicio *</label>
                  <input type="time" className="form-input" value={novaInicio} onChange={e => setNovaInicio(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fim *</label>
                  <input type="time" className="form-input" value={novaFim} onChange={e => setNovaFim(e.target.value)} />
                </div>
              </div>
              {erro && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px' }}><p className="form-error">{erro}</p></div>}
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setModalNova(false)}>Cancelar</button>
                <button className="btn-primary" onClick={criarAula} disabled={salvando}>{salvando ? 'Salvando...' : 'Agendar Aula'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}