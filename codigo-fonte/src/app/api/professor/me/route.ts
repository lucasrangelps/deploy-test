// src/app/api/professor/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ erro: 'Token inválido ou expirado' }, { status: 401 })
    }

    const { data: usuario, error } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario, nome_completo, email, tipo_perfil, professores(especialidade)')
      .eq('auth_user_id', user.id)
      .eq('tipo_perfil', 'PROFESSOR')
      .single()

    if(error) {
      console.error('[PROFESSOR_ME]', error)
      return NextResponse.json({ erro: 'Erro ao buscar perfil' }, { status: 500 })
    }

    if (!usuario) {
      return NextResponse.json({ erro: 'Professor não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ usuario })
  } catch (error) {
    console.error('[PROFESSOR_ME]', error)
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 })
  }
}