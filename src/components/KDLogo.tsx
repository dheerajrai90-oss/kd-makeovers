import React from 'react';
import { OFFICIAL_STUDIO_LOGO } from '@/src/data/defaults';

interface KDLogoProps {
  logoUrl?: string;
  businessName?: string;
  tagline?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const KDLogo: React.FC<KDLogoProps> = ({
  logoUrl,
  businessName = 'KD Makeovers',
  tagline = 'Redefine Beauty',
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const activeLogo = logoUrl || OFFICIAL_STUDIO_LOGO;

  if (size === 'lg') {
    return (
      <div className={`inline-flex flex-col items-center text-center gap-3 shrink-0 ${className}`}>
        <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-kd-black border border-kd-pink/40 flex items-center justify-center overflow-hidden shadow-lg shrink-0">
          <img
            src={activeLogo}
            alt={businessName}
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        {showTagline && (
          <span className="text-[11px] tracking-[0.28em] uppercase text-kd-pink/90 font-medium whitespace-nowrap">
            {tagline}
          </span>
        )}
      </div>
    );
  }

  const iconDimensions =
    size === 'sm' ? 'w-10 h-10 sm:w-11 sm:h-11' : 'w-14 h-14 sm:w-16 sm:h-16';
  const titleClass =
    size === 'sm' ? 'text-[15px] sm:text-lg leading-tight' : 'text-xl sm:text-2xl leading-tight';

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 min-w-0 max-w-full ${className}`}>
      <div
        className={`${iconDimensions} rounded-full bg-kd-black border border-kd-pink/40 flex items-center justify-center overflow-hidden shrink-0`}
      >
        <img
          src={activeLogo}
          alt={businessName}
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex flex-col leading-none min-w-0">
        <span
          className={`font-serif font-bold text-white tracking-tight truncate ${titleClass}`}
        >
          {businessName.includes('KD') ? (
            <>
              <span className="text-kd-pink">KD</span>{' '}
              {businessName.replace(/^KD\s*/i, '')}
            </>
          ) : (
            businessName
          )}
        </span>
        {showTagline && (
          <span className="text-[9px] sm:text-[10px] tracking-[0.18em] sm:tracking-[0.24em] uppercase text-kd-rosegold mt-0.5 truncate">
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
};
