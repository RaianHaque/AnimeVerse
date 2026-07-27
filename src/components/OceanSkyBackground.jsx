import React, { useMemo } from 'react';
import './oceanSkyBackground.css';
import { generateStarField, generateShootingStars, getWaveLayers } from './oceanSkyEffects';

export default function OceanSkyBackground() {
  // Generate stable random stars and meteors once on mount
  const stars = useMemo(() => generateStarField(130), []);
  const shootingStars = useMemo(() => generateShootingStars(8), []);
  const waveLayers = useMemo(() => getWaveLayers(), []);

  return (
    <div className="ocean-sky-container" aria-hidden="true">
      {/* Twinkling Star Field in the Sky */}
      {stars.map((star) => (
        <span
          key={star.id}
          className="star-twinkle"
          style={{
            left: star.left,
            top: star.top,
            width: star.width,
            height: star.height,
            backgroundColor: star.color,
            color: star.color,
            animationDuration: star.animationDuration,
            animationDelay: star.animationDelay,
          }}
        />
      ))}

      {/* Falling / Shooting Stars */}
      {shootingStars.map((meteor) => (
        <div
          key={meteor.id}
          className="shooting-star"
          style={{
            left: meteor.left,
            top: meteor.top,
            animationDelay: meteor.animationDelay,
            animationDuration: meteor.animationDuration,
          }}
        />
      ))}

      {/* Horizon Aurora Glow (Where sky meets ocean) */}
      <div className="horizon-glow" />

      {/* Dynamic Animated Ocean Waves */}
      <div className="ocean-waves-wrapper">
        {waveLayers.map((layer) => (
          <div key={layer.id} className={`wave-layer ${layer.className}`}>
            <svg
              className="wave-svg"
              viewBox="0 0 1920 200"
              preserveAspectRatio="none"
            >
              <path d={layer.path} fill={layer.fill} />
            </svg>
            <svg
              className="wave-svg"
              viewBox="0 0 1920 200"
              preserveAspectRatio="none"
            >
              <path d={layer.path} fill={layer.fill} />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
