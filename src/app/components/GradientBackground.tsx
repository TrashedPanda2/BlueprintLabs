"use client";

import { AnimatedBackground } from 'animated-backgrounds';
import { CSSProperties } from 'react';

export default function GradientBackground() {
  const style: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1
  };

  return (
    <AnimatedBackground 
      animationName="cosmicDust"
      style={style}
      adaptivePerformance={true}
    />
  );
}