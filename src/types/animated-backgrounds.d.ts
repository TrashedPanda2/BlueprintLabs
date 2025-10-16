declare module 'animated-backgrounds' {
  import { CSSProperties } from 'react';

  interface AnimatedBackgroundProps {
    animationName: string;
    style?: CSSProperties;
    config?: Record<string, any>;
    adaptivePerformance?: boolean;
  }

  export const AnimatedBackground: React.FC<AnimatedBackgroundProps>;
}