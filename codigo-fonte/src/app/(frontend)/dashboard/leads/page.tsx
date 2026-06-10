'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { UserPlus, X } from 'lucide-react'
import PageHeader from '@/components/dashboard/PageHeader'
import StatusBadge from '@/components/dashboard/StatusBadge'
import ConfirmModal from '@/components/dashboard/ConfirmModal'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Lead {
  id_lead: string
  nome: string
  email: string | null
  telefone: string | null
  ritmo_interesse: string | null
  status: 'novo' | 'em_contato' | 'convertido' | 'perdido'
  origem: string | null
  observacoes: string | null
  criado_em: string
  convertido_em: string | null
}

interface Ritmo {
  id_ritmo: string
  nome: string
}

type StatusFiltro = '' | 'novo' | 'em_contato' | 'convertido' | 'perdido'

const STATUS_FILTROS: { value: StatusFiltro; label: string }[] = [
  { value: '',           label: 'Todos'      },
  { value: 'novo',       label: 'Novo'       },
  { value: 'em_contato', label: 'Em Contato' },
  { value: 'convertido', label: 'Convertido' },
  { value: 'perdido',    label: 'Perdido'    },
]

const ORIGENS = ['Indicação', 'Instagram', 'Site', 'WhatsApp', 'Outro'] as const

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

// ─── Modal Novo Lead ──────────────────────────────────────────────────────────

interface NovoLeadModalProps {
  ritmos: Ritmo[]
  onClose: () => void
  onCreated: (lead: Lead) => void
}

