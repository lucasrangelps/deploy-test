'use client'

import { useState, useEffect, useRef } from 'react'
import { useInView } from '@/hooks/useInView'

interface FaqItemProps {
  question: string
  answer: string
  index: number
}

export function FaqItem({ question, answer, index }: FaqItemProps) {
  const [open, setOpen] = useState(false)
  const [ref, inView] = useInView({ once: true })
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [answer, open])

  return (
    <div
      ref={ref}
      className="faq-card"
      role="region"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(30px)',
        transition: `all 0.6s cubic-bezier(.22,1,.36,1) ${index * 0.1}s`,
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`faq-answer-${index}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          cursor: 'pointer',
          width: '100%',
          background: 'none',
          border: 'none',
          padding: 0,
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            color: '#6B1326',
            fontWeight: 700,
            fontSize: 16,
            fontFamily: "'Playfair Display', serif",
          }}
        >
          {question}
        </span>
        <span
          style={{
            color: '#6B1326',
            fontSize: 24,
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.4s cubic-bezier(.34,1.56,.64,1)',
            display: 'inline-block',
            lineHeight: 1,
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          ⌄
        </span>
      </button>
      <div
        id={`faq-answer-${index}`}
        ref={contentRef}
        role="region"
        aria-hidden={!open}
        style={{
          maxHeight: open ? contentHeight + 24 : 0,
          opacity: open ? 1 : 0,
          overflow: 'hidden',
          transition:
            'max-height 0.5s cubic-bezier(.22,1,.36,1), opacity 0.4s ease',
        }}
      >
        <p
          style={{
            marginTop: 12,
            color: '#555',
            fontSize: 14,
            lineHeight: 1.7,
            borderTop: '1px solid #f0ece6',
            paddingTop: 12,
          }}
        >
          {answer}
        </p>
      </div>
    </div>
  )
}