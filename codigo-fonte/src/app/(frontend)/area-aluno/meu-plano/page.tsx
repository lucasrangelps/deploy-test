'use client'

import { useState, useEffect } from 'react'
import { useIdAluno } from '@/hooks/useIdAluno'
import { fetchWithAuth } from '@/lib/fetchWithAuth'
import { CheckCircle, Layers } from 'lucide-react'

interface Plano {
  id_plano: string
  nome: string
  ciclo_meses: number
  valor_base: number
  percentual_desconto: number
  valor_final: number
  ativo?: boolean
}

interface PlanoAtualResponse {
  plano_atual: Plano | null
  id_contrato: string | null
  parcelas_pendentes: number
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarCiclo(meses: number) {
  if (meses === 1) return 'Mensal'
  if (meses === 3) return 'Trimestral'
  if (meses === 6) return 'Semestral'
  if (meses === 12) return 'Anual'
  return `${meses} meses`
}

export default function MeuPlanoPage() {
  const { idAluno, loading: loadingAluno } = useIdAluno()
  const [planoAtual, setPlanoAtual] = useState<Plano | null>(null)
  const [todosPlanos, setTodosPlanos] = useState<Plano[]>([])
  const [parcelasPendentes, setParcelasPendentes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [migrando, setMigrando] = useState(false)
  const [planoParaMigrar, setPlanoParaMigrar] = useState<Plano | null>(null)

  useEffect(() => {
    if (loadingAluno) return
    if (!idAluno) { setLoading(false); return }

    Promise.all([
      fetchWithAuth(`/api/area-aluno/meu-plano?id_aluno=${idAluno}`).then(r => r.json()),
      fetchWithAuth('/api/planos').then(r => r.json()),
    ])
      .then(([planoRes, planosRes]: [PlanoAtualResponse, Plano[]]) => {
        setPlanoAtual(planoRes.plano_atual)
        setParcelasPendentes(planoRes.parcelas_pendentes ?? 0)
        setTodosPlanos(Array.isArray(planosRes) ? planosRes.filter(p => p.ativo !== false) : [])
        setLoading(false)
      })
      .catch(err => {
        console.error('[meu-plano]', err)
        setErro('Erro ao carregar informações do plano.')
        setLoading(false)
      })
  }, [idAluno, loadingAluno])

  function migracaoBloqueada(planoDestino: Plano) {
    return planoDestino.ciclo_meses < (planoAtual?.ciclo_meses ?? 0) && parcelasPendentes > 0
  }

  async function confirmarMigracao() {
    if (!idAluno || !planoParaMigrar) return
    setMigrando(true)
    setErro('')
    setSucesso('')
    try {
      const res = await fetchWithAuth('/api/area-aluno/meu-plano', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_aluno: idAluno, id_plano: planoParaMigrar.id_plano }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.erro ?? 'Erro ao migrar plano.')
      } else {
        setPlanoAtual(planoParaMigrar)
        setParcelasPendentes(data.parcelas_geradas ?? planoParaMigrar.ciclo_meses)
        const n = data.parcelas_geradas ?? planoParaMigrar.ciclo_meses
        setSucesso(`Migração para o plano "${planoParaMigrar.nome}" realizada com sucesso! ${n} parcela(s) gerada(s). Acesse "Pagamentos" para acompanhar.`)
      }
    } catch {
      setErro('Erro ao migrar plano. Tente novamente.')
    } finally {
      setMigrando(false)
      setPlanoParaMigrar(null)
    }
  }

  const outrosPlanos = todosPlanos.filter(p => p.id_plano !== planoAtual?.id_plano)

