// oceanSkyEffects.js - Real Ocean Wave Harmonic Physics & Star Field Canvas Engine (60 FPS)

/**
 * Initializes random star field objects for canvas rendering.
 * @param {number} count Number of stars
 * @param {number} width Canvas width
 * @param {number} height Canvas height
 * @returns {Array} Array of star objects
 */
export function initStars(count, width, height) {
  const colors = [
    { r: 255, g: 255, b: 255 }, // White
    { r: 220, g: 247, b: 255 }, // Ice blue
    { r: 0, g: 212, b: 255 },   // Cyber blue
    { r: 180, g: 79, b: 255 },  // Purple shimmer
    { r: 255, g: 210, b: 125 }  // Starlight gold
  ];

  const stars = [];
  for (let i = 0; i < count; i++) {
    const c = colors[Math.floor(Math.random() * colors.length)];
    stars.push({
      x: Math.random() * width,
      y: Math.random() * (height * 0.65), // Upper 65% sky
      radius: Math.random() * 1.6 + 0.4,
      baseAlpha: Math.random() * 0.6 + 0.3,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      twinklePhase: Math.random() * Math.PI * 2,
      color: c
    });
  }
  return stars;
}

/**
 * Initializes shooting star meteors for canvas rendering.
 * @param {number} count Number of meteors
 * @param {number} width Canvas width
 * @param {number} height Canvas height
 * @returns {Array} Array of meteor objects
 */
export function initMeteors(count, width, height) {
  const meteors = [];
  for (let i = 0; i < count; i++) {
    meteors.push(resetMeteor(width, height, Math.random() * 600 + i * 150));
  }
  return meteors;
}

function resetMeteor(width, height, delayFrames = 0) {
  return {
    x: Math.random() * (width * 0.8),
    y: Math.random() * (height * 0.3),
    length: Math.random() * 80 + 60,
    speed: Math.random() * 12 + 10,
    angle: Math.PI / 4, // 45 degrees diagonal
    alpha: 0,
    active: false,
    delay: delayFrames
  };
}

/**
 * Calculates Y coordinate for realistic ocean water wave at horizontal position x.
 * Uses organic harmonic summation (combining multiple sine waves with different frequencies and phase speeds).
 * @param {number} x Horizontal canvas coordinate
 * @param {number} time Animation time elapsed
 * @param {number} baseHeight Base Y level of this ocean layer
 * @param {number} amp Multiplier for wave amplitude
 * @param {number} speed Multiplier for wave speed
 * @param {number} freq Multiplier for spatial frequency
 * @returns {number} Y coordinate of water surface
 */
export function getRealOceanWaveY(x, time, baseHeight, amp = 1, speed = 1, freq = 1) {
  // Harmonic 1: Primary ocean swell
  const w1 = Math.sin(x * 0.003 * freq + time * 0.02 * speed) * (18 * amp);
  // Harmonic 2: Secondary cross-swell (cos with different phase speed)
  const w2 = Math.cos(x * 0.007 * freq - time * 0.035 * speed) * (10 * amp);
  // Harmonic 3: Surface chop / ripples
  const w3 = Math.sin(x * 0.015 * freq + time * 0.05 * speed) * (5 * amp);
  // Harmonic 4: Organic deep water interference
  const w4 = Math.sin(x * 0.001 * freq - time * 0.01 * speed) * (12 * amp);

  return baseHeight + w1 + w2 + w3 + w4;
}

/**
 * Main 60 FPS Canvas rendering function called on each animation frame.
 */
