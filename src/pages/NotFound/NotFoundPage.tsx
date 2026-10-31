import { LogoMark, MaterialIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import { brand } from '../../config/brand';
import './NotFoundPage.css';

interface NotFoundPageProps {
  /** `page`: tela cheia (visitante sem sessão). `embedded`: dentro do menu lateral, para quem já entrou. */
  variant?: 'page' | 'embedded';
  title?: string;
  description?: string;
  /** Texto do botão principal. */
  actionLabel?: string;
  onAction: () => void;
  /** Ação secundária opcional (ex.: voltar à tela anterior). */
  onBack?: () => void;
}

export function NotFoundPage({
  variant = 'page',
  title = 'Página não encontrada',
  description = 'O endereço que você abriu não existe ou foi movido. Confira o link digitado ou volte para continuar de onde parou.',
  actionLabel = 'Ir para o início',
  onAction,
  onBack,
}: NotFoundPageProps) {
  const content = (
    <section className="not-found" aria-labelledby="not-found-title">
      <div className="not-found__code" aria-hidden="true">
        <span>4</span>
        <span className="not-found__code-icon">
          <MaterialIcon name="search" size={44} />
        </span>
        <span>4</span>
      </div>

      <p className="not-found__eyebrow">Erro 404</p>
      <h1 id="not-found-title" className="not-found__title">{title}</h1>
      <p className="not-found__text">{description}</p>

      <div className="not-found__actions">
        <Button onClick={onAction}>
          <MaterialIcon name="home" size={18} />
          {actionLabel}
        </Button>
        {onBack && (
          <Button variant="secondary" onClick={onBack}>
            <MaterialIcon name="chevron_left" size={18} />
            Voltar
          </Button>
        )}
      </div>
    </section>
  );

  if (variant === 'embedded') {
    return <div className="page not-found-page not-found-page--embedded"><div className="not-found-card">{content}</div></div>;
  }

  return (
    <main className="not-found-page">
      <header className="not-found-page__brand">
        <span className="not-found-page__mark" aria-hidden="true"><LogoMark /></span>
        <span className="not-found-page__word">{brand.name}</span>
      </header>
      <div className="not-found-card not-found-page__card">{content}</div>
    </main>
  );
}