function NovoLeadModal({ ritmos, onClose, onCreated }: NovoLeadModalProps) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    ritmo_interesse: '',
    origem: '' as string,
    observacoes: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState<string | null>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: [] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setFieldErrors({})

    const payload = {
      nome: form.nome,
      email: form.email || undefined,
      telefone: form.telefone || undefined,
      ritmo_interesse: form.ritmo_interesse || undefined,
      origem: form.origem || undefined,
      observacoes: form.observacoes || undefined,
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = await res.json()
      if (!res.ok) {
        if (body?.detalhes) setFieldErrors(body.detalhes)
        throw new Error(body?.erro ?? 'Falha ao criar lead.')
      }
      onCreated(body)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setSubmitting(false)
    }
  }

  // Fechar com Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="novo-lead-title"
    >
      <div className="modal-box" style={{ width: 560 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 id="novo-lead-title" className="modal-title" style={{ margin: 0 }}>Novo Lead</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B', display: 'flex', padding: 4 }}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {error && <div className="alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Nome *</label>
            <input
              className="form-input"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Nome completo"
              required
            />
            {fieldErrors.nome && (
              <span className="form-error">{fieldErrors.nome[0]}</span>
            )}
          </div>

          <div className="form-grid-2" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input
                className="form-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@exemplo.com"
              />
              {fieldErrors.email && (
                <span className="form-error">{fieldErrors.email[0]}</span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input
                className="form-input"
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
              />
              {fieldErrors.telefone && (
                <span className="form-error">{fieldErrors.telefone[0]}</span>
              )}
            </div>
          </div>

          <div className="form-grid-2" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Ritmo de Interesse</label>
              <select className="form-select" name="ritmo_interesse" value={form.ritmo_interesse} onChange={handleChange}>
                <option value="">Selecionar…</option>
                {ritmos.map((r) => (
                  <option key={r.id_ritmo} value={r.nome}>{r.nome}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Origem</label>
              <select className="form-select" name="origem" value={form.origem} onChange={handleChange}>
                <option value="">Selecionar…</option>
                {ORIGENS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Observações</label>
            <textarea
              className="form-textarea"
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              rows={3}
              placeholder="Informações adicionais sobre o lead…"
            />
          </div>

          <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <UserPlus size={14} />
              {submitting ? 'Salvando…' : 'Criar Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const [leads,         setLeads]         = useState<Lead[]>([])
  const [ritmos,        setRitmos]        = useState<Ritmo[]>([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState<string | null>(null)
  const [statusFiltro,  setStatusFiltro]  = useState<StatusFiltro>('')
  const [modalOpen,     setModalOpen]     = useState(false)
  const [perdidoId,     setPerdidoId]     = useState<string | null>(null)
  const [markingPerdido, setMarkingPerdido] = useState(false)

  const fetchLeads = useCallback(async (status: StatusFiltro) => {
    setLoading(true)
    setError(null)
    try {
      const params = status ? `?status=${status}` : ''
      const res = await fetch(`/api/leads${params}`)
      if (!res.ok) throw new Error('Falha ao carregar leads.')
      setLeads(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads('')
    fetch('/api/ritmos')
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setRitmos(data))
      .catch(() => {})
  }, [fetchLeads])

  useEffect(() => { fetchLeads(statusFiltro) }, [statusFiltro, fetchLeads])

  async function handleMarcarPerdido() {
    if (!perdidoId) return
    setMarkingPerdido(true)
    try {
      await fetch(`/api/leads/${perdidoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'perdido' }),
      })
      setLeads((prev) =>
        prev.map((l) => (l.id_lead === perdidoId ? { ...l, status: 'perdido' } : l)),
      )
    } finally {
      setMarkingPerdido(false)
      setPerdidoId(null)
    }
  }

  const perdidoNome = leads.find((l) => l.id_lead === perdidoId)?.nome ?? ''

  return (
    <>
      <div>
        <PageHeader
          label="Captação"
          title="Leads"
          subtitle="Gerencie os potenciais alunos captados."
          action={{ label: 'Novo Lead', onClick: () => setModalOpen(true), icon: UserPlus }}
        />

        <div className="page-content">
          {/* Filtro de status */}
          <div style={{ marginBottom: 20 }}>
            <div className="toggle-group">
              {STATUS_FILTROS.map((s) => (
                <button
                  key={s.value}
                  className={`toggle-btn${statusFiltro === s.value ? ' active' : ''}`}
                  onClick={() => setStatusFiltro(s.value)}
                  type="button"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Erro */}
          {error && <div className="alert-danger">{error}</div>}

          {/* Tabela */}
          <div className="card">
            {loading ? (
              <div style={{ padding: '48px 0', textAlign: 'center', color: '#6B6B6B', fontSize: 14 }}>
                Carregando leads…
              </div>
            ) : leads.length === 0 ? (
              <div style={{ padding: '48px 0', textAlign: 'center', color: '#6B6B6B', fontSize: 14 }}>
                {statusFiltro
                  ? `Nenhum lead com status "${statusFiltro}".`
                  : 'Nenhum lead cadastrado ainda.'}
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Contato</th>
                    <th>Ritmo</th>
                    <th>Origem</th>
                    <th>Status</th>
                    <th>Captado em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id_lead}>
                      <td style={{ fontWeight: 600 }}>{lead.nome}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {lead.email && (
                            <span style={{ fontSize: 12, color: '#1A1A1A' }}>{lead.email}</span>
                          )}
                          {lead.telefone && (
                            <span style={{ fontSize: 12, color: '#6B6B6B' }}>{lead.telefone}</span>
                          )}
                          {!lead.email && !lead.telefone && (
                            <span style={{ color: '#6B6B6B', fontSize: 12 }}>—</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {lead.ritmo_interesse ? (
                          <span className="badge badge-gold">{lead.ritmo_interesse}</span>
                        ) : (
                          <span style={{ color: '#6B6B6B', fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td style={{ color: '#6B6B6B', fontSize: 13 }}>{lead.origem ?? '—'}</td>
                      <td>
                        <StatusBadge status={lead.status} />
                      </td>
                      <td style={{ fontSize: 13, color: '#6B6B6B' }}>{formatDate(lead.criado_em)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'nowrap' }}>
                          {lead.status === 'convertido' ? (
                            <span
                              style={{ fontSize: 12, color: '#6B6B6B', fontWeight: 500, cursor: 'not-allowed' }}
                              title="Lead já convertido"
                            >
                              Convertido
                            </span>
                          ) : (
                            <Link
                              href={`/dashboard/alunos/novo?from_lead=${lead.id_lead}`}
                              style={{ fontSize: 12, color: '#8B1A2F', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
                            >
                              Converter em Aluno →
                            </Link>
                          )}
                          {lead.status !== 'perdido' && lead.status !== 'convertido' && (
                            <button
                              onClick={() => setPerdidoId(lead.id_lead)}
                              style={{ fontSize: 12, color: '#991B1B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0, whiteSpace: 'nowrap' }}
                            >
                              Marcar como Perdido
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loading && !error && leads.length > 0 && (
            <p style={{ marginTop: 12, fontSize: 12, color: '#6B6B6B' }}>
              {leads.length} lead{leads.length !== 1 ? 's' : ''} encontrado{leads.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Modal Novo Lead */}
      {modalOpen && (
        <NovoLeadModal
          ritmos={ritmos}
          onClose={() => setModalOpen(false)}
          onCreated={(lead) => setLeads((prev) => [lead, ...prev])}
        />
      )}

      {/* Modal Confirmar Perda */}
      <ConfirmModal
        open={!!perdidoId}
        title="Marcar como Perdido"
        description={`Confirmar que o lead "${perdidoNome}" foi perdido? O status será atualizado e não poderá ser revertido por esta ação.`}
        confirmLabel={markingPerdido ? 'Atualizando…' : 'Marcar como Perdido'}
        onConfirm={handleMarcarPerdido}
        onCancel={() => setPerdidoId(null)}
        variant="danger"
      />
    </>
  )
}
