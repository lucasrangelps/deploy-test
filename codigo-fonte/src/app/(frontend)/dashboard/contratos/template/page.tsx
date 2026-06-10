'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, FileText, History } from 'lucide-react'
import PageHeader from '@/components/dashboard/PageHeader'
import StatusBadge from '@/components/dashboard/StatusBadge'
import ConfirmModal from '@/components/dashboard/ConfirmModal'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContratoTemplate {
  id_template: string
  versao: number
  conteudo: string
  ativo: boolean
  criado_em: string
}

interface HistoricoItem {
  id_template: string
  versao: number
  ativo: boolean
  criado_em: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContratosTemplatePage() {
  const [template,       setTemplate]      = useState<ContratoTemplate | null>(null)
  const [conteudo,       setConteudo]       = useState('')
  const [historico,      setHistorico]      = useState<HistoricoItem[]>([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState<string | null>(null)
  const [confirmOpen,    setConfirmOpen]    = useState(false)
  const [saving,         setSaving]         = useState(false)
  const [saveError,      setSaveError]      = useState<string | null>(null)
  const [saveSuccess,    setSaveSuccess]    = useState(false)

  const fetchTemplate = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [activeRes, histRes] = await Promise.all([
        fetch('/api/contratos/template'),
        fetch('/api/contratos/template?historico=true'),
      ])

      if (activeRes.status === 404) {
        // Nenhum contrato ativo — editor começa vazio
        setTemplate(null)
        setConteudo('')
      } else if (!activeRes.ok) {
        throw new Error('Falha ao carregar o contrato.')
      } else {
        const data: ContratoTemplate = await activeRes.json()
        setTemplate(data)
        setConteudo(data.conteudo)
      }

      if (histRes.ok) {
        setHistorico(await histRes.json())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTemplate() }, [fetchTemplate])

  async function handleSalvar() {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    setConfirmOpen(false)
    try {
      const res = await fetch('/api/contratos/template', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conteudo }),
      })
      const body = await res.json()
      if (!res.ok) {
        throw new Error(
          body?.detalhes?.conteudo?.[0] ?? body?.erro ?? 'Falha ao salvar.'
        )
      }
      setSaveSuccess(true)
      // Recarrega template e histórico
      await fetchTemplate()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setSaving(false)
    }
  }

  const conteudoAlterado = template ? conteudo !== template.conteudo : conteudo.length >= 50
  const conteudoValido   = conteudo.trim().length >= 50

  // ── Loading ──
  if (loading) {
    return (
      <div>
        <PageHeader label="Configurações" title="Termo de Aceite" />
        <div className="page-content">
          <div style={{ padding: '64px 0', textAlign: 'center', color: '#6B6B6B', fontSize: 14 }}>
            Carregando contrato…
          </div>
        </div>
      </div>
    )
  }

  // ── Erro ──
  if (error) {
    return (
      <div>
        <PageHeader label="Configurações" title="Termo de Aceite" />
        <div className="page-content">
          <div className="alert-danger">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        label="Configurações"
        title="Termo de Aceite"
        subtitle="Edite e versione o contrato exibido no momento da matrícula."
      />

      <div className="page-content">

        {/* Metadados da versão ativa */}
        {template ? (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="detail-section" style={{ marginBottom: 0 }}>
              <p className="detail-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={13} /> Versão Ativa
              </p>
              <div className="detail-grid">
                <div className="detail-field">
                  <span className="detail-field-label">Versão</span>
                  <span className="detail-field-value">#{template.versao}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-field-label">Criada em</span>
                  <span className="detail-field-value">{formatDate(template.criado_em)}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-field-label">Status</span>
                  <span className="detail-field-value">
                    <StatusBadge status="ativo" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: '#FEF9EC', borderLeft: '4px solid #C9A96E', padding: '12px 16px', borderRadius: 8, fontSize: 13, color: '#7A5C1E', marginBottom: 20 }}>
            Nenhum contrato ativo. Escreva o conteúdo abaixo e salve para criar a primeira versão.
          </div>
        )}

        {/* Feedback de sucesso */}
        {saveSuccess && (
          <div style={{ background: '#DCFAE6', borderLeft: '4px solid #22C55E', padding: '12px 16px', borderRadius: 8, fontSize: 13, color: '#1A7340', marginBottom: 20 }}>
            Nova versão salva e ativada com sucesso!
          </div>
        )}

        {/* Erro ao salvar */}
        {saveError && <div className="alert-danger">{saveError}</div>}

        {/* Editor + Preview */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Lado esquerdo — editor */}
            <div className="form-group">
              <label className="form-label" style={{ marginBottom: 8 }}>
                Editar Conteúdo
              </label>
              <textarea
                className="form-textarea"
                value={conteudo}
                onChange={(e) => { setConteudo(e.target.value); setSaveSuccess(false) }}
                style={{ minHeight: 400, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6 }}
                placeholder="Digite o conteúdo do Termo de Aceite aqui…"
              />
              {conteudo.trim().length > 0 && conteudo.trim().length < 50 && (
                <span className="form-error">
                  O contrato deve ter ao menos 50 caracteres ({conteudo.trim().length}/50).
                </span>
              )}
            </div>

            {/* Lado direito — preview */}
            <div className="form-group">
              <label className="form-label" style={{ marginBottom: 8 }}>
                Pré-visualização
              </label>
              <div
                style={{
                  minHeight: 400,
                  border: '1px solid #E8E0D8',
                  borderRadius: 8,
                  padding: '12px 16px',
                  whiteSpace: 'pre-wrap',
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: conteudo ? '#1A1A1A' : '#9B9B9B',
                  overflowY: 'auto',
                  background: '#FAFAFA',
                }}
              >
                {conteudo || 'O conteúdo digitado aparecerá aqui…'}
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: 20, justifyContent: 'flex-end' }}>
            <button
              className="btn-primary"
              disabled={!conteudoValido || !conteudoAlterado || saving}
              onClick={() => setConfirmOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={14} />
              {saving ? 'Salvando…' : 'Salvar Nova Versão'}
            </button>
          </div>
        </div>

        {/* Histórico de versões */}
        <div className="card">
          <div className="card-header">
            <div>
              <p className="card-label">Histórico</p>
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <History size={16} /> Versões Anteriores
              </h2>
            </div>
          </div>

          {historico.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#6B6B6B', fontSize: 13 }}>
              Nenhuma versão registrada ainda.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Versão</th>
                  <th>Criada em</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((item) => (
                  <tr key={item.id_template}>
                    <td style={{ fontWeight: 600 }}>Versão #{item.versao}</td>
                    <td style={{ color: '#6B6B6B', fontSize: 13 }}>{formatDate(item.criado_em)}</td>
                    <td>
                      {item.ativo ? (
                        <StatusBadge status="ativo" />
                      ) : (
                        <StatusBadge status="inativo" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* Modal de confirmação */}
      <ConfirmModal
        open={confirmOpen}
        title="Salvar Nova Versão"
        description="Uma nova versão será ativada para todas as próximas matrículas. A versão atual será arquivada. Deseja continuar?"
        confirmLabel="Salvar e Ativar"
        onConfirm={handleSalvar}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
