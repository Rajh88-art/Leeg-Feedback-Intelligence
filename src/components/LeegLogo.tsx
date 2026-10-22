import React from 'react';

interface LeegLogoProps {
  size?: number;
  className?: string;
  variant?: 'badge' | 'icon';
}

export default function LeegLogo({
  size = 36,
  className = '',
}: LeegLogoProps) {
  return (
    <img
      src="/leeg-logo.svg"
      alt="Leeg Logo"
      width={size}
      height={size}
      className={`shrink-0 select-none rounded-xl object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
