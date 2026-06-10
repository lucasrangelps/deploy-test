import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const AdminUpdateSchema = z.object({
  nome_completo: z.string().min(3).max(150).optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  data_nascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

// Helper: verifica autenticação e que o solicitante é ADMIN.
// Retorna o auth_user_id do solicitante ou uma NextResponse de erro.
async function verificarAdmin(req: NextRequest): Promise<{ id_usuario_solicitante?: string; erro?: NextResponse }> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { erro: NextResponse.json({ erro: 'Não autorizado' }, { status: 401 }) }
  }
  const rawToken = authHeader.replace('Bearer ', '')

  const { data: { user }, error: authError } = await supabase.auth.getUser(rawToken)
  if (authError || !user) {
    return { erro: NextResponse.json({ erro: 'Token inválido ou expirado' }, { status: 401 }) }
  }

  const { data: solicitante } = await supabaseAdmin
    .from('usuarios')
    .select('id_usuario, tipo_perfil')
    .eq('auth_user_id', user.id)
    .single()

  if (solicitante?.tipo_perfil !== 'ADMIN') {
    return { erro: NextResponse.json({ erro: 'Acesso restrito ao administrador' }, { status: 403 }) }
  }

  return { id_usuario_solicitante: solicitante.id_usuario }
}

// GET /api/admin/admins/:id
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { erro } = await verificarAdmin(req)
  if (erro) return erro

  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('id_admin, usuarios(id_usuario, nome_completo, email, criado_em)')
    .eq('id_admin', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ erro: 'Administrador não encontrado' }, { status: 404 })
  }

  return NextResponse.json(data)
}

// PUT /api/admin/admins/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { erro, id_usuario_solicitante } = await verificarAdmin(req)
  if (erro) return erro

  const { id } = await params

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ erro: 'Corpo da requisição inválido' }, { status: 400 })
  }

  const parsed = AdminUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { erro: 'Dados inválidos', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  // Buscar id_usuario vinculado a este admin
  const { data: adminData, error: findError } = await supabaseAdmin
    .from('admins')
    .select('id_admin, id_usuario')
    .eq('id_admin', id)
    .single()

  if (findError || !adminData) {
    return NextResponse.json({ erro: 'Administrador não encontrado' }, { status: 404 })
  }

  // Impedir auto-alteração via outro registro (segurança extra)
  const { nome_completo, email, ...rest } = parsed.data
  const camposUsuario: Record<string, unknown> = {}
  if (nome_completo) camposUsuario.nome_completo = nome_completo
  if (email) camposUsuario.email = email

  try {
    // Atualizar tabela usuarios
    if (Object.keys(camposUsuario).length > 0) {
      const { error: userError } = await supabaseAdmin
        .from('usuarios')
        .update(camposUsuario)
        .eq('id_usuario', adminData.id_usuario)

      if (userError) throw userError

      // Sincronizar e-mail no Supabase Auth se alterado
      if (email) {
        const { data: usuarioData } = await supabaseAdmin
          .from('usuarios')
          .select('auth_user_id')
          .eq('id_usuario', adminData.id_usuario)
          .single()

        if (usuarioData?.auth_user_id) {
          await supabaseAdmin.auth.admin.updateUserById(usuarioData.auth_user_id, { email })
        }
      }
    }

    return NextResponse.json({ message: 'Administrador atualizado com sucesso' })
  } catch (error) {
    console.error('[ADMIN/ADMINS PUT]', error)
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 })
  }
}

// DELETE /api/admin/admins/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { erro, id_usuario_solicitante } = await verificarAdmin(req)
  if (erro) return erro

  const { id } = await params

  // 1. Buscar id_usuario vinculado ao admin
  const { data: adminData, error: findError } = await supabaseAdmin
    .from('admins')
    .select('id_admin, id_usuario')
    .eq('id_admin', id)
    .single()

  if (findError || !adminData) {
    return NextResponse.json({ erro: 'Administrador não encontrado' }, { status: 404 })
  }

  // 2. Impedir que o admin exclua a própria conta
  if (adminData.id_usuario === id_usuario_solicitante) {
    return NextResponse.json({ erro: 'Não é possível excluir a própria conta de administrador' }, { status: 403 })
  }

  // 3. Buscar auth_user_id em query separada (evita ambiguidade de join aninhado)
  const { data: usuarioData, error: usuarioFindError } = await supabaseAdmin
    .from('usuarios')
    .select('auth_user_id')
    .eq('id_usuario', adminData.id_usuario)
    .single()

  if (usuarioFindError || !usuarioData) {
    return NextResponse.json({ erro: 'Usuário não encontrado' }, { status: 404 })
  }

  try {
    // 4. Excluir da tabela usuarios — o CASCADE remove a linha de admins automaticamente
    const { error: userDeleteError } = await supabaseAdmin
      .from('usuarios')
      .delete()
      .eq('id_usuario', adminData.id_usuario)

    if (userDeleteError) throw userDeleteError

    // 5. Excluir do Supabase Auth (revoga o acesso de login)
    if (usuarioData.auth_user_id) {
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
        usuarioData.auth_user_id,
      )
      if (authDeleteError) {
        // Registra o erro mas não reverte — o usuário já não existe em usuarios
        console.error('[ADMIN/ADMINS DELETE] Falha ao excluir do Auth:', authDeleteError)
      }
    }

    return NextResponse.json({ message: 'Administrador excluído com sucesso' })
  } catch (error) {
    console.error('[ADMIN/ADMINS DELETE]', error)
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 })
  }
}
