'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import PageHeader from '@/components/dashboard/PageHeader'
import StatusBadge from '@/components/dashboard/StatusBadge'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Anamnese {
  dados_questionario: Record<string, unknown>
  data_preenchimento: string
}

interface Matricula {
  id_matricula: string
  nome_turma: string
  ritmo: string
  status: string
}

interface Parcela {
  id_parcela: string
  numero_parcela: number
  valor_cobrado: number
  data_vencimento: string
  status: string
}

interface AlunoCompleto {
  id_usuario: string
  nome_completo: string
  email: string
  id_aluno: string
  cpf: string | null
  telefone: string | null
  endereco: string | null
  data_nascimento: string | null
  nome_mae: string | null
  profissao: string | null
  tel_parente: string | null
  nome_parente: string | null
  grau_parentesco: string | null
  genero: string | null
  observacoes: string | null
  anamnese: Anamnese | null
  matriculas: Matricula[]
  parcelas: Parcela[]
  status_financeiro?: 'em_dia' | 'inadimplente'
}

type Tab = 'dados' | 'anamnese' | 'matriculas' | 'financeiro'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR')
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="detail-field">
      <span className="detail-field-label">{label}</span>
      <span className="detail-field-value">{value || '—'}</span>
    </div>
  )
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string }[] = [
  { key: 'dados',       label: 'Dados Pessoais' },
  { key: 'anamnese',    label: 'Anamnese'        },
  { key: 'matriculas',  label: 'Matrículas'      },
  { key: 'financeiro',  label: 'Financeiro'      },
]

// ─── Aba: Dados Pessoais ─────────────────────────────────────────────────────

function TabDados({ aluno, onSaved }: { aluno: AlunoCompleto; onSaved: (updated: AlunoCompleto) => void }) {
  const [form, setForm] = useState({
    nome_completo:   aluno.nome_completo   ?? '',
    email:           aluno.email           ?? '',
    cpf:             aluno.cpf             ?? '',
    telefone:        aluno.telefone        ?? '',
    data_nascimento: aluno.data_nascimento ? aluno.data_nascimento.slice(0, 10) : '',
    profissao:       aluno.profissao       ?? '',
    endereco:        aluno.endereco        ?? '',
    nome_mae:        aluno.nome_mae        ?? '',
    nome_parente:    aluno.nome_parente    ?? '',
    grau_parentesco: aluno.grau_parentesco ?? '',
    tel_parente:     aluno.tel_parente     ?? '',
    genero:          aluno.genero          ?? '',
    observacoes:     aluno.observacoes     ?? '',
  })
  const [saving, setSaving]   = useState(false)
  const [saved,  setSaved]    = useState(false)
  const [error,  setError]    = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setSaved(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/alunos/${aluno.id_aluno}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? 'Falha ao salvar.')
      }
      const updated: AlunoCompleto = await res.json()
      onSaved(updated)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert-danger">{error}</div>}
      {saved  && (
        <div style={{ background: '#DCFAE6', borderLeft: '4px solid #22C55E', padding: '12px 16px', borderRadius: 8, fontSize: 13, color: '#1A7340', marginBottom: 20 }}>
          Dados salvos com sucesso!
        </div>
      )}

      <div className="detail-section">
        <p className="detail-section-title">Identificação</p>
        <div className="detail-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="form-group">
            <label className="form-label">Nome Completo</label>
            <input className="form-input" name="nome_completo" value={form.nome_completo} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">CPF</label>
            <input className="form-input" name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" />
          </div>
          <div className="form-group">
            <label className="form-label">Telefone</label>
            <input className="form-input" name="telefone" value={form.telefone} onChange={handleChange} placeholder="(00) 00000-0000" />
          </div>
          <div className="form-group">
            <label className="form-label">Data de Nascimento</label>
            <input className="form-input" type="date" name="data_nascimento" value={form.data_nascimento} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Profissão</label>
            <input className="form-input" name="profissao" value={form.profissao} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Gênero</label>
            <select className="form-input" name="genero" value={form.genero} onChange={handleChange}>
              <option value="">—</option>
              <option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option>
              <option value="outro">Outro</option>
              <option value="prefiro_nao_dizer">Prefiro não dizer</option>
            </select>
          </div>
        </div>
        <div className="form-group" style={{ marginTop: 16 }}>
          <label className="form-label">Endereço</label>
          <input className="form-input" name="endereco" value={form.endereco} onChange={handleChange} />
        </div>
        <div className="form-group" style={{ marginTop: 16 }}>
          <label className="form-label">Nome da Mãe</label>
          <input className="form-input" name="nome_mae" value={form.nome_mae} onChange={handleChange} />
        </div>
        <div className="form-group" style={{ marginTop: 16 }}>
          <label className="form-label">Observações (internas)</label>
          <textarea className="form-input" name="observacoes" value={form.observacoes} onChange={handleChange} rows={3} style={{ resize: 'none' }} />
        </div>
      </div>

      <div className="detail-section">
        <p className="detail-section-title">Responsável (se menor de idade)</p>
        <div className="detail-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="form-group">
            <label className="form-label">Nome do Responsável</label>
            <input className="form-input" name="nome_parente" value={form.nome_parente} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Grau de Parentesco</label>
            <input className="form-input" name="grau_parentesco" value={form.grau_parentesco} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Telefone do Responsável</label>
            <input className="form-input" name="tel_parente" value={form.tel_parente} onChange={handleChange} placeholder="(00) 00000-0000" />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Save size={14} />
          {saving ? 'Salvando…' : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  )
}

