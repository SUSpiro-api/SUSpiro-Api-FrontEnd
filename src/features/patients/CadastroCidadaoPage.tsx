import { CadastroCidadaoForm } from './CadastroCidadaoForm';
import './patients.css';

export function CadastroCidadaoPage() {
  return (
    <main className="patient-page">
      <header className="patient-page__header">
        <div>
          <p className="patient-page__eyebrow">Cadastro de Cidadão</p>
          <h1 className="patient-page__title">Dados do cidadão</h1>
          <p className="patient-page__subtitle">
            Localize ou cadastre um cidadão para manter seus dados atualizados.
          </p>
        </div>
      </header>

      <section className="patient-page__content">
        <CadastroCidadaoForm
          onSucesso={() => {
            console.info('Cidadão cadastrado com sucesso.');
          }}
          onCancelar={() => {
            console.info('Cadastro cancelado.');
          }}
        />
      </section>
    </main>
  );
}     
