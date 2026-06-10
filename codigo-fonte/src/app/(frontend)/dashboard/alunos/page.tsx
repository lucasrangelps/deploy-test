'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import PageHeader from '@/components/dashboard/PageHeader'
import SearchBar from '@/components/dashboard/SearchBar'
import StatusBadge from '@/components/dashboard/StatusBadge'

interface AlunoListItem {
  id_aluno: string
  nome_completo: string
  email: string
  cpf: string | null
  telefone: string | null
  status_financeiro: 'em_dia' | 'inadimplente'
  turmas_ativas: number
  criado_em: string
}

function maskCpf(cpf: string | null): string {
  if (!cpf) return '—'
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return cpf
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<AlunoListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const fetchAlunos = useCallback(async (term: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = term ? `?search=${encodeURIComponent(term)}` : ''
      const res = await fetch(`/api/alunos${params}`)
      if (!res.ok) throw new Error('Falha ao carregar alunos.')
      const data: AlunoListItem[] = await res.json()
      setAlunos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = useCallback(
    (term: string) => {
      setSearch(term)
      fetchAlunos(term)
    },
    [fetchAlunos],
  )

  useEffect(() => {
    fetchAlunos('')
  }, [fetchAlunos])

  return (
    <div>
      <PageHeader
        label="Gestão"
        title="Alunos"
        subtitle="Gerencie as fichas e situação financeira dos alunos."
        action={{ label: 'Nova Matrícula', href: '/dashboard/alunos/novo', icon: UserPlus }}
      />

      <div className="page-content">
        {/* Barra de busca */}
        <div style={{ marginBottom: 20 }}>
          <SearchBar placeholder="Buscar por nome, CPF ou e-mail…" onSearch={handleSearch} />
        </div>

        {/* Erro */}
        {error && (
          <div className="alert-danger" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* Tabela */}
        <div className="card">
          {loading ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: '#6B6B6B', fontSize: 14 }}>
              Carregando alunos…
            </div>
          ) : alunos.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: '#6B6B6B', fontSize: 14 }}>
              {search ? 'Nenhum aluno encontrado para a busca.' : 'Nenhum aluno cadastrado ainda.'}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>CPF</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>Status</th>
                  <th>Turmas</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((aluno) => (
                  <tr
                    key={aluno.id_aluno}
                    style={aluno.status_financeiro === 'inadimplente' ? { background: '#FFF5F5' } : undefined}
                  >
                    <td style={{ fontWeight: 600 }}>{aluno.nome_completo}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{maskCpf(aluno.cpf)}</td>
                    <td style={{ color: '#6B6B6B' }}>{aluno.email}</td>
                    <td>{aluno.telefone ?? '—'}</td>
                    <td>
                      <StatusBadge status={aluno.status_financeiro} />
                    </td>
                    <td style={{ textAlign: 'center' }}>{aluno.turmas_ativas}</td>
                    <td>
                      <Link
                        href={`/dashboard/alunos/${aluno.id_aluno}`}
                        style={{ color: '#8B1A2F', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', textDecoration: 'none' }}
                      >
                        Ver ficha →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Total */}
        {!loading && !error && alunos.length > 0 && (
          <p style={{ marginTop: 12, fontSize: 12, color: '#6B6B6B' }}>
            {alunos.length} aluno{alunos.length !== 1 ? 's' : ''} encontrado{alunos.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  )
}
