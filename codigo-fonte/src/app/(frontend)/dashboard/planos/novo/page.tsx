'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

function NovoPlanoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  const [nome, setNome] = useState('')
  const [cicloMeses, setCicloMeses] = useState('')
  const [valorBase, setValorBase] = useState('')
  const [desconto, setDesconto] = useState('0')
  const [ativo, setAtivo] = useState(true)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (editId) {
      fetch(`/api/planos/${editId}`)
        .then(res => res.json())
        .then(data => {
          setNome(data.nome || '')
          setCicloMeses(data.ciclo_meses?.toString() || '')
          setValorBase(data.valor_base?.toString() || '')
          setDesconto(data.percentual_desconto?.toString() || '0')
          setAtivo(data.ativo ?? true)
        })
    }
  }, [editId])

  const valorFinal = Number(valorBase) * (1 - Number(desconto) / 100)

  async function handleSubmit() {
    setErro('')
    if (!nome.trim() || !cicloMeses || !valorBase) {
      setErro('Nome, ciclo e valor base sao obrigatorios.')
      return
    }

    setLoading(true)
    try {
      const url = editId ? `/api/planos/${editId}` : '/api/planos'
      const method = editId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          ciclo_meses: Number(cicloMeses),
          valor_base: Number(valorBase),
          percentual_desconto: Number(desconto),
          ativo,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setErro(data.erro || 'Erro ao salvar.')
        return
      }

      router.push('/dashboard/planos')
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
          onClick={() => router.push('/dashboard/planos')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#6B6B6B', fontSize: 13, marginBottom: 8 }}
        >
          <ArrowLeft size={16} /> Voltar para Planos
        </button>
        <h1 className="page-title">{editId ? 'Editar Plano' : 'Novo Plano'}</h1>
      </div>

      <div className="page-content">
        <div className="card" style={{ maxWidth: 520 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div className="form-group">
              <label className="form-label">Nome do Plano *</label>
              <input
                className="form-input"
                placeholder="Ex: Mensal, Trimestral, Anual..."
                value={nome}
                onChange={e => setNome(e.target.value)}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Ciclo em meses *</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  placeholder="1, 3, 6, 12..."
                  value={cicloMeses}
                  onChange={e => setCicloMeses(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Valor base (R$) *</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="99.00"
                  value={valorBase}
                  onChange={e => setValorBase(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Desconto (%)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={desconto}
                  onChange={e => setDesconto(e.target.value)}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#8B1A2F', minWidth: 40 }}>
                  {desconto}%
                </span>
              </div>
            </div>

            {valorBase && (
              <div style={{
                background: '#FAF7F4', border: '1px solid #E8E0D8',
                borderRadius: 8, padding: '12px 16px',
              }}>
                <p style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 4 }}>Valor final</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#2D6A4F', fontFamily: 'Georgia, serif' }}>
                  {valorFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="toggle-group" style={{ width: 'fit-content' }}>
                <button className={`toggle-btn ${ativo ? 'active' : ''}`} onClick={() => setAtivo(true)} type="button">
                  Ativo
                </button>
                <button className={`toggle-btn ${!ativo ? 'active' : ''}`} onClick={() => setAtivo(false)} type="button">
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
              <button className="btn-secondary" onClick={() => router.push('/dashboard/planos')}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Salvando...' : editId ? 'Salvar Alteracoes' : 'Criar Plano'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NovoPlanoPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <NovoPlanoContent />
    </Suspense>
  )
}