import { useEffect, useState } from 'react';
import { toPersianDigits } from '../../utils/formatters.js';

/**
 * AnimatedNumber - Counts up smoothly to numeric values with Persian numeral support
 */
export default function AnimatedNumber({ value = 0, duration = 800, prefix = '', suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const numericTarget = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]+/g, '')) || 0;
    const startValue = displayValue;
    const startTime = performance.now();

    let animationFrameId;

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (numericTarget - startValue) * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCounter);
      }
    };

    animationFrameId = requestAnimationFrame(updateCounter);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {toPersianDigits(displayValue.toLocaleString('fa-IR'))}
      {suffix}
    </span>
  );
}
