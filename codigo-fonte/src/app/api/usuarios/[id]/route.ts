// src/app/api/usuarios/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { UsuarioUpdateSchema } from '@/lib/validations'

// GET /api/usuarios/:id
// Retorna dados completos do usuário (aluno logado)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validar Bearer token
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')

    // Validar token e obter user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ erro: 'Token inválido ou expirado' }, { status: 401 })
    }

    // Validar que o usuário está acessando seus próprios dados
    const { data: usuarioAuth } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario')
      .eq('auth_user_id', user.id)
      .single()

    if (!usuarioAuth || usuarioAuth.id_usuario !== id) {
      return NextResponse.json({ erro: 'Sem permissão para acessar este usuário' }, { status: 403 })
    }

    // Buscar dados do usuário com dados do aluno
    const { data: usuario, error } = await supabaseAdmin
      .from('usuarios')
      .select(`
        id_usuario,
        nome_completo,
        email,
        tipo_perfil,
        criado_em,
        alunos (
          id_aluno,
          cpf,
          telefone,
          endereco,
          data_nascimento,
          profissao,
          genero,
          nome_parente,
          tel_parente,
          grau_parentesco,
          id_usuario
        )
      `)
      .eq('id_usuario', id)
      .eq('tipo_perfil', 'ALUNO')
      .single()

    if (error || !usuario) {
      console.error('[GET /api/usuarios/:id]', error)
      return NextResponse.json({ erro: 'Usuário/Aluno não encontrado' }, { status: 404 })
    }

    // Preparar resposta combinando dados de usuarios e alunos
    // alunos pode ser um objeto direto ou um array dependendo da resposta do Supabase
    let alunoData = null
    if (usuario.alunos) {
      if (Array.isArray(usuario.alunos)) {
        alunoData = usuario.alunos.length > 0 ? usuario.alunos[0] : null
      } else {
        // Se é um objeto simples (não array), usar direto
        alunoData = usuario.alunos
      }
    }
    
    // Buscar anamnese preenchida (se existe)
    let anamnese_preenchida = false
    let dados_questionario = null
    if (alunoData?.id_aluno) {
      const { data: anamneseData } = await supabaseAdmin
        .from('anamneses')
        .select('dados_questionario')
        .eq('id_aluno', alunoData.id_aluno)
        .order('data_preenchimento', { ascending: false })
        .limit(1)
        .single()
      
      if (anamneseData) {
        anamnese_preenchida = true
        dados_questionario = anamneseData.dados_questionario
      }
    }

    const resposta = {
      id_usuario: usuario.id_usuario,
      nome_completo: usuario.nome_completo,
      email: usuario.email,
      tipo_perfil: usuario.tipo_perfil,
      telefone: alunoData?.telefone || "",
      id_aluno: alunoData?.id_aluno || "",
      cpf: alunoData?.cpf || "",
      data_nascimento: alunoData?.data_nascimento || "",
      endereco: alunoData?.endereco || "",
      profissao: alunoData?.profissao || "",
      genero: alunoData?.genero || "",
      nome_parente: alunoData?.nome_parente || "",
      tel_parente: alunoData?.tel_parente || "",
      grau_parentesco: alunoData?.grau_parentesco || "",
      anamnese_preenchida,
      dados_questionario,
    }

    return NextResponse.json(resposta)
  } catch (error) {
    console.error('[GET /api/usuarios/:id]', error)
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 })
  }
}

