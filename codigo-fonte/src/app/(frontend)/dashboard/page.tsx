'use client'

import { useEffect, useState } from 'react'
import { Users, DollarSign, BookOpen, Target, TrendingUp, TrendingDown } from 'lucide-react'

type DashboardData = {
  kpis: {
    total_alunos: number
    receita_mensal: number
    turmas_ativas: number
    total_leads: number
  }
  ultimas_matriculas: Array<{
    id_matricula: string
    status: string
    alunos: { id_aluno: string; usuarios: { nome_completo: string } }
    turmas: { nome: string }
  }>
  aulas_hoje: Array<{
    id_aula: string
    hora_inicio: string
    hora_fim: string
    turmas: {
      nome: string
      ritmos: { nome: string }
      professores: { usuarios: { nome_completo: string } }
    }
  }>
}

export default function DashboardPage() {
  const [dados, setDados] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setDados(data))
      .catch(err => console.error('[DASHBOARD]', err))
      .finally(() => setLoading(false))
  }, [])

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const kpis = [
    {
      label: 'Total de Alunos',
      value: dados?.kpis.total_alunos?.toString() || '0',
      icon: Users,
      color: '#8B1A2F',
      bg: 'rgba(139,26,47,0.08)',
    },
    {
      label: 'Receita Mensal',
      value: `R$ ${(dados?.kpis.receita_mensal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: '#C9A96E',
      bg: 'rgba(201,169,110,0.1)',
    },
    {
      label: 'Turmas Ativas',
      value: dados?.kpis.turmas_ativas?.toString() || '0',
      icon: BookOpen,
      color: '#2D6A4F',
      bg: 'rgba(45,106,79,0.08)',
    },
    {
      label: 'Leads Captados',
      value: dados?.kpis.total_leads?.toString() || '0',
      icon: Target,
      color: '#6B5B95',
      bg: 'rgba(107,91,149,0.08)',
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <p className="page-label">Visao Geral</p>
        <h1 className="page-title">Bom dia, Admin</h1>
        <p className="page-subtitle">{hoje}</p>
      </div>

      <div className="page-content">

        {/* KPIs */}
        <div className="kpi-grid">
          {kpis.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card kpi-card">
              <div className="kpi-icon" style={{ background: bg }}>
                <Icon size={18} color={color} />
              </div>
              <div className="kpi-value">
                {loading ? '...' : value}
              </div>
              <div className="kpi-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Grid 2 colunas */}
        <div className="dashboard-grid">

          {/* Proximas aulas do dia */}
          <div className="card">
            <div className="card-header">
              <div>
                <p className="card-label">Hoje</p>
                <h2 className="card-title">Proximas Aulas</h2>
              </div>
              <a href="/dashboard/agenda" className="card-link">Ver agenda &rarr;</a>
            </div>

            <div className="aulas-list">
              {loading ? (
                <p style={{ fontSize: 13, color: '#6B6B6B', padding: '12px 0' }}>Carregando...</p>
              ) : dados?.aulas_hoje && dados.aulas_hoje.length > 0 ? (
                dados.aulas_hoje.map((aula, i) => (
                  <div key={i} className="aula-item">
                    <div className="aula-hora">{aula.hora_inicio}</div>
                    <div className="aula-info">
                      <p className="aula-turma">{aula.turmas?.nome}</p>
                      <p className="aula-professor">
                        {aula.turmas?.professores?.usuarios?.nome_completo || 'Sem professor'}
                      </p>
                    </div>
                    <span className="badge badge-wine">
                      {aula.turmas?.ritmos?.nome}
                    </span>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: 13, color: '#6B6B6B', padding: '12px 0' }}>
                  Nenhuma aula agendada para hoje.
                </p>
              )}
            </div>
          </div>

          {/* Resumo rapido */}
          <div className="card">
            <div className="card-header">
              <div>
                <p className="card-label">Resumo</p>
                <h2 className="card-title">Indicadores</h2>
              </div>
            </div>

            <div className="aulas-list">
              <div className="aula-item">
                <div className="aula-info">
                  <p className="aula-turma">Alunos cadastrados</p>
                  <p className="aula-professor">Total no sistema</p>
                </div>
                <span className="badge badge-green">
                  {loading ? '...' : dados?.kpis.total_alunos}
                </span>
              </div>
              <div className="aula-item">
                <div className="aula-info">
                  <p className="aula-turma">Turmas ativas</p>
                  <p className="aula-professor">Em funcionamento</p>
                </div>
                <span className="badge badge-blue">
                  {loading ? '...' : dados?.kpis.turmas_ativas}
                </span>
              </div>
              <div className="aula-item">
                <div className="aula-info">
                  <p className="aula-turma">Leads captados</p>
                  <p className="aula-professor">Potenciais alunos</p>
                </div>
                <span className="badge badge-gold">
                  {loading ? '...' : dados?.kpis.total_leads}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ultimas matriculas */}
        <div className="card">
          <div className="card-header">
            <div>
              <p className="card-label">Recentes</p>
              <h2 className="card-title">Ultimas Matriculas</h2>
            </div>
            <a href="/dashboard/turmas" className="card-link">Ver todas &rarr;</a>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Turma</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} style={{ color: '#6B6B6B' }}>Carregando...</td>
                  </tr>
                ) : dados?.ultimas_matriculas && dados.ultimas_matriculas.length > 0 ? (
                  dados.ultimas_matriculas.map((m) => (
                    <tr key={m.id_matricula}>
                      <td style={{ fontWeight: 600 }}>
                        {m.alunos?.usuarios?.nome_completo || '-'}
                      </td>
                      <td style={{ color: '#6B6B6B' }}>
                        {m.turmas?.nome || '-'}
                      </td>
                      <td>
                        <span className={`badge ${m.status === 'ativo' || m.status === 'ativa' ? 'badge-green' : 'badge-gray'}`}>
                          {m.status === 'ativo' || m.status === 'ativa' ? 'Ativo' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ color: '#6B6B6B' }}>Nenhuma matricula encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}