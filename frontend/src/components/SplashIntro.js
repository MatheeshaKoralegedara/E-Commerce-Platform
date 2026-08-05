'use client';

import { useEffect, useState } from 'react';

export default function SplashIntro({ productImages = [] }) {
  const [phase, setPhase] = useState('logo'); // 'logo' | 'products' | 'exiting' | 'done'

  useEffect(() => {
    // Only play once per browser session — not on every internal navigation
    if (sessionStorage.getItem('splashPlayed')) {
      setPhase('done');
      return;
    }

    const t1 = setTimeout(() => setPhase('products'), 600);
    const t2 = setTimeout(() => setPhase('exiting'), 1800);
    const t3 = setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem('splashPlayed', 'true');
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-pine-dark)] ${
        phase === 'exiting' ? 'splash-exit' : ''
      }`}
    >
      {/* Product images animating in around the logo */}
      {phase !== 'logo' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-full max-w-2xl h-64">
            {productImages.slice(0, 4).map((url, i) => {
              const positions = [
                { top: '5%', left: '10%', rotate: '-8deg' },
                { top: '15%', right: '8%', rotate: '6deg' },
                { bottom: '10%', left: '18%', rotate: '5deg' },
                { bottom: '0%', right: '15%', rotate: '-5deg' },
              ];
              const pos = positions[i];
              return (
                <div
                  key={i}
                  className="splash-product absolute w-20 h-20 md:w-28 md:h-28 rounded-xl overflow-hidden shadow-2xl"
                  style={{ ...pos, transform: `rotate(${pos.rotate})`, animationDelay: `${i * 0.1}s` }}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Logo, always on top */}
      <div className="splash-logo relative z-10 text-center">
        <p className="font-display text-4xl md:text-5xl text-white tracking-tight">Mercato</p>
        <p className="text-white/50 text-xs tracking-[0.3em] uppercase mt-2">Est. 2024</p>
      </div>
    </div>
  );
}
