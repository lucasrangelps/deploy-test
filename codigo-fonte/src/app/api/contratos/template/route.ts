import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { z } from 'zod'

const ContratoTemplateSchema = z.object({
  conteudo: z.string().min(50, 'O contrato deve ter ao menos 50 caracteres'),
})

// GET /api/contratos/template — retorna a versão ativa, ou todas se ?historico=true
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const historico = searchParams.get('historico') === 'true'

    if (historico) {
      const { data, error } = await supabaseAdmin
        .from('contratos_template')
        .select('id_template, versao, ativo, criado_em')
        .order('versao', { ascending: false })

      if (error) throw error
      return NextResponse.json(data ?? [])
    }

    const { data: ativo, error } = await supabaseAdmin
      .from('contratos_template')
      .select('id_template, versao, conteudo, ativo, criado_em')
      .eq('ativo', true)
      .maybeSingle()

    if (error) throw error

    if (!ativo) {
      return NextResponse.json({ mensagem: 'Nenhum contrato ativo cadastrado' }, { status: 404 })
    }

    return NextResponse.json(ativo)
  } catch (error) {
    console.error('[GET CONTRATOS TEMPLATE]', error)
    return NextResponse.json({ erro: 'Erro ao buscar contrato' }, { status: 500 })
  }
}

// PUT /api/contratos/template — salva nova versão e desativa a anterior
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()

    const parsed = ContratoTemplateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Busca versão atual para calcular próximo número de versão
    const { data: atual } = await supabaseAdmin
      .from('contratos_template')
      .select('id_template, versao')
      .eq('ativo', true)
      .maybeSingle()

    const proximaVersao = atual ? atual.versao + 1 : 1

    // Desativa todas as versões anteriores
    if (atual) {
      const { error: desativarErr } = await supabaseAdmin
        .from('contratos_template')
        .update({ ativo: false })
        .eq('ativo', true)

      if (desativarErr) throw desativarErr
    }

    // Insere nova versão como ativa
    const { data: nova, error: insertErr } = await supabaseAdmin
      .from('contratos_template')
      .insert({
        versao: proximaVersao,
        conteudo: parsed.data.conteudo,
        ativo: true,
      })
      .select()
      .single()

    if (insertErr) throw insertErr

    return NextResponse.json({
      mensagem: `Versão ${proximaVersao} salva e ativada com sucesso`,
      template: nova,
    })
  } catch (error) {
    console.error('[PUT CONTRATOS TEMPLATE]', error)
    return NextResponse.json({ erro: 'Erro ao salvar contrato' }, { status: 500 })
  }
}
