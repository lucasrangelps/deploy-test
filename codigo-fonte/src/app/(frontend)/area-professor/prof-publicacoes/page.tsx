'use client'

// src/app/(frontend)/area-professor/prof-publicacoes/page.tsx

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useIdProfessor } from '@/hooks/useIdProfessor'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

interface Publicacao {
  id_publicacao: string
  titulo:        string
  conteudo:      string
  categoria:     string
  destaque:      boolean
  imagem_url:    string | null
  criado_em:     string
}

export default function ProfPublicacoesPage() {
  const router = useRouter()
  const { idProfessor, loading: loadingProf } = useIdProfessor()

  const [publicacoes,   setPublicacoes]   = useState<Publicacao[]>([])
  const [loading,       setLoading]       = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deletando,     setDeletando]     = useState(false)

  function carregar(id: string) {
    setLoading(true)
    fetchWithAuth(`/api/publicacoes?id_professor=${id}`)
      .then(r => r.json())
      .then(({ data }) => { setPublicacoes(data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    if (loadingProf || !idProfessor) return
    carregar(idProfessor)
  }, [idProfessor, loadingProf])

  async function handleDelete(id: string) {
    setDeletando(true)
    await fetchWithAuth(`/api/publicacoes?id=${id}`, { method: 'DELETE' })
    setDeletando(false)
    setConfirmDelete(null)
    if (idProfessor) carregar(idProfessor)
  }

  async function handleToggleDestaque(p: Publicacao) {
    await fetchWithAuth('/api/publicacoes', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id: p.id_publicacao, destaque: !p.destaque }),
    })
    if (idProfessor) carregar(idProfessor)
  }

  const CATEGORIA_EMOJI: Record<string, string> = {
    comunicado: '📢',
    aviso:      '⚠️',
    evento:     '🗓',
    dica:       '💃',
  }

  if (loading || loadingProf) {
    return (
      <div style={{ padding: '1rem 1.25rem' }}>
        <div className="flex flex-col items-center justify-center min-h-[360px]">
          <div className="w-8 h-8 rounded-full border-2 border-[#7a1535] border-t-transparent animate-spin mb-4" />
          <p className="text-[13.5px] text-[#7b6f8a]">Carregando publicações...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '1rem 1.25rem' }}>

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-[#7b6f8a]">
          {publicacoes.length} publicação(ões)
        </p>
        <button
          onClick={() => router.push('/area-professor/prof-publicacoes/nova')}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#7a1535] hover:bg-[#9a1a3f] transition-colors px-4 py-2 rounded-xl border-none cursor-pointer"
        >
          + Nova publicação
        </button>
      </div>

      {publicacoes.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <p className="text-[13.5px] text-[#7b6f8a] mb-4">
            Você ainda não criou nenhuma publicação.
          </p>
          <button
            onClick={() => router.push('/area-professor/prof-publicacoes/nova')}
            className="text-[13px] font-semibold text-white bg-[#7a1535] hover:bg-[#9a1a3f] transition-colors px-5 py-2.5 rounded-xl border-none cursor-pointer"
          >
            Criar primeira publicação
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {publicacoes.map(p => (
            <div
              key={p.id_publicacao}
              className="bg-white rounded-2xl border border-[#e2dbd6]"
              style={{ padding: '1.25rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>

                {/* Ícone */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px] shrink-0 bg-[#f5e8ec]">
                  {CATEGORIA_EMOJI[p.categoria] ?? '📢'}
                </div>

                {/* Conteúdo */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span className="font-['Playfair_Display'] text-[16px] font-semibold text-[#2a1f3d]">
                      {p.titulo}
                    </span>
                    {p.destaque && (
                      <span className="text-[11px] font-medium rounded-full px-2.5 py-0.5 bg-[#fef3c7] text-[#92400e]">
                        ⭐ Destaque
                      </span>
                    )}
                    <span className="text-[11px] font-medium rounded-full px-2.5 py-0.5 bg-[#ede9fe] text-[#6d28d9]">
                      {p.categoria}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#7b6f8a] leading-relaxed line-clamp-2 mb-2">
                    {p.conteudo}
                  </p>
                  <p className="text-[12px] text-[#7b6f8a]">
                    {new Date(p.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Ações */}
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button
                    onClick={() => handleToggleDestaque(p)}
                    title={p.destaque ? 'Remover destaque' : 'Destacar'}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[15px] bg-[#f0ebe4] hover:bg-[#e2dbd6] transition-colors border-none cursor-pointer"
                  >
                    {p.destaque ? '⭐' : '☆'}
                  </button>
                  <button
                    onClick={() => router.push(`/area-professor/prof-publicacoes/nova?id=${p.id_publicacao}`)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[15px] bg-[#f0ebe4] hover:bg-[#e2dbd6] transition-colors border-none cursor-pointer"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setConfirmDelete(p.id_publicacao)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[15px] bg-[#f0ebe4] hover:bg-[#fce8ec] transition-colors border-none cursor-pointer"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Confirm delete */}
              {confirmDelete === p.id_publicacao && (
                <div className="mt-3 pt-3 border-t border-[#e2dbd6] flex items-center gap-3">
                  <p className="text-[13px] text-[#7b6f8a] flex-1">Deletar esta publicação?</p>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="text-[12px] font-medium text-[#7b6f8a] hover:text-[#2a1f3d] bg-transparent border border-[#e2dbd6] rounded-lg px-3 py-1.5 cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id_publicacao)}
                    disabled={deletando}
                    className="text-[12px] font-semibold text-white bg-[#7a1535] hover:bg-[#9a1a3f] rounded-lg px-3 py-1.5 border-none cursor-pointer transition-colors disabled:opacity-60"
                  >
                    {deletando ? 'Deletando...' : 'Deletar'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}