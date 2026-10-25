// Orientações de atendimento que agora ficam em uma página própria do paciente.

import { MaterialIcon, type MaterialIconName } from '../../../components/icons';

const beforeVisit = [
  'Leve um documento com foto e o cartão do SUS, se tiver.',
  'Confira a data, o horário e o local no detalhe do atendimento.',
  'Chegue com cerca de 15 minutos de antecedência.',
  'Leve exames, receitas e laudos anteriores que possam ajudar no atendimento.',
  'Se usa medicamentos, leve uma lista com os nomes e as doses.',
  'Se não puder comparecer, entre em contato com a unidade para avisar.',
];

const statusGuide = [
  { status: 'pendente', label: 'Pendente', text: 'A unidade ainda vai definir a data, o horário e o local.' },
  { status: 'agendado', label: 'Agendado', text: 'A data e o horário estão definidos. Confira o local antes de sair.' },
  { status: 'realizado', label: 'Realizado', text: 'O atendimento já aconteceu.' },
  { status: 'vencido', label: 'Vencido', text: 'A solicitação venceu sem agendamento. Entre em contato com a unidade.' },
  { status: 'cancelado', label: 'Cancelado', text: 'Entre em contato com a unidade para receber orientação sobre um novo agendamento.' },
];

export function PatientGuides() {
  return (
    <div className="care-help" aria-label="Orientações para o paciente">
      <article className="care-tip">
        <TipHeading icon="assignment_turned_in" title="Antes do atendimento" />
        <ul className="care-tip__checks">
          {beforeVisit.map((tip) => (
            <li key={tip}>
              <MaterialIcon name="check_circle_outline" size={21} aria-hidden="true" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </article>

      <article className="care-tip">
        <TipHeading icon="info" title="Entenda as situações" />
        <dl className="care-legend">
          {statusGuide.map((entry) => (
            <div key={entry.status} className="care-legend__row">
              <dt>
                <span className={`appointment__status appointment__status--${entry.status}`}>{entry.label}</span>
              </dt>
              <dd>{entry.text}</dd>
            </div>
          ))}
        </dl>
      </article>

      <article className="care-tip">
        <TipHeading icon="science" title="Antes de fazer um exame" />
        <ul className="care-tip__checks">
          <li><MaterialIcon name="check_circle_outline" size={21} aria-hidden="true" /><span>Siga as instruções de preparo dadas pela unidade ou pelo profissional.</span></li>
          <li><MaterialIcon name="check_circle_outline" size={21} aria-hidden="true" /><span>Não deixe de tomar nem altere medicamentos sem orientação de um profissional de saúde.</span></li>
          <li><MaterialIcon name="check_circle_outline" size={21} aria-hidden="true" /><span>Se não recebeu instruções de preparo, fale com a unidade antes do exame.</span></li>
        </ul>
      </article>

      <article className="care-tip">
        <TipHeading icon="local_hospital" title="Precisa de ajuda com o agendamento?" />
        <p className="care-tip__text">
          Se a data, o local ou o preparo não estiverem claros, entre em contato com a unidade de saúde que fez a solicitação. A equipe poderá confirmar essas informações.
        </p>
      </article>

      <article className="care-tip care-tip--urgent">
        <TipHeading icon="priority_high" title="Em caso de urgência" />
        <p className="care-tip__text">Se você ou outra pessoa estiver passando mal, não espere pelo agendamento. Peça ajuda imediatamente.</p>
        <div className="care-calls">
          <a className="care-call" href="tel:192">
            <span>SAMU — urgência e emergência</span>
            <strong>192</strong>
          </a>
          <a className="care-call" href="tel:136">
            <span>Disque Saúde — orientações do Ministério da Saúde</span>
            <strong>136</strong>
          </a>
        </div>
      </article>
    </div>
  );
}

function TipHeading({ icon, title }: { icon: MaterialIconName; title: string }) {
  return (
    <header className="care-tip__header">
      <span className="care-tip__icon" aria-hidden="true">
        <MaterialIcon name={icon} size={21} />
      </span>
      <h2 className="care-tip__title">{title}</h2>
    </header>
  );
}
