import React, { useRef, useEffect } from 'react';

const SoundWave: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const numBars = 32;
    const barWidth = 4;
    const barGap = 3;
    
    const resizeCanvas = () => {
        const parent = canvas.parentElement;
        if (parent) {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
        }
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#a78bfa'); // violet-400
    gradient.addColorStop(1, '#6366f1'); // indigo-500

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const totalWidth = (barWidth + barGap) * numBars - barGap;
      const startX = (canvas.width - totalWidth) / 2;

      for (let i = 0; i < numBars; i++) {
        // Create a dynamic, random-looking but smooth height
        const barHeight = (Math.sin(Date.now() * 0.005 + i * 0.3) + 1) * 0.5 * (canvas.height * 0.8) + (canvas.height * 0.2);
        const x = startX + i * (barWidth + barGap);
        const y = canvas.height - barHeight;

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default SoundWave;