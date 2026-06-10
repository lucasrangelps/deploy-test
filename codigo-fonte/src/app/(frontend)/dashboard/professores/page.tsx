'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, GraduationCap, Eye } from 'lucide-react'

type Professor = {
  id_professor: string
  especialidades: string | null
  telefone: string | null
  bio: string | null
  foto_url: string | null
  ativo: boolean
  usuarios: { id_usuario: string; nome_completo: string; email: string }
  total_turmas_ativas: number
}

export default function ProfessoresPage() {
  const router = useRouter()
  const [professores, setProfessores] = useState<Professor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/professores')
      .then(res => res.json())
      .then(data => setProfessores(data))
      .catch(err => console.error('[PROFESSORES]', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="page-header">
        <p className="page-label">Gestao</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="page-title">Professores</h1>
          <button className="btn-primary" onClick={() => router.push('/dashboard/professores/novo')}>
            <Plus size={16} /> Novo Professor
          </button>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <p style={{ color: '#6B6B6B' }}>Carregando...</p>
        ) : professores.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <GraduationCap size={40} color="#E8E0D8" style={{ marginBottom: 12 }} />
            <p style={{ color: '#6B6B6B', fontSize: 14 }}>Nenhum professor cadastrado.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {professores.map(prof => (
              <div key={prof.id_professor} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: '#8B1A2F', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#F5F0EB',
                    fontWeight: 700, fontSize: 18, flexShrink: 0,
                  }}>
                    {prof.usuarios?.nome_completo?.charAt(0).toUpperCase() || 'P'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A' }}>
                      {prof.usuarios?.nome_completo}
                    </p>
                    <p style={{ fontSize: 11, color: '#6B6B6B' }}>
                      {prof.usuarios?.email}
                    </p>
                  </div>
                  <span className={`badge ${prof.ativo ? 'badge-green' : 'badge-gray'}`}>
                    {prof.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Especialidades */}
                {prof.especialidades && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                    {prof.especialidades.split(',').map((esp, i) => (
                      <span key={i} className="badge badge-wine" style={{ fontSize: 10 }}>
                        {esp.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#6B6B6B' }}>
                    {prof.total_turmas_ativas} turma{prof.total_turmas_ativas !== 1 ? 's' : ''} ativa{prof.total_turmas_ativas !== 1 ? 's' : ''}
                  </span>
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => router.push(`/dashboard/professores/${prof.id_professor}`)}
                  >
                    <Eye size={13} /> Ver Ficha
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