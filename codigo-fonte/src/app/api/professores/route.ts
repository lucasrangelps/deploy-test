// src/app/api/professores/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET /api/professores                  → lista todos (uso atual)
// GET /api/professores?id_usuario=xxx   → busca pelo id_usuario (hook)
export async function GET(req: NextRequest) {
  try {
    const id_usuario = req.nextUrl.searchParams.get('id_usuario')

    // ── Busca por id_usuario (para o hook useIdProfessor) ──────────────────
    if (id_usuario) {
      const { data, error } = await supabaseAdmin
        .from('professores')
        .select('id_professor, id_usuario')
        .eq('id_usuario', id_usuario)
        .single()

      if (error) {
        console.error('[GET /api/professores] id_usuario', error)
        return NextResponse.json({ erro: 'Professor não encontrado.' }, { status: 404 })
      }

      return NextResponse.json({ data })
    }

    // ── Lista todos (comportamento original) ───────────────────────────────
    const { data, error } = await supabaseAdmin
      .from('professores')
      .select(`
        *,
        usuarios (
          id_usuario,
          nome_completo,
          email,
          tipo_perfil
        ),
        turmas (
          id_turma,
          nome,
          ativo,
          ritmos ( nome )
        )
      `)
      .order('id_professor', { ascending: true })

    if (error) throw error

    const resultado = data.map((prof: any) => ({
      ...prof,
      total_turmas_ativas: prof.turmas?.filter((t: any) => t.ativo).length ?? 0,
    }))

    return NextResponse.json(resultado)

  } catch (error) {
    console.error('[GET PROFESSORES]', error)
    return NextResponse.json({ erro: 'Erro ao buscar professores' }, { status: 500 })
  }
}