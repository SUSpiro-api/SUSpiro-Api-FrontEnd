// Banda de busca usada pelas páginas de apoio ao paciente.

import type { FormEvent } from 'react';
import { MaterialIcon, type MaterialIconName } from '../../../components/icons';

interface SupportSearchBarProps {
  inputId: string;
  label: string;
  placeholder: string;
  icon: MaterialIconName;
  buttonLabel: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function SupportSearchBar({
  inputId, label, placeholder, icon, buttonLabel, hint, value, onChange, onSubmit,
}: SupportSearchBarProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <section className="support-search">
      <form className="support-search__form" onSubmit={handleSubmit} noValidate>
        <label className="support-search__label" htmlFor={inputId}>{label}</label>
        <div className="support-search__row">
          <div className="support-search__field">
            <span className="support-search__icon" aria-hidden="true">
              <MaterialIcon name={icon} size={20} />
            </span>
            <input
              id={inputId}
              className="support-search__input"
              type="search"
              autoComplete="off"
              placeholder={placeholder}
              value={value}
              onChange={(event) => onChange(event.target.value)}
            />
          </div>
          <button type="submit" className="dashboard-button dashboard-button--primary">{buttonLabel}</button>
        </div>
        <p className="support-search__hint">{hint}</p>
      </form>
    </section>
  );
}
