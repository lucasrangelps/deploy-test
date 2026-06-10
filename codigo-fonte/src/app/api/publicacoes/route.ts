// src/app/api/publicacoes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET /api/publicacoes?id_aluno=xxx       → feed do aluno
// GET /api/publicacoes?id_professor=xxx   → publicações do professor
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id_aluno     = searchParams.get('id_aluno')
    const id_professor = searchParams.get('id_professor')

    // ── Professor: suas próprias publicações ────────────────────────────────
    if (id_professor) {
      const { data, error } = await supabaseAdmin
        .from('publicacoes')
        .select(`*, turmas(nome)`)
        .eq('id_professor', id_professor)
        .order('criado_em', { ascending: false })

      if (error) throw error
      return NextResponse.json({ data })
    }

    // ── Aluno: feed das turmas em que está matriculado ──────────────────────
    if (id_aluno) {
      const { data: matriculas, error: mErr } = await supabaseAdmin
        .from('matriculas_turmas')
        .select('id_turma')
        .eq('id_aluno', id_aluno)
        .eq('status', 'ativo')

      if (mErr) throw mErr

      const turmaIds = (matriculas ?? []).map((m: { id_turma: string }) => m.id_turma)

      let query = supabaseAdmin
        .from('publicacoes')
        .select(`*, professores(id_professor, usuarios(nome_completo)), turmas(nome)`)
        .order('destaque', { ascending: false })
        .order('criado_em', { ascending: false })

      if (turmaIds.length > 0) {
        query = query.or(`id_turma.is.null,id_turma.in.(${turmaIds.join(',')})`)
      } else {
        query = query.is('id_turma', null)
      }

      const { data, error } = await query
      if (error) throw error
      return NextResponse.json({ data })
    }

    return NextResponse.json({ erro: 'Parâmetros inválidos' }, { status: 400 })

  } catch (error: any) {
    console.error('[PUBLICACOES GET]', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { erro: error?.message || 'Erro interno', detalhes: error },
      { status: 500 },
    )
  }
}

// POST /api/publicacoes → professor cria publicação
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id_professor, titulo, conteudo, tipo, categoria, id_turma, fixado, destaque, imagem_url } = body

    if (!id_professor || !titulo || !conteudo) {
      return NextResponse.json(
        { erro: 'Campos obrigatórios ausentes: id_professor, titulo, conteudo.' },
        { status: 400 },
      )
    }

    const { data, error } = await supabaseAdmin
      .from('publicacoes')
      .insert({
        id_professor,
        titulo,
        conteudo,
        categoria:  categoria  ?? tipo    ?? 'comunicado', // aceita os dois nomes
        destaque:   destaque   ?? fixado  ?? false,         // aceita os dois nomes
        id_turma:   id_turma   ?? null,
        imagem_url: imagem_url ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error('[PUBLICACOES POST ERROR]', JSON.stringify(error, null, 2))
      throw error
    }

    return NextResponse.json({ data }, { status: 201 })

  } catch (error: any) {
    console.error('[PUBLICACOES POST]', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { erro: error?.message || 'Erro interno', detalhes: error },
      { status: 500 },
    )
  }
}

// PATCH /api/publicacoes → professor edita publicação
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, tipo, categoria, fixado, destaque, ...resto } = body

    if (!id) {
      return NextResponse.json({ erro: 'ID obrigatório' }, { status: 400 })
    }

    const updatePayload = {
      ...resto,
      // normaliza nomes dos campos
      ...(categoria  !== undefined || tipo    !== undefined ? { categoria:  categoria  ?? tipo    } : {}),
      ...(destaque   !== undefined || fixado  !== undefined ? { destaque:   destaque   ?? fixado  } : {}),
      atualizado_em: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('publicacoes')
      .update(updatePayload)
      .eq('id_publicacao', id)
      .select()
      .single()

    if (error) {
      console.error('[PUBLICACOES PATCH ERROR]', JSON.stringify(error, null, 2))
      throw error
    }

    return NextResponse.json({ data })

  } catch (error: any) {
    console.error('[PUBLICACOES PATCH]', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { erro: error?.message || 'Erro interno', detalhes: error },
      { status: 500 },
    )
  }
}

// DELETE /api/publicacoes?id=xxx → professor deleta publicação
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ erro: 'ID obrigatório' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('publicacoes')
      .delete()
      .eq('id_publicacao', id)

    if (error) {
      console.error('[PUBLICACOES DELETE ERROR]', JSON.stringify(error, null, 2))
      throw error
    }

    return NextResponse.json({ message: 'Publicação removida' })

  } catch (error: any) {
    console.error('[PUBLICACOES DELETE]', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { erro: error?.message || 'Erro interno', detalhes: error },
      { status: 500 },
    )
  }
}