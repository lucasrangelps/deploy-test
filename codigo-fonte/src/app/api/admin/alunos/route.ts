import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { RegisterSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  // 1. Verificar autenticação e role ADMIN
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }
  const rawToken = authHeader.replace('Bearer ', '')

  const { data: { user }, error: authError } = await supabase.auth.getUser(rawToken)
  if (authError || !user) {
    return NextResponse.json({ erro: 'Token inválido ou expirado' }, { status: 401 })
  }

  const { data: usuarioAuth } = await supabaseAdmin
    .from('usuarios')
    .select('tipo_perfil')
    .eq('auth_user_id', user.id)
    .single()

  if (usuarioAuth?.tipo_perfil !== 'ADMIN') {
    return NextResponse.json({ erro: 'Acesso restrito ao administrador' }, { status: 403 })
  }

  // 2. Validar body
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ erro: 'Corpo da requisição inválido' }, { status: 400 })
  }

  const parsed = RegisterSchema.safeParse({ ...body, role: 'ALUNO' })
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    return NextResponse.json({ erro: 'Dados inválidos', fieldErrors }, { status: 400 })
  }

  const {
    nomeCompleto,
    email,
    senha,
    telefone,
    dataNascimento,
    cpf,
    endereco,
    nomeMae,
    profissao,
    menorIdade,
    telParente,
    nomeParente,
    grauParentesco,
    genero,
    observacoes,
  } = parsed.data

  try {
    // 3. Criar usuário no Auth do Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
    })

    if (authError) {
      const isConflict =
        authError.message.toLowerCase().includes('already') ||
        authError.message.toLowerCase().includes('duplicate')
      return NextResponse.json(
        { erro: isConflict ? 'E-mail já cadastrado no sistema' : authError.message },
        { status: isConflict ? 409 : 400 },
      )
    }

    const authUserId = authData.user.id

    // 4. Inserir em usuarios
    const { data: usuario, error: userError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        auth_user_id: authUserId,
        nome_completo: nomeCompleto,
        email,
        tipo_perfil: 'ALUNO',
      })
      .select()
      .single()

    if (userError) throw userError

    // 5. Inserir em alunos
    const { data: alunoData, error: alunoError } = await supabaseAdmin
      .from('alunos')
      .insert({
        id_usuario: usuario.id_usuario,
        telefone: telefone || null,
        data_nascimento: dataNascimento || null,
        cpf: cpf || null,
        endereco: endereco || null,
        nome_mae: nomeMae || null,
        profissao: profissao || null,
        genero: genero || null,
        observacoes: observacoes || null,
        tel_parente: menorIdade ? telParente ?? null : null,
        nome_parente: menorIdade ? nomeParente ?? null : null,
        grau_parentesco: menorIdade ? grauParentesco ?? null : null,
      })
      .select('id_aluno')
      .single()

    if (alunoError) {
      console.error('[ADMIN/ALUNOS] Erro ao inserir aluno:', alunoError)
      throw alunoError
    }

    return NextResponse.json(
      { message: 'Aluno matriculado com sucesso', id_aluno: alunoData.id_aluno },
      { status: 201 },
    )
  } catch (error) {
    console.error('[ADMIN/ALUNOS]', error)
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 })
  }
}
