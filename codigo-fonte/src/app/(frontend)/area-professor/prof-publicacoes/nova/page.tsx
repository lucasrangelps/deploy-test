'use client'

// src/app/(frontend)/area-professor/prof-publicacoes/nova/page.tsx

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useIdProfessor } from '@/hooks/useIdProfessor' // ajuste para seu hook real

const CATEGORIAS = [
  { value: 'comunicado', label: '📢 Comunicado', desc: 'Informação geral'   },
  { value: 'aviso',      label: '⚠️ Aviso',      desc: 'Urgente/importante' },
  { value: 'evento',     label: '🗓 Evento',      desc: 'Data especial'     },
  { value: 'dica',       label: '💃 Dica',        desc: 'Dica de dança'     },
]

function ProfNovaPublicacaoContent() {
  const router       = useRouter()
  const params       = useSearchParams()
  const editId       = params.get('id')
  const isEditing    = !!editId

  // ← busca o id do professor logado, igual ao useIdAluno que você já tem
  const { idProfessor, loading: loadingProf } = useIdProfessor()

  const [titulo,    setTitulo]    = useState('')
  const [conteudo,  setConteudo]  = useState('')
  const [tipo,      setTipo]      = useState('comunicado') // era "categoria"
  const [fixado,    setFixado]    = useState(false)        // era "destaque"
  const [imagemUrl, setImagemUrl] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [erro,      setErro]      = useState('')

  useEffect(() => {
    if (!editId || !idProfessor) return
    fetch(`/api/publicacoes?id_professor=${idProfessor}`)
      .then(r => r.json())
      .then(({ data }) => {
        const pub = (data ?? []).find((p: any) => p.id_publicacao === editId)
        if (!pub) return
        setTitulo(pub.titulo)
        setConteudo(pub.conteudo)
        setTipo(pub.tipo ?? 'comunicado')
        setFixado(pub.fixado ?? false)
        setImagemUrl(pub.imagem_url ?? '')
      })
  }, [editId, idProfessor])

  async function handleSubmit() {
    if (!titulo.trim() || !conteudo.trim()) {
      setErro('Título e conteúdo são obrigatórios.')
      return
    }
    if (!idProfessor) {
      setErro('Professor não identificado. Faça login novamente.')
      return
    }

    setLoading(true)
    setErro('')

    try {
      const payload = {
        id_professor: idProfessor,   // ← obrigatório na API
        titulo,
        conteudo,
        tipo,                        // era "categoria"
        fixado,                      // era "destaque"
        imagem_url: imagemUrl.trim() || null,
      }

      const res = isEditing
        ? await fetch('/api/publicacoes', {
            method:  'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ id: editId, ...payload }),
          })
        : await fetch('/api/publicacoes', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload),
          })

      const data = await res.json()
      if (!res.ok) { setErro(data.erro || 'Erro ao salvar.'); return }

      router.push('/area-professor/prof-publicacoes')

    } catch {
      setErro('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '1rem 1.25rem', maxWidth: 620 }}>

      {/* Categoria */}
      <div className="bg-white rounded-2xl border border-[#e2dbd6] mb-3" style={{ padding: '1.25rem' }}>
        <p className="text-[11px] font-semibold tracking-widest text-[#7b6f8a] uppercase mb-3">Categoria</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {CATEGORIAS.map(c => (
            <button
              key={c.value}
              onClick={() => setTipo(c.value)}
              className="text-left rounded-xl p-3 border cursor-pointer transition-all"
              style={{
                border:     `1.5px solid ${tipo === c.value ? '#7a1535' : '#e2dbd6'}`,
                background: tipo === c.value ? '#f5e8ec' : '#fff',
              }}
            >
              <div className="text-[13px] font-semibold text-[#2a1f3d]">{c.label}</div>
              <div className="text-[11px] text-[#7b6f8a] mt-0.5">{c.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Título e Conteúdo */}
      <div className="bg-white rounded-2xl border border-[#e2dbd6] mb-3" style={{ padding: '1.25rem' }}>
        <div className="mb-4">
          <label className="block text-[12px] font-semibold text-[#2a1f3d] mb-1.5">Título *</label>
          <input
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Ex: Aula especial de samba no próximo sábado"
            maxLength={300}
            className="w-full bg-[#f0ebe4] border-0 rounded-xl px-4 py-3 text-[13px] text-[#2a1f3d] placeholder:text-[#7b6f8a] outline-none focus:ring-2 focus:ring-[#7a1535]/20 transition"
          />
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-[#2a1f3d] mb-1.5">Conteúdo *</label>
          <textarea
            value={conteudo}
            onChange={e => setConteudo(e.target.value)}
            placeholder="Escreva aqui o comunicado para seus alunos..."
            rows={5}
            className="w-full bg-[#f0ebe4] border-0 rounded-xl px-4 py-3 text-[13px] text-[#2a1f3d] placeholder:text-[#7b6f8a] outline-none focus:ring-2 focus:ring-[#7a1535]/20 transition resize-none"
          />
        </div>
      </div>

      {/* Imagem URL */}
      <div className="bg-white rounded-2xl border border-[#e2dbd6] mb-3" style={{ padding: '1.25rem' }}>
        <label className="block text-[12px] font-semibold text-[#2a1f3d] mb-1.5">
          URL da imagem <span className="font-normal text-[#7b6f8a]">(opcional)</span>
        </label>
        <input
          type="text"
          value={imagemUrl}
          onChange={e => setImagemUrl(e.target.value)}
          placeholder="https://exemplo.com/imagem.jpg"
          className="w-full bg-[#f0ebe4] border-0 rounded-xl px-4 py-3 text-[13px] text-[#2a1f3d] placeholder:text-[#7b6f8a] outline-none focus:ring-2 focus:ring-[#7a1535]/20 transition"
        />
      </div>

      {/* Destaque */}
      <div className="bg-white rounded-2xl border border-[#e2dbd6] mb-4" style={{ padding: '1.25rem' }}>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setFixado(!fixado)}
            className="relative shrink-0 w-10 h-5 rounded-full transition-colors"
            style={{ background: fixado ? '#7a1535' : '#e2dbd6' }}
          >
            <span
              className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
              style={{ left: fixado ? '21px' : '3px' }}
            />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#2a1f3d]">⭐ Marcar como destaque</p>
            <p className="text-[12px] text-[#7b6f8a] mt-0.5">Aparece em primeiro no feed dos alunos</p>
          </div>
        </label>
      </div>

      {erro && <p className="text-[12px] text-red-500 mb-3">{erro}</p>}

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={loading || loadingProf}
          className="text-[13px] font-semibold text-white bg-[#7a1535] hover:bg-[#9a1a3f] transition-colors px-5 py-2.5 rounded-xl border-none cursor-pointer disabled:opacity-60"
        >
          {loading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Publicar'}
        </button>
        <button
          onClick={() => router.back()}
          className="text-[13px] font-medium text-[#7b6f8a] hover:text-[#2a1f3d] bg-transparent border border-[#e2dbd6] rounded-xl px-5 py-2.5 cursor-pointer transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default function ProfNovaPublicacaoPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ProfNovaPublicacaoContent />
    </Suspense>
  )
}