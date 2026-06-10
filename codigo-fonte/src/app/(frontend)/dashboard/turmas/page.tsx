'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

type Ritmo = { id_ritmo: string; nome: string }
type Professor = {
  id_professor: string
  usuarios: { nome_completo: string }
}

const DIAS = ['Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo']
const NIVEIS = ['Iniciante', 'Intermediario', 'Avancado']

export default function NovaTurmaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  const [ritmos, setRitmos] = useState<Ritmo[]>([])
  const [professores, setProfessores] = useState<Professor[]>([])

  const [nome, setNome] = useState('')
  const [idRitmo, setIdRitmo] = useState('')
  const [idProfessor, setIdProfessor] = useState('')
  const [nivel, setNivel] = useState('Iniciante')
  const [diaSemana, setDiaSemana] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFim, setHoraFim] = useState('')
  const [capacidade, setCapacidade] = useState('')
  const [valorAvulso, setValorAvulso] = useState('')
  const [descricao, setDescricao] = useState('')
  const [status, setStatus] = useState('ativa')

  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  // Carrega ritmos e professores
  useEffect(() => {
    Promise.all([
      fetch('/api/ritmos').then(r => r.json()),
      fetch('/api/professores').then(r => r.json()).catch(() => []),
    ]).then(([r, p]) => {
      setRitmos(Array.isArray(r) ? r : [])
      setProfessores(Array.isArray(p) ? p : [])
    })
  }, [])

  // Se edicao, carrega dados da turma
  useEffect(() => {
    if (editId) {
      fetch(`/api/turmas/${editId}`)
        .then(r => r.json())
        .then(data => {
          setNome(data.nome || '')
          setIdRitmo(data.id_ritmo || '')
          setIdProfessor(data.id_professor || '')
          setNivel(data.nivel || 'Iniciante')
          setDiaSemana(data.dia_semana || '')
          setHoraInicio(data.hora_inicio?.slice(0, 5) || '')
          setHoraFim(data.hora_fim?.slice(0, 5) || '')
          setCapacidade(data.capacidade_maxima?.toString() || '')
          setValorAvulso(data.valor_avulso?.toString() || '')
          setDescricao(data.descricao || '')
          setStatus(data.status || 'ativa')
        })
    }
  }, [editId])

  async function handleSubmit() {
    setErro('')

    if (!nome.trim() || !idRitmo || !capacidade) {
      setErro('Nome, ritmo e capacidade sao obrigatorios.')
      return
    }

    setLoading(true)
    try {
      const url = editId ? `/api/turmas/${editId}` : '/api/turmas'
      const method = editId ? 'PUT' : 'POST'

      const body: Record<string, unknown> = {
        nome: nome.trim(),
        id_ritmo: idRitmo,
        capacidade_maxima: Number(capacidade),
        nivel,
        dia_semana: diaSemana || null,
        hora_inicio: horaInicio || null,
        hora_fim: horaFim || null,
        descricao: descricao.trim() || null,
        valor_avulso: valorAvulso ? Number(valorAvulso) : null,
        status,
      }

      if (idProfessor) body.id_professor = idProfessor

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.erro || 'Erro ao salvar.')
        return
      }

      router.push('/dashboard/turmas')
    } catch {
      setErro('Erro de conexao.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <button
          onClick={() => router.push('/dashboard/turmas')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#6B6B6B', fontSize: 13, marginBottom: 8 }}
        >
          <ArrowLeft size={16} /> Voltar para Turmas
        </button>
        <h1 className="page-title">{editId ? 'Editar Turma' : 'Nova Turma'}</h1>
      </div>

      <div className="page-content">
        <div className="card" style={{ maxWidth: 640 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Nome */}
            <div className="form-group">
              <label className="form-label">Nome da Turma *</label>
              <input
                className="form-input"
                placeholder="Ex: Forro Iniciante - Noite"
                value={nome}
                onChange={e => setNome(e.target.value)}
              />
            </div>

            {/* Ritmo + Professor */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Ritmo *</label>
                <select className="form-select" value={idRitmo} onChange={e => setIdRitmo(e.target.value)}>
                  <option value="">Selecione...</option>
                  {ritmos.map(r => (
                    <option key={r.id_ritmo} value={r.id_ritmo}>{r.nome}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Professor</label>
                <select className="form-select" value={idProfessor} onChange={e => setIdProfessor(e.target.value)}>
                  <option value="">Selecione...</option>
                  {professores.map(p => (
                    <option key={p.id_professor} value={p.id_professor}>
                      {p.usuarios?.nome_completo || 'Professor'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nivel */}
            <div className="form-group">
              <label className="form-label">Nivel</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {NIVEIS.map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`toggle-btn ${nivel === n ? 'active' : ''}`}
                    style={{
                      padding: '8px 16px', borderRadius: 8, border: '1.5px solid #E8E0D8',
                      background: nivel === n ? '#8B1A2F' : '#FFFFFF',
                      color: nivel === n ? '#FFFFFF' : '#6B6B6B',
                      fontWeight: 600, fontSize: 12, cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onClick={() => setNivel(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Dia + Horario */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Dia da Semana</label>
                <select className="form-select" value={diaSemana} onChange={e => setDiaSemana(e.target.value)}>
                  <option value="">Selecione...</option>
                  {DIAS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Capacidade maxima *</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  placeholder="Ex: 15"
                  value={capacidade}
                  onChange={e => setCapacidade(e.target.value)}
                />
              </div>
            </div>

            {/* Horarios */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Hora inicio</label>
                <input
                  className="form-input"
                  type="time"
                  value={horaInicio}
                  onChange={e => setHoraInicio(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Hora fim</label>
                <input
                  className="form-input"
                  type="time"
                  value={horaFim}
                  onChange={e => setHoraFim(e.target.value)}
                />
              </div>
            </div>

            {/* Valor avulso */}
            <div className="form-group">
              <label className="form-label">Valor da aula avulsa (R$)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="Opcional"
                value={valorAvulso}
                onChange={e => setValorAvulso(e.target.value)}
              />
            </div>

            {/* Descricao */}
            <div className="form-group">
              <label className="form-label">Descricao</label>
              <textarea
                className="form-textarea"
                placeholder="Breve descricao da turma..."
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="toggle-group" style={{ width: 'fit-content' }}>
                <button className={`toggle-btn ${status === 'ativa' ? 'active' : ''}`} onClick={() => setStatus('ativa')} type="button">
                  Ativa
                </button>
                <button className={`toggle-btn ${status === 'inativa' ? 'active' : ''}`} onClick={() => setStatus('inativa')} type="button">
                  Inativa
                </button>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px' }}>
                <p className="form-error">{erro}</p>
              </div>
            )}

            {/* Acoes */}
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => router.push('/dashboard/turmas')}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Salvando...' : editId ? 'Salvar Alteracoes' : 'Criar Turma'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}