import { useState, useEffect, useRef } from 'preact/hooks';

export function FPSIndicator() {
  const [fps, setFps] = useState<number>(0);
  const frameCount = useRef<number>(0);
  const lastTime = useRef<number>(performance.now());

  useEffect(() => {
    let animationFrameId: number;

    const calculateFPS = () => {
      frameCount.current += 1;
      const now = performance.now();
      const delta = now - lastTime.current;

      if (delta >= 1000) {
        setFps(Math.round((frameCount.current / delta) * 1000));
        frameCount.current = 0;
        lastTime.current = now;
      }

      animationFrameId = requestAnimationFrame(calculateFPS);
    };

    animationFrameId = requestAnimationFrame(calculateFPS);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      style={{
        color: '#0f0',
        backgroundColor: '#000',
        borderRadius: '5px',
        fontFamily: 'monospace',
        display: 'inline-block',
      }}
    >
      FPS: {fps}
    </div>
  );
}
