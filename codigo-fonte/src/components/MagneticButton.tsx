'use client'

import { useRef, useState, useCallback, type CSSProperties, type ReactNode } from 'react'

interface MagneticButtonProps {
  children: ReactNode
  href: string
  className?: string
  style?: CSSProperties
  [key: string]: unknown
}

export function MagneticButton({
  children,
  href,
  className = '',
  style: styleProp = {},
  ...props
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLAnchorElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const handleMove = useCallback((e: React.MouseEvent) => {
    const rect = btnRef.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setOffset({ x: (e.clientX - cx) * 0.15, y: (e.clientY - cy) * 0.15 })
  }, [])

  const handleLeave = useCallback(() => setOffset({ x: 0, y: 0 }), [])

  return (
    <a
      ref={btnRef}
      href={href}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        ...styleProp,
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: 'transform 0.3s cubic-bezier(.23,1,.32,1)',
      }}
      {...props}
    >
      {children}
    </a>
  )
}