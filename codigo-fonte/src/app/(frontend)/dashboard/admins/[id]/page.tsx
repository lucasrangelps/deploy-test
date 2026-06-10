'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Pencil, Trash2, Check, X } from 'lucide-react'
import { fetchWithAuth } from '@/lib/fetchWithAuth'
import { Toast, useToast } from '@/components/Toast'
import ConfirmModal from '@/components/dashboard/ConfirmModal'

type AdminDetalhe = {
  id_admin: string
  usuarios: {
    id_usuario: string
    nome_completo: string
    email: string
    criado_em: string
  }
}

export default function AdminDetalhePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { toast, showToast, hideToast } = useToast()
  const [admin, setAdmin] = useState<AdminDetalhe | null>(null)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [nomeCompleto, setNomeCompleto] = useState('')
  const [email, setEmail] = useState('')

  const carregar = useCallback(() => {
    fetchWithAuth(`/api/admin/admins/${id}`)
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data: AdminDetalhe) => {
        setAdmin(data)
        setNomeCompleto(data.usuarios.nome_completo)
        setEmail(data.usuarios.email)
      })
      .catch(() => showToast('Erro ao carregar administrador.', 'error'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { carregar() }, [carregar])

  async function handleSalvar() {
    setSalvando(true)
    try {
      const res = await fetchWithAuth(`/api/admin/admins/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_completo: nomeCompleto, email }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.erro || 'Erro ao atualizar.', 'error')
        return
      }
      showToast('Dados atualizados com sucesso.', 'success')
      setAdmin(prev => prev ? {
        ...prev,
        usuarios: { ...prev.usuarios, nome_completo: nomeCompleto, email },
      } : prev)
      setEditando(false)
    } catch {
      showToast('Erro de conexão.', 'error')
    } finally {
      setSalvando(false)
    }
  }

  function handleCancelarEdicao() {
    if (admin) {
      setNomeCompleto(admin.usuarios.nome_completo)
      setEmail(admin.usuarios.email)
    }
    setEditando(false)
  }

  async function handleExcluir() {
    setConfirmDelete(false)
    try {
      const res = await fetchWithAuth(`/api/admin/admins/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.erro || 'Erro ao excluir.', 'error')
        return
      }
      showToast('Administrador excluído.', 'success')
      setTimeout(() => router.push('/dashboard/admins'), 1000)
    } catch {
      showToast('Erro de conexão.', 'error')
    }
  }

  if (loading) return <div className="page-content"><p style={{ color: '#6B6B6B' }}>Carregando...</p></div>
  if (!admin) return <div className="page-content"><p style={{ color: '#8B1A2F' }}>Administrador não encontrado.</p></div>

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <ConfirmModal
        open={confirmDelete}
        title="Excluir administrador"
        description={`Tem certeza que deseja excluir "${admin.usuarios.nome_completo}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
        onConfirm={handleExcluir}
        onCancel={() => setConfirmDelete(false)}
      />

      <div className="page-header">
        <button
          onClick={() => router.push('/dashboard/admins')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#6B6B6B', fontSize: 13, marginBottom: 8, padding: 0 }}
        >
          <ArrowLeft size={14} /> Voltar para Administradores
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="page-title">Ficha do Administrador</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            {!editando ? (
              <>
                <button
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={() => setEditando(true)}
                >
                  <Pencil size={14} /> Editar
                </button>
                <button
                  style={{ padding: '8px 14px', fontSize: 13, background: '#EF4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 size={14} /> Excluir
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={handleCancelarEdicao}
                  disabled={salvando}
                >
                  <X size={14} /> Cancelar
                </button>
                <button
                  className="btn-primary"
                  style={{ padding: '8px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={handleSalvar}
                  disabled={salvando}
                >
                  <Check size={14} /> {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="card" style={{ maxWidth: 560 }}>

          {/* Avatar + badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#8B1A2F', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#F5F0EB', fontWeight: 700, fontSize: 24, flexShrink: 0,
            }}>
              {admin.usuarios.nome_completo.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="badge badge-wine" style={{ fontSize: 10 }}>Admin</span>
              {admin.usuarios.criado_em && (
                <p style={{ fontSize: 11, color: '#ABABAB', marginTop: 4 }}>
                  Criado em {new Date(admin.usuarios.criado_em).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>

          {/* Nome */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Nome Completo
            </label>
            {editando ? (
              <input
                type="text"
                value={nomeCompleto}
                onChange={e => setNomeCompleto(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E8E0D8', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            ) : (
              <p style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{admin.usuarios.nome_completo}</p>
            )}
          </div>

          {/* E-mail */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              E-mail
            </label>
            {editando ? (
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E8E0D8', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            ) : (
              <p style={{ fontSize: 14, color: '#1A1A1A', margin: 0 }}>{admin.usuarios.email}</p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