// ─── Aba: Anamnese ────────────────────────────────────────────────────────────

function TabAnamnese({ anamnese }: { anamnese: Anamnese | null }) {
  if (!anamnese) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center', color: '#6B6B6B', fontSize: 14 }}>
        Anamnese não preenchida pelo aluno.
      </div>
    )
  }

  const q = anamnese.dados_questionario as Record<string, unknown>

  const boolLabel = (val: unknown) =>
    val === true ? <span style={{ color: '#1A7340', fontWeight: 600 }}>Sim</span> : <span style={{ color: '#6B6B6B' }}>Não</span>

  return (
    <div>
      <div className="detail-section">
        <p className="detail-section-title">Informações de Saúde</p>
        <div className="detail-grid">
          <Field label="Pratica atividade física"  value={boolLabel(q.pratica_atividade)} />
          <Field label="Possui lesão"               value={boolLabel(q.tem_lesao)}         />
          <Field label="Doença crônica"             value={boolLabel(q.tem_doenca_cronica)} />
          <Field label="Usa medicamento"            value={boolLabel(q.usa_medicamento)}   />
        </div>
      </div>

      {q.descricao_lesao && (
        <div className="detail-section">
          <p className="detail-section-title">Descrição da Lesão</p>
          <p style={{ fontSize: 13, color: '#1A1A1A', lineHeight: 1.6 }}>{String(q.descricao_lesao)}</p>
        </div>
      )}

      {q.observacoes && (
        <div className="detail-section">
          <p className="detail-section-title">Observações</p>
          <p style={{ fontSize: 13, color: '#1A1A1A', lineHeight: 1.6 }}>{String(q.observacoes)}</p>
        </div>
      )}

      <p style={{ fontSize: 11, color: '#6B6B6B', marginTop: 8 }}>
        Preenchida em {formatDate(anamnese.data_preenchimento)}
      </p>
    </div>
  )
}

// ─── Aba: Matrículas ─────────────────────────────────────────────────────────

