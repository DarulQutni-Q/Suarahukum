import React, { useState, useEffect } from 'react';

interface Props {
  target: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export default function AnimatedCounter({ target, duration = 2000, suffix = '', className = '' }: Props) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    // Total steps = duration / 16ms (roughly 60fps)
    const totalSteps = Math.round(duration / 16);
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      // Simple linear ease
      const progress = currentStep / totalSteps;
      const currentVal = Math.round(start + (end - start) * progress);
      setCount(currentVal);

      if (currentStep >= totalSteps) {
        clearInterval(timer);
        setCount(end);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration]);

  return <span className={className}>{count}{suffix}</span>;
}
