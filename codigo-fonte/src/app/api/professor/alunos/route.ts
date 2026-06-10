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

    // 3. Buscar turmas do professor (via aulas_agenda, deduplicadas)
    const { data: aulas, error: aulasError } = await supabaseAdmin
      .from('aulas_agenda')
      .select('id_turma')
      .eq('id_professor', professor.id_professor)

    if (aulasError) {
      console.error('[PROFESSOR_ALUNOS]', aulasError)
      return NextResponse.json({ erro: 'Erro ao buscar turmas' }, { status: 500 })
    }

    const turmaIds = [...new Set((aulas ?? []).map(a => a.id_turma))]

    if (turmaIds.length === 0) {
      return NextResponse.json({ alunos: [], total: 0 })
    }

    // 4. Buscar alunos matriculados nessas turmas
    const { data: matriculas, error: matriculasError } = await supabaseAdmin
      .from('matriculas_turmas')
      .select(`
        id_matricula,
        status,
        id_turma,
        turmas ( nome ),
        alunos (
          id_aluno,
          usuarios (
            nome_completo,
            email
          )
        )
      `)
      .in('id_turma', turmaIds)
      .eq('status', 'ativo')

    if (matriculasError) {
      console.error('[PROFESSOR_ALUNOS]', matriculasError)
      return NextResponse.json({ erro: 'Erro ao buscar alunos' }, { status: 500 })
    }

    // 5. Deduplicar por id_aluno, agregando turmas
    const alunosMap = new Map<string, {
      id_aluno: string
      nome_completo: string
      email: string
      turmas: string[]
    }>()

    for (const m of matriculas ?? []) {
      const aluno = m.alunos as {
        id_aluno: string
        usuarios: { nome_completo: string; email: string } | null
      } | null

      const turma = m.turmas as { nome: string } | null

      if (!aluno) continue

      if (!alunosMap.has(aluno.id_aluno)) {
        alunosMap.set(aluno.id_aluno, {
          id_aluno: aluno.id_aluno,
          nome_completo: aluno.usuarios?.nome_completo ?? '',
          email: aluno.usuarios?.email ?? '',
          turmas: turma ? [turma.nome] : [],
        })
      } else if (turma) {
        alunosMap.get(aluno.id_aluno)!.turmas.push(turma.nome)
      }
    }

    const alunos = Array.from(alunosMap.values())

    return NextResponse.json({ alunos, total: alunos.length })
  } catch (error) {
    console.error('[PROFESSOR_ALUNOS]', error)
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 })
  }
}
