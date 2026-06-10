import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET /api/alunos?id_usuario=<uuid>
// GET /api/alunos?search=<termo>
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const id_usuario = searchParams.get('id_usuario')
    const search = searchParams.get('search') ?? ''

    // Caso 1: busca o id_aluno pelo id_usuario autenticado
    if (id_usuario) {
      const { data, error } = await supabaseAdmin
        .from('alunos')
        .select('id_aluno')
        .eq('id_usuario', id_usuario)
        .single()

      if (error) {
        console.error('[GET /api/alunos?id_usuario]', error)
        return NextResponse.json(
          { erro: 'Aluno não encontrado.' },
          { status: 404 }
        )
      }

      return NextResponse.json({ data })
    }

    // Caso 2: lista alunos para o dashboard
    let query = supabaseAdmin
      .from('alunos')
      .select(`
        id_aluno,
        cpf,
        telefone,
        usuarios!inner (
          id_usuario,
          nome_completo,
          email,
          criado_em
        ),
        matriculas_turmas (
          status
        ),
        contratos (
          parcelas (
            status
          )
        )
      `)
      .order('id_aluno', { ascending: false })

    if (search) {
      query = query.or(
        `nome_completo.ilike.%${search}%,email.ilike.%${search}%`,
        { referencedTable: 'usuarios' }
      )
    }

    const { data, error } = await query

    if (error) throw error

    const resultado = (data ?? []).map((aluno: any) => {
      const turmasAtivas = (aluno.matriculas_turmas ?? []).filter(
        (m: any) => m.status === 'ativa'
      ).length

      const parcelas = (aluno.contratos ?? []).flatMap(
        (c: any) => c.parcelas ?? []
      )

      const inadimplente = parcelas.some(
        (p: any) => p.status === 'atrasado'
      )

      return {
        id_aluno: aluno.id_aluno,
        nome_completo: aluno.usuarios?.nome_completo ?? '',
        email: aluno.usuarios?.email ?? '',
        cpf: aluno.cpf ?? null,
        telefone: aluno.telefone ?? null,
        status_financeiro: inadimplente ? 'inadimplente' : 'em_dia',
        turmas_ativas: turmasAtivas,
        criado_em: aluno.usuarios?.criado_em ?? null,
      }
    })

    return NextResponse.json(resultado)
  } catch (error) {
    console.error('[GET /api/alunos]', error)
    return NextResponse.json(
      { erro: 'Erro ao buscar alunos' },
      { status: 500 }
    )
  }
}