function TabMatriculas({ matriculas }: { matriculas: Matricula[] }) {
  if (matriculas.length === 0) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center', color: '#6B6B6B', fontSize: 14 }}>
        Nenhuma matrícula encontrada.
      </div>
    )
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Turma</th>
          <th>Ritmo</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {matriculas.map((m) => (
          <tr key={m.id_matricula}>
            <td style={{ fontWeight: 600 }}>{m.nome_turma}</td>
            <td>
              <span className="badge badge-gold">{m.ritmo}</span>
            </td>
            <td>
              <StatusBadge status={m.status as Parameters<typeof StatusBadge>[0]['status']} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── Aba: Financeiro ─────────────────────────────────────────────────────────

function TabFinanceiro({ parcelas, idAluno }: { parcelas: Parcela[]; idAluno: string }) {
  if (parcelas.length === 0) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center', color: '#6B6B6B', fontSize: 14 }}>
        Nenhuma parcela encontrada.
      </div>
    )
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Valor</th>
          <th>Vencimento</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {parcelas.map((p) => (
          <tr
            key={p.id_parcela}
            style={p.status === 'atrasado' ? { background: '#FFF5F5' } : undefined}
          >
            <td style={{ fontVariantNumeric: 'tabular-nums' }}>Parcela {p.numero_parcela}</td>
            <td style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(p.valor_cobrado)}</td>
            <td>{formatDate(p.data_vencimento)}</td>
            <td>
              <StatusBadge status={p.status as Parameters<typeof StatusBadge>[0]['status']} />
            </td>
            <td>
              <Link
                href={`/dashboard/financeiro/${p.id_parcela}`}
                style={{ color: '#8B1A2F', fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                Ver detalhes →
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AlunoFichaPage() {
  const { id } = useParams<{ id: string }>()
  const [aluno, setAluno]     = useState<AlunoCompleto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('dados')

  const fetchAluno = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/alunos/${id}`)
      if (res.status === 404) throw new Error('Aluno não encontrado.')
      if (!res.ok) throw new Error('Falha ao carregar ficha do aluno.')
      setAluno(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchAluno() }, [fetchAluno])

  // ── Loading ──
  if (loading) {
    return (
      <div>
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard/alunos" style={{ color: '#8B1A2F', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Alunos
          </Link>
        </div>
        <div className="page-content">
          <div style={{ padding: '64px 0', textAlign: 'center', color: '#6B6B6B', fontSize: 14 }}>
            Carregando ficha do aluno…
          </div>
        </div>
      </div>
    )
  }

  // ── Erro ──
  if (error || !aluno) {
    return (
      <div>
        <div className="page-header">
          <Link href="/dashboard/alunos" style={{ color: '#8B1A2F', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Alunos
          </Link>
        </div>
        <div className="page-content">
          <div className="alert-danger">{error ?? 'Aluno não encontrado.'}</div>
        </div>
      </div>
    )
  }

  const inadimplente = aluno.status_financeiro === 'inadimplente' ||
    aluno.parcelas.some((p) => p.status === 'atrasado')

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link
            href="/dashboard/alunos"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#8B1A2F', textDecoration: 'none', marginBottom: 8 }}
          >
            <ArrowLeft size={13} /> Voltar para Alunos
          </Link>
          <p className="page-label">Ficha do Aluno</p>
          <h1 className="page-title">{aluno.nome_completo}</h1>
          <p className="page-subtitle">{aluno.email}</p>
        </div>
        <div>
          <StatusBadge status={inadimplente ? 'inadimplente' : 'em_dia'} />
        </div>
      </div>

      <div className="page-content">
        {/* Alerta inadimplência */}
        {inadimplente && (
          <div className="alert-danger">
            Este aluno possui parcelas em atraso. Entre em contato para regularizar a situação.
          </div>
        )}

        <div className="card">
          {/* Abas */}
          <div className="tabs">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`tab-item${activeTab === tab.key ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Conteúdo das abas */}
          {activeTab === 'dados' && (
            <TabDados aluno={aluno} onSaved={(updated) => setAluno((prev) => ({ ...prev!, ...updated }))} />
          )}
          {activeTab === 'anamnese' && (
            <TabAnamnese anamnese={aluno.anamnese} />
          )}
          {activeTab === 'matriculas' && (
            <TabMatriculas matriculas={aluno.matriculas} />
          )}
          {activeTab === 'financeiro' && (
            <TabFinanceiro parcelas={aluno.parcelas} idAluno={aluno.id_aluno} />
          )}
        </div>
      </div>
    </div>
  )
}
