import React, { useRef, useEffect, useMemo } from 'react';
import { useDisturbances } from '../../contexts/DisturbanceContext';

const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const mouse = useMemo(() => ({ x: -1000, y: -1000, radius: 80 }), []); // Start mouse off-screen
  const particlesRef = useRef([]);
  const animationFrameIdRef = useRef();

  const { disturbances } = useDisturbances();
  const disturbancesRef = useRef(disturbances);
  useEffect(() => {
    disturbancesRef.current = disturbances;
  }, [disturbances]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let gridCols = 0; // Moved to the top of the effect's scope

    class Particle {
      constructor(x, y) {
        this.homeX = x;
        this.homeY = y;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = 1.5;
        this.color = 'rgba(0, 255, 70, 0.7)';
      }

      // Calculate force from mouse and return to home
      update(time) {
        // Repulsion from mouse
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.vx += force * Math.cos(angle);
          this.vy += force * Math.sin(angle);
        }

        // Repulsion from disturbances (windows/icons)
        const repulsionRadius = 60;
        for (const rect of disturbancesRef.current) {
          // Optimization: Broad-phase check to see if the particle is even close to the rectangle
          if (this.x < rect.x - repulsionRadius ||
              this.x > rect.x + rect.width + repulsionRadius ||
              this.y < rect.y - repulsionRadius ||
              this.y > rect.y + rect.height + repulsionRadius) {
            continue; // Skip to the next disturbance if it's too far away
          }

          // Find the closest point on the rectangle to the particle
          const closestX = Math.max(rect.x, Math.min(this.x, rect.x + rect.width));
          const closestY = Math.max(rect.y, Math.min(this.y, rect.y + rect.height));

          const dx = this.x - closestX;
          const dy = this.y - closestY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Apply force if close enough
          if (distance < repulsionRadius && distance > 0) {
              const force = (repulsionRadius - distance) / repulsionRadius;
              const angle = Math.atan2(dy, dx);
              this.vx += force * 0.6 * Math.cos(angle);
              this.vy += force * 0.6 * Math.sin(angle);
          }
        }

        // --- Horizontal Physics (remains simple) ---
        const homeDx = this.x - this.homeX;
        this.vx -= homeDx * 0.02;
        this.vx *= 0.95;

        // --- Vertical Physics (PD Controller for stable oscillation) ---
        
        // Define constants for the sine wave
        const amplitude = 2.5;
        const spatialFrequency = 0.02;  
        const temporalFrequency = 0.0015;

        // 1. Calculate the target position (where the particle should be on the wave)
        const targetY = this.homeY + amplitude * Math.sin(this.homeX * spatialFrequency + time * temporalFrequency);

        // 2. Calculate the target velocity (how fast it should be moving to stay on the wave)
        const targetVy = amplitude * temporalFrequency * Math.cos(this.homeX * spatialFrequency + time * temporalFrequency);

        // 3. Apply a spring force to correct position (Proportional term)
        const Kp = 0.005; // Springiness
        this.vy += (targetY - this.y) * Kp;

        // 4. Apply a damping force to correct velocity (Derivative term)
        const Kd = 0.02; // Damping
        this.vy += (targetVy - this.vy) * Kd;

        this.x += this.vx;
        this.y += this.vy;
      }

      draw(time) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const particleGap = 30;

    const initParticles = () => {
      // This now correctly updates the gridCols in the outer scope
      gridCols = Math.ceil(canvas.width / particleGap);
      const gridRows = Math.ceil(canvas.height / particleGap);
      const particles = [];
      for (let y = 0; y < gridRows; y++) {
        for (let x = 0; x < gridCols; x++) {
          // Add a small random offset to home position for a more organic look
          particles.push(new Particle(x * particleGap + Math.random() * 5, y * particleGap + Math.random() * 5));
        }
      }
      particlesRef.current = particles;
    };

    const connectParticles = () => {
      // This is an optimized O(n) implementation, avoiding the previous O(n^2) approach.
      
      // Safeguard: If gridCols is not a positive number, skip connecting to prevent errors.
      if (gridCols <= 0) {
        return;
      }

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p1 = particlesRef.current[i];

        const drawLineTo = (p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Draw line if particles are close enough. Increased threshold for better visuals.
          if (distance < particleGap * 2) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 255, 70, ${0.4 * (1 - distance / (particleGap * 2))})`;
            ctx.lineWidth = 1.2;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        };

        // Connect to right neighbor (if it exists and is on the same row)
        if ((i + 1) % gridCols !== 0 && (i + 1) < particlesRef.current.length) {
          drawLineTo(particlesRef.current[i + 1]);
        }

        // Connect to bottom neighbor (if it exists)
        if (i + gridCols < particlesRef.current.length) {
          drawLineTo(particlesRef.current[i + gridCols]);
        }
      }
    };

    let frameCount = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameCount++;

      // Apply the expensive glow effect only for the particles
      ctx.shadowBlur = 5;
      ctx.shadowColor = 'rgba(0, 255, 70, 0.5)';

      particlesRef.current.forEach(p => {
        p.update(frameCount);
        p.draw(frameCount);
      });

      // Disable the glow before drawing the numerous connecting lines to maintain performance
      ctx.shadowBlur = 0;
      connectParticles();

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
      // The animation loop will handle drawing, no need for a static draw.
    };

    // --- Setup and Cleanup ---

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    // 1. Set initial size and particles
    handleResize();
    // 2. Start the animation loop
    animate();
    // 3. Add event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameIdRef.current);
    };
    // The effect now runs only once on mount, making it much more stable.
  }, [mouse]); // Only depends on mouse, which is stable.

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        // zIndex is removed to rely on natural document flow for stacking.
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default ParticleBackground;