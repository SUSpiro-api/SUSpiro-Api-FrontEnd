import './UnauthorizedPage.css';

interface UnauthorizedPageProps {
  onBack: () => void;
}

export function UnauthorizedPage({ onBack }: UnauthorizedPageProps) {
  return (
    <main className="unauthorized-page" aria-labelledby="unauthorized-title">
      <section className="unauthorized-page__card">
        <p className="unauthorized-page__code">403</p>
        <h1 id="unauthorized-title">Acesso não autorizado</h1>
        <p>Seu perfil não possui permissão para acessar este recurso.</p>
        <button type="button" onClick={onBack}>Voltar</button>
      </section>
    </main>
  );
}
