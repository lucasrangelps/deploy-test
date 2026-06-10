'use client'

import { useState, useCallback } from 'react'
import { useInView } from '@/hooks/useInView'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import {
  DANCE_STYLES,
  QUIZ_QUESTIONS,
  WHATSAPP_NUMBER,
  type DanceStyle,
  type QuizOption,
} from '@/data/quiz'

export function QuizWidget() {
  const [step, setStep] = useState(0)
  const [selections, setSelections] = useState<QuizOption[]>([])
  const [result, setResult] = useState<DanceStyle | null>(null)
  const [animating, setAnimating] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [scores, setScores] = useState<Record<string, number> | null>(null)
  const [ref, inView] = useInView({ once: true })

  const totalQuestions = QUIZ_QUESTIONS.length

  const calculateResult = useCallback((allSelections: QuizOption[]) => {
    const totals: Record<string, number> = {
      forro: 0,
      samba: 0,
      salsa: 0,
      sertanejo: 0,
      zouk: 0,
    }
    allSelections.forEach((sel) => {
      Object.entries(sel.weights).forEach(([key, val]) => {
        totals[key] += val
      })
    })
    setScores(totals)
    const maxKey = Object.entries(totals).reduce((a, b) =>
      b[1] > a[1] ? b : a
    )[0]
    return DANCE_STYLES[maxKey]
  }, [])

  const handleAnswer = useCallback(
    (optIndex: number) => {
      if (animating) return
      const selected = QUIZ_QUESTIONS[step].opts[optIndex]
      const newSelections = [...selections, selected]
      setSelections(newSelections)
      setAnimating(true)

      if (newSelections.length >= totalQuestions) {
        const res = calculateResult(newSelections)
        setTimeout(() => {
          setResult(res)
          setTimeout(() => setShowResult(true), 100)
          setAnimating(false)
        }, 500)
      } else {
        setTimeout(() => {
          setStep((prev) => prev + 1)
          setAnimating(false)
        }, 400)
      }
    },
    [animating, step, selections, totalQuestions, calculateResult]
  )

  const reset = useCallback(() => {
    setStep(0)
    setSelections([])
    setResult(null)
    setShowResult(false)
    setScores(null)
    setAnimating(false)
  }, [])

  const maxScore = scores ? Math.max(...Object.values(scores)) : 0
  const whatsappMsg = result
    ? encodeURIComponent(
        `Olá! Fiz o quiz no site e o meu resultado deu "${result.name}"! Quero agendar minha aula experimental grátis! 💃`
      )
    : ''

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(40px)',
        transition: 'all 0.8s cubic-bezier(.22,1,.36,1) 0.2s',
      }}
    >
      {/* ── Perguntas ── */}
      {!result ? (
        <div className="quiz-container" style={{ position: 'relative' }}>
          {/* Barra de progresso */}
          <div
            style={{ display: 'flex', gap: 5, marginBottom: 28 }}
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={totalQuestions}
          >
            {QUIZ_QUESTIONS.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 4,
                  background:
                    i < step
                      ? '#c9a96e'
                      : i === step
                        ? 'rgba(201,169,110,0.6)'
                        : 'rgba(255,255,255,0.1)',
                  transition: 'all 0.5s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {i === step && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(90deg, #c9a96e, rgba(201,169,110,0.3))',
                      animation: 'shimmer 2s ease-in-out infinite',
                      backgroundSize: '200% 100%',
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Contador + ícone */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 28 }} aria-hidden="true">
              {QUIZ_QUESTIONS[step].icon}
            </span>
            <p
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: 'uppercase',
              }}
            >
              Pergunta {step + 1} de {totalQuestions}
            </p>
          </div>

          {/* Pergunta */}
          <h3
            key={step}
            style={{
              color: 'white',
              fontSize: 22,
              fontWeight: 800,
              fontFamily: "'Playfair Display', serif",
              marginBottom: 28,
              lineHeight: 1.4,
              animation: 'slideUp 0.5s cubic-bezier(.22,1,.36,1) forwards',
            }}
          >
            {QUIZ_QUESTIONS[step].q}
          </h3>

          {/* Opções */}
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            role="group"
            aria-label="Opções de resposta"
          >
            {QUIZ_QUESTIONS[step].opts.map((opt, i) => (
              <button
                key={`${step}-${i}`}
                onClick={() => handleAnswer(i)}
                disabled={animating}
                className="quiz-option"
                style={{
                  animation: `slideUp 0.4s cubic-bezier(.22,1,.36,1) ${i * 0.08}s forwards`,
                  opacity: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.5)',
                    marginRight: 14,
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ── Resultado ── */
        <div
          className="quiz-container"
          style={{
            textAlign: 'center',
            opacity: showResult ? 1 : 0,
            transform: showResult
              ? 'translateY(0) scale(1)'
              : 'translateY(20px) scale(0.97)',
            transition: 'all 0.7s cubic-bezier(.22,1,.36,1)',
          }}
        >
          <div
            style={{
              fontSize: 72,
              marginBottom: 8,
              animation: 'bounceIn 0.7s cubic-bezier(.34,1.56,.64,1)',
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))',
            }}
            aria-hidden="true"
          >
            {result.emoji}
          </div>

          <p
            style={{
              color: result.color || '#c9a96e',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Seu corpo pede...
          </p>

          <h3
            style={{
              color: 'white',
              fontSize: 42,
              fontWeight: 900,
              fontFamily: "'Playfair Display', serif",
              marginBottom: 16,
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            {result.name}!
          </h3>

          <p
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 15,
              lineHeight: 1.8,
              maxWidth: 440,
              margin: '0 auto 28px',
            }}
          >
            {result.vibe}
          </p>

          {/* Barras de afinidade */}
          {scores && (
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 16,
                padding: '20px 24px',
                marginBottom: 28,
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <p
                style={{
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                Sua afinidade com cada estilo
              </p>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {Object.entries(scores)
                  .sort((a, b) => b[1] - a[1])
                  .map(([key, val], i) => {
                    const dStyle = DANCE_STYLES[key]
                    if (!dStyle) return null
                    const pct =
                      maxScore > 0
                        ? Math.round((val / maxScore) * 100)
                        : 0
                    const isWinner = i === 0
                    return (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 18,
                            width: 28,
                            textAlign: 'center',
                            filter: isWinner
                              ? 'none'
                              : 'grayscale(0.5) opacity(0.7)',
                          }}
                          aria-hidden="true"
                        >
                          {dStyle.emoji}
                        </span>
                        <span
                          style={{
                            color: isWinner
                              ? 'white'
                              : 'rgba(255,255,255,0.5)',
                            fontSize: 13,
                            fontWeight: isWinner ? 700 : 500,
                            width: 80,
                            textAlign: 'left',
                            flexShrink: 0,
                          }}
                        >
                          {dStyle.name}
                        </span>
                        <div
                          style={{
                            flex: 1,
                            height: 8,
                            borderRadius: 4,
                            background: 'rgba(255,255,255,0.08)',
                            overflow: 'hidden',
                          }}
                          role="progressbar"
                          aria-valuenow={pct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${dStyle.name}: ${pct}%`}
                        >
                          <div
                            style={{
                              width: showResult ? `${pct}%` : '0%',
                              height: '100%',
                              borderRadius: 4,
                              background: isWinner
                                ? `linear-gradient(90deg, ${dStyle.color}, ${dStyle.color}cc)`
                                : 'rgba(255,255,255,0.15)',
                              transition:
                                'width 1.2s cubic-bezier(.22,1,.36,1)',
                              transitionDelay: `${i * 0.15 + 0.3}s`,
                              boxShadow: isWinner
                                ? `0 0 12px ${dStyle.color}66`
                                : 'none',
                            }}
                          />
                        </div>
                        <span
                          style={{
                            color: isWinner
                              ? dStyle.color
                              : 'rgba(255,255,255,0.35)',
                            fontSize: 12,
                            fontWeight: 700,
                            width: 38,
                            textAlign: 'right',
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* CTAs */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <WhatsAppIcon size={16} />
              Agendar Aula de {result.cta}
            </a>
            <button onClick={reset} className="btn-outline-white">
              Refazer Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  )
}