import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  try {
    // 1. Extrair token do header Authorization
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')

    // 2. Validar token e obter usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ erro: 'Token inválido ou expirado' }, { status: 401 })
    }

    // 3. Buscar id_professor a partir do auth_user_id
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

    // 4. Buscar turmas atribuídas via aulas_agenda (com join em turmas e ritmos)
    const { data: aulas, error: aulasError } = await supabaseAdmin
      .from('aulas_agenda')
      .select(`
        id_turma,
        data_hora_inicio,
        turmas ( id_turma, nome, capacidade_maxima, ritmos ( id_ritmo, nome ) )
      `)
      .eq('id_professor', professor.id_professor)
      .order('data_hora_inicio', { ascending: true })

    if (aulasError) {
      console.error('[PROFESSOR_TURMAS]', aulasError)
      return NextResponse.json({ erro: 'Erro ao buscar turmas' }, { status: 500 })
    }

    // 5. Deduplicar turmas e capturar próxima aula
    const now = new Date().toISOString()

    const turmasMap = new Map<string, {
      id_turma: string
      nome: string
      capacidade_maxima: number
      ritmo: { id_ritmo: string; nome: string } | null
      proxima_aula: string | null
    }>()

    for (const aula of aulas ?? []) {
      const t = (aula.turmas as unknown) as {
        id_turma: string
        nome: string
        capacidade_maxima: number
        ritmos: { id_ritmo: string; nome: string } | null
      } | null

      if (!t) continue

      if (!turmasMap.has(t.id_turma)) {
        turmasMap.set(t.id_turma, {
          id_turma: t.id_turma,
          nome: t.nome,
          capacidade_maxima: t.capacidade_maxima,
          ritmo: t.ritmos ?? null,
          proxima_aula: null,
        })
      }
 
      // Atribui a próxima aula futura (lista está ordenada ASC)
      const entry = turmasMap.get(t.id_turma)!
      if (!entry.proxima_aula && aula.data_hora_inicio >= now) {
        entry.proxima_aula = aula.data_hora_inicio
      }
    }

    const turmaIds = Array.from(turmasMap.keys())

    // 6. Contar alunos matriculados por turma
    if (turmaIds.length > 0) {
      const { data: matriculas } = await supabaseAdmin
        .from('matriculas_turmas')
        .select('id_turma')
        .in('id_turma', turmaIds)
        .eq('status', 'ativo')

      const contagemAlunos: Record<string, number> = {}
      for (const m of matriculas ?? []) {
        contagemAlunos[m.id_turma] = (contagemAlunos[m.id_turma] ?? 0) + 1
      }

      for (const [id, turma] of turmasMap) {
        ;(turma as typeof turma & { total_alunos: number }).total_alunos =
          contagemAlunos[id] ?? 0
      }
    }

    return NextResponse.json({ turmas: Array.from(turmasMap.values()) })

  } catch (error) {
    console.error('[PROFESSOR_TURMAS]', error)
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 })
  }
}