export function renderOceanSkyFrame(ctx, width, height, time, stars, meteors) {
  // 1. Clear frame
  ctx.clearRect(0, 0, width, height);

  // 2. Draw Twinkling Stars
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    s.twinklePhase += s.twinkleSpeed;
    const currentAlpha = s.baseAlpha + Math.sin(s.twinklePhase) * 0.3;
    const alpha = Math.max(0.1, Math.min(1, currentAlpha));

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${alpha})`;
    ctx.fill();

    // Subtle glow on larger stars
    if (s.radius > 1.3) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${alpha * 0.25})`;
      ctx.fill();
    }
  }

  // 3. Update & Draw Shooting Stars (Meteors)
  for (let i = 0; i < meteors.length; i++) {
    const m = meteors[i];
    if (m.delay > 0) {
      m.delay--;
      continue;
    }

    if (!m.active) {
      m.active = true;
      m.alpha = 1;
    }

    // Move meteor
    m.x += Math.cos(m.angle) * m.speed;
    m.y += Math.sin(m.angle) * m.speed;
    m.alpha -= 0.015;

    if (m.alpha <= 0 || m.x > width || m.y > height) {
      Object.assign(m, resetMeteor(width, height, Math.random() * 400 + 100));
      continue;
    }

    // Draw meteor tail
    const tailX = m.x - Math.cos(m.angle) * m.length;
    const tailY = m.y - Math.sin(m.angle) * m.length;

    const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
    grad.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
    grad.addColorStop(0.3, `rgba(0, 212, 255, ${m.alpha * 0.7})`);
    grad.addColorStop(1, 'rgba(0, 212, 255, 0)');

    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(tailX, tailY);
    ctx.lineWidth = 2;
    ctx.strokeStyle = grad;
    ctx.stroke();

    // Meteor head glow
    ctx.beginPath();
    ctx.arc(m.x, m.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${m.alpha})`;
    ctx.fill();
  }

  // 4. Draw Horizon Aurora Glow
  const horizonY = height * 0.7;
  const auroraAlpha = 0.15 + Math.sin(time * 0.015) * 0.08;
  const auroraGrad = ctx.createRadialGradient(width * 0.5, horizonY, 10, width * 0.5, horizonY, width * 0.6);
  auroraGrad.addColorStop(0, `rgba(0, 212, 255, ${auroraAlpha})`);
  auroraGrad.addColorStop(0.5, `rgba(180, 79, 255, ${auroraAlpha * 0.6})`);
  auroraGrad.addColorStop(1, 'rgba(0, 212, 255, 0)');

  ctx.fillStyle = auroraGrad;
  ctx.fillRect(0, horizonY - 100, width, 200);

  // 5. Draw Real Ocean Water Wave Layers (from back to front)
  const waveConfigs = [
    { // Far Ocean Horizon Layer
      baseY: height * 0.75,
      amp: 0.5, speed: 0.8, freq: 1.4,
      fill: 'rgba(10, 55, 125, 0.45)',
      stroke: 'rgba(0, 180, 255, 0.3)'
    },
    { // Mid Ocean Swell Layer 1
      baseY: height * 0.80,
      amp: 0.75, speed: 1.1, freq: 1.1,
      fill: 'rgba(12, 40, 95, 0.65)',
      stroke: 'rgba(0, 212, 255, 0.45)'
    },
    { // Mid Ocean Swell Layer 2
      baseY: height * 0.86,
      amp: 1.0, speed: 1.3, freq: 0.85,
      fill: 'rgba(6, 22, 60, 0.85)',
      stroke: 'rgba(120, 220, 255, 0.55)'
    },
    { // Foreground Real Ocean Water Body
      baseY: height * 0.92,
      amp: 1.3, speed: 1.5, freq: 0.65,
      fill: '#020715',
      stroke: 'rgba(180, 240, 255, 0.7)'
    }
  ];

  for (let l = 0; l < waveConfigs.length; l++) {
    const cfg = waveConfigs[l];
    ctx.beginPath();
    ctx.moveTo(0, height);

    // Compute surface points across screen width
    const step = Math.max(2, Math.floor(width / 150));
    for (let x = 0; x <= width + step; x += step) {
      const y = getRealOceanWaveY(x, time, cfg.baseY, cfg.amp, cfg.speed, cfg.freq);
      if (x === 0) ctx.lineTo(0, y);
      else ctx.lineTo(x, y);
    }

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = cfg.fill;
    ctx.fill();

    // Shimmering crest highlight stroke along the water surface
    ctx.beginPath();
    for (let x = 0; x <= width + step; x += step) {
      const y = getRealOceanWaveY(x, time, cfg.baseY, cfg.amp, cfg.speed, cfg.freq);
      if (x === 0) ctx.moveTo(0, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = cfg.stroke;
    ctx.stroke();
  }
}
