// Permite escolher o tipo de registro no formulário.

import { useRef, type KeyboardEvent } from 'react';
import { MaterialIcon } from '../../../components/icons';
import type { ScheduleType } from '../types';

interface ScheduleTypeTabsProps {
  value: ScheduleType;
  options: Array<{ value: ScheduleType; label: string; icon: 'calendar' | 'medical_services' | 'science' | 'description' }>;
  disabled?: boolean;
  onChange: (value: ScheduleType) => void;
}

function useTabKeyboard(onChange: (value: ScheduleType) => void) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number, values: ScheduleType[]) => {
    const moves: Partial<Record<string, number>> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      Home: -index,
      End: values.length - 1 - index,
    };
    const move = moves[event.key];
    if (move === undefined) return;

    event.preventDefault();
    const next = values[(index + move + values.length) % values.length];
    onChange(next);
    refs.current[values.indexOf(next)]?.focus();
  };

  return { refs, handleKeyDown };
}

export function ScheduleTypeTabs({ value, options, disabled, onChange }: ScheduleTypeTabsProps) {
  const values = options.map((option) => option.value);
  const { refs, handleKeyDown } = useTabKeyboard(onChange);

  return (
    <div className="schedule-modal__types" role="tablist" aria-label="Tipo de guia">
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={(element) => { refs.current[index] = element; }}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          tabIndex={value === option.value ? 0 : -1}
          className={['schedule-type', value === option.value && 'schedule-type--active'].filter(Boolean).join(' ')}
          onClick={() => onChange(option.value)}
          onKeyDown={(event) => handleKeyDown(event, index, values)}
          disabled={disabled}
        >
          <MaterialIcon name={option.icon} size={18} />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
