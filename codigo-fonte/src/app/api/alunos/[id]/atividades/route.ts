// src/app/api/alunos/[id]/atividades/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET /api/alunos/:id/atividades
// Retorna histórico de atividades recentes do aluno (matrículas, pagamentos, etc)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: id_aluno } = await params

    // Validar que aluno existe
    const { data: aluno } = await supabaseAdmin
      .from('alunos')
      .select('id_aluno, id_usuario')
      .eq('id_aluno', id_aluno)
      .single()

    if (!aluno) {
      return NextResponse.json({ erro: 'Aluno não encontrado' }, { status: 404 })
    }

    const atividades = []

    // 1. Buscar matrículas recentes
    const { data: matriculas } = await supabaseAdmin
      .from('matriculas_turmas')
      .select(`
        id_matricula,
        id_turma,
        turmas ( nome ),
        id_aluno
      `)
      .eq('id_aluno', id_aluno)
      .order('id_matricula', { ascending: false })
      .limit(3)

    if (matriculas) {
      matriculas.forEach((mat: any) => {
        atividades.push({
          tipo: 'matricula',
          titulo: `Matrícula em ${mat.turmas?.nome}`,
          descricao: 'Você foi matriculado(a) em uma nova turma',
          timestamp: new Date().toISOString(), // Usar id_matricula como proxy se necessário
          icon: '📝',
        })
      })
    }

    // 2. Buscar pagamentos recentes (último mês)
    const { data: pagamentos } = await supabaseAdmin
      .from('pagamentos')
      .select(`
        id_pagamento,
        data_pagamento,
        valor_pago,
        metodo,
        parcelas (
          numero_parcela,
          contratos (
            id_aluno
          )
        )
      `)
      .eq('parcelas.contratos.id_aluno', id_aluno)
      .order('data_pagamento', { ascending: false })
      .limit(3)

    if (pagamentos) {
      pagamentos.forEach((pag: any) => {
        atividades.push({
          tipo: 'pagamento',
          titulo: `Pagamento realizado`,
          descricao: `R$ ${parseFloat(pag.valor_pago).toFixed(2)} via ${pag.metodo}`,
          timestamp: pag.data_pagamento,
          icon: '💳',
        })
      })
    }

    // 3. Data de cadastro (apenas uma vez)
    const { data: usuario } = await supabaseAdmin
      .from('usuarios')
      .select('criado_em')
      .eq('id_usuario', aluno.id_usuario)
      .single()

    if (usuario) {
      atividades.push({
        tipo: 'cadastro',
        titulo: 'Conta criada',
        descricao: 'Seu cadastro foi concluído com sucesso',
        timestamp: usuario.criado_em,
        icon: '✅',
      })
    }

    // Ordenar por timestamp (mais recente primeiro) e limitar a 5
    atividades.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return NextResponse.json({
      atividades: atividades.slice(0, 5),
    })
  } catch (error) {
    console.error('[GET /api/alunos/:id/atividades]', error)
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 })
  }
}
