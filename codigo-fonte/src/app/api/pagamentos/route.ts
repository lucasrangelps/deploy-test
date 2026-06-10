// src/app/api/pagamentos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET /api/pagamentos
// ADMIN/PROFESSOR → retorna { kpis, parcelas } com todos os alunos
// ALUNO           → retorna array das próprias parcelas
export async function GET(req: NextRequest) {
  try {
    // Validar Bearer token
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')

    // Validar token e obter user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ erro: 'Token inválido ou expirado' }, { status: 401 })
    }

    // Obter usuário e tipo_perfil
    const { data: usuarioAuth } = await supabaseAdmin
      .from('usuarios')
      .select('id_usuario, tipo_perfil')
      .eq('auth_user_id', user.id)
      .single()

    if (!usuarioAuth) {
      return NextResponse.json({ erro: 'Usuário não encontrado' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const mes = searchParams.get('mes')
    const ano = searchParams.get('ano')
    const statusFiltro = searchParams.get('status')
    const alunoFiltro = searchParams.get('aluno')

    const isAdmin =
      usuarioAuth.tipo_perfil === 'ADMIN' || usuarioAuth.tipo_perfil === 'PROFESSOR'

    // ── Modo ADMIN / PROFESSOR ────────────────────────────────────────────────
    if (isAdmin) {
      const { data: parcelas, error: parcelasError } = await supabaseAdmin
        .from('parcelas')
        .select(`
          id_parcela,
          numero_parcela,
          valor_cobrado,
          data_vencimento,
          status,
          contratos (
            id_aluno,
            alunos (
              id_aluno,
              usuarios (
                nome_completo
              )
            )
          ),
          pagamentos (
            id_pagamento,
            data_pagamento,
            metodo,
            valor_pago
          )
        `)
        .order('data_vencimento', { ascending: true })

      if (parcelasError) {
        console.error('[GET /api/pagamentos admin]', parcelasError)
        return NextResponse.json({ erro: 'Erro ao buscar pagamentos' }, { status: 500 })
      }

      // Mapear para o formato esperado pelo dashboard
      let lista = (parcelas || []).map((parcela: any) => {
        const contrato = parcela.contratos
        const alunoRel = contrato?.alunos
        const idAluno: string | null = alunoRel?.id_aluno ?? contrato?.id_aluno ?? null
        const nomeAluno: string = alunoRel?.usuarios?.nome_completo ?? '—'

        return {
          id_parcela: parcela.id_parcela,
          numero_parcela: parcela.numero_parcela,
          valor_cobrado: Number(parcela.valor_cobrado),
          data_vencimento: parcela.data_vencimento,
          status: ((parcela.status as string) ?? 'pendente').toLowerCase() as 'pendente' | 'pago' | 'atrasado',
          nome_aluno: nomeAluno,
          id_aluno: idAluno,
        }
      })

      // Filtrar por mês/ano
      if (mes && ano) {
        lista = lista.filter((p) => {
          const d = new Date(p.data_vencimento)
          return (
            d.getMonth() === parseInt(mes) - 1 &&
            d.getFullYear() === parseInt(ano)
          )
        })
      }

      // Filtrar por status
      if (statusFiltro) {
        lista = lista.filter((p) => p.status === statusFiltro.toLowerCase())
      }

      // Filtrar por nome do aluno
      if (alunoFiltro) {
        const termo = alunoFiltro.toLowerCase()
        lista = lista.filter((p) => p.nome_aluno.toLowerCase().includes(termo))
      }

      // Calcular KPIs sobre a lista filtrada
      const receitaMes = lista
        .filter((p) => p.status === 'pago')
        .reduce((acc, p) => acc + p.valor_cobrado, 0)

      const parcelasPendentes = lista.filter((p) => p.status === 'pendente').length

      const valorEmAtraso = lista
        .filter((p) => p.status === 'atrasado')
        .reduce((acc, p) => acc + p.valor_cobrado, 0)

      const taxaInadimplencia =
        lista.length > 0
          ? Math.round(
              (lista.filter((p) => p.status === 'atrasado').length / lista.length) * 100,
            )
          : 0

      return NextResponse.json({
        kpis: {
          receita_mes: receitaMes,
          parcelas_pendentes: parcelasPendentes,
          valor_em_atraso: valorEmAtraso,
          taxa_inadimplencia: taxaInadimplencia,
        },
        parcelas: lista,
      })
    }

    // ── Modo ALUNO: retorna apenas as próprias parcelas (flat array) ──────────
    const id_aluno_param = searchParams.get('id_aluno')

    const { data: aluno, error: alunoError } = await supabaseAdmin
      .from('alunos')
      .select('id_aluno')
      .eq('id_usuario', usuarioAuth.id_usuario)
      .single()

    if (alunoError || !aluno) {
      return NextResponse.json({ erro: 'Aluno não encontrado' }, { status: 404 })
    }

    if (id_aluno_param && id_aluno_param !== aluno.id_aluno) {
      return NextResponse.json(
        { erro: 'Sem permissão para acessar pagamentos de outro aluno' },
        { status: 403 },
      )
    }

    const { data: parcelasAluno, error: parcelasError } = await supabaseAdmin
      .from('parcelas')
      .select(`
        id_parcela,
        numero_parcela,
        valor_cobrado,
        data_vencimento,
        status,
        contratos!inner (
          id_aluno,
          planos (
            id_plano,
            nome
          )
        ),
        pagamentos (
          id_pagamento,
          data_pagamento,
          metodo,
          valor_pago
        )
      `)
      .eq('contratos.id_aluno', aluno.id_aluno)
      .order('data_vencimento', { ascending: true })

    if (parcelasError) {
      console.error('[GET /api/pagamentos]', parcelasError)
      return NextResponse.json({ erro: 'Erro ao buscar pagamentos' }, { status: 500 })
    }

    const pagamentosEnriquecidos = (parcelasAluno || []).map((parcela: any) => {
      const pagamentos = parcela.pagamentos || []

      const dataVencimento = new Date(parcela.data_vencimento)
      const mesFormatado = dataVencimento
        .toLocaleString('pt-BR', { month: 'short', year: '2-digit' })
        .replace('.', '')

      return {
        id_parcela: parcela.id_parcela,
        numero_parcela: parcela.numero_parcela,
        nome_plano: (parcela.contratos as any)?.planos?.nome ?? '—',
        mes_parcela:
          mesFormatado.charAt(0).toUpperCase() + mesFormatado.slice(1),
        data_vencimento: parcela.data_vencimento,
        valor_cobrado: parcela.valor_cobrado,
        status: parcela.status
          ? parcela.status.charAt(0).toUpperCase() + parcela.status.slice(1)
          : 'Pendente',
        acao: pagamentos.length > 0 ? 'Ver' : 'Pagar',
        pagamentos: pagamentos.map((pag: any) => ({
          id_pagamento: pag.id_pagamento,
          data_pagamento: pag.data_pagamento,
          metodo_pagamento: pag.metodo,
          valor_pago: pag.valor_pago,
        })),
      }
    })

    let resultado = pagamentosEnriquecidos
    if (mes && ano) {
      resultado = resultado.filter((pag: any) => {
        const data = new Date(pag.data_vencimento)
        return (
          data.getMonth() === parseInt(mes) - 1 &&
          data.getFullYear() === parseInt(ano)
        )
      })
    }

    return NextResponse.json(resultado)
  } catch (error) {
    console.error('[GET /api/pagamentos]', error)
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 })
  }
}
