export const landingStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800;900&family=Outfit:wght@300;400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Outfit', sans-serif; background: #f8f4ef; color: #333; overflow-x: hidden; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #f8f4ef; }
  ::-webkit-scrollbar-thumb { background: #6B1326; border-radius: 4px; }

  /* Animations */
  @keyframes floatParticle {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
    25% { transform: translate(20px, -30px) scale(1.2); opacity: 0.6; }
    50% { transform: translate(-15px, -50px) scale(0.8); opacity: 0.4; }
    75% { transform: translate(25px, -20px) scale(1.1); opacity: 0.5; }
  }

  @keyframes bounceIn {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(40px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  /* Header */
  .header-glass {
    background: linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(248,244,239,0.9) 100%);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border-bottom: 1px solid rgba(107,19,38,0.08);
    box-shadow: 0 4px 30px rgba(107,19,38,0.06);
  }

  .header-solid {
    background: white;
    border-bottom: 1px solid #f0ece6;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }

  .nav-link {
    font-size: 11px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase;
    color: #999; text-decoration: none; padding-bottom: 4px;
    border-bottom: 2px solid transparent; transition: all 0.3s ease;
    position: relative;
  }
  .nav-link:hover { color: #6B1326; }
  .nav-link.active { color: #6B1326; border-bottom-color: #c9a96e; }

  /* Hero */
  .hero-title span {
    display: inline-block;
    animation: slideUp 0.8s cubic-bezier(.22,1,.36,1) forwards;
    opacity: 0;
  }

  /* Benefit Cards */
  .benefit-card {
    background: white;
    border-radius: 20px;
    padding: 32px 28px;
    position: relative;
    overflow: hidden;
    cursor: default;
    transition: all 0.5s cubic-bezier(.22,1,.36,1);
    border: 1px solid rgba(107,19,38,0.04);
  }
  .benefit-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(107,19,38,0.12);
  }
  .benefit-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--accent), transparent);
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  .benefit-card:hover::before { opacity: 1; }

  /* Rhythm Cards */
  .rhythm-card {
    position: relative; border-radius: 24px; overflow: hidden;
    height: 420px; cursor: pointer;
  }
  .rhythm-card img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.8s cubic-bezier(.22,1,.36,1), filter 0.5s ease;
  }
  .rhythm-card:hover img {
    transform: scale(1.08);
    filter: brightness(0.85);
  }
  .rhythm-card .overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(61,10,23,0.95) 0%, rgba(61,10,23,0.3) 40%, transparent 70%);
    transition: background 0.5s ease;
  }
  .rhythm-card:hover .overlay {
    background: linear-gradient(to top, rgba(61,10,23,0.98) 0%, rgba(61,10,23,0.5) 50%, rgba(61,10,23,0.1) 80%);
  }
  .rhythm-card .cta-reveal {
    opacity: 0; transform: translateY(12px);
    transition: all 0.4s cubic-bezier(.22,1,.36,1);
  }
  .rhythm-card:hover .cta-reveal {
    opacity: 1; transform: translateY(0);
  }

  /* FAQ */
  .faq-card {
    background: white;
    border-radius: 16px;
    padding: 22px 28px;
    border: 1px solid rgba(107,19,38,0.04);
    transition: all 0.3s ease;
  }
  .faq-card:hover {
    box-shadow: 0 8px 30px rgba(107,19,38,0.08);
    border-color: rgba(201,169,110,0.3);
  }

  /* Quiz */
  .quiz-container {
    background: linear-gradient(145deg, rgba(107,19,38,0.95), rgba(61,10,23,0.98));
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 40px;
    border: 1px solid rgba(201,169,110,0.15);
  }
  .quiz-option {
    background: rgba(255,255,255,0.06);
    border: 1.5px solid rgba(255,255,255,0.12);
    border-radius: 14px;
    padding: 16px 20px;
    color: white;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
    font-family: 'Outfit', sans-serif;
    width: 100%;
  }
  .quiz-option:hover:not(:disabled) {
    background: rgba(201,169,110,0.15);
    border-color: #c9a96e;
    transform: translateX(6px);
  }
  .quiz-option:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  /* Buttons */
  .btn-primary {
    display: inline-flex; align-items: center; justify-content: center;
    background: #6B1326; color: white;
    font-weight: 700; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase;
    border-radius: 14px; padding: 18px 36px;
    text-decoration: none;
    transition: all 0.4s cubic-bezier(.22,1,.36,1);
    box-shadow: 0 8px 30px rgba(107,19,38,0.25);
    position: relative; overflow: hidden;
  }
  .btn-primary:hover {
    background: #8a1a30;
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(107,19,38,0.35);
  }
  .btn-primary::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    background-size: 200% 100%;
    animation: shimmer 3s ease-in-out infinite;
  }

  .btn-secondary {
    display: inline-flex; align-items: center; justify-content: center;
    background: white; color: #6B1326;
    font-weight: 700; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase;
    border-radius: 14px; padding: 18px 36px;
    text-decoration: none;
    transition: all 0.4s cubic-bezier(.22,1,.36,1);
    box-shadow: 0 4px 15px rgba(0,0,0,0.06);
    border: 1px solid #e8e0d4;
  }
  .btn-secondary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }

  .btn-gold {
    display: inline-flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #c9a96e, #b8963d); color: #3d1a00;
    font-weight: 800; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;
    border-radius: 14px; padding: 16px 32px;
    text-decoration: none; border: none; cursor: pointer;
    transition: all 0.4s cubic-bezier(.22,1,.36,1);
    box-shadow: 0 8px 30px rgba(201,169,110,0.3);
    font-family: 'Outfit', sans-serif;
  }
  .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(201,169,110,0.45); }

  .btn-outline-white {
    display: inline-flex; align-items: center; justify-content: center;
    background: transparent; color: white;
    font-weight: 700; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;
    border-radius: 14px; padding: 14px 28px;
    border: 2px solid rgba(255,255,255,0.3); cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Outfit', sans-serif;
  }
  .btn-outline-white:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.5); }

  /* Marquee */
  .marquee-track {
    display: flex;
    animation: marquee 25s linear infinite;
  }
  .marquee-track:hover { animation-play-state: paused; }

  /* Stats */
  .stat-card {
    text-align: center;
    padding: 32px 20px;
  }

  /* Footer */
  .footer-link:hover { color: #6B1326 !important; }

  /* ── Responsive ── */
  .desktop-nav { display: flex; }
  .mobile-menu-btn { display: none !important; }

  @media (max-width: 768px) {
    .hero-title { font-size: 36px !important; }
    .rhythm-card { height: 320px; }
    .quiz-container { padding: 28px 20px; }
    .desktop-nav { display: none !important; }
    .mobile-menu-btn { display: block !important; }
    .stat-card { border-right: none !important; border-bottom: 1px solid #e8e0d4; }
  }
`