import type { ReactNode } from 'react';
import './ui.css';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** Agrupa campos relacionados (fieldset + legend), o que também ajuda leitores de tela. */
export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <fieldset className="form-section">
      <legend className="form-section__title">{title}</legend>
      {description && <p className="form-section__description">{description}</p>}
      {children}
    </fieldset>
  );
}
