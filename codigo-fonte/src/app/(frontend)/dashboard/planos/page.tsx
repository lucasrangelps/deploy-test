'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil } from 'lucide-react'

type Plano = {
  id_plano: string
  nome: string
  ciclo_meses: number
  valor_base: number
  percentual_desconto: number
  valor_final: number
  ativo: boolean
}

export default function PlanosPage() {
  const router = useRouter()
  const [planos, setPlanos] = useState<Plano[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/planos')
      .then(res => res.json())
      .then(data => setPlanos(data))
      .catch(err => console.error('[PLANOS]', err))
      .finally(() => setLoading(false))
  }, [])

  async function toggleAtivo(plano: Plano) {
    const res = await fetch(`/api/planos/${plano.id_plano}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !plano.ativo }),
    })
    if (res.ok) {
      setPlanos(prev =>
        prev.map(p => p.id_plano === plano.id_plano ? { ...p, ativo: !p.ativo } : p)
      )
    }
  }

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div>
      <div className="page-header">
        <p className="page-label">Gestao</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="page-title">Planos & Valores</h1>
          <button className="btn-primary" onClick={() => router.push('/dashboard/planos/novo')}>
            <Plus size={16} /> Novo Plano
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="card">
          {loading ? (
            <p style={{ color: '#6B6B6B', padding: 20 }}>Carregando...</p>
          ) : planos.length === 0 ? (
            <p style={{ color: '#6B6B6B', padding: 20 }}>Nenhum plano cadastrado.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Ciclo</th>
                    <th>Valor Base</th>
                    <th>Desconto</th>
                    <th>Valor Final</th>
                    <th>Status</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {planos.map(plano => (
                    <tr key={plano.id_plano}>
                      <td style={{ fontWeight: 600 }}>{plano.nome}</td>
                      <td style={{ color: '#6B6B6B' }}>
                        {plano.ciclo_meses} {plano.ciclo_meses === 1 ? 'mes' : 'meses'}
                      </td>
                      <td>{formatCurrency(plano.valor_base)}</td>
                      <td>
                        {plano.percentual_desconto > 0 ? (
                          <span className="badge badge-gold">{plano.percentual_desconto}%</span>
                        ) : (
                          <span style={{ color: '#6B6B6B', fontSize: 12 }}>-</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, color: '#2D6A4F' }}>
                        {formatCurrency(plano.valor_final)}
                      </td>
                      <td>
                        <button
                          onClick={() => toggleAtivo(plano)}
                          className={`badge ${plano.ativo ? 'badge-green' : 'badge-gray'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                        >
                          {plano.ativo ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td>
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B' }}
                          onClick={() => router.push(`/dashboard/planos/novo?id=${plano.id_plano}`)}
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                      </td>
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