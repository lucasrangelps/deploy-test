'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Receipt, FileCheck } from 'lucide-react'
import PageHeader from '@/components/dashboard/PageHeader'
import StatusBadge from '@/components/dashboard/StatusBadge'
import ConfirmModal from '@/components/dashboard/ConfirmModal'

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotaFiscal {
  id_nota: string
  numero_nfse: string | null
  status_emissao: 'pendente' | 'emitida' | 'erro'
  xml_link: string | null
  data_emissao: string | null
}

interface Pagamento {
  id_pagamento: string
  metodo: string
  data_pagamento: string
  valor_pago: number
  notas_fiscais: NotaFiscal[]
}

interface ParcelaDetalhe {
  id_parcela: string
  numero_parcela: number
  valor_cobrado: number
  data_vencimento: string
  status: 'pendente' | 'pago' | 'atrasado'
  contratos: {
    id_contrato: string
    forma_pgto_padrao: string | null
    planos: { nome: string; ciclo_meses: number; valor_base: number } | null
    alunos: {
      id_aluno: string
      usuarios: { nome_completo: string; email: string } | null
    } | null
  } | null
  pagamentos: Pagamento[]
}

type MetodoPagamento = 'PIX' | 'Cartão' | 'Dinheiro' | 'Boleto'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso.length === 10 ? iso + 'T00:00:00' : iso)
  return d.toLocaleDateString('pt-BR')
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="detail-field">
      <span className="detail-field-label">{label}</span>
      <span className="detail-field-value">{children}</span>
    </div>
  )
}

// ─── Bloco Baixa Manual ───────────────────────────────────────────────────────

