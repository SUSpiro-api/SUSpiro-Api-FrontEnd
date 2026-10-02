import { MaterialIcon } from '../../../components/icons';
import type { ScheduleType } from '../types';

interface ScheduleTypeTabsProps {
  value: ScheduleType;
  options: Array<{ value: ScheduleType; label: string; icon: 'calendar' | 'medical_services' | 'science' | 'description' }>;
  disabled?: boolean;
  onChange: (value: ScheduleType) => void;
}

export function ScheduleTypeTabs({ value, options, disabled, onChange }: ScheduleTypeTabsProps) {
  return (
    <div className="schedule-modal__types" role="tablist" aria-label="Tipo de guia">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className={['schedule-type', value === option.value && 'schedule-type--active'].filter(Boolean).join(' ')}
          onClick={() => onChange(option.value)}
          disabled={disabled}
        >
          <MaterialIcon name={option.icon} size={18} />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
