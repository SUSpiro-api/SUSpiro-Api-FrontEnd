import type { CSSProperties, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

/**
 * Nomes de ícone usados pelo site.
 */
export type MaterialIconName = 'check' | 'lock' | 'person' | 'visibility' | 'visibility_off';

interface MaterialIconProps {
  name: MaterialIconName;
  className?: string;
  size?: number;
}

export function MaterialIcon({ name, className, size = 20 }: MaterialIconProps) {
  const style: CSSProperties = { fontSize: size };

  return (
    <span
      className={['material-symbols-outlined', className].filter(Boolean).join(' ')}
      style={style}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

export function LogoMark(props: IconProps) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" {...props}>
      <circle cx="9" cy="9" r="6" fill="currentColor" />
      <circle cx="19" cy="9" r="6" fill="currentColor" opacity="0.7" />
      <circle cx="9" cy="19" r="6" fill="currentColor" opacity="0.7" />
      <circle cx="19" cy="19" r="6" fill="currentColor" opacity="0.45" />
    </svg>
  );
}


