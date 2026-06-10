'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInView } from '@/hooks/useInView'
import {
  AnimatedCounter,
  MagneticButton,
  FaqItem,
  QuizWidget,
  WhatsAppIcon,
  FloatingParticles,
} from '@/components'
import {
  NAV_LINKS,
  STATS,
  BENEFITS,
  STEPS,
  RHYTHMS,
  FAQS,
  MARQUEE_RHYTHMS,
} from '@/data/landing'
import { WHATSAPP_NUMBER } from '@/data/quiz'
import { landingStyles } from '@/styles/landing'

// ── Footer Link ─────────────────────────────────────────────────────────────
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="footer-link"
      style={{
        color: '#999',
        fontSize: 13,
        textDecoration: 'none',
        transition: 'color 0.3s ease',
      }}
    >
      {children}
    </a>
  )
}

// ── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState('inicio')

  const currentYear = new Date().getFullYear()

  // ── Scroll tracking ──
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60)
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Active section observer ──
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.id)
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]
    if (sections.length === 0) return

    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id)
        }),
      { rootMargin: '-40% 0px -55% 0px' }
    )
    sections.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  const handleNavClick = useCallback(() => setMenuOpen(false), [])

  // ── InView refs ──
  const [benefitsRef, benefitsInView] = useInView({ once: true })
  const [stepsRef, stepsInView] = useInView({ once: true })
  const [rhythmsRef, rhythmsInView] = useInView({ once: true })
  const [statsRef, statsInView] = useInView({ once: true })
  const [ctaRef, ctaInView] = useInView({ once: true })

  return (
    <>
      <style>{landingStyles}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header
          className={scrolled ? 'header-glass' : 'header-solid'}
          style={{ position: 'sticky', top: 0, zIndex: 50, transition: 'all 0.5s ease' }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: '0 auto',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
            }}
          >
            <a
              href="#inicio"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 900,
                fontSize: 20,
                letterSpacing: 2,
                color: '#6B1326',
                textDecoration: 'none',
                textTransform: 'uppercase',
              }}
            >
              Isabel Wencces
            </a>

            <nav style={{ alignItems: 'center', gap: 32 }} className="desktop-nav">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
                >
                  {link.label}
                </a>
              ))}

              <a
                href="/grade-aulas"
                className="nav-link"
              >
                Grade de Aulas
              </a>
            </nav>

            <div style={{ alignItems: 'center', gap: 12 }} className="desktop-nav">
              <a
                href="/login"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: '#6B1326',
                  border: '1.5px solid rgba(107,19,38,0.25)',
                  borderRadius: 50,
                  padding: '10px 20px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                Área do Aluno
              </a>
              <MagneticButton
                href="/cadastro/aluno"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  background: '#6B1326',
                  color: 'white',
                  borderRadius: 50,
                  padding: '12px 24px',
                  textDecoration: 'none',
                  boxShadow: '0 6px 20px rgba(107,19,38,0.25)',
                  display: 'inline-flex',
                }}
              >
                Aula Experimental
              </MagneticButton>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="mobile-menu-btn"
              style={{
                background: 'none',
                border: 'none',
                color: '#6B1326',
                cursor: 'pointer',
                fontSize: 24,
              }}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>

          {menuOpen && (
            <nav
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #f0ece6',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
              aria-label="Menu mobile"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={handleNavClick}
                  className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
                >
                  {link.label}
                </a>
              ))}

              <a
                href="/grade-aulas"
                onClick={handleNavClick}
                className="nav-link"
              >
                Grade de Aulas
              </a>
              <div
                style={{
                  borderTop: '1px solid #f0ece6',
                  paddingTop: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <a
                  href="/login"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#6B1326',
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    textDecoration: 'none',
                  }}
                >
                  Área do Aluno / Professor
                </a>
                <a
                  href="/cadastro/aluno"
                  className="btn-primary"
                  style={{ textAlign: 'center' }}
                >
                  Aula Experimental
                </a>
              </div>
            </nav>
          )}
        </header>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section
          id="inicio"
          style={{
            position: 'relative',
            minHeight: 'calc(100vh - 65px)',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <img
            src="/images/img_cadastro.png"
            alt="Casal dançando elegantemente em um salão"
            loading="eager"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              transform: `scale(${1 + scrollY * 0.0003}) translateY(${scrollY * 0.15}px)`,
              willChange: 'transform',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(135deg, rgba(248,244,239,0.95) 0%, rgba(248,244,239,0.7) 40%, rgba(248,244,239,0.2) 70%, transparent 100%)',
            }}
          />
          <FloatingParticles />
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              maxWidth: 1200,
              margin: '0 auto',
              padding: '80px 32px',
              width: '100%',
            }}
          >
            <div style={{ maxWidth: 580 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(107,19,38,0.08)',
                  borderRadius: 50,
                  padding: '8px 18px',
                  marginBottom: 24,
                  animation: 'slideUp 0.6s cubic-bezier(.22,1,.36,1) forwards',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#c9a96e',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                  aria-hidden="true"
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 2.5,
                    textTransform: 'uppercase',
                    color: '#6B1326',
                  }}
                >
                  Aulas abertas para iniciantes
                </span>
              </div>

              <h1
                className="hero-title"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 60,
                  fontWeight: 900,
                  color: '#6B1326',
                  lineHeight: 1.1,
                  marginBottom: 24,
                }}
              >
                <span style={{ animationDelay: '0.1s' }}>Descubra o</span>
                <br />
                <span style={{ animationDelay: '0.3s' }}>prazer de </span>
                <br />
                <span
                  style={{
                    animationDelay: '0.5s',
                    background: 'linear-gradient(135deg, #6B1326, #c9a96e)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  dançar
                </span>
              </h1>

              <p
                style={{
                  color: '#555',
                  fontSize: 17,
                  lineHeight: 1.8,
                  marginBottom: 40,
                  maxWidth: 440,
                  animation:
                    'slideUp 0.8s cubic-bezier(.22,1,.36,1) 0.6s forwards',
                  opacity: 0,
                }}
              >
                Aulas de dança para você se divertir, aprender e evoluir no seu
                ritmo. Sinta a música, domine o palco da sua vida.
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 16,
                  animation:
                    'slideUp 0.8s cubic-bezier(.22,1,.36,1) 0.8s forwards',
                  opacity: 0,
                }}
              >
                <MagneticButton href="/cadastro/aluno" className="btn-primary">
                  Agendar Aula Experimental
                </MagneticButton>
                <MagneticButton href="#quiz" className="btn-secondary">
                  Fazer Quiz de Indicação
                </MagneticButton>
              </div>
            </div>
          </div>
        </section>

        {/* ── Marquee ────────────────────────────────────────────────────── */}
        <div
          style={{ background: '#6B1326', padding: '14px 0', overflow: 'hidden' }}
          aria-hidden="true"
        >
          <div className="marquee-track" style={{ width: '200%' }}>
            {[0, 1].map((j) => (
              <div
                key={j}
                style={{
                  display: 'flex',
                  minWidth: '50%',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                }}
              >
                {MARQUEE_RHYTHMS.map((r, i) => (
                  <span
                    key={`${j}-${i}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span
                      style={{
                        color: 'white',
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: 3,
                        textTransform: 'uppercase',
                        fontFamily: "'Outfit', sans-serif",
                      }}
                    >
                      {r}
                    </span>
                    <span style={{ color: '#c9a96e', fontSize: 10 }}>✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <section ref={statsRef} style={{ background: '#f8f4ef', padding: '60px 24px' }}>
          <div
            style={{
              maxWidth: 1000,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 0,
              opacity: statsInView ? 1 : 0,
              transform: statsInView ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s cubic-bezier(.22,1,.36,1)',
            }}
          >
            {STATS.map((s, i) => (
              <div
                key={i}
                className="stat-card"
                style={{
                  borderRight: i < 3 ? '1px solid #e8e0d4' : 'none',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 42,
                    fontWeight: 900,
                    color: '#6B1326',
                    marginBottom: 6,
                  }}
                >
                  <AnimatedCounter end={s.val} suffix={s.suffix} />
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    color: '#888',
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Benefits ───────────────────────────────────────────────────── */}
        <section style={{ background: '#f8f4ef', padding: '80px 24px' }} aria-label="Benefícios">
          <div
            ref={benefitsRef}
            style={{
              maxWidth: 1200,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 20,
            }}
          >
            {BENEFITS.map((card, i) => (
              <div
                key={card.title}
                className="benefit-card"
                style={{
                  '--accent': card.color,
                  opacity: benefitsInView ? 1 : 0,
                  transform: benefitsInView ? 'translateY(0)' : 'translateY(40px)',
                  transition: `all 0.7s cubic-bezier(.22,1,.36,1) ${i * 0.12}s`,
                } as React.CSSProperties}
              >
                <div
                  style={{
                    fontSize: 32,
                    color: card.color,
                    marginBottom: 16,
                    lineHeight: 1,
                  }}
                  aria-hidden="true"
                >
                  {card.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: '#6B1326',
                    fontWeight: 700,
                    fontSize: 20,
                    marginBottom: 10,
                    lineHeight: 1.3,
                  }}
                >
                  {card.title}
                </h3>
                <p style={{ color: '#777', fontSize: 14, lineHeight: 1.7 }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Como Funciona ──────────────────────────────────────────────── */}
        <section id="como-funciona" style={{ background: '#f8f4ef', padding: '80px 24px' }}>
          <div ref={stepsRef} style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div
              style={{
                textAlign: 'center',
                marginBottom: 64,
                opacity: stepsInView ? 1 : 0,
                transform: stepsInView ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.6s ease',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                  color: '#c9a96e',
                  marginBottom: 12,
                }}
              >
                Passo a passo
              </p>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 36,
                  fontWeight: 900,
                  color: '#6B1326',
                }}
              >
                Como Funciona
              </h2>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 48,
                textAlign: 'center',
              }}
            >
              {STEPS.map((step, i) => (
                <div
                  key={step.num}
                  style={{
                    position: 'relative',
                    opacity: stepsInView ? 1 : 0,
                    transform: stepsInView ? 'translateY(0)' : 'translateY(40px)',
                    transition: `all 0.7s cubic-bezier(.22,1,.36,1) ${i * 0.15}s`,
                  }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6B1326, #8a1a30)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      boxShadow: '0 12px 35px rgba(107,19,38,0.25)',
                    }}
                  >
                    <span
                      style={{
                        color: 'white',
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 22,
                        fontWeight: 800,
                      }}
                      aria-hidden="true"
                    >
                      {step.num}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: '#2a2a2a',
                      fontWeight: 700,
                      fontSize: 20,
                      marginBottom: 10,
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      color: '#888',
                      fontSize: 14,
                      lineHeight: 1.7,
                      maxWidth: 280,
                      margin: '0 auto',
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Nossos Ritmos ──────────────────────────────────────────────── */}
        <section
          style={{ background: '#f8f4ef', padding: '80px 24px' }}
          aria-label="Nossos Ritmos"
        >
          <div ref={rhythmsRef} style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                marginBottom: 40,
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 3,
                    textTransform: 'uppercase',
                    color: '#c9a96e',
                    marginBottom: 8,
                  }}
                >
                  Explore
                </p>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 36,
                    fontWeight: 900,
                    color: '#6B1326',
                  }}
                >
                  Nossos Ritmos
                </h2>
              </div>
              <a
                href="#"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#6B1326',
                  textDecoration: 'none',
                  borderBottom: '2px solid #c9a96e',
                  paddingBottom: 2,
                  transition: 'all 0.3s ease',
                }}
              >
                Ver todos os estilos →
              </a>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 20,
              }}
            >
              {RHYTHMS.map((card, i) => (
                <div
                  key={card.title}
                  className="rhythm-card"
                  style={{
                    opacity: rhythmsInView ? 1 : 0,
                    transform: rhythmsInView
                      ? 'translateY(0) scale(1)'
                      : 'translateY(40px) scale(0.95)',
                    transition: `all 0.8s cubic-bezier(.22,1,.36,1) ${i * 0.15}s`,
                  }}
                >
                  <img
                    src={card.image}
                    alt={`Dançarinos praticando ${card.title}`}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.background =
                        'linear-gradient(135deg, #6B1326, #4a0d1a)'
                      target.style.objectFit = 'none'
                    }}
                  />
                  <div className="overlay" />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: 28,
                    }}
                  >
                    <p
                      style={{
                        color: '#c9a96e',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 3,
                        textTransform: 'uppercase',
                        marginBottom: 8,
                      }}
                    >
                      {card.tag}
                    </p>
                    <h3
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: 'white',
                        fontSize: 28,
                        fontWeight: 800,
                        marginBottom: 16,
                      }}
                    >
                      {card.title}
                    </h3>
                    <div className="cta-reveal">
                      <a
                        href="/cadastro/aluno"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          color: '#c9a96e',
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: 2,
                          textTransform: 'uppercase',
                          textDecoration: 'none',
                          borderBottom: '1.5px solid rgba(201,169,110,0.4)',
                          paddingBottom: 4,
                        }}
                      >
                        Experimentar agora →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Dúvidas Frequentes ─────────────────────────────────────────── */}
        <section
          style={{ background: '#f8f4ef', padding: '80px 24px' }}
          aria-label="Perguntas Frequentes"
        >
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                  color: '#c9a96e',
                  marginBottom: 8,
                }}
              >
                Tire suas dúvidas
              </p>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 36,
                  fontWeight: 900,
                  color: '#6B1326',
                }}
              >
                Perguntas Frequentes
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FAQS.map((faq, i) => (
                <FaqItem key={faq.question} {...faq} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Quiz Section ───────────────────────────────────────────────── */}
        <section id="quiz" style={{ background: '#f8f4ef', padding: '0 24px 80px' }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                  color: '#c9a96e',
                  marginBottom: 8,
                }}
              >
                Descubra seu estilo
              </p>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 36,
                  fontWeight: 900,
                  color: '#6B1326',
                }}
              >
                Quiz de Indicação
              </h2>
            </div>
            <QuizWidget />
          </div>
        </section>

        {/* ── CTA Final ──────────────────────────────────────────────────── */}
        <section
          ref={ctaRef}
          style={{
            background: 'linear-gradient(135deg, #6B1326 0%, #4a0d1a 100%)',
            padding: '100px 24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <FloatingParticles />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 600,
              height: 600,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          />
          <div
            style={{
              maxWidth: 650,
              margin: '0 auto',
              position: 'relative',
              zIndex: 10,
              opacity: ctaInView ? 1 : 0,
              transform: ctaInView ? 'translateY(0)' : 'translateY(40px)',
              transition: 'all 0.8s cubic-bezier(.22,1,.36,1)',
            }}
          >
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 48,
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.15,
                marginBottom: 20,
              }}
            >
              Agende sua aula
              <br />
              gratuita <span style={{ color: '#c9a96e' }}>hoje</span>
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 16,
                lineHeight: 1.8,
                marginBottom: 40,
              }}
            >
              Não deixe para amanhã o prazer que a dança pode te proporcionar
              agora. Estamos te esperando!
            </p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                justifyContent: 'center',
              }}
            >
              <MagneticButton href="/cadastro/aluno" className="btn-gold">
                Agendar Agora
              </MagneticButton>
              <MagneticButton
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                className="btn-outline-white"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
              >
                <WhatsAppIcon size={16} />
                Falar no WhatsApp
              </MagneticButton>
            </div>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer
          style={{
            background: '#f8f4ef',
            padding: '60px 24px',
            borderTop: '1px solid #e8e0d4',
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: '0 auto',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 32,
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: '#6B1326',
                  fontWeight: 800,
                  fontSize: 16,
                  marginBottom: 8,
                }}
              >
                Isabel Wencces
              </p>
              <p style={{ color: '#aaa', fontSize: 13, lineHeight: 1.7 }}>
                Dança de Salão — Pinhais/PR
                <br />© {currentYear} Isabel Wencces Studio.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 32 }}>
              <FooterLink href={`https://wa.me/${WHATSAPP_NUMBER}`}>
                WhatsApp
              </FooterLink>
              <FooterLink href="#">Localização</FooterLink>
              <FooterLink href="#">Termos</FooterLink>
              <FooterLink href="#">Privacidade</FooterLink>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}