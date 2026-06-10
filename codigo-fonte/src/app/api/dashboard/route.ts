import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    // 1. Total de alunos
    const { count: totalAlunos } = await supabaseAdmin
      .from('alunos')
      .select('*', { count: 'exact', head: true })

    // 2. Turmas ativas
    const { count: turmasAtivas } = await supabaseAdmin
      .from('turmas')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true)

    // 3. Leads captados
    const { count: totalLeads } = await supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true })

    // 4. Receita do mes atual
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)

    const { data: pagamentosMes } = await supabaseAdmin
      .from('pagamentos')
      .select('valor_pago')
      .gte('data_pagamento', inicioMes.toISOString())

    const receitaMensal = (pagamentosMes || []).reduce(
      (acc, p) => acc + Number(p.valor_pago), 0
    )

    // 5. Ultimas 5 matriculas
    const { data: ultimasMatriculas } = await supabaseAdmin
      .from('matriculas_turmas')
      .select(`
        id_matricula, status,
        alunos (
          id_aluno,
          usuarios ( nome_completo )
        ),
        turmas ( nome )
      `)
      .order('id_matricula', { ascending: false })
      .limit(5)

    // 6. Proximas aulas do dia
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)

    const { data: aulasHoje } = await supabaseAdmin
      .from('aulas_agenda')
      .select(`
        *,
        turmas (
          nome,
          ritmos ( nome ),
          professores (
            usuarios ( nome_completo )
          )
        )
      `)
      .gte('data', hoje.toISOString().split('T')[0])
      .lte('data', hoje.toISOString().split('T')[0])
      .eq('cancelada', false)
      .order('hora_inicio', { ascending: true })
      .limit(3)

    return NextResponse.json({
      kpis: {
        total_alunos: totalAlunos || 0,
        receita_mensal: receitaMensal,
        turmas_ativas: turmasAtivas || 0,
        total_leads: totalLeads || 0,
      },
      ultimas_matriculas: ultimasMatriculas || [],
      aulas_hoje: aulasHoje || [],
    })
  } catch (err) {
    console.error('[DASHBOARD GET]', err)
    return NextResponse.json({ erro: 'Erro interno.' }, { status: 500 })
  }
}