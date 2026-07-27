// oceanSkyEffects.js - Generator logic for dynamic stars, shooting stars, and waves

/**
 * Generates an array of randomized star objects for the starry sky.
 * @param {number} count Number of stars to generate in the sky
 * @returns {Array} Array of star configuration objects
 */
export function generateStarField(count = 110) {
  const colors = [
    "#ffffff", // Crisp white
    "#e0f7ff", // Ice blue
    "#b44fff", // Neon purple shimmer
    "#00d4ff", // Cyber blue
    "#ffd27d"  // Warm starlight gold
  ];

  const stars = [];
  for (let i = 0; i < count; i++) {
    const size = Math.random() * 2.8 + 1; // 1px to 3.8px
    const color = colors[Math.floor(Math.random() * colors.length)];
    const duration = Math.random() * 3.5 + 2; // 2s to 5.5s
    const delay = Math.random() * 5; // 0s to 5s
    
    // Position stars primarily in the upper 70% sky zone
    const left = Math.random() * 100;
    const top = Math.random() * 72; 

    stars.push({
      id: `star-${i}`,
      left: `${left}%`,
      top: `${top}%`,
      width: `${size}px`,
      height: `${size}px`,
      color,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`
    });
  }
  return stars;
}

/**
 * Generates falling / shooting star configurations.
 * @param {number} count Number of active shooting meteor trajectories
 * @returns {Array} Array of shooting star objects
 */
export function generateShootingStars(count = 6) {
  const meteors = [];
  for (let i = 0; i < count; i++) {
    const startX = Math.random() * 85; // Start near top or left
    const startY = Math.random() * 40;
    const delay = Math.random() * 14 + i * 2.5; // Staggered appearances
    const duration = Math.random() * 1.5 + 1.2; // Quick streak

    meteors.push({
      id: `meteor-${i}`,
      left: `${startX}%`,
      top: `${startY}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`
    });
  }
  return meteors;
}

/**
 * Returns SVG path data and color themes for the 4 dynamic ocean wave layers.
 * @returns {Array} Wave layer definitions
 */
export function getWaveLayers() {
  return [
    {
      id: "layer-1",
      className: "wave-layer-1",
      fill: "rgba(0, 160, 255, 0.25)",
      path: "M0,60 C320,-20 640,120 960,40 C1280,-40 1600,100 1920,40 L1920,200 L0,200 Z"
    },
    {
      id: "layer-2",
      className: "wave-layer-2",
      fill: "rgba(18, 90, 190, 0.45)",
      path: "M0,80 C400,140 800,10 1200,90 C1600,170 1800,30 1920,70 L1920,200 L0,200 Z"
    },
    {
      id: "layer-3",
      className: "wave-layer-3",
      fill: "rgba(8, 45, 120, 0.7)",
      path: "M0,50 C280,130 680,20 1050,100 C1420,180 1700,40 1920,80 L1920,200 L0,200 Z"
    },
    {
      id: "layer-4",
      className: "wave-layer-4",
      fill: "#020715",
      path: "M0,90 C350,30 750,140 1100,60 C1450,-20 1750,110 1920,85 L1920,200 L0,200 Z"
    }
  ];
}
