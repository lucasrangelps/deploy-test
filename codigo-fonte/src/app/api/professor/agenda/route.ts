import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  try {
    // 1. Auth
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ erro: 'Token inválido ou expirado' }, { status: 401 })
    }

    // 2. Resolver id_professor
    const { data: usuario, error: usuarioError } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario')
      .eq('auth_user_id', user.id)
      .eq('tipo_perfil', 'PROFESSOR')
      .single()

    if (usuarioError || !usuario) {
      return NextResponse.json({ erro: 'Professor não encontrado' }, { status: 404 })
    }

    const { data: professor, error: profError } = await supabaseAdmin
      .from('professores')
      .select('id_professor')
      .eq('id_usuario', usuario.id_usuario)
      .single()

    if (profError || !professor) {
      return NextResponse.json({ erro: 'Perfil de professor não encontrado' }, { status: 404 })
    }

    // 3. Filtro por mês/ano (opcional — ?ano=2026&mes=5)
    const { searchParams } = new URL(req.url)
    const ano = parseInt(searchParams.get('ano') ?? String(new Date().getFullYear()))
    const mes = parseInt(searchParams.get('mes') ?? String(new Date().getMonth() + 1))

    const inicioMes = new Date(ano, mes - 1, 1).toISOString()
    const fimMes = new Date(ano, mes, 1).toISOString()

    // 4. Buscar aulas do professor no intervalo
    const { data: aulas, error: aulasError } = await supabaseAdmin
      .from('aulas_agenda')
      .select(`
        id_aula,
        tipo_aula,
        data_hora_inicio,
        data_hora_fim,
        status,
        turmas (
          id_turma,
          nome,
          ritmos ( nome )
        )
      `)
      .eq('id_professor', professor.id_professor)
      .gte('data_hora_inicio', inicioMes)
      .lt('data_hora_inicio', fimMes)
      .order('data_hora_inicio', { ascending: true })

    if (aulasError) {
      console.error('[PROFESSOR_AGENDA]', aulasError)
      return NextResponse.json({ erro: 'Erro ao buscar agenda' }, { status: 500 })
    }

    return NextResponse.json({ aulas: aulas ?? [] })
  } catch (error) {
    console.error('[PROFESSOR_AGENDA]', error)
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 })
  }
}
