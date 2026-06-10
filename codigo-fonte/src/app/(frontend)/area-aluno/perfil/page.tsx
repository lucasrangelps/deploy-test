'use client'

// src/app/(frontend)/area-aluno/perfil/page.tsx

import { useState, useEffect } from 'react'
import { useIdAluno } from '@/hooks/useIdAluno'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

interface PerfilData {
  id_usuario: string
  nome_completo: string
  email: string
  tipo_perfil: string
  telefone: string
  id_aluno: string
  cpf: string
  data_nascimento: string
  endereco: string
  profissao: string
  nome_parente: string
  tel_parente: string
  grau_parentesco: string
}

export default function PerfilPage() {
  const { idAluno, idUsuario, loading: loadingAluno } = useIdAluno()
  const [form, setForm] = useState<PerfilData | null>(null)
  const [original, setOriginal] = useState<PerfilData | null>(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    if (loadingAluno) return
    if (!idAluno || !idUsuario) { setLoading(false); return }

    fetchWithAuth(`/api/usuarios/${idUsuario}`)
      .then(r => r.json())
      .then(data => {
        // Normalizar dados para garantir que tudo seja string, não null
        const normalizedData: PerfilData = {
          ...data,
          telefone: data.telefone || "",
          endereco: data.endereco || "",
          profissao: data.profissao || "",
          nome_parente: data.nome_parente || "",
          tel_parente: data.tel_parente || "",
          grau_parentesco: data.grau_parentesco || "",
          id_aluno: data.id_aluno || "",
        }
        setForm(normalizedData)
        setOriginal(normalizedData)
        setLoading(false)
      })
      .catch(err => {
        console.error('[perfil]', err)
        setErro('Erro ao carregar perfil.')
        setLoading(false)
      })
  }, [idAluno, idUsuario, loadingAluno])

  function handleChange(campo: keyof PerfilData, valor: string) {
    if (!form) return
    setForm({ ...form, [campo]: valor })
    setErro('')
    setSucesso(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form || !idAluno || !idUsuario) return

    setSalvando(true)
    setErro('')
    setSucesso(false)

    try {
      console.log('[perfil] Enviando update para /api/usuarios/:id', {
        idUsuario,
        payload: {
          telefone: form.telefone,
          endereco: form.endereco,
          profissao: form.profissao,
          nome_parente: form.nome_parente,
          tel_parente: form.tel_parente,
          grau_parentesco: form.grau_parentesco,
        }
      })

      const res = await fetchWithAuth(`/api/usuarios/${idUsuario}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telefone: form.telefone,
          endereco: form.endereco,
          profissao: form.profissao,
          nome_parente: form.nome_parente,
          tel_parente: form.tel_parente,
          grau_parentesco: form.grau_parentesco,
        }),
      })

      const data = await res.json()

      console.log('[perfil] Resposta da API:', { 
        status: res.status, 
        statusText: res.statusText,
        data 
      })

      if (!res.ok) {
        const mensagemErro = data.erro || data.detalhes || 'Erro ao salvar perfil.'
        console.error('[perfil] Erro na resposta:', mensagemErro)
        setErro(mensagemErro)
        return
      }

      console.log('[perfil] Perfil atualizado com sucesso')
      setSucesso(true)
      setEditMode(false)
      setOriginal(form)
    } catch (err) {
      console.error('[perfil submit]', err)
      const mensagem = err instanceof Error ? err.message : 'Erro de conexão.'
      setErro(mensagem)
    } finally {
      setSalvando(false)
    }
  }

  function handleCancel() {
    if (original) {
      setForm(original)
    }
    setEditMode(false)
    setErro('')
  }

  if (loading || loadingAluno || !form) {
    return (
      <div style={{ padding: '28px 32px' }}>
        <p style={{ textAlign: 'center', color: '#6B6B6B', fontSize: 13 }}>Carregando perfil...</p>
      </div>
    )
  }

  return (
    <>
      <div style={{ padding: '28px 32px 0', marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 4 }}>Área do Aluno</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2 }}>Meu Perfil</h1>
        <p style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4 }}>Visualize e atualize suas informações pessoais. 👤</p>
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
            ✓ Perfil atualizado com sucesso!
          </div>
        </div>
      )}

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

      <div style={{ padding: '0 32px 32px', maxWidth: 800 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Seção: Informações Pessoais */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D8', padding: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 20 }}>
              Informações Pessoais
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
              {/* Nome Completo - Readonly */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', display: 'block', marginBottom: 6 }}>
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={form.nome_completo}
                  disabled
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #E8E0D8',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#999',
                    background: '#F5F0EB',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Email - Readonly */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', display: 'block', marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #E8E0D8',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#999',
                    background: '#F5F0EB',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* CPF - Readonly */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', display: 'block', marginBottom: 6 }}>
                  CPF
                </label>
                <input
                  type="text"
                  value={form.cpf}
                  disabled
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #E8E0D8',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#999',
                    background: '#F5F0EB',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Data de Nascimento - Readonly */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', display: 'block', marginBottom: 6 }}>
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={form.data_nascimento}
                  disabled
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #E8E0D8',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#999',
                    background: '#F5F0EB',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Seção: Informações de Contato */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D8', padding: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 20 }}>
              Informações de Contato
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
              {/* Telefone */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', display: 'block', marginBottom: 6 }}>
                  Telefone
                </label>
                <input
                  type="tel"
                  value={form.telefone}
                  onChange={(e) => handleChange('telefone', e.target.value)}
                  disabled={!editMode}
                  placeholder="(11) 99999-8888"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #E8E0D8',
                    borderRadius: 8,
                    fontSize: 13,
                    color: editMode ? '#1A1A1A' : '#999',
                    background: editMode ? '#fff' : '#F5F0EB',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: editMode ? 'text' : 'default',
                    transition: 'all 0.15s',
                  }}
                  onFocus={(el) => {
                    if (editMode) el.currentTarget.style.borderColor = '#8B1A2F'
                  }}
                  onBlur={(el) => {
                    el.currentTarget.style.borderColor = '#E8E0D8'
                  }}
                />
              </div>

              {/* Endereço */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', display: 'block', marginBottom: 6 }}>
                  Endereço
                </label>
                <input
                  type="text"
                  value={form.endereco}
                  onChange={(e) => handleChange('endereco', e.target.value)}
                  disabled={!editMode}
                  placeholder="Rua, número, bairro, cidade"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #E8E0D8',
                    borderRadius: 8,
                    fontSize: 13,
                    color: editMode ? '#1A1A1A' : '#999',
                    background: editMode ? '#fff' : '#F5F0EB',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: editMode ? 'text' : 'default',
                    transition: 'all 0.15s',
                  }}
                  onFocus={(el) => {
                    if (editMode) el.currentTarget.style.borderColor = '#8B1A2F'
                  }}
                  onBlur={(el) => {
                    el.currentTarget.style.borderColor = '#E8E0D8'
                  }}
                />
              </div>

              {/* Profissão */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', display: 'block', marginBottom: 6 }}>
                  Profissão
                </label>
                <input
                  type="text"
                  value={form.profissao}
                  onChange={(e) => handleChange('profissao', e.target.value)}
                  disabled={!editMode}
                  placeholder="Ex: Desenvolvedora"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #E8E0D8',
                    borderRadius: 8,
                    fontSize: 13,
                    color: editMode ? '#1A1A1A' : '#999',
                    background: editMode ? '#fff' : '#F5F0EB',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: editMode ? 'text' : 'default',
                    transition: 'all 0.15s',
                  }}
                  onFocus={(el) => {
                    if (editMode) el.currentTarget.style.borderColor = '#8B1A2F'
                  }}
                  onBlur={(el) => {
                    el.currentTarget.style.borderColor = '#E8E0D8'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Seção: Informações de Emergência */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D8', padding: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', marginBottom: 20 }}>
              Contato de Emergência
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 }}>
              {/* Nome Parente */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', display: 'block', marginBottom: 6 }}>
                  Nome do Parente
                </label>
                <input
                  type="text"
                  value={form.nome_parente}
                  onChange={(e) => handleChange('nome_parente', e.target.value)}
                  disabled={!editMode}
                  placeholder="Ex: Maria Silva"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #E8E0D8',
                    borderRadius: 8,
                    fontSize: 13,
                    color: editMode ? '#1A1A1A' : '#999',
                    background: editMode ? '#fff' : '#F5F0EB',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: editMode ? 'text' : 'default',
                    transition: 'all 0.15s',
                  }}
                  onFocus={(el) => {
                    if (editMode) el.currentTarget.style.borderColor = '#8B1A2F'
                  }}
                  onBlur={(el) => {
                    el.currentTarget.style.borderColor = '#E8E0D8'
                  }}
                />
              </div>

              {/* Telefone Parente */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', display: 'block', marginBottom: 6 }}>
                  Telefone do Parente
                </label>
                <input
                  type="tel"
                  value={form.tel_parente}
                  onChange={(e) => handleChange('tel_parente', e.target.value)}
                  disabled={!editMode}
                  placeholder="(11) 98888-7777"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #E8E0D8',
                    borderRadius: 8,
                    fontSize: 13,
                    color: editMode ? '#1A1A1A' : '#999',
                    background: editMode ? '#fff' : '#F5F0EB',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: editMode ? 'text' : 'default',
                    transition: 'all 0.15s',
                  }}
                  onFocus={(el) => {
                    if (editMode) el.currentTarget.style.borderColor = '#8B1A2F'
                  }}
                  onBlur={(el) => {
                    el.currentTarget.style.borderColor = '#E8E0D8'
                  }}
                />
              </div>

              {/* Grau de Parentesco */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#C9A96E', display: 'block', marginBottom: 6 }}>
                  Grau de Parentesco
                </label>
                <select
                  value={form.grau_parentesco}
                  onChange={(e) => handleChange('grau_parentesco', e.target.value)}
                  disabled={!editMode}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #E8E0D8',
                    borderRadius: 8,
                    fontSize: 13,
                    color: editMode ? '#1A1A1A' : '#999',
                    background: editMode ? '#fff' : '#F5F0EB',
                    cursor: editMode ? 'pointer' : 'default',
                    outline: 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <option value="">Selecione...</option>
                  <option value="Mãe">Mãe</option>
                  <option value="Pai">Pai</option>
                  <option value="Irmã">Irmã</option>
                  <option value="Irmão">Irmão</option>
                  <option value="Avó">Avó</option>
                  <option value="Avô">Avô</option>
                  <option value="Tia">Tia</option>
                  <option value="Tio">Tio</option>
                  <option value="Esposo">Esposo</option>
                  <option value="Esposa">Esposa</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            {!editMode ? (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                style={{
                  background: '#8B1A2F',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(el) => el.currentTarget.style.background = '#B5283D'}
                onMouseLeave={(el) => el.currentTarget.style.background = '#8B1A2F'}
              >
                ✏️ Editar Perfil
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    background: '#E8E0D8',
                    color: '#1A1A1A',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(el) => el.currentTarget.style.background = '#D8CFC0'}
                  onMouseLeave={(el) => el.currentTarget.style.background = '#E8E0D8'}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  style={{
                    background: '#8B1A2F',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
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
                  {salvando ? 'Salvando...' : '✓ Salvar Alterações'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </>
  )
}
