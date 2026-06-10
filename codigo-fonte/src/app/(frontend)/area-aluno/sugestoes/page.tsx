'use client'

// src/app/(frontend)/area-aluno/sugestoes/page.tsx

import { useState, useEffect, useCallback } from 'react'
import { useIdAluno } from '@/hooks/useIdAluno'

const CATEGORIAS = [
  { value: 'sugestao', label: '💡 Sugestão' },
  { value: 'elogio',   label: '🌟 Elogio'   },
  { value: 'critica',  label: '⚠️ Crítica'  },
  { value: 'duvida',   label: '❓ Dúvida'   },
  { value: 'outro',    label: '📌 Outro'    },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  aberto:     { label: 'Pendente',   color: '#6B6B6B', bg: '#F0EDE8' },
  em_analise: { label: 'Em análise', color: '#92400e', bg: '#fef3c7' },
  resolvido:  { label: 'Respondida', color: '#1A7340', bg: '#DCFAE6' },
}

interface Sugestao {
  id_sugestao: string
  assunto:     string
  mensagem:    string
  categoria:   string
  status:      string
  resposta:    string | null
  criado_em:   string
}

export default function SugestoesPage() {
  const { idAluno, loading: loadingAluno } = useIdAluno()

  const [sugestoes,   setSugestoes]   = useState<Sugestao[]>([])
  const [loading,     setLoading]     = useState(true)
  const [atualizando, setAtualizando] = useState(false)
  const [categoria,   setCategoria]   = useState('sugestao')
  const [assunto,     setAssunto]     = useState('')
  const [mensagem,    setMensagem]    = useState('')
  const [enviando,    setEnviando]    = useState(false)
  const [enviado,     setEnviado]     = useState(false)
  const [erro,        setErro]        = useState('')

  const carregar = useCallback((id: string, silencioso = false) => {
    if (!silencioso) setLoading(true)
    else setAtualizando(true)

    fetch(`/api/sugestoes?id_aluno=${id}`)
      .then(r => r.json())
      .then(({ data }) => setSugestoes(data ?? []))
      .catch(() => {})
      .finally(() => { setLoading(false); setAtualizando(false) })
  }, [])

  useEffect(() => {
    if (loadingAluno) return
    if (!idAluno) { setLoading(false); return }

    carregar(idAluno)

    // Polling a cada 30s para capturar respostas do admin
    const intervalo = setInterval(() => carregar(idAluno, true), 30_000)
    return () => clearInterval(intervalo)
  }, [idAluno, loadingAluno, carregar])

  const enviadas    = sugestoes.length
  const respondidas = sugestoes.filter(s => s.status === 'resolvido').length
  const pendentes   = sugestoes.filter(s => s.status !== 'resolvido').length

  async function handleEnviar() {
    if (!idAluno) return
    if (!assunto.trim() || !mensagem.trim()) { setErro('Preencha o assunto e a mensagem.'); return }

    setEnviando(true); setErro('')
    try {
      const res = await fetch('/api/sugestoes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id_aluno: idAluno, assunto, mensagem, categoria }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.erro || 'Erro ao enviar.'); return }

      setAssunto(''); setMensagem(''); setCategoria('sugestao')
      setEnviado(true)
      setTimeout(() => setEnviado(false), 3000)
      carregar(idAluno)
    } catch {
      setErro('Erro de conexão.')
    } finally {
      setEnviando(false)
    }
  }

  const card  = { background: '#fff', borderRadius: 12, border: '1px solid #E8E0D8', padding: 24 }
  const lbl   = { fontSize: 10, fontWeight: 600 as const, letterSpacing: '1px', textTransform: 'uppercase' as const, color: '#C9A96E', marginBottom: 8, display: 'block' as const }
  const input = { width: '100%', padding: '9px 12px', border: '1.5px solid #E8E0D8', borderRadius: 8, fontSize: 13, color: '#1A1A1A', background: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const, transition: 'border-color 0.15s' }

  return (
    <>
      <div style={{ padding: '28px 32px 0', marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 4 }}>
          Área do Aluno
        </p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1A1A1A' }}>
          Caixa de Sugestões
        </h1>
      </div>

      <div style={{ padding: '0 32px 32px' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'ENVIADAS',    valor: enviadas,    color: '#8B1A2F' },
            { label: 'RESPONDIDAS', valor: respondidas, color: '#1A7340' },
            { label: 'PENDENTES',   valor: pendentes,   color: '#6B6B6B' },
          ].map(k => (
            <div key={k.label} style={{ ...card, textAlign: 'center', padding: 20 }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 700, color: k.color }}>{k.valor}</p>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#6B6B6B', marginTop: 4 }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* Formulário */}
        <div style={{ ...card, marginBottom: 20 }}>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
            💡 Nova Mensagem
          </p>
          <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 20, lineHeight: 1.6 }}>
            Tem alguma sugestão, elogio, crítica ou dúvida? Mande sua mensagem para a Isabel — ela responde por aqui! 💬
          </p>

          <span style={lbl}>Categoria</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {CATEGORIAS.map(c => (
              <button
                key={c.value}
                onClick={() => setCategoria(c.value)}
                style={{
                  padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: categoria === c.value ? '#8B1A2F' : 'transparent',
                  color:      categoria === c.value ? '#fff'    : '#8B1A2F',
                  border: '1.5px solid #8B1A2F',
                }}
              >
                {c.label.toUpperCase()}
              </button>
            ))}
          </div>

          <span style={lbl}>Assunto</span>
          <input
            type="text"
            value={assunto}
            onChange={e => setAssunto(e.target.value)}
            placeholder="Ex: Horário das aulas, nova modalidade..."
            style={{ ...input, marginBottom: 16 }}
            onFocus={e => e.currentTarget.style.borderColor = '#8B1A2F'}
            onBlur={e  => e.currentTarget.style.borderColor = '#E8E0D8'}
          />

          <span style={lbl}>Mensagem *</span>
          <textarea
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            placeholder="Escreva aqui sua mensagem..."
            rows={4}
            style={{ ...input, resize: 'vertical', marginBottom: 16 }}
            onFocus={e => e.currentTarget.style.borderColor = '#8B1A2F'}
            onBlur={e  => e.currentTarget.style.borderColor = '#E8E0D8'}
          />

          {erro    && <p style={{ fontSize: 11, color: '#8B1A2F', marginBottom: 12 }}>{erro}</p>}
          {enviado && <p style={{ fontSize: 11, color: '#1A7340', fontWeight: 600, marginBottom: 12 }}>✅ Mensagem enviada com sucesso!</p>}

          <button
            onClick={handleEnviar}
            disabled={enviando || loadingAluno}
            style={{
              background: '#8B1A2F', color: '#fff', border: 'none', borderRadius: 8,
              padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              opacity: (enviando || loadingAluno) ? 0.6 : 1, transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#B5283D'}
            onMouseLeave={e => e.currentTarget.style.background = '#8B1A2F'}
          >
            {enviando ? 'Enviando...' : '📨 Enviar Mensagem'}
          </button>
        </div>

        {/* Lista de mensagens */}
        {!loading && !loadingAluno && sugestoes.length > 0 && (
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>
                Minhas Mensagens
              </p>
              <button
                onClick={() => idAluno && carregar(idAluno, true)}
                disabled={atualizando}
                style={{
                  fontSize: 11, fontWeight: 600, color: '#8B1A2F',
                  background: 'none', border: 'none', cursor: 'pointer',
                  opacity: atualizando ? 0.5 : 1,
                }}
              >
                {atualizando ? 'Atualizando...' : '↻ Atualizar'}
              </button>
            </div>

            {sugestoes.map((s, i) => {
              const sc = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.aberto
              return (
                <div
                  key={s.id_sugestao}
                  style={{
                    padding: '14px 0',
                    borderBottom: i < sugestoes.length - 1 ? '1px solid #F0EDE8' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
                    <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: 13 }}>{s.assunto}</p>
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: sc.color, background: sc.bg,
                      padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap',
                    }}>
                      {sc.label}
                    </span>
                  </div>

                  <p style={{ color: '#6B6B6B', fontSize: 13, lineHeight: 1.6 }}>{s.mensagem}</p>

                  {/* Resposta do admin */}
                  {s.resposta && (
                    <div style={{ marginTop: 10, padding: '10px 14px', background: '#F0EDE8', borderRadius: 8, borderLeft: '3px solid #C9A96E' }}>
                      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 4 }}>
                        Resposta
                      </p>
                      <p style={{ color: '#1A1A1A', fontSize: 13, lineHeight: 1.6 }}>{s.resposta}</p>
                    </div>
                  )}

                  <p style={{ color: '#6B6B6B', fontSize: 11, marginTop: 8 }}>
                    {new Date(s.criado_em).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        {/* Estado vazio */}
        {!loading && !loadingAluno && sugestoes.length === 0 && (
          <div style={{ ...card, textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>💬</p>
            <p style={{ fontWeight: 600, color: '#1A1A1A', fontSize: 14, marginBottom: 6 }}>Nenhuma mensagem ainda</p>
            <p style={{ color: '#6B6B6B', fontSize: 13 }}>Envie sua primeira sugestão ou dúvida acima!</p>
          </div>
        )}

      </div>
    </>
  )
}