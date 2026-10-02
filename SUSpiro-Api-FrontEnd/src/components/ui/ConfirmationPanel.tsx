import { MaterialIcon } from '../icons';
import { Button } from './Button';
import './ui.css';

interface ConfirmationPanelProps {
  title: string;
  description?: string;
  /** Resumo do que foi registrado (use dados mascarados quando forem pessoais). */
  details: Array<{ label: string; value: string }>;
  primaryAction: { label: string; onClick: () => void };
  secondaryAction: { label: string; onClick: () => void };
}

/** Confirmação após um cadastro: o que foi feito, um resumo e os próximos passos. */
export function ConfirmationPanel({
  title,
  description,
  details,
  primaryAction,
  secondaryAction,
}: ConfirmationPanelProps) {
  return (
    <section className="confirmation" role="status" aria-live="polite">
      <span className="confirmation__icon" aria-hidden="true">
        <MaterialIcon name="check_circle" size={28} />
      </span>

      <h2 className="confirmation__title">{title}</h2>
      {description && <p className="confirmation__description">{description}</p>}

      {details.length > 0 && (
        <dl className="confirmation__details">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt>{detail.label}</dt>
              <dd>{detail.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="form-actions">
        <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>
        <Button variant="secondary" onClick={secondaryAction.onClick}>
          {secondaryAction.label}
        </Button>
      </div>
    </section>
  );
}
