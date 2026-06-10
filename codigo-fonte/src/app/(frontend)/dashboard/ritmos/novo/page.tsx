'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function NovoRitmoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  // Se veio id, carrega dados para edicao
  useEffect(() => {
    if (editId) {
      fetch(`/api/ritmos/${editId}`)
        .then(res => res.json())
        .then(data => {
          setNome(data.nome || '')
          setDescricao(data.descricao || '')
          setAtivo(data.ativo ?? true)
        })
    }
  }, [editId])

  async function handleSubmit() {
    setErro('')
    if (!nome.trim()) {
      setErro('Nome do ritmo e obrigatorio.')
      return
    }

    setLoading(true)
    try {
      const url = editId ? `/api/ritmos/${editId}` : '/api/ritmos'
      const method = editId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim(), descricao: descricao.trim(), ativo }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.erro || 'Erro ao salvar.')
        return
      }

      router.push('/dashboard/ritmos')
    } catch {
      setErro('Erro de conexao.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <button
          onClick={() => router.push('/dashboard/ritmos')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#6B6B6B', fontSize: 13, marginBottom: 8 }}
        >
          <ArrowLeft size={16} /> Voltar para Ritmos
        </button>
        <h1 className="page-title">{editId ? 'Editar Ritmo' : 'Novo Ritmo'}</h1>
      </div>

      <div className="page-content">
        <div className="card" style={{ maxWidth: 560 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div className="form-group">
              <label className="form-label">Nome do Ritmo *</label>
              <input
                className="form-input"
                placeholder="Ex: Forro, Samba, Valsa..."
                value={nome}
                onChange={e => setNome(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descricao</label>
              <textarea
                className="form-textarea"
                placeholder="Breve descricao do ritmo..."
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="toggle-group" style={{ width: 'fit-content' }}>
                <button
                  className={`toggle-btn ${ativo ? 'active' : ''}`}
                  onClick={() => setAtivo(true)}
                  type="button"
                >
                  Ativo
                </button>
                <button
                  className={`toggle-btn ${!ativo ? 'active' : ''}`}
                  onClick={() => setAtivo(false)}
                  type="button"
                >
                  Inativo
                </button>
              </div>
            </div>

            {erro && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px' }}>
                <p className="form-error">{erro}</p>
              </div>
            )}

            <div className="form-actions">
              <button className="btn-secondary" onClick={() => router.push('/dashboard/ritmos')}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Salvando...' : editId ? 'Salvar Alteracoes' : 'Salvar Ritmo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}