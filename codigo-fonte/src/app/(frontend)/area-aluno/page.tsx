'use client'

// src/app/(frontend)/area-aluno/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useIdAluno } from '@/hooks/useIdAluno'
import { fetchWithAuth } from '@/lib/fetchWithAuth'
import {
  GreetingCard,
  AlertBanner,
  JourneyContainer,
  SummaryCard,
  NextClassCard,
  RecentActivityList,
} from '@/components/dashboard/HomeComponents'

interface UsuarioData {
  id_usuario: string
  nome_completo: string
  email: string
  tipo_perfil: string
  anamnese_preenchida: boolean
}

interface ProximaAula {
  id_aula: string
  id_turma: string
  data: string
  hora_inicio: string
  hora_fim: string
  turma_nome: string
  ritmo: string
  professor: string
}

interface Atividade {
  tipo: string
  titulo: string
  descricao: string
  timestamp: string
  icon: string
}

interface Matricula {
  id_matricula: string
  nome_turma: string
  ritmo: string
  status: string
}

interface DadosHome {
  usuario: UsuarioData | null
  proximaAula: ProximaAula | null
  atividades: Atividade[]
  matriculas: Matricula[]
  turmasAtivas: number
  aulasEstesMes: number
  pagamentosEmAberto: number
  matriculadoEmTurma: boolean
  pagamentosEmDia: boolean
  loading: boolean
}

