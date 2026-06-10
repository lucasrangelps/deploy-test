'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ShieldCheck, Eye } from 'lucide-react'
import { fetchWithAuth } from '@/lib/fetchWithAuth'
import { Toast, useToast } from '@/components/Toast'

type Admin = {
  id_admin: string
  usuarios: {
    id_usuario: string
    nome_completo: string
    email: string
    criado_em: string
  }
}

export default function AdminsPage() {
  const router = useRouter()
  const { toast, showToast, hideToast } = useToast()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWithAuth('/api/admin/admins')
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar administradores')
        return res.json()
      })
      .then(data => setAdmins(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('[ADMINS]', err)
        showToast('Erro ao carregar administradores.', 'error')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <div className="page-header">
        <p className="page-label">Gestão</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="page-title">Administradores</h1>
          <button
            className="btn-primary"
            onClick={() => router.push('/dashboard/admins/novo')}
          >
            <Plus size={16} /> Novo Admin
          </button>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <p style={{ color: '#6B6B6B' }}>Carregando...</p>
        ) : admins.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <ShieldCheck size={40} color="#E8E0D8" style={{ marginBottom: 12 }} />
            <p style={{ color: '#6B6B6B', fontSize: 14 }}>Nenhum administrador cadastrado.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {admins.map(admin => (
              <div key={admin.id_admin} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: '#8B1A2F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#F5F0EB',
                    fontWeight: 700,
                    fontSize: 18,
                    flexShrink: 0,
                  }}>
                    {admin.usuarios?.nome_completo?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A', margin: 0 }}>
                      {admin.usuarios?.nome_completo}
                    </p>
                    <p style={{ fontSize: 11, color: '#6B6B6B', margin: '2px 0 0' }}>
                      {admin.usuarios?.email}
                    </p>
                  </div>
                  <span className="badge badge-wine" style={{ fontSize: 10 }}>
                    Admin
                  </span>
                </div>
                {admin.usuarios?.criado_em && (
                  <p style={{ fontSize: 11, color: '#ABABAB', marginTop: 12 }}>
                    Criado em{' '}
                    {new Date(admin.usuarios.criado_em).toLocaleDateString('pt-BR')}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => router.push(`/dashboard/admins/${admin.id_admin}`)}
                  >
                    <Eye size={13} /> Ver / Editar
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
