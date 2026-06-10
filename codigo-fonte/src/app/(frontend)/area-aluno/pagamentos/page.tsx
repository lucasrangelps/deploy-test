'use client'

// src/app/(frontend)/area-aluno/pagamentos/page.tsx

import { useState, useEffect } from 'react'
import { useIdAluno } from '@/hooks/useIdAluno'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

interface PagamentoItem {
  id_pagamento: string
  data_pagamento: string
  metodo_pagamento: string
  valor_pago: string
}

interface Parcela {
  id_parcela: string
  numero_parcela?: number
  nome_plano?: string
  mes_parcela?: string
  data_vencimento?: string
  valor_cobrado?: string
  status?: string
  acao?: string
  pagamentos?: PagamentoItem[]
}

interface PIXResponse {
  id_pagamento: string
  id_parcela: string
  valor?: string
  qr_code: string
  qr_code_base64?: string
  expira_em: string
  id_referencia: string
  status: string
}

export default function PagamentosPage() {
  const { idAluno, loading: loadingAluno } = useIdAluno()
  const [parcelas, setParcelas] = useState<Parcela[]>([])
  const [loading, setLoading] = useState(true)
  const [gerandoPix, setGerandoPix] = useState<string>('')
  const [pixData, setPixData] = useState<PIXResponse | null>(null)
  const [showPixModal, setShowPixModal] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    if (loadingAluno) return
    if (!idAluno) { setLoading(false); return }

    fetchWithAuth(`/api/pagamentos?id_aluno=${idAluno}`)
      .then(r => r.json())
      .then(data => {
        setParcelas(data.data ?? data ?? [])
        setLoading(false)
      })
      .catch(err => {
        console.error('[pagamentos]', err)
        setErro('Erro ao carregar pagamentos.')
        setLoading(false)
      })
  }, [idAluno, loadingAluno])

  async function handleGerarPix(parcelaId: string) {
    if (!idAluno) return

    setGerandoPix(parcelaId)
    setErro('')
    setSucesso('')

    try {
      const res = await fetchWithAuth('/api/pagamentos/pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_parcela: parcelaId,
          id_aluno: idAluno,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.erro || 'Erro ao gerar QR Code.')
        return
      }

      setPixData(data)
      setShowPixModal(true)
      setSucesso('QR Code gerado com sucesso!')
    } catch (err) {
      console.error('[pix]', err)
      setErro('Erro de conexão.')
    } finally {
      setGerandoPix('')
    }
  }

  function handleCopiarCodigo() {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code)
      setSucesso('Código PIX copiado!')
      setTimeout(() => setSucesso(''), 3000)
    }
  }

  const statusConfig: Record<string, { cor: string; fundo: string }> = {
    'Pendente': { cor: '#92400e', fundo: '#fef3c7' },
    'Pago': { cor: '#166534', fundo: '#dcfae6' },
    'Vencido': { cor: '#991B1B', fundo: '#fee2e2' },
    'Aguardando Confirmação': { cor: '#7c2d12', fundo: '#fed7aa' },
  }

  const statusAtual = statusConfig['Pendente'] // Default

  return (
    <>
      <div style={{ padding: '28px 32px 0', marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 4 }}>Área do Aluno</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2 }}>Meus Pagamentos</h1>
        <p style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4 }}>Visualize suas parcelas e realize pagamentos via PIX. 💳</p>
      </div>

      {erro && (
        <div style={{ padding: '0 32px 16px' }}>
          <div style={{
            background: '#FEE2E2',
            border: '1px solid #FECACA',
            borderRadius: 8,
            padding: '12px 16px',
            fontSize: 13,
            color: '#991B1B',
          }}>
            {erro}
          </div>
        </div>
      )}

      {sucesso && (
        <div style={{ padding: '0 32px 16px' }}>
          <div style={{
            background: '#DCFAE6',
            border: '1px solid #86EFAC',
            borderRadius: 8,
            padding: '12px 16px',
            fontSize: 13,
            color: '#166534',
          }}>
            {sucesso}
          </div>
        </div>
      )}

      <div style={{ padding: '0 32px 32px' }}>
        {loading || loadingAluno ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D8', padding: 40, textAlign: 'center', color: '#6B6B6B', fontSize: 13 }}>
            Carregando parcelas...
          </div>
        ) : parcelas.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D8', padding: 40, textAlign: 'center', color: '#6B6B6B', fontSize: 13 }}>
            Você não possui parcelas cadastradas.
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D8', overflow: 'hidden' }}>
            {/* Cabeçalho da Tabela */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 16,
              padding: 20,
              background: '#F5F0EB',
              borderBottom: '1px solid #E8E0D8',
              fontWeight: 600,
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#C9A96E',
            }}>
              <div>Parcela</div>
              <div>Plano</div>
              <div>Vencimento</div>
              <div>Valor</div>
              <div>Status</div>
              <div>Ação</div>
              <div></div>
            </div>

            {/* Linhas */}
            {parcelas.map((parcela, idx) => {
              const statusInfo = statusConfig[parcela.status || ''] || statusAtual
              return (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: 16,
                    padding: 16,
                    borderBottom: idx < parcelas.length - 1 ? '1px solid #E8E0D8' : 'none',
                    alignItems: 'center',
                    fontSize: 13,
                    color: '#1A1A1A',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>#{parcela.numero_parcela ?? '-'}</div>
                  <div>{parcela.nome_plano || '—'}</div>
                  <div>{parcela.data_vencimento ? new Date(parcela.data_vencimento).toLocaleDateString('pt-BR') : '--'}</div>
                  <div style={{ fontWeight: 600 }}>R$ {parcela.valor_cobrado ? parseFloat(parcela.valor_cobrado).toFixed(2) : '0.00'}</div>
                  <div>
                    <span style={{
                      background: statusInfo.fundo,
                      color: statusInfo.cor,
                      padding: '4px 10px',
                      borderRadius: 16,
                      fontSize: 11,
                      fontWeight: 600,
                    }}>
                      {parcela.status || 'Sem status'}
                    </span>
                  </div>
                  <div>
                    {parcela.status === 'Pendente' ? (
                      <button
                        onClick={() => handleGerarPix(parcela.id_parcela)}
                        disabled={gerandoPix === parcela.id_parcela}
                        style={{
                          background: '#8B1A2F',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '6px 12px',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          opacity: gerandoPix === parcela.id_parcela ? 0.6 : 1,
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(el) => {
                          if (gerandoPix !== parcela.id_parcela) {
                            el.currentTarget.style.background = '#B5283D'
                          }
                        }}
                        onMouseLeave={(el) => {
                          el.currentTarget.style.background = '#8B1A2F'
                        }}
                      >
                        {gerandoPix === parcela.id_parcela ? 'Gerando...' : 'Pagar PIX'}
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: '#6B6B6B' }}>-</span>
                    )}
                  </div>
                  <div>
                    {parcela.pagamentos && parcela.pagamentos.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {parcela.pagamentos.map((pag) => (
                          <span key={pag.id_pagamento} style={{ fontSize: 11, color: '#6B6B6B' }}>
                            {new Date(pag.data_pagamento).toLocaleDateString('pt-BR')}
                            {pag.metodo_pagamento ? ` · ${pag.metodo_pagamento}` : ''}
                            {pag.valor_pago ? ` · R$ ${parseFloat(pag.valor_pago).toFixed(2)}` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal PIX */}
      {showPixModal && pixData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 32,
            maxWidth: 400,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
                Pagamento via PIX
              </h2>
              <p style={{ fontSize: 13, color: '#6B6B6B' }}>
                Escaneie o código ou copie a chave
              </p>
            </div>

            {/* QR Code */}
            <div style={{
              background: '#F5F0EB',
              borderRadius: 8,
              padding: 20,
              textAlign: 'center',
              marginBottom: 20,
            }}>
              {pixData.qr_code_base64 ? (
                <img
                  src={`data:image/png;base64,${pixData.qr_code_base64}`}
                  alt="QR Code PIX"
                  style={{ width: 200, height: 200 }}
                />
              ) : (
                <div style={{ fontSize: 48 }}>📱</div>
              )}
            </div>

            {/* Informações */}
            <div style={{ background: '#F5F0EB', borderRadius: 8, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 6, margin: 0 }}>
                Valor
              </p>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', margin: '4px 0 0 0' }}>
                R$ {pixData.valor ? parseFloat(pixData.valor).toFixed(2) : '0.00'}
              </p>
            </div>

            {/* Chave PIX */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 8 }}>
                Chave PIX
              </p>
              <div style={{
                background: '#F5F0EB',
                border: '1px solid #E8E0D8',
                borderRadius: 8,
                padding: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <code style={{
                  fontSize: 11,
                  color: '#1A1A1A',
                  flex: 1,
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                }}>
                  {pixData.qr_code || 'Código não disponível'}
                </code>
                <button
                  onClick={handleCopiarCodigo}
                  style={{
                    background: '#8B1A2F',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 12px',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(el) => el.currentTarget.style.background = '#B5283D'}
                  onMouseLeave={(el) => el.currentTarget.style.background = '#8B1A2F'}
                >
                  Copiar
                </button>
              </div>
            </div>

            {/* Expiração */}
            <div style={{ fontSize: 11, color: '#6B6B6B', textAlign: 'center', marginBottom: 20 }}>
              ⏰ QR Code expira em {pixData.expira_em ? new Date(pixData.expira_em).toLocaleTimeString('pt-BR') : '--:--'}
            </div>

            {/* Botões */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowPixModal(false)}
                style={{
                  flex: 1,
                  background: '#E8E0D8',
                  color: '#1A1A1A',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(el) => el.currentTarget.style.background = '#D8CFC0'}
                onMouseLeave={(el) => el.currentTarget.style.background = '#E8E0D8'}
              >
                Fechar
              </button>
              <button
                onClick={handleCopiarCodigo}
                style={{
                  flex: 1,
                  background: '#8B1A2F',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(el) => el.currentTarget.style.background = '#B5283D'}
                onMouseLeave={(el) => el.currentTarget.style.background = '#8B1A2F'}
              >
                Copiar Código
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