export default function AreaAlunoPage() {
  const router = useRouter()
  const { idAluno, idUsuario, loading: loadingAluno } = useIdAluno()
  const [dados, setDados] = useState<DadosHome>({
    usuario: null,
    proximaAula: null,
    atividades: [],
    matriculas: [],
    turmasAtivas: 0,
    aulasEstesMes: 0,
    pagamentosEmAberto: 0,
    matriculadoEmTurma: false,
    pagamentosEmDia: false,
    loading: true,
  })

  useEffect(() => {
    if (loadingAluno) return
    if (!idAluno) {
      router.replace('/login')
      return
    }

    carregarDados(idAluno, idUsuario)
  }, [idAluno, idUsuario, loadingAluno, router])

  async function carregarDados(idAluno: string, idUsuario: string | null) {
    try {
      // 1. Buscar dados do usuário (usar idUsuario para validação de permissão)
      const usuarioRes = await fetchWithAuth(`/api/usuarios/${idUsuario}`)
      if (!usuarioRes.ok) {
        throw new Error(`Falha ao carregar usuário: ${usuarioRes.status}`)
      }
      const usuarioData = await usuarioRes.json()

      // 2. Buscar próxima aula
      const proximaAulaRes = await fetchWithAuth(`/api/alunos/${idAluno}/proxima-aula`)
      let proximaAulaData = { proxima_aula: null }
      if (proximaAulaRes.ok) {
        proximaAulaData = await proximaAulaRes.json()
      }

      // 3. Buscar atividades recentes
      const atividadesRes = await fetchWithAuth(`/api/alunos/${idAluno}/atividades`)
      let atividadesData = { atividades: [] }
      if (atividadesRes.ok) {
        atividadesData = await atividadesRes.json()
      }

      // 4. Buscar matrículas (turmas ativas)
      const matriculasRes = await fetchWithAuth(`/api/alunos/${idAluno}`)
      let matriculasData: Matricula[] = []
      if (matriculasRes.ok) {
        const alunoData = await matriculasRes.json()
        matriculasData = alunoData.matriculas || []
      }
      const turmasAtivas = matriculasData.filter(m => m.status === 'ativa').length

      // 5. Buscar pagamentos
      const pagamentosRes = await fetchWithAuth(`/api/pagamentos?id_aluno=${idAluno}`)
      let pagamentosData = []
      if (pagamentosRes.ok) {
        pagamentosData = await pagamentosRes.json()
      }
      const parcelas = Array.isArray(pagamentosData) ? pagamentosData : pagamentosData.data ?? []
      const pagamentosEmAberto = parcelas.filter((p: any) => p.status !== 'Pago').length
      const pagamentosEmDia = pagamentosEmAberto === 0

      // Calcular aulas este mês (simulado - contar próximas aulas do mês)
      const agora = new Date()
      const aulasEstesMes = turmasAtivas * 4 // Aproximação: 4 aulas por turma por mês

      setDados({
        usuario: usuarioData,
        proximaAula: proximaAulaData.proxima_aula,
        atividades: atividadesData.atividades || [],
        matriculas: matriculasData,
        turmasAtivas,
        aulasEstesMes,
        pagamentosEmAberto,
        matriculadoEmTurma: turmasAtivas > 0,
        pagamentosEmDia,
        loading: false,
      })
    } catch (err) {
      console.error('[area-aluno home] erro ao carregar dados', err)
      setDados((prev) => ({ ...prev, loading: false }))
    }
  }

  if (dados.loading || loadingAluno) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#6B6B6B', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Carregando seu dashboard...</p>
      </div>
    )
  }

  const anamneseRequired = dados.usuario && !dados.usuario.anamnese_preenchida

  return (
    <>
      {/* HEADER */}
      <div style={{ padding: '28px 32px 0', marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 4 }}>
          Área do Aluno
        </p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2 }}>
          Dashboard
        </h1>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div style={{ padding: '0 32px 32px' }}>
        {/* GREETING CARD */}
        {dados.usuario && (
          <GreetingCard nome={dados.usuario.nome_completo} />
        )}

        {/* ALERT BANNER */}
        <AlertBanner
          show={anamneseRequired ?? false}
          title="1 ação necessária"
          message="Preencha seu questionário de saúde (Anamnese) antes de sua primeira aula"
          buttonText="Preencher agora"
          buttonHref="/area-aluno/anamnese"
        />

        {/* JORNADA */}
        <JourneyContainer
          anamnesePreenchida={dados.usuario?.anamnese_preenchida ?? false}
          matriculadoEmTurma={dados.matriculadoEmTurma}
          pagamentosEmDia={dados.pagamentosEmDia}
        />

        {/* RESUMO EM CARDS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <SummaryCard
            titulo="Turmas Ativas"
            valor={dados.turmasAtivas}
            descricao={dados.turmasAtivas > 0 ? `Você está matriculado em ${dados.turmasAtivas} turma(s)` : 'Nenhuma turma ativa'}
            icon="💃"
            cor={dados.turmasAtivas > 0 ? 'success' : 'primary'}
          />
          <SummaryCard
            titulo="Aulas Este Mês"
            valor={`${Math.min(5, dados.aulasEstesMes)}/12`}
            descricao="Das 12 previstas"
            icon="📅"
            cor="primary"
          />
          <SummaryCard
            titulo="Pagtos. Em Aberto"
            valor={dados.pagamentosEmAberto}
            descricao={dados.pagamentosEmAberto > 0 ? `Vence em 3 dias` : 'Você está em dia'}
            icon="💳"
            cor={dados.pagamentosEmAberto > 0 ? 'warning' : 'success'}
          />
        </div>

        {/* PRÓXIMA AULA */}
        <NextClassCard
          turma_nome={dados.proximaAula?.turma_nome}
          ritmo={dados.proximaAula?.ritmo}
          professor={dados.proximaAula?.professor}
          data={dados.proximaAula?.data}
          hora_inicio={dados.proximaAula?.hora_inicio}
          hora_fim={dados.proximaAula?.hora_fim}
          onConfirm={() => {
            // TODO: Implementar confirmação de presença
            alert('Presença confirmada!')
          }}
        />

        {/* ATIVIDADE RECENTE */}
        <RecentActivityList
          atividades={dados.atividades}
          loading={dados.loading}
        />
      </div>
    </>
  )
}
