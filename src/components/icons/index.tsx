// Catálogo de ícones padronizados Lucide para navegação e fluxos clínicos.
// Os símbolos são vetoriais, escaláveis e empacotados no frontend — sem imagens remotas.

import type { SVGProps } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Building2,
  Calendar,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileText,
  Filter,
  FlaskConical,
  HeartPulse,
  Home,
  Info,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Stethoscope,
  Users,
  User,
  UserPlus,
  Eye,
  EyeOff,
  X,
  type LucideIcon,
} from 'lucide-react';

const ICONS = {
  dashboard: LayoutDashboard,
  calendar: CalendarDays,
  medical_services: HeartPulse,
  local_hospital: Building2,
  stethoscope: Stethoscope,
  health_and_safety: ShieldCheck,
  science: FlaskConical,
  description: FileText,
  check_circle_outline: CheckCircle2,
  warning: AlertTriangle,
  arrow_upward: ArrowUp,
  filter_list: Filter,
  add: Plus,
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
  more_vert: MoreVertical,
  search: Search,
  edit: Pencil,
  patients: Users,
  check: Check,
  lock: Lock,
  person: User,
  person_add: UserPlus,
  person_search: Search,
  group: Users,
  visibility: Eye,
  visibility_off: EyeOff,
  home: Home,
  logout: LogOut,
  error: AlertCircle,
  info: Info,
  check_circle: CheckCircle2,
  assignment: ClipboardList,
  pending_actions: Clock,
  priority_high: AlertTriangle,
  today: Calendar,
  refresh: RefreshCw,
  task_alt: CheckCircle2,
  event_available: CalendarCheck,
  assignment_turned_in: ClipboardCheck,
  arrow_back: ArrowLeft,
  arrow_forward: ArrowRight,
  menu: Menu,
  close: X,
  shield: Shield,
} satisfies Record<string, LucideIcon>;

export type MaterialIconName = keyof typeof ICONS;

interface MaterialIconProps {
  name: MaterialIconName;
  className?: string;
  size?: number;
}

/** Mantém o contrato usado pelas telas e delega o desenho à biblioteca Lucide. */
export function MaterialIcon({ name, className, size = 20 }: MaterialIconProps) {
  const Icon = ICONS[name];
  return <Icon className={className} size={size} strokeWidth={1.8} aria-hidden="true" focusable="false" />;
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
