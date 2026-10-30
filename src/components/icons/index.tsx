import type { SVGProps } from 'react';

const ICONS = {
  dashboard: 'space_dashboard',
  calendar: 'calendar_month',
  medical_services: 'medical_services',
  local_hospital: 'local_hospital',
  stethoscope: 'stethoscope',
  health_and_safety: 'health_and_safety',
  my_health: 'ecg_heart',
  science: 'science',
  description: 'description',
  check_circle_outline: 'check_circle',
  warning: 'warning',
  arrow_upward: 'arrow_upward',
  filter_list: 'filter_list',
  add: 'add',
  chevron_left: 'chevron_left',
  chevron_right: 'chevron_right',
  more_vert: 'more_vert',
  search: 'search',
  edit: 'edit',
  patients: 'groups',
  check: 'check',
  lock: 'lock',
  person: 'person',
  person_add: 'person_add',
  person_search: 'person_search',
  group: 'group',
  visibility: 'visibility',
  visibility_off: 'visibility_off',
  home: 'home',
  logout: 'logout',
  error: 'error',
  info: 'info',
  check_circle: 'check_circle',
  assignment: 'assignment',
  pending_actions: 'pending_actions',
  priority_high: 'priority_high',
  today: 'today',
  refresh: 'refresh',
  task_alt: 'task_alt',
  event_available: 'event_available',
  assignment_turned_in: 'assignment_turned_in',
  arrow_back: 'arrow_back',
  arrow_forward: 'arrow_forward',
  menu: 'menu',
  close: 'close',
  shield: 'shield',
  light_mode: 'light_mode',
  dark_mode: 'dark_mode',
  tonality: 'tonality',
} as const;

export type MaterialIconName = keyof typeof ICONS;

interface MaterialIconProps {
  name: MaterialIconName;
  className?: string;
  size?: number;
}

export function MaterialIcon({ name, className, size = 20 }: MaterialIconProps) {
  return (
    <span
      className={['material-symbols-outlined', className].filter(Boolean).join(' ')}
      style={{ fontSize: size }}
      aria-hidden="true"
      translate="no"
    >
      {ICONS[name]}
    </span>
  );
}

export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" {...props}>
      <circle cx="9" cy="9" r="6" fill="currentColor" />
      <circle cx="19" cy="9" r="6" fill="currentColor" opacity="0.7" />
      <circle cx="9" cy="19" r="6" fill="currentColor" opacity="0.7" />
      <circle cx="19" cy="19" r="6" fill="currentColor" opacity="0.45" />
    </svg>
  );
}
