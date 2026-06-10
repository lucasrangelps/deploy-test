'use client'

import { useState, useEffect } from 'react'
import { useInView } from '@/hooks/useInView'

interface AnimatedCounterProps {
  end: number
  duration?: number
  suffix?: string
}

export function AnimatedCounter({ end, duration = 2000, suffix = '' }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [ref, inView] = useInView({ once: true })

  useEffect(() => {
    if (!inView || end <= 0) return

    let startTime: number | null = null
    let rafId: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))

      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [inView, end, duration])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}