import type { ReactNode, SVGProps } from 'react';

type SvgProps = SVGProps<SVGSVGElement>;

/**
 * Ícones embutidos como SVG (traço de 2px, 24x24). Não dependem de fonte externa, então
 * continuam aparecendo em redes que bloqueiam o Google Fonts, como as de clínicas e hospitais.
 */
const PATHS = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  medical_services: (
    <>
      <path d="M8 4h8a2 2 0 0 1 2 2v14H6V6a2 2 0 0 1 2-2Z" />
      <path d="M9 4V2h6v2M12 9v6M9 12h6" />
    </>
  ),
  science: (
    <>
      <path d="M9 3v6l-4.5 8A2 2 0 0 0 6.25 20h11.5a2 2 0 0 0 1.75-3L15 9V3" />
      <path d="M8 3h8M7.5 16h9" />
    </>
  ),
  description: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h4M9 13h6M9 17h6" />
    </>
  ),
  check_circle_outline: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.3 2.3 4.7-5" />
    </>
  ),
  warning: (
    <>
      <path d="m12 3 10 18H2L12 3Z" />
      <path d="M12 9v5M12 17h.01" />
    </>
  ),
  arrow_upward: <path d="M12 19V5M6 11l6-6 6 6" />,
  filter_list: (
    <>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </>
  ),
  add: <path d="M12 5v14M5 12h14" />,
  chevron_left: <path d="m15 18-6-6 6-6" />,
  chevron_right: <path d="m9 18 6-6-6-6" />,
  more_vert: <path d="M12 5h.01M12 12h.01M12 19h.01" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  edit: <path d="M4 20h4l10-10-4-4L4 16v4Z" />,
  patients: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  person: (
    <>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  person_add: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </>
  ),
  group: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  visibility: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  visibility_off: (
    <>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <path d="M2 2l20 20" />
    </>
  ),
  home: (
    <>
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <path d="M9 21v-7h6v7" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </>
  ),
  error: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
  check_circle: (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4 12 14.01l-3-3" />
    </>
  ),
  assignment: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  pending_actions: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2" />
    </>
  ),
  priority_high: (
    <>
      <path d="M12 4v10" />
      <path d="M12 18h.01" />
    </>
  ),
  today: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 0 0-14.8-3L3 11" />
      <path d="M3 6v5h5" />
      <path d="M4 13a8 8 0 0 0 14.8 3L21 13" />
      <path d="M21 18v-5h-5" />
    </>
  ),
  task_alt: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </>
  ),
  event_available: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 10h18M8 15l2 2 5-5" />
    </>
  ),
  assignment_turned_in: (
    <>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M15 3v4h3M9 14l2 2 4-4" />
    </>
  ),
  arrow_back: <path d="M19 12H5M12 19l-7-7 7-7" />,
  arrow_forward: <path d="M5 12h14M12 5l7 7-7 7" />,
  menu: <path d="M3 12h18M3 6h18M3 18h18" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
} satisfies Record<string, ReactNode>;

export type MaterialIconName = keyof typeof PATHS;

interface MaterialIconProps {
  name: MaterialIconName;
  className?: string;
  size?: number;
}

export function MaterialIcon({ name, className, size = 20 }: MaterialIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

export function LogoMark(props: SvgProps) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" {...props}>
      <circle cx="9" cy="9" r="6" fill="currentColor" />
      <circle cx="19" cy="9" r="6" fill="currentColor" opacity="0.7" />
      <circle cx="9" cy="19" r="6" fill="currentColor" opacity="0.7" />
      <circle cx="19" cy="19" r="6" fill="currentColor" opacity="0.45" />
    </svg>
  );
}
