const PARTICLES = [
  { w: 6, h: 7, op: 0.22, left: 15, top: 25, dur: 10, delay: 0.5 },
  { w: 8, h: 5, op: 0.28, left: 35, top: 60, dur: 12, delay: 1.2 },
  { w: 5, h: 8, op: 0.18, left: 55, top: 15, dur: 9, delay: 2.0 },
  { w: 7, h: 6, op: 0.32, left: 70, top: 45, dur: 11, delay: 0.8 },
  { w: 9, h: 5, op: 0.24, left: 85, top: 70, dur: 13, delay: 3.0 },
  { w: 6, h: 9, op: 0.20, left: 45, top: 80, dur: 10, delay: 1.8 },
]

export function FloatingParticles() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: p.w,
            height: p.h,
            borderRadius: '50%',
            background: `rgba(201,169,110,${p.op})`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animation: `floatParticle ${p.dur}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}