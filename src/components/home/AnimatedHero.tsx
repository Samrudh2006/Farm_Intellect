// audit-allow: mock-data — visual/UI randomness only, no data semantics
import { useEffect, useRef } from "react";

export const AnimatedHero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    // Particles representing crops/seeds
    const particles: {
      x: number; y: number; size: number; speedY: number; speedX: number;
      opacity: number; type: 'leaf' | 'seed' | 'glow';
      color: string;
    }[] = [];

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    const isMobile = canvas.offsetWidth < 768;
    const particleCount = isMobile ? 20 : 60;
    for (let i = 0; i < particleCount; i++) {
      const type = i < 20 ? 'leaf' : i < 40 ? 'seed' : 'glow';
      particles.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        size: type === 'glow' ? Math.random() * 4 + 2 : Math.random() * 8 + 4,
        speedY: -(Math.random() * 0.3 + 0.1),
        speedX: Math.random() * 0.4 - 0.2,
        opacity: Math.random() * 0.5 + 0.2,
        type,
        color: type === 'leaf' ? 'hsl(145, 63%, 32%)' :
               type === 'seed' ? 'hsl(24, 90%, 50%)' :
               'hsl(220, 70%, 28%)',
      });
    }

    const drawLeaf = (x: number, y: number, size: number, rotation: number, color: string, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(size * 0.6, -size * 0.3, 0, size);
      ctx.quadraticCurveTo(-size * 0.6, -size * 0.3, 0, -size);
      ctx.fill();
      // leaf vein
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.8);
      ctx.lineTo(0, size * 0.8);
      ctx.stroke();
      ctx.restore();
    };

    const drawSeed = (x: number, y: number, size: number, color: string, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(x, y, size * 0.4, size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const draw = () => {
      const cw = w();
      const ch = h();
      ctx.clearRect(0, 0, cw, ch);

      // Animated gradient background - tricolor inspired
      const grad = ctx.createLinearGradient(0, 0, cw, ch);
      const shift = Math.sin(time * 0.3) * 0.05;
      grad.addColorStop(0, `hsla(24, 90%, 50%, ${0.06 + shift})`);
      grad.addColorStop(0.3, `hsla(0, 0%, 100%, 0.02)`);
      grad.addColorStop(0.5, `hsla(220, 70%, 28%, ${0.04 + shift * 0.5})`);
      grad.addColorStop(0.7, `hsla(0, 0%, 100%, 0.02)`);
      grad.addColorStop(1, `hsla(145, 63%, 32%, ${0.06 + shift})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cw, ch);

      // Animated wave lines (like crop rows)
      for (let row = 0; row < 4; row++) {
        ctx.beginPath();
        ctx.strokeStyle = `hsla(145, 63%, 32%, ${0.06 - row * 0.01})`;
        ctx.lineWidth = 1.5;
        for (let x = 0; x < cw; x += 4) {
          const y = ch * (0.5 + row * 0.12) +
                    Math.sin(x * 0.008 + time * 0.5 + row) * 20 +
                    Math.cos(x * 0.003 + time * 0.3) * 10;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Particles
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(time + p.y * 0.01) * 0.15;

        if (p.y < -20) { p.y = ch + 20; p.x = Math.random() * cw; }
        if (p.x < -20) p.x = cw + 20;
        if (p.x > cw + 20) p.x = -20;

        const pulsedOpacity = p.opacity * (0.7 + Math.sin(time * 2 + p.x) * 0.3);

        if (p.type === 'leaf') {
          drawLeaf(p.x, p.y, p.size, Math.sin(time + p.x * 0.01) * 0.5, p.color, pulsedOpacity);
        } else if (p.type === 'seed') {
          drawSeed(p.x, p.y, p.size, p.color, pulsedOpacity);
        } else {
          ctx.save();
          ctx.globalAlpha = pulsedOpacity * 0.6;
          const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          glowGrad.addColorStop(0, p.color);
          glowGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // Subtle Ashoka Chakra outline in center
      const cx = cw / 2;
      const cy = ch / 2;
      const radius = Math.min(cw, ch) * 0.15;
      ctx.save();
      ctx.globalAlpha = 0.03 + Math.sin(time * 0.5) * 0.01;
      ctx.strokeStyle = 'hsl(220, 70%, 28%)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
      // Spokes
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2 + time * 0.1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * radius * 0.3, cy + Math.sin(angle) * radius * 0.3);
        ctx.lineTo(cx + Math.cos(angle) * radius * 0.95, cy + Math.sin(angle) * radius * 0.95);
        ctx.stroke();
      }
      ctx.restore();

      time += 0.016;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none", willChange: "contents" }}
    />
  );
};
