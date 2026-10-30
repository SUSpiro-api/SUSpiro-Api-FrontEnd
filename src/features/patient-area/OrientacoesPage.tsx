// Reúne orientações práticas fora do painel principal para não sobrecarregar o paciente.

import { MaterialIcon } from '../../components/icons';
import { PatientGuides } from './components/PatientGuides';
import '../../components/layout/layout.css';
import './patient-area.css';

export function OrientacoesPage() {
  return (
    <div className="page patient-page patient-info-page">
      <header className="patient-info-page__header">
        <div className="patient-info-page__heading-icon" aria-hidden="true">
          <MaterialIcon name="assignment" size={23} />
        </div>
        <div>
          <h1 className="page__title">Orientações</h1>
          <p className="page__description">Informações para se preparar para seus atendimentos e entender cada etapa.</p>
        </div>
      </header>
      <PatientGuides />
    </div>
  );
}