  return (
    <>
      {/* Header */}
      <div style={{ padding: '28px 32px 0', marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 4 }}>
          Área do Aluno
        </p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, marginBottom: 6 }}>
          Meu Plano
        </h1>
        <p style={{ fontSize: 14, color: '#6B6B6B' }}>
          Veja seu plano atual e explore outras opções disponíveis.
        </p>
      </div>

      <div style={{ padding: '0 32px 32px' }}>

        {/* Alertas */}
        {erro && (
          <div style={{ background: 'rgba(139,26,47,0.08)', border: '1px solid rgba(139,26,47,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#8B1A2F', fontSize: 14 }}>
            {erro}
          </div>
        )}
        {sucesso && (
          <div style={{ background: 'rgba(34,139,34,0.08)', border: '1px solid rgba(34,139,34,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#1A6B1A', fontSize: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            {sucesso}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: '#6B6B6B', fontSize: 14 }}>
            Carregando informações do plano...
          </div>
        ) : (
          <>
            {/* Plano Atual */}
            <section style={{ marginBottom: 36 }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 700, color: '#1A1A1A', marginBottom: 16 }}>
                Plano Atual
              </h2>

              {planoAtual ? (
                <div style={{
                  background: '#FFF',
                  border: '2px solid #8B1A2F',
                  borderRadius: 12,
                  padding: '24px 28px',
                  maxWidth: 440,
                  position: 'relative',
                }}>
                  <div style={{ position: 'absolute', top: -12, left: 20 }}>
                    <span style={{
                      background: '#8B1A2F', color: '#F5F0EB',
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.8px',
                      textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20,
                    }}>
                      Plano Atual
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, background: 'rgba(139,26,47,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Layers size={22} color="#8B1A2F" />
                    </div>
                    <div>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2 }}>
                        {planoAtual.nome}
                      </p>
                      <p style={{ fontSize: 13, color: '#6B6B6B', marginTop: 2 }}>
                        {formatarCiclo(planoAtual.ciclo_meses)}
                      </p>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #E8E0D8', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <span style={{ color: '#6B6B6B' }}>Valor base</span>
                      <span style={{ color: '#1A1A1A' }}>{formatarMoeda(planoAtual.valor_base)}</span>
                    </div>
                    {planoAtual.percentual_desconto > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                        <span style={{ color: '#6B6B6B' }}>Desconto</span>
                        <span style={{ color: '#228B22', fontWeight: 600 }}>{planoAtual.percentual_desconto}% OFF</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, borderTop: '1px solid #E8E0D8', paddingTop: 8, marginTop: 4 }}>
                      <span style={{ color: '#1A1A1A' }}>Valor final</span>
                      <span style={{ color: '#8B1A2F' }}>{formatarMoeda(planoAtual.valor_final)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: '#FFF', border: '1px solid #E8E0D8', borderRadius: 12,
                  padding: '28px 24px', maxWidth: 440, textAlign: 'center', color: '#6B6B6B',
                }}>
                  <Layers size={32} color="#C9A96E" style={{ marginBottom: 12 }} />
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>Nenhum plano ativo</p>
                  <p style={{ fontSize: 13 }}>Você ainda não possui um plano associado. Entre em contato com a secretaria.</p>
                </div>
              )}
            </section>

            {/* Outros planos */}
            {outrosPlanos.length > 0 && (
              <section>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>
                  Outros Planos Disponíveis
                </h2>
                <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 20 }}>
                  Selecione um plano para solicitar a migração. A cobrança será ajustada pelo financeiro.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                  {outrosPlanos.map(plano => {
                    const bloqueado = migracaoBloqueada(plano)
                    return (
                      <div key={plano.id_plano} style={{
                        background: '#FFF', border: '1px solid #E8E0D8',
                        borderRadius: 12, padding: '20px 22px',
                        display: 'flex', flexDirection: 'column', gap: 12,
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <p style={{ fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 700, color: '#1A1A1A' }}>
                              {plano.nome}
                            </p>
                            {plano.percentual_desconto > 0 && (
                              <span style={{
                                background: 'rgba(34,139,34,0.1)', color: '#228B22',
                                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                              }}>
                                {plano.percentual_desconto}% OFF
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 12, color: '#6B6B6B' }}>{formatarCiclo(plano.ciclo_meses)}</p>
                        </div>

                        <div style={{ borderTop: '1px solid #E8E0D8', paddingTop: 12 }}>
                          {plano.percentual_desconto > 0 && (
                            <p style={{ fontSize: 12, color: '#9B9B9B', textDecoration: 'line-through', marginBottom: 2 }}>
                              {formatarMoeda(plano.valor_base)}
                            </p>
                          )}
                          <p style={{ fontSize: 20, fontWeight: 700, color: '#8B1A2F' }}>
                            {formatarMoeda(plano.valor_final)}
                          </p>
                          <p style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>
                            por {formatarCiclo(plano.ciclo_meses).toLowerCase()}
                          </p>
                        </div>

                        <button
                          onClick={() => { if (!bloqueado) setPlanoParaMigrar(plano) }}
                          disabled={bloqueado}
                          title={bloqueado ? `Quite as ${parcelasPendentes} parcela(s) pendente(s) do plano atual antes de migrar para um plano de ciclo menor` : ''}
                          style={{
                            background: bloqueado ? '#E8E0D8' : '#8B1A2F',
                            color: bloqueado ? '#9B9B9B' : '#FFF',
                            border: 'none', borderRadius: 8, padding: '9px 0',
                            fontSize: 13, fontWeight: 600,
                            cursor: bloqueado ? 'not-allowed' : 'pointer',
                            width: '100%', transition: 'background 0.15s',
                            marginTop: 'auto',
                          }}
                          onMouseEnter={e => { if (!bloqueado) e.currentTarget.style.background = '#B5283D' }}
                          onMouseLeave={e => { e.currentTarget.style.background = bloqueado ? '#E8E0D8' : '#8B1A2F' }}
                        >
                          {bloqueado ? 'Migração bloqueada' : 'Migrar para este plano'}
                        </button>
                        {bloqueado && (
                          <p style={{ fontSize: 11, color: '#8B1A2F', textAlign: 'center', marginTop: -4 }}>
                            Quite as {parcelasPendentes} parcela(s) pendente(s) primeiro
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {todosPlanos.length > 0 && outrosPlanos.length === 0 && planoAtual && (
              <p style={{ fontSize: 14, color: '#6B6B6B', marginTop: 8 }}>
                Você já está no único plano disponível ou nos melhores termos disponíveis.
              </p>
            )}
          </>
        )}
      </div>

      {/* Modal de confirmação */}
      {planoParaMigrar && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: 24,
        }}
          onClick={e => { if (e.target === e.currentTarget) setPlanoParaMigrar(null) }}
        >
          <div style={{
            background: '#FFF', borderRadius: 14, padding: '32px 28px',
            maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1A1A1A', marginBottom: 12 }}>
              Confirmar Migração
            </h3>

            <p style={{ fontSize: 14, color: '#1A1A1A', marginBottom: 8 }}>
              Você está solicitando a migração
              {planoAtual ? <> do plano <strong>"{planoAtual.nome}"</strong></> : ''} para o plano{' '}
              <strong>"{planoParaMigrar.nome}"</strong>.
            </p>

            <div style={{
              background: '#F5F0EB', border: '1px solid #E8E0D8',
              borderRadius: 8, padding: '12px 14px', marginBottom: 24,
            }}>
              <p style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.5 }}>
                Novo valor: <strong style={{ color: '#8B1A2F' }}>{formatarMoeda(planoParaMigrar.valor_final)}</strong> por {formatarCiclo(planoParaMigrar.ciclo_meses).toLowerCase()}.
                A cobrança será ajustada pelo financeiro da escola.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setPlanoParaMigrar(null)}
                disabled={migrando}
                style={{
                  background: 'none', border: '1px solid #E8E0D8', borderRadius: 8,
                  padding: '9px 20px', fontSize: 14, color: '#6B6B6B', cursor: 'pointer',
                  fontWeight: 500, opacity: migrando ? 0.5 : 1,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarMigracao}
                disabled={migrando}
                style={{
                  background: '#8B1A2F', color: '#FFF', border: 'none', borderRadius: 8,
                  padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: migrando ? 'not-allowed' : 'pointer',
                  opacity: migrando ? 0.7 : 1, transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!migrando) e.currentTarget.style.background = '#B5283D' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#8B1A2F' }}
              >
                {migrando ? 'Migrando...' : 'Confirmar Migração'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
