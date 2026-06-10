'use client'

// src/app/(frontend)/area-aluno/anamnese/page.tsx

import { useState, useEffect } from 'react'
import { useIdAluno } from '@/hooks/useIdAluno'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

interface Anamnese {
  id_anamnese?: string
  peso_kg: string
  altura_cm: string
  lesao_ortopedica: string
  pratica_atividade_fisica: string
  condicao_cardiaca: string
  gravida_ou_pode_estar: string
  observacoes_adicionais: string
}

export default function AnamnesePage() {
  const { idAluno, idUsuario, loading: loadingAluno } = useIdAluno()
  const [form, setForm] = useState<Anamnese>({
    peso_kg: '',
    altura_cm: '',
    lesao_ortopedica: 'Não',
    pratica_atividade_fisica: 'Sim',
    condicao_cardiaca: 'Não',
    gravida_ou_pode_estar: 'Não',
    observacoes_adicionais: '',
  })
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [anamneseExistente, setAnamneseExistente] = useState(false)

  useEffect(() => {
    if (loadingAluno) return
    if (!idAluno || !idUsuario) { setLoading(false); return }

    // Carregar anamnese existente se houver
    fetchWithAuth(`/api/usuarios/${idUsuario}`)
      .then(r => r.json())
      .then(data => {
        if (data.anamnese_preenchida && data.dados_questionario) {
          setForm(data.dados_questionario)
          setAnamneseExistente(true)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('[anamnese]', err)
        setLoading(false)
      })
  }, [idAluno, idUsuario, loadingAluno])

  function handleChange(campo: keyof Anamnese, valor: string) {
    setForm(prev => ({ ...prev, [campo]: valor }))
    setErro('')
    setSucesso(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!idAluno) return

    if (!form.peso_kg || !form.altura_cm) {
      setErro('Peso e altura são obrigatórios.')
      return
    }

    setSalvando(true)
    setErro('')
    setSucesso(false)

    try {
      const res = await fetchWithAuth('/api/anamnese', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_aluno: idAluno,
          dados_questionario: form,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.erro || 'Erro ao salvar anamnese.')
        return
      }

      setSucesso(true)
      setAnamneseExistente(true)
      setForm(data.dados_questionario || form)
    } catch (err) {
      console.error('[anamnese submit]', err)
      setErro('Erro de conexão.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <div style={{ padding: '28px 32px 0', marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 4 }}>Área do Aluno</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2 }}>Questionário de Saúde</h1>
        <p style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4 }}>Informações importantes para personalizar suas aulas. 🏥</p>
      </div>

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
            ✓ Anamnese salva com sucesso!
          </div>
        </div>
      )}

      <div style={{ padding: '0 32px 32px', maxWidth: 600 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D8', padding: 32 }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#6B6B6B' }}>Carregando...</p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Peso */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', display: 'block', marginBottom: 6 }}>
                  Peso (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.peso_kg}
                  onChange={(e) => handleChange('peso_kg', e.target.value)}
                  placeholder="Ex: 65.5"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #E8E0D8',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#1A1A1A',
                    background: '#fff',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(el) => el.currentTarget.style.borderColor = '#8B1A2F'}
                  onBlur={(el) => el.currentTarget.style.borderColor = '#E8E0D8'}
                />
              </div>

              {/* Altura */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', display: 'block', marginBottom: 6 }}>
                  Altura (cm) *
                </label>
                <input
                  type="number"
                  value={form.altura_cm}
                  onChange={(e) => handleChange('altura_cm', e.target.value)}
                  placeholder="Ex: 165"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #E8E0D8',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#1A1A1A',
                    background: '#fff',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(el) => el.currentTarget.style.borderColor = '#8B1A2F'}
                  onBlur={(el) => el.currentTarget.style.borderColor = '#E8E0D8'}
                />
              </div>

              {/* Lesão Ortopédica */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', display: 'block', marginBottom: 6 }}>
                  Possui lesão ortopédica?
                </label>
                <select
                  value={form.lesao_ortopedica}
                  onChange={(e) => handleChange('lesao_ortopedica', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #E8E0D8',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#1A1A1A',
                    background: '#fff',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>
              </div>

              {/* Prática de Atividade Física */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', display: 'block', marginBottom: 6 }}>
                  Pratica atividade física regularmente?
                </label>
                <select
                  value={form.pratica_atividade_fisica}
                  onChange={(e) => handleChange('pratica_atividade_fisica', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #E8E0D8',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#1A1A1A',
                    background: '#fff',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="Não">Não</option>
                  <option value="Sim, 1-2x/semana">Sim, 1-2x por semana</option>
                  <option value="Sim, 3-4x/semana">Sim, 3-4x por semana</option>
                  <option value="Sim, 5+ x/semana">Sim, 5+ vezes por semana</option>
                </select>
              </div>

              {/* Condição Cardíaca */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', display: 'block', marginBottom: 6 }}>
                  Possui problemas cardíacos?
                </label>
                <select
                  value={form.condicao_cardiaca}
                  onChange={(e) => handleChange('condicao_cardiaca', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #E8E0D8',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#1A1A1A',
                    background: '#fff',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>
              </div>

              {/* Gravidez */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', display: 'block', marginBottom: 6 }}>
                  Está grávida ou pode estar?
                </label>
                <select
                  value={form.gravida_ou_pode_estar}
                  onChange={(e) => handleChange('gravida_ou_pode_estar', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #E8E0D8',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#1A1A1A',
                    background: '#fff',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                  <option value="Pode estar">Pode estar</option>
                </select>
              </div>

              {/* Observações */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', display: 'block', marginBottom: 6 }}>
                  Observações adicionais
                </label>
                <textarea
                  value={form.observacoes_adicionais}
                  onChange={(e) => handleChange('observacoes_adicionais', e.target.value)}
                  placeholder="Descreva qualquer condição especial, lesão ou alergia..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #E8E0D8',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#1A1A1A',
                    background: '#fff',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(el) => el.currentTarget.style.borderColor = '#8B1A2F'}
                  onBlur={(el) => el.currentTarget.style.borderColor = '#E8E0D8'}
                />
              </div>

              {erro && (
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
              )}

              <button
                type="submit"
                disabled={salvando}
                style={{
                  background: '#8B1A2F',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 18px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: salvando ? 0.6 : 1,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(el) => {
                  if (!salvando) el.currentTarget.style.background = '#B5283D'
                }}
                onMouseLeave={(el) => {
                  el.currentTarget.style.background = '#8B1A2F'
                }}
              >
                {salvando ? 'Salvando...' : anamneseExistente ? '✏️ Atualizar Anamnese' : '✓ Salvar Anamnese'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
