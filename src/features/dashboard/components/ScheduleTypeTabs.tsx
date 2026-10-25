// Mostra as opções de tipo de registro.

import { useArrowKeyTabs } from '../../../hooks/useArrowKeyTabs';
import { MaterialIcon } from '../../../components/icons';
import type { ScheduleType } from '../types';

interface ScheduleTypeTabsProps {
  value: ScheduleType;
  options: Array<{
    value: ScheduleType;
    label: string;
    icon: 'calendar' | 'medical_services' | 'science' | 'description';
  }>;
  disabled?: boolean;
  onChange: (value: ScheduleType) => void;
}

export function ScheduleTypeTabs({ value, options, disabled, onChange }: ScheduleTypeTabsProps) {
  const values = options.map((option) => option.value);
  const { refs, handleKeyDown } = useArrowKeyTabs(values, onChange);

  return (
    <div className="schedule-modal__types" role="tablist" aria-label="Tipo de guia">
      {options.map((option, index) => (
        <button
          key={option.value}
          id={`schedule-type-tab-${option.value}`}
          ref={(element) => { refs.current[index] = element; }}
          type="button"
          role="tab"
          aria-controls="schedule-type-panel"
          aria-selected={value === option.value}
          tabIndex={value === option.value ? 0 : -1}
          className={['schedule-type', value === option.value && 'schedule-type--active'].filter(Boolean).join(' ')}
          onClick={() => onChange(option.value)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          disabled={disabled}
        >
          <MaterialIcon name={option.icon} size={18} />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
