import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { RegisterSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  // 1. Verificar autenticação
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }
  const rawToken = authHeader.replace('Bearer ', '')

  const { data: { user }, error: authError } = await supabase.auth.getUser(rawToken)
  if (authError || !user) {
    return NextResponse.json({ erro: 'Token inválido ou expirado' }, { status: 401 })
  }

  // 2. Verificar que o solicitante é ADMIN
  const { data: solicitante } = await supabaseAdmin
    .from('usuarios')
    .select('tipo_perfil')
    .eq('auth_user_id', user.id)
    .single()

  if (solicitante?.tipo_perfil !== 'ADMIN') {
    return NextResponse.json({ erro: 'Acesso restrito ao administrador' }, { status: 403 })
  }

  // 3. Validar body — role é sempre 'ADMIN', ignorar qualquer role enviado pelo cliente
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ erro: 'Corpo da requisição inválido' }, { status: 400 })
  }

  const parsed = RegisterSchema.safeParse({
    ...body,
    role: 'ADMIN',
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    return NextResponse.json({ erro: 'Dados inválidos', fieldErrors }, { status: 400 })
  }

  const { nomeCompleto, email, senha, telefone, dataNascimento, genero, observacoes } = parsed.data

  try {
    // 4. Criar usuário no Auth do Supabase
    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
    })

    if (createAuthError) {
      const isConflict =
        createAuthError.message.toLowerCase().includes('already') ||
        createAuthError.message.toLowerCase().includes('duplicate')
      return NextResponse.json(
        { erro: isConflict ? 'E-mail já cadastrado no sistema' : 'Erro ao criar usuário' },
        { status: isConflict ? 409 : 400 },
      )
    }

    const authUserId = authData.user.id

    // 5. Inserir em usuarios com tipo_perfil ADMIN e rastreio de auditoria
    const { data: usuario, error: userError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        auth_user_id: authUserId,
        nome_completo: nomeCompleto,
        email,
        tipo_perfil: 'ADMIN',
      })
      .select('id_usuario')
      .single()

    if (userError) throw userError

    // 6. Inserir em admins
    const { error: adminError } = await supabaseAdmin
      .from('admins')
      .insert({ id_usuario: usuario.id_usuario })

    if (adminError) throw adminError

    return NextResponse.json(
      { message: 'Admin criado com sucesso', id_usuario: usuario.id_usuario },
      { status: 201 },
    )
  } catch (error) {
    console.error('[ADMIN/ADMINS]', error)
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  // 1. Verificar autenticação
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }
  const rawToken = authHeader.replace('Bearer ', '')

  const { data: { user }, error: authError } = await supabase.auth.getUser(rawToken)
  if (authError || !user) {
    return NextResponse.json({ erro: 'Token inválido ou expirado' }, { status: 401 })
  }

  const { data: solicitante } = await supabaseAdmin
    .from('usuarios')
    .select('tipo_perfil')
    .eq('auth_user_id', user.id)
    .single()

  if (solicitante?.tipo_perfil !== 'ADMIN') {
    return NextResponse.json({ erro: 'Acesso restrito ao administrador' }, { status: 403 })
  }

  // 2. Listar admins com dados do usuário
  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('id_admin, usuarios(id_usuario, nome_completo, email, criado_em)')
    .order('id_admin', { ascending: true })

  if (error) {
    console.error('[ADMIN/ADMINS] GET:', error)
    return NextResponse.json({ erro: 'Erro ao buscar administradores' }, { status: 500 })
  }

  return NextResponse.json(data)
}
