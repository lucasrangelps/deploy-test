'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Music2, Pencil, Power } from 'lucide-react'

type Ritmo = {
  id_ritmo: string
  nome: string
  descricao: string | null
  imagem_url: string | null
  ativo: boolean
}

export default function RitmosPage() {
  const router = useRouter()
  const [ritmos, setRitmos] = useState<Ritmo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/ritmos')
      .then(res => res.json())
      .then(data => setRitmos(data))
      .catch(err => console.error('[RITMOS]', err))
      .finally(() => setLoading(false))
  }, [])

  async function toggleAtivo(ritmo: Ritmo) {
    const res = await fetch(`/api/ritmos/${ritmo.id_ritmo}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !ritmo.ativo }),
    })
    if (res.ok) {
      setRitmos(prev =>
        prev.map(r => r.id_ritmo === ritmo.id_ritmo ? { ...r, ativo: !r.ativo } : r)
      )
    }
  }

  return (
    <div>
      <div className="page-header">
        <p className="page-label">Gestao</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="page-title">Ritmos de Danca</h1>
          <button className="btn-primary" onClick={() => router.push('/dashboard/ritmos/novo')}>
            <Plus size={16} /> Novo Ritmo
          </button>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <p style={{ color: '#6B6B6B' }}>Carregando...</p>
        ) : ritmos.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <Music2 size={40} color="#E8E0D8" style={{ marginBottom: 12 }} />
            <p style={{ color: '#6B6B6B', fontSize: 14 }}>Nenhum ritmo cadastrado.</p>
            <button
              className="btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => router.push('/dashboard/ritmos/novo')}
            >
              <Plus size={16} /> Cadastrar Primeiro Ritmo
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {ritmos.map(ritmo => (
              <div key={ritmo.id_ritmo} className="card" style={{ transition: 'box-shadow 0.2s', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: 'rgba(139,26,47,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Music2 size={20} color="#8B1A2F" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A' }}>{ritmo.nome}</p>
                  </div>
                  <span className={`badge ${ritmo.ativo ? 'badge-green' : 'badge-gray'}`}>
                    {ritmo.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {ritmo.descricao && (
                  <p style={{ fontSize: 12, color: '#6B6B6B', lineHeight: 1.5, marginBottom: 14 }}>
                    {ritmo.descricao.length > 100 ? ritmo.descricao.slice(0, 100) + '...' : ritmo.descricao}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn-secondary"
                    style={{ flex: 1, justifyContent: 'center', padding: '7px 12px', fontSize: 12 }}
                    onClick={() => router.push(`/dashboard/ritmos/novo?id=${ritmo.id_ritmo}`)}
                  >
                    <Pencil size={13} /> Editar
                  </button>
                  <button
                    className="btn-secondary"
                    style={{
                      justifyContent: 'center', padding: '7px 12px', fontSize: 12,
                      color: ritmo.ativo ? '#6B6B6B' : '#1A7340',
                      borderColor: ritmo.ativo ? '#E8E0D8' : '#1A7340',
                    }}
                    onClick={() => toggleAtivo(ritmo)}
                  >
                    <Power size={13} />
                    {ritmo.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}