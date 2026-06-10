'use client'

import { useState, useEffect, useRef, type RefObject } from 'react'

interface UseInViewOptions {
  once?: boolean
  threshold?: number
  rootMargin?: string
}

/**
 * Hook que detecta se um elemento está visível no viewport.
 * Retorna uma tupla [ref, isInView] com tipos corretos.
 */
export function useInView(options: UseInViewOptions = {}): [RefObject<HTMLDivElement | null>, boolean] {
  const [isInView, setIsInView] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  const once = options.once ?? false
  const threshold = options.threshold ?? 0.15
  const rootMargin = options.rootMargin ?? '0px'

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          setHasAnimated(true)
          if (once) obs.unobserve(el)
        } else if (!once) {
          setIsInView(false)
        }
      },
      { threshold, rootMargin }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [once, threshold, rootMargin])

  return [ref, once ? hasAnimated : isInView]
}