// PUT /api/usuarios/:id
// Atualiza dados do usuário (aluno logado)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validar Bearer token
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')

    // Validar token e obter user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ erro: 'Token inválido ou expirado' }, { status: 401 })
    }

    // Validar que o usuário está acessando seus próprios dados
    const { data: usuarioAuth } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario')
      .eq('auth_user_id', user.id)
      .single()

    if (!usuarioAuth || usuarioAuth.id_usuario !== id) {
      return NextResponse.json({ erro: 'Sem permissão para alterar este usuário' }, { status: 403 })
    }

    // Parsing e validação do body
    const body = await req.json()
    const validation = UsuarioUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { 
          erro: 'Validação falhou',
          detalhes: validation.error.flatten()
        },
        { status: 422 }
      )
    }

    const updateData = validation.data

    // Buscar id_aluno para update
    const { data: alunoList, error: alunoError } = await supabaseAdmin
      .from('alunos')
      .select('id_aluno')
      .eq('id_usuario', id)

    if (alunoError) {
      console.error('[PUT /api/usuarios/:id] Erro ao buscar aluno:', alunoError)
      return NextResponse.json({ erro: 'Erro ao buscar dados do aluno' }, { status: 500 })
    }

    if (!alunoList || alunoList.length === 0) {
      return NextResponse.json({ erro: 'Aluno não encontrado para este usuário' }, { status: 404 })
    }

    if (alunoList.length > 1) {
      console.warn('[PUT /api/usuarios/:id] Usuário tem múltiplos alunos:', id)
      return NextResponse.json({ erro: 'Erro: usuário associado a múltiplos alunos' }, { status: 400 })
    }

    const aluno = alunoList[0]

    console.log(`[PUT /api/usuarios/:id] ID do usuário: ${id}, ID do aluno: ${aluno.id_aluno}`)

    // Preparar dados para update na tabela alunos
    const alunoUpdateData: Record<string, any> = {}
    if (updateData.telefone !== undefined) alunoUpdateData.telefone = updateData.telefone
    if (updateData.endereco !== undefined) alunoUpdateData.endereco = updateData.endereco
    if (updateData.profissao !== undefined) alunoUpdateData.profissao = updateData.profissao
    if (updateData.tel_parente !== undefined) alunoUpdateData.tel_parente = updateData.tel_parente
    if (updateData.nome_parente !== undefined) alunoUpdateData.nome_parente = updateData.nome_parente
    if (updateData.grau_parentesco !== undefined) alunoUpdateData.grau_parentesco = updateData.grau_parentesco

    // Verificar se há dados para atualizar
    if (Object.keys(alunoUpdateData).length === 0) {
      console.warn('[PUT /api/usuarios/:id] Nenhum campo para atualizar')
      return NextResponse.json({ erro: 'Nenhum campo foi alterado' }, { status: 400 })
    }

    console.log(`[PUT /api/usuarios/:id] Enviando update para aluno ${aluno.id_aluno}:`, alunoUpdateData)

    // Atualizar na tabela alunos
    const updateResponse = await supabaseAdmin
      .from('alunos')
      .update(alunoUpdateData)
      .eq('id_aluno', aluno.id_aluno)

    console.log('[PUT /api/usuarios/:id] Resposta do update Supabase:', {
      error: updateResponse.error,
      data: updateResponse.data,
      status: updateResponse.status,
      statusText: updateResponse.statusText,
    })

    if (updateResponse.error) {
      console.error('[PUT /api/usuarios/:id] Update alunos error:', updateResponse.error)
      return NextResponse.json({ erro: `Erro ao atualizar dados: ${updateResponse.error.message}` }, { status: 500 })
    }

    console.log(`[PUT /api/usuarios/:id] Dados atualizados com sucesso para aluno ${aluno.id_aluno}`)

    // DEBUG: Verificar imediatamente se o dado foi persistido
    const { data: alunoVerificacao, error: verifyError } = await supabaseAdmin
      .from('alunos')
      .select('telefone,endereco,profissao,tel_parente,nome_parente,grau_parentesco')
      .eq('id_aluno', aluno.id_aluno)
      .single()

    if (!verifyError && alunoVerificacao) {
      console.log('[PUT /api/usuarios/:id] Verificação imediata após update:', alunoVerificacao)
    } else if (verifyError) {
      console.warn('[PUT /api/usuarios/:id] Erro ao verificar dados após update:', verifyError)
    }

    // Aguardar pequeno delay para garantir consistência dos dados após update
    await new Promise(resolve => setTimeout(resolve, 100))

    // Buscar dados atualizados
    const { data: usuarioAtualizado, error: fetchError } = await supabaseAdmin
      .from('usuarios')
      .select(`
        id_usuario,
        nome_completo,
        email,
        tipo_perfil,
        alunos (
          id_aluno,
          cpf,
          telefone,
          endereco,
          data_nascimento,
          profissao,
          nome_parente,
          tel_parente,
          grau_parentesco,
          id_usuario
        )
      `)
      .eq('id_usuario', id)
      .eq('tipo_perfil', 'ALUNO')
      .single()

    if (fetchError) {
      console.error('[PUT /api/usuarios/:id] Erro ao buscar dados atualizados:', fetchError)
      return NextResponse.json({ erro: 'Erro ao recuperar dados após atualização' }, { status: 500 })
    }

    if (!usuarioAtualizado) {
      console.error('[PUT /api/usuarios/:id] Dados do usuário não encontrados após update')
      return NextResponse.json({ erro: 'Dados do usuário não encontrados após atualização' }, { status: 500 })
    }

    // Validar que relação alunos foi retornada corretamente
    if (!usuarioAtualizado.alunos || usuarioAtualizado.alunos.length === 0) {
      console.error('[PUT /api/usuarios/:id] Relação alunos não retornada ou vazia')
      return NextResponse.json({ erro: 'Dados do aluno não encontrados após atualização' }, { status: 500 })
    }

    console.log('[PUT /api/usuarios/:id] Dados retornados para resposta:', usuarioAtualizado)

    // Preparar resposta combinando dados
    // alunos pode ser um objeto direto ou um array dependendo da resposta do Supabase
    let alunoDataAtual = null
    if (usuarioAtualizado.alunos) {
      if (Array.isArray(usuarioAtualizado.alunos)) {
        alunoDataAtual = usuarioAtualizado.alunos.length > 0 ? usuarioAtualizado.alunos[0] : null
      } else {
        // Se é um objeto simples (não array), usar direto
        alunoDataAtual = usuarioAtualizado.alunos
      }
    }

    console.log('[PUT /api/usuarios/:id] alunoDataAtual processado:', alunoDataAtual)
    
    const respostaAtualizada = {
      id_usuario: usuarioAtualizado.id_usuario,
      nome_completo: usuarioAtualizado.nome_completo,
      email: usuarioAtualizado.email,
      tipo_perfil: usuarioAtualizado.tipo_perfil,
      telefone: alunoDataAtual?.telefone || "",
      id_aluno: alunoDataAtual?.id_aluno || "",
      cpf: alunoDataAtual?.cpf || "",
      data_nascimento: alunoDataAtual?.data_nascimento || "",
      endereco: alunoDataAtual?.endereco || "",
      profissao: alunoDataAtual?.profissao || "",
      nome_parente: alunoDataAtual?.nome_parente || "",
      tel_parente: alunoDataAtual?.tel_parente || "",
      grau_parentesco: alunoDataAtual?.grau_parentesco || "",
    }

    return NextResponse.json(respostaAtualizada)
  } catch (error) {
    console.error('[PUT /api/usuarios/:id]', error)
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 })
  }
}
