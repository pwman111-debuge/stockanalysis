"use client";
import { useEffect, useRef } from 'react';

const MOBILE = { unit: 'DAN-hBCP4jBL2KeL8gtH', width: 320, height: 50 };
const PC     = { unit: 'DAN-1m8vHRZay8Rd3z9Y', width: 728, height: 90 };

function AdSlot({ unit, width, height }: { unit: string; width: number; height: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';

    const ins = document.createElement('ins');
    ins.className = 'kakao_ad_area';
    ins.style.display = 'none';
    ins.setAttribute('data-ad-unit', unit);
    ins.setAttribute('data-ad-width', String(width));
    ins.setAttribute('data-ad-height', String(height));
    el.appendChild(ins);

    const script = document.createElement('script');
    script.async = true;
    script.src = '//t1.kakaocdn.net/kas/static/ba.min.js';
    el.appendChild(script);

    return () => { el.innerHTML = ''; };
  }, [unit, width, height]);

  return <div ref={ref} />;
}

export function AdFitBanner({ className = '' }: { className?: string }) {
  return (
    <div className={`my-4 overflow-hidden ${className}`}>
      <div className="flex justify-center md:hidden">
        <AdSlot {...MOBILE} />
      </div>
      <div className="hidden md:flex justify-center">
        <AdSlot {...PC} />
      </div>
    </div>
  );
}
