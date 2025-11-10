import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  href?: string;
}

const sizeClasses = {
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-12',
  xl: 'h-16',
};

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-4xl',
};

export function Logo({
  variant = 'full',
  size = 'md',
  className = '',
  href = '/'
}: LogoProps) {

  // Icon SVG (Processor Chip)
  const IconSVG = () => (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClasses[size]} ${className}`}
    >
      <circle cx="100" cy="100" r="95" fill="currentColor"/>
      <rect x="60" y="60" width="80" height="80" rx="8" fill="white"/>
      <line x1="75" y1="60" x2="75" y2="140" stroke="currentColor" strokeWidth="2"/>
      <line x1="90" y1="60" x2="90" y2="140" stroke="currentColor" strokeWidth="2"/>
      <line x1="110" y1="60" x2="110" y2="140" stroke="currentColor" strokeWidth="2"/>
      <line x1="125" y1="60" x2="125" y2="140" stroke="currentColor" strokeWidth="2"/>
      <line x1="60" y1="75" x2="140" y2="75" stroke="currentColor" strokeWidth="2"/>
      <line x1="60" y1="90" x2="140" y2="90" stroke="currentColor" strokeWidth="2"/>
      <line x1="60" y1="110" x2="140" y2="110" stroke="currentColor" strokeWidth="2"/>
      <line x1="60" y1="125" x2="140" y2="125" stroke="currentColor" strokeWidth="2"/>
      <rect x="85" y="85" width="30" height="30" rx="4" fill="currentColor"/>
      <rect x="40" y="80" width="20" height="4" fill="white"/>
      <rect x="40" y="95" width="20" height="4" fill="white"/>
      <rect x="40" y="110" width="20" height="4" fill="white"/>
      <rect x="140" y="80" width="20" height="4" fill="white"/>
      <rect x="140" y="95" width="20" height="4" fill="white"/>
      <rect x="140" y="110" width="20" height="4" fill="white"/>
      <rect x="80" y="40" width="4" height="20" fill="white"/>
      <rect x="95" y="40" width="4" height="20" fill="white"/>
      <rect x="110" y="40" width="4" height="20" fill="white"/>
      <rect x="80" y="140" width="4" height="20" fill="white"/>
      <rect x="95" y="140" width="4" height="20" fill="white"/>
      <rect x="110" y="140" width="4" height="20" fill="white"/>
      <ellipse cx="155" cy="45" rx="15" ry="10" fill="white" opacity="0.9"/>
      <ellipse cx="145" cy="48" rx="12" ry="8" fill="white" opacity="0.9"/>
      <ellipse cx="165" cy="48" rx="10" ry="7" fill="white" opacity="0.9"/>
    </svg>
  );

  // Text logo
  const TextLogo = () => (
    <span className={`font-bold ${textSizeClasses[size]} ${className}`}>
      <span className="text-primary">Hit</span>
      <span className="text-foreground">Forget</span>
    </span>
  );

  // Full logo (icon + text)
  const FullLogo = () => (
    <div className={`flex items-center gap-3 ${className}`}>
      <IconSVG />
      <TextLogo />
    </div>
  );

  // Render based on variant
  const LogoContent = () => {
    switch (variant) {
      case 'icon':
        return <IconSVG />;
      case 'text':
        return <TextLogo />;
      case 'full':
      default:
        return <FullLogo />;
    }
  };

  // Wrap with link if href is provided
  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}

// Export variants as separate components for convenience
export const LogoIcon = (props: Omit<LogoProps, 'variant'>) => (
  <Logo {...props} variant="icon" />
);

export const LogoText = (props: Omit<LogoProps, 'variant'>) => (
  <Logo {...props} variant="text" />
);

export const LogoFull = (props: Omit<LogoProps, 'variant'>) => (
  <Logo {...props} variant="full" />
);