function BaixaManualSection({
  parcela,
  onBaixaRealizada,
}: {
  parcela: ParcelaDetalhe
  onBaixaRealizada: () => void
}) {
  const [metodo,          setMetodo]         = useState<MetodoPagamento>('PIX')
  const [dataPagamento,   setDataPagamento]  = useState(new Date().toISOString().slice(0, 10))
  const [valorPago,       setValorPago]      = useState(String(parcela.valor_cobrado))
  const [confirmOpen,     setConfirmOpen]    = useState(false)
  const [submitting,      setSubmitting]     = useState(false)
  const [error,           setError]          = useState<string | null>(null)

  async function confirmarBaixa() {
    setSubmitting(true)
    setError(null)
    setConfirmOpen(false)
    try {
      const res = await fetch(`/api/pagamentos/${parcela.id_parcela}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metodo,
          data_pagamento: dataPagamento,
          valor_pago: Number(valorPago),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.erro ?? 'Falha ao registrar pagamento.')
      }
      onBaixaRealizada()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setSubmitting(false)
    }
  }

  const valorNumerico = Number(valorPago)
  const formValida = dataPagamento && valorNumerico > 0

  return (
    <>
      <div className="detail-section">
        <p className="detail-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Receipt size={14} />
          Baixa Manual
        </p>
        <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 16, lineHeight: 1.5 }}>
          Registre o recebimento desta parcela manualmente. A operação não pode ser desfeita.
        </p>

        {error && <div className="alert-danger">{error}</div>}

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Método de Pagamento</label>
            <select
              className="form-select"
              value={metodo}
              onChange={(e) => setMetodo(e.target.value as MetodoPagamento)}
            >
              {(['PIX', 'Cartão', 'Dinheiro', 'Boleto'] as MetodoPagamento[]).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Data do Pagamento</label>
            <input
              type="date"
              className="form-input"
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: 16, maxWidth: 220 }}>
          <label className="form-label">Valor Pago (R$)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className="form-input"
            value={valorPago}
            onChange={(e) => setValorPago(e.target.value)}
          />
        </div>

        <div className="form-actions" style={{ marginTop: 20 }}>
          <button
            className="btn-primary"
            disabled={!formValida || submitting}
            onClick={() => setConfirmOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {submitting ? 'Registrando…' : 'Confirmar Baixa'}
          </button>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Confirmar Baixa Manual"
        description={`Registrar pagamento de ${formatCurrency(valorNumerico)} via ${metodo} em ${formatDate(dataPagamento)}? Esta ação não pode ser desfeita.`}
        confirmLabel="Confirmar Baixa"
        onConfirm={confirmarBaixa}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}

// ─── Bloco Nota Fiscal ────────────────────────────────────────────────────────

function NotaFiscalSection({
  pagamento,
  parcelaId,
  onEmitida,
}: {
  pagamento: Pagamento
  parcelaId: string
  onEmitida: () => void
}) {
  const nota = pagamento.notas_fiscais?.[0] ?? null
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  async function emitirNota() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/notas-fiscais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_pagamento: pagamento.id_pagamento }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.erro ?? 'Falha ao emitir nota fiscal.')
      }
      onEmitida()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="detail-section">
      <p className="detail-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <FileCheck size={14} />
        Nota Fiscal
      </p>

      {error && <div className="alert-danger">{error}</div>}

      {nota ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="detail-grid">
            <Field label="Status de Emissão">
              <StatusBadge status={nota.status_emissao} />
            </Field>
            {nota.numero_nfse && (
              <Field label="Número NFS-e">{nota.numero_nfse}</Field>
            )}
            {nota.data_emissao && (
              <Field label="Data de Emissão">{formatDate(nota.data_emissao)}</Field>
            )}
          </div>

          {nota.xml_link && (
            <a
              href={nota.xml_link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, width: 'fit-content', textDecoration: 'none' }}
            >
              Baixar XML
            </a>
          )}

          {nota.status_emissao === 'erro' && (
            <button
              className="btn-primary"
              onClick={emitirNota}
              disabled={submitting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, width: 'fit-content' }}
            >
              {submitting ? 'Reenviando…' : 'Tentar Novamente'}
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, color: '#6B6B6B' }}>
            Nenhuma nota fiscal emitida para este pagamento.
          </p>
          <button
            className="btn-primary"
            onClick={emitirNota}
            disabled={submitting}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, width: 'fit-content' }}
          >
            <FileCheck size={14} />
            {submitting ? 'Emitindo…' : 'Emitir Nota Fiscal'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FinanceiroDetalhe() {
  const { id } = useParams<{ id: string }>()

  const [parcela,  setParcela]  = useState<ParcelaDetalhe | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  const fetchParcela = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/pagamentos/${id}`)
      if (res.status === 404) throw new Error('Parcela não encontrada.')
      if (!res.ok) throw new Error('Falha ao carregar dados da parcela.')
      setParcela(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchParcela() }, [fetchParcela])

  const breadcrumb = (
    <Link
      href="/dashboard/financeiro"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#8B1A2F', textDecoration: 'none', marginBottom: 8 }}
    >
      <ArrowLeft size={13} /> Controle de Pagamentos
    </Link>
  )

  // ── Loading ──
  if (loading) {
    return (
      <div>
        <div className="page-header">{breadcrumb}</div>
        <div className="page-content">
          <div style={{ padding: '64px 0', textAlign: 'center', color: '#6B6B6B', fontSize: 14 }}>
            Carregando parcela…
          </div>
        </div>
      </div>
    )
  }

  // ── Erro ──
  if (error || !parcela) {
    return (
      <div>
        <div className="page-header">{breadcrumb}</div>
        <div className="page-content">
          <div className="alert-danger">{error ?? 'Parcela não encontrada.'}</div>
        </div>
      </div>
    )
  }

  const aluno    = parcela.contratos?.alunos
  const usuario  = aluno?.usuarios
  const plano    = parcela.contratos?.planos
  const pagamento = parcela.pagamentos?.[0] ?? null

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          {breadcrumb}
          <p className="page-label">Detalhe da Parcela</p>
          <h1 className="page-title">Parcela #{parcela.numero_parcela}</h1>
          {usuario && <p className="page-subtitle">{usuario.nome_completo}</p>}
        </div>
        <StatusBadge status={parcela.status} />
      </div>

      <div className="page-content">

        {/* Metadados */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="detail-section">
            <p className="detail-section-title">Informações da Parcela</p>
            <div className="detail-grid">
              <Field label="Aluno">
                {aluno ? (
                  <Link
                    href={`/dashboard/alunos/${aluno.id_aluno}`}
                    style={{ color: '#8B1A2F', textDecoration: 'none', fontWeight: 600 }}
                  >
                    {usuario?.nome_completo ?? '—'}
                  </Link>
                ) : '—'}
              </Field>
              <Field label="E-mail">{usuario?.email ?? '—'}</Field>
              <Field label="Contrato">
                {parcela.contratos?.id_contrato
                  ? parcela.contratos.id_contrato.slice(0, 8).toUpperCase()
                  : '—'}
              </Field>
              <Field label="Plano">{plano?.nome ?? '—'}</Field>
              <Field label="Ciclo">
                {plano ? `${plano.ciclo_meses} ${plano.ciclo_meses === 1 ? 'mês' : 'meses'}` : '—'}
              </Field>
              <Field label="Forma de Pagamento Padrão">
                {parcela.contratos?.forma_pgto_padrao ?? '—'}
              </Field>
              <Field label="Valor Cobrado">{formatCurrency(parcela.valor_cobrado)}</Field>
              <Field label="Vencimento">{formatDate(parcela.data_vencimento)}</Field>
              <Field label="Status"><StatusBadge status={parcela.status} /></Field>
            </div>
          </div>

          {/* Dados do pagamento se já pago */}
          {pagamento && (
            <div className="detail-section">
              <p className="detail-section-title">Pagamento Realizado</p>
              <div className="detail-grid">
                <Field label="Método">{pagamento.metodo}</Field>
                <Field label="Data">{formatDate(pagamento.data_pagamento)}</Field>
                <Field label="Valor Pago">{formatCurrency(pagamento.valor_pago)}</Field>
              </div>
            </div>
          )}
        </div>

        {/* Baixa manual — somente se não pago */}
        {parcela.status !== 'pago' && (
          <div className="card" style={{ marginBottom: 20 }}>
            <BaixaManualSection
              parcela={parcela}
              onBaixaRealizada={fetchParcela}
            />
          </div>
        )}

        {/* Nota fiscal — somente se pago */}
        {parcela.status === 'pago' && pagamento && (
          <div className="card">
            <NotaFiscalSection
              pagamento={pagamento}
              parcelaId={parcela.id_parcela}
              onEmitida={fetchParcela}
            />
          </div>
        )}

      </div>
    </div>
  )
}
