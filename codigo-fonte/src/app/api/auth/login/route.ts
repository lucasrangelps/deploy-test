import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json()

    if (!email || !senha) {
      return NextResponse.json(
        { erro: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // 🔐 Login no Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password: senha,
      })

    if (authError || !authData.user) {
      return NextResponse.json(
        { erro: 'Credenciais inválidas' },
        { status: 400 }
      )
    }

    const authUserId = authData.user.id

    // 🔎 Buscar dados do usuário na tabela
    const { data: usuario, error: userError } =
      await supabaseAdmin
        .from('usuarios')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single()

    if (userError || !usuario) {
      return NextResponse.json(
        { erro: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      session: authData.session,
      usuario,
    })

  } catch (error) {
    console.error('[LOGIN]', error)
    return NextResponse.json(
      { erro: 'Erro interno no servidor' },
      { status: 500 }
    )
  }
}