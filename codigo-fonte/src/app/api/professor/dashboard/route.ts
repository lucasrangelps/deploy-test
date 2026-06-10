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

    // 2. Buscar dados do professor
    const { data: usuario, error: usuarioError } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario, nome_completo, professores(especialidade)')
      .eq('auth_user_id', user.id)
      .eq('tipo_perfil', 'PROFESSOR')
      .single()

    if (usuarioError) {
      console.error('[PROFESSOR_DASHBOARD]', usuarioError)
      return NextResponse.json({ erro: 'Erro ao buscar perfil' }, { status: 500 })
    }
    if (!usuario) {
      return NextResponse.json({ erro: 'Professor não encontrado' }, { status: 404 })
    }

    const { data: professor, error: profError } = await supabaseAdmin
      .from('professores')
      .select('id_professor')
      .eq('id_usuario', usuario.id_usuario)
      .single()

    if (profError) {
      console.error('[PROFESSOR_DASHBOARD]', profError)
      return NextResponse.json({ erro: 'Erro ao buscar perfil de professor' }, { status: 500 })
    }
    
    if (!professor) {
      return NextResponse.json({ erro: 'Perfil de professor não encontrado' }, { status: 404 })
    }

    // 3. Buscar turmas ativas (distintas) do professor
    const { data: aulasAll, error: aulasError } = await supabaseAdmin
      .from('aulas_agenda')
      .select('id_turma')
      .eq('id_professor', professor.id_professor)

    if (aulasError) {
      return NextResponse.json({ erro: 'Erro ao buscar turmas' }, { status: 500 })
    }

    const turmasUnicas = new Set((aulasAll ?? []).map((a) => a.id_turma))
    const turmasAtivas = turmasUnicas.size

    // 4. Contar total de alunos ativos nas turmas do professor
    let totalAlunos = 0
    if (turmasUnicas.size > 0) {
      const { count, error: alunosError } = await supabaseAdmin
        .from('matriculas_turmas')
        .select('id_matricula', { count: 'exact', head: true })
        .in('id_turma', Array.from(turmasUnicas))
        .eq('status', 'ativa')

      if (!alunosError) {
        totalAlunos = count ?? 0
      }
    }

    // 5. Contar aulas de hoje
    const hoje = new Date()
    const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString()
    const fimDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1).toISOString()

    const { count: aulasHoje, error: aulasHojeError } = await supabaseAdmin
      .from('aulas_agenda')
      .select('id_aula', { count: 'exact', head: true })
      .eq('id_professor', professor.id_professor)
      .gte('data_hora_inicio', inicioDia)
      .lt('data_hora_inicio', fimDia)

    if (aulasHojeError) {
      return NextResponse.json({ erro: 'Erro ao buscar aulas de hoje' }, { status: 500 })
    }

    // 6. Montar especialidade legível
    const prof = (usuario.professores as unknown) as { especialidades: string[] }[] | null
    const especialidade = prof?.[0]?.especialidades?.[0] ?? 'Instrutor de dança'

    return NextResponse.json({
      nome_completo: usuario.nome_completo,
      especialidade,
      turmas_ativas: turmasAtivas,
      total_alunos: totalAlunos,
      aulas_hoje: aulasHoje ?? 0,
    })
  } catch (error) {
    console.error('[PROFESSOR_DASHBOARD]', error)
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 })
  }
}
