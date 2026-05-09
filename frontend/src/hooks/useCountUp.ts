// Performance: requestAnimationFrame-based counter - no external dependencies, smooth 60fps animation
import { useState, useEffect, useRef } from 'react';

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function useCountUp(target: number, duration: number = 1500): number {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const startValue = prevTarget.current;
    const startTime = performance.now();
    const diff = target - startValue;

    if (Math.abs(diff) < 0.5) {
      setValue(target);
      prevTarget.current = target;
      return;
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const current = startValue + diff * easedProgress;

      setValue(Math.round(current * 10) / 10);

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
        prevTarget.current = target;
      }
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [target, duration]);

  return value;
}
