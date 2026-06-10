'use client'

import Link from 'next/link'
import { ShieldX, ArrowLeft, Home, Lock, User } from 'lucide-react'

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"
              fill="#C9A96E"
            />
            <circle cx="12" cy="9" r="2.5" fill="#1C0A0E" />
          </svg>
        </div>

        <div>
          <p className="sidebar-logo-title">Isabel Wencces</p>
          <p className="sidebar-logo-sub">Painel Admin</p>
        </div>
      </div>

      <div className="sidebar-admin">
        <div className="sidebar-admin-avatar">
          <Lock size={16} />
        </div>

        <div>
          <p className="sidebar-admin-name">Acesso Restrito</p>
          <p className="sidebar-admin-role">Sem permissão</p>
        </div>
      </div>
    </aside>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AcessoNegadoPage() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#f5f1eb',
      }}
    >
      

      <main className="page-main">
        <div
          style={{
            width: '100%',
            maxWidth: 1200,
            margin: '0 auto',
          }}
        >
          
          {/* ─── Conteúdo ───────────────────────────────────────────────── */}
          <div className="page-content">
            <div
              className="card"
              style={{
                padding: '60px 40px',
                borderRadius: 24,
                textAlign: 'center',
                background: '#fff',
                border: '1px solid #ede8e1',
                boxShadow: '0 10px 35px rgba(0,0,0,0.04)',
              }}
            >
              {/* Ícone */}
              <div
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: '50%',
                  background: 'rgba(192,57,43,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 28px',
                }}
              >
                <ShieldX size={54} color="#c0392b" />
              </div>

              {/* Título */}
              <h2
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  color: '#1a0a0a',
                  marginBottom: 14,
                }}
              >
                Permissão Insuficiente
              </h2>

              {/* Texto */}
              <p
                style={{
                  maxWidth: 580,
                  margin: '0 auto',
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: '#777',
                }}
              >
                Sua conta não possui autorização para visualizar esta área do
                sistema. Caso acredite que isso seja um erro, entre em contato
                com o administrador responsável.
              </p>

              {/* Box informativo */}
              <div
                style={{
                  marginTop: 34,
                  padding: '18px 22px',
                  borderRadius: 16,
                  background: '#faf8f5',
                  border: '1px solid #ece6de',
                  maxWidth: 520,
                  marginInline: 'auto',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <Lock size={18} color="#8B1A2F" />

                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#8B1A2F',
                    }}
                  >
                    Área restrita para administradores
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 13,
                    color: '#888',
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  Apenas usuários com permissões administrativas podem acessar
                  módulos sensíveis do painel.
                </p>
              </div>

              {/* Botões */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 14,
                  flexWrap: 'wrap',
                  marginTop: 40,
                }}
              >
                <Link
                  href="/"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 22px',
                    borderRadius: 12,
                    background: '#8B1A2F',
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(139,26,47,0.22)',
                  }}
                >
                  <Home size={16} />
                  Inicio
                </Link>
            
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}