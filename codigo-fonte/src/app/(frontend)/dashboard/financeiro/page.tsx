'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { DollarSign, Clock, AlertTriangle, TrendingDown } from 'lucide-react'
import { fetchWithAuth } from '@/lib/fetchWithAuth'
import PageHeader from '@/components/dashboard/PageHeader'
import FinancialKpiCard from '@/components/dashboard/FinancialKpiCard'
import SearchBar from '@/components/dashboard/SearchBar'
import StatusBadge from '@/components/dashboard/StatusBadge'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FinanceiroKpis {
  receita_mes: number
  parcelas_pendentes: number
  valor_em_atraso: number
  taxa_inadimplencia: number
}

interface ParcelaListItem {
  id_parcela: string
  numero_parcela: number
  valor_cobrado: number
  data_vencimento: string
  status: 'pendente' | 'pago' | 'atrasado'
  nome_aluno: string
  id_aluno: string | null
}

type StatusFiltro = '' | 'pendente' | 'pago' | 'atrasado'

const STATUS_FILTROS: { value: StatusFiltro; label: string }[] = [
  { value: '',         label: 'Todos'    },
  { value: 'pendente', label: 'Pendente' },
  { value: 'atrasado', label: 'Atrasado' },
  { value: 'pago',     label: 'Pago'     },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('pt-BR')
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FinanceiroPage() {
  const now = new Date()
  const [mes,     setMes]     = useState(String(now.getMonth() + 1))
  const [ano,     setAno]     = useState(String(now.getFullYear()))
  const [status,  setStatus]  = useState<StatusFiltro>('')
  const [aluno,   setAluno]   = useState('')

  const [kpis,     setKpis]     = useState<FinanceiroKpis | null>(null)
  const [parcelas, setParcelas] = useState<ParcelaListItem[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  const fetchData = useCallback(async (
    mesFiltro: string,
    anoFiltro: string,
    statusFiltro: string,
    alunoFiltro: string,
  ) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (mesFiltro)    params.set('mes',    mesFiltro)
      if (anoFiltro)    params.set('ano',    anoFiltro)
      if (statusFiltro) params.set('status', statusFiltro)
      if (alunoFiltro)  params.set('aluno',  alunoFiltro)

      const res = await fetchWithAuth(`/api/pagamentos?${params.toString()}`)
      if (!res.ok) throw new Error('Falha ao carregar dados financeiros.')
      const data = await res.json()
      setKpis(data.kpis)
      setParcelas(data.parcelas)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Dispara ao montar
  useEffect(() => {
    fetchData(mes, ano, status, aluno)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Dispara quando filtros discretos mudam (mes/ano/status)
  useEffect(() => {
    fetchData(mes, ano, status, aluno)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes, ano, status])

  const handleAlunoSearch = useCallback(
    (term: string) => {
      setAluno(term)
      fetchData(mes, ano, status, term)
    },
    [fetchData, mes, ano, status],
  )

  return (
    <div>
      <PageHeader
        label="Financeiro"
        title="Controle de Pagamentos"
        subtitle="Acompanhe receitas, pendências e inadimplência."
      />

      <div className="page-content">

        {/* KPIs */}
        <div className="kpi-grid" style={{ marginBottom: 24 }}>
          <FinancialKpiCard
            label="Receita do Mês"
            value={kpis ? formatCurrency(kpis.receita_mes) : '—'}
            icon={DollarSign}
            variant="gold"
          />
          <FinancialKpiCard
            label="Parcelas Pendentes"
            value={kpis ? String(kpis.parcelas_pendentes) : '—'}
            icon={Clock}
            variant="neutral"
          />
          <FinancialKpiCard
            label="Em Atraso (R$)"
            value={kpis ? formatCurrency(kpis.valor_em_atraso) : '—'}
            icon={AlertTriangle}
            variant="danger"
          />
          <FinancialKpiCard
            label="Inadimplência"
            value={kpis ? `${kpis.taxa_inadimplencia}%` : '—'}
            icon={TrendingDown}
            variant="danger"
          />
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 20 }}>
          {/* Mês */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B6B6B' }}>Mês</label>
            <select
              className="form-select"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              style={{ width: 100 }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleString('pt-BR', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          {/* Ano */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B6B6B' }}>Ano</label>
            <select
              className="form-select"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              style={{ width: 90 }}
            >
              {[2024, 2025, 2026, 2027].map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Status toggle */}
          <div className="toggle-group">
            {STATUS_FILTROS.map((s) => (
              <button
                key={s.value}
                className={`toggle-btn${status === s.value ? ' active' : ''}`}
                onClick={() => setStatus(s.value)}
                type="button"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Busca por aluno */}
          <SearchBar
            placeholder="Buscar por aluno…"
            onSearch={handleAlunoSearch}
            debounceMs={300}
          />
        </div>

        {/* Erro */}
        {error && <div className="alert-danger">{error}</div>}

        {/* Tabela */}
        <div className="card">
          {loading ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: '#6B6B6B', fontSize: 14 }}>
              Carregando pagamentos…
            </div>
          ) : parcelas.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: '#6B6B6B', fontSize: 14 }}>
              Nenhuma parcela encontrada para os filtros selecionados.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Parcela</th>
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
                    <td>
                      {p.id_aluno ? (
                        <Link
                          href={`/dashboard/alunos/${p.id_aluno}`}
                          style={{ color: '#1A1A1A', fontWeight: 600, textDecoration: 'none' }}
                        >
                          {p.nome_aluno || '—'}
                        </Link>
                      ) : (
                        <span style={{ fontWeight: 600 }}>{p.nome_aluno || '—'}</span>
                      )}
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                      #{p.numero_parcela}
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(p.valor_cobrado)}
                    </td>
                    <td>{formatDate(p.data_vencimento)}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/financeiro/${p.id_parcela}`}
                        style={{ color: '#8B1A2F', fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
                      >
                        Detalhes →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && !error && parcelas.length > 0 && (
          <p style={{ marginTop: 12, fontSize: 12, color: '#6B6B6B' }}>
            {parcelas.length} parcela{parcelas.length !== 1 ? 's' : ''} encontrada{parcelas.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  )
}
