// src/components/dashboard/MyClassesCard.tsx

interface Matricula {
  id_matricula: string
  nome_turma: string
  ritmo: string
  status: string
}

interface MyClassesCardProps {
  matriculas: Matricula[]
  loading?: boolean
}

export function MyClassesCard({ matriculas, loading = false }: MyClassesCardProps) {
  // Filtrar apenas matrículas ativas
  const ativas = matriculas.filter(m => m.status === 'ativa')

  if (loading) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #E8E0D8',
        padding: 20,
        marginBottom: 24,
      }}>
        <h2 style={{
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: '#C9A96E',
          marginBottom: 16,
        }}>
          Minhas Turmas
        </h2>
        <p style={{ textAlign: 'center', color: '#6B6B6B', fontSize: 13, padding: '20px 0' }}>
          Carregando...
        </p>
      </div>
    )
  }

  if (ativas.length === 0) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #E8E0D8',
        padding: 20,
        marginBottom: 24,
      }}>
        <h2 style={{
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: '#C9A96E',
          marginBottom: 16,
        }}>
          Minhas Turmas
        </h2>
        <p style={{ textAlign: 'center', color: '#6B6B6B', fontSize: 13, padding: '20px 0' }}>
          Você ainda não está matriculado em nenhuma turma.
        </p>
        <a
          href="/area-aluno/turmas"
          style={{
            display: 'inline-block',
            marginTop: 12,
            background: '#8B1A2F',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.5px',
            textDecoration: 'none',
            transition: 'background 0.15s',
            textAlign: 'center',
            width: '100%',
            boxSizing: 'border-box',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = '#6B1326'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = '#8B1A2F'
          }}
        >
          Explorar Turmas
        </a>
      </div>
    )
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #E8E0D8',
      padding: 20,
      marginBottom: 24,
    }}>
      <h2 style={{
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        color: '#C9A96E',
        marginBottom: 16,
      }}>
        Minhas Turmas
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12,
      }}>
        {ativas.map((matricula) => (
          <div
            key={matricula.id_matricula}
            style={{
              background: '#F5F0EB',
              borderRadius: 8,
              padding: 12,
              borderLeft: '4px solid #8B1A2F',
              transition: 'box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                '0 2px 8px rgba(107, 19, 38, 0.1)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
            }}
          >
            <p style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#1A1A1A',
              marginBottom: 4,
              lineHeight: 1.3,
            }}>
              {matricula.nome_turma}
            </p>
            <p style={{
              fontSize: 11,
              color: '#6B6B6B',
              marginBottom: 8,
            }}>
              {matricula.ritmo}
            </p>
            <p style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#C9A96E',
              margin: 0,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              ✓ Matriculado
            </p>
          </div>
        ))}
      </div>

      <p style={{
        fontSize: 12,
        color: '#6B6B6B',
        marginTop: 16,
        marginBottom: 0,
      }}>
        <strong>{ativas.length}</strong> {ativas.length === 1 ? 'turma' : 'turmas'} ativa{ativas.length === 1 ? '' : 's'}
      </p>
    </div>
  )
}
