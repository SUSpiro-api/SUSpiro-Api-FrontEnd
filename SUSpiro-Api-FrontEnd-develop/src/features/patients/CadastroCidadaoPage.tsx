import { useState } from 'react';
import { CadastroCidadaoForm } from './CadastroCidadaoForm';
import './patients.css';

interface CadastroCidadaoPageProps {
  onVoltar: () => void;
}

export function CadastroCidadaoPage({ onVoltar }: CadastroCidadaoPageProps) {
  const [sucesso, setSucesso] = useState(false);

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
        {sucesso ? (
          <div className="patient-page__success" role="status" aria-live="polite">
            <h2>Cidadão cadastrado com sucesso!</h2>
            <p>Os dados foram enviados para o SUSpiro.</p>
            <div className="patient-form__actions">
              <button
                type="button"
                className="patient-page__success-primary"
                onClick={() => setSucesso(false)}
              >
                Cadastrar outro
              </button>
              <button
                type="button"
                className="patient-form__cancel"
                onClick={onVoltar}
              >
                Voltar
              </button>
            </div>
          </div>
        ) : (
          <CadastroCidadaoForm
            onSucesso={() => setSucesso(true)}
            onCancelar={onVoltar}
          />
        )}
      </section>
    </main>
  );
}     
