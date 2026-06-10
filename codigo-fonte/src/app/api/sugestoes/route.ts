// src/app/api/sugestoes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// GET /api/sugestoes?id_aluno=xxx
// GET /api/sugestoes?status=aberto|em_analise|resolvido
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id_aluno = searchParams.get('id_aluno')
    const status   = searchParams.get('status')

    // ── Aluno: busca as próprias sugestões ──────────────────────────────────
    if (id_aluno) {
      const { data, error } = await supabaseAdmin
        .from('sugestoes')
        .select('*')
        .eq('id_aluno', id_aluno)
        .order('criado_em', { ascending: false })

      if (error) {
        console.error('[GET ALUNO ERROR]', error)
        throw error
      }

      return NextResponse.json({ data: data ?? [] })
    }

    // ── Admin: todas as sugestões com dados do aluno ────────────────────────
    let query = supabaseAdmin
      .from('sugestoes')
      .select(`
        *,
        alunos (
          id_aluno,
          usuarios (
            nome_completo,
            email
          )
        )
      `)
      .order('criado_em', { ascending: false })

    if (status) query = query.eq('status', status)

    const { data, error } = await query

    if (error) {
      console.error('[GET ADMIN ERROR]', error)
      throw error
    }

    // Normaliza id_sugestao → id  e  assunto → titulo para o dashboard admin
    const normalizado = (data ?? []).map(({ id_sugestao, assunto, ...rest }: any) => ({
      id:     id_sugestao,
      titulo: assunto,
      ...rest,
    }))

    return NextResponse.json({ data: normalizado })

  } catch (error: any) {
    console.error('[SUGESTOES GET]', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { erro: error?.message || 'Erro interno', detalhes: error },
      { status: 500 },
    )
  }
}

// POST /api/sugestoes
// body: { id_aluno, assunto, mensagem, categoria? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id_aluno, titulo, assunto, mensagem, categoria } = body

    if (!id_aluno || !(titulo || assunto) || !mensagem) {
      return NextResponse.json(
        { erro: 'Campos obrigatórios ausentes: id_aluno, assunto, mensagem.' },
        { status: 400 },
      )
    }

    const payload = {
      id_aluno,
      assunto:   titulo ?? assunto,
      mensagem,
      categoria: categoria || 'outro',
    }

    const { data, error } = await supabaseAdmin
      .from('sugestoes')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('[INSERT ERROR]', error)
      throw error
    }

    return NextResponse.json({ data }, { status: 201 })

  } catch (error: any) {
    console.error('[SUGESTOES POST]', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { erro: error?.message || 'Erro interno', detalhes: error },
      { status: 500 },
    )
  }
}

// PATCH /api/sugestoes
// body: { id, resposta, respondido_por? }
// PATCH /api/sugestoes
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, resposta } = body

    if (!id || !resposta) {
      return NextResponse.json(
        { erro: 'Campos obrigatórios ausentes: id, resposta.' },
        { status: 400 },
      )
    }

    // Atualiza SOMENTE resposta e status — sem tocar em id_admin ou respondido_em
    const { data, error } = await supabaseAdmin
      .from('sugestoes')
      .update({ resposta, status: 'resolvido' })
      .eq('id_sugestao', id)
      .select('id_sugestao, resposta, status')
      .single()

    if (error) {
      console.error('[PATCH ERROR]', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { erro: error.message, detalhes: error },
        { status: 500 },
      )
    }

    // Confirma que realmente atualizou
    if (!data) {
      console.error('[PATCH] Nenhuma linha atualizada para id_sugestao:', id)
      return NextResponse.json(
        { erro: 'Sugestão não encontrada.' },
        { status: 404 },
      )
    }

    console.log('[PATCH SUCCESS]', data)
    return NextResponse.json({ data })

  } catch (error: any) {
    console.error('[SUGESTOES PATCH]', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { erro: error?.message || 'Erro interno' },
      { status: 500 },
    )
  }
}