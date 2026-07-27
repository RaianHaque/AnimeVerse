import React, { useEffect, useRef } from 'react';
import './oceanSkyBackground.css';
import { initStars, initMeteors, renderOceanSkyFrame } from './oceanSkyEffects';

export default function OceanSkyBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Initialize stars and shooting meteors
    let stars = initStars(120, width, height);
    let meteors = initMeteors(6, width, height);
    let time = 0;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      stars = initStars(120, width, height);
      meteors = initMeteors(6, width, height);
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      time++;
      renderOceanSkyFrame(ctx, width, height, time, stars, meteors);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="ocean-sky-container" aria-hidden="true">
      <canvas ref={canvasRef} className="ocean-sky-canvas" />
    </div>
  );
}
