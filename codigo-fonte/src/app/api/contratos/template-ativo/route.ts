// src/app/api/contratos/template-ativo/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET /api/contratos/template-ativo
// Retorna o texto do contrato/termo ativo
export async function GET(req: NextRequest) {
  try {
    // Buscar contrato ativo (público, sem autenticação)
    const { data: contrato, error } = await supabaseAdmin
      .from('contratos')
      .select('id_contrato, titulo, conteudo_html, versao, data_vigencia')
      .eq('ativo', true)
      .order('data_vigencia', { ascending: false })
      .limit(1)
      .single()

    if (error || !contrato) {
      return NextResponse.json(
        { erro: 'Nenhum contrato ativo encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id_contrato_template: contrato.id_contrato,
      titulo: contrato.titulo,
      conteudo_html: contrato.conteudo_html,
      versao: contrato.versao,
      data_vigencia: contrato.data_vigencia,
    })
  } catch (error) {
    console.error('[GET /api/contratos/template-ativo]', error)
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 })
  }
}
