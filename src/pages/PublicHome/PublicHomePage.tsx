import { useState, type MouseEvent } from 'react';
import { LogoMark } from '../../components/icons';
import { brand } from '../../config/brand';
import './PublicHomePage.css';

type PublicPath = '/login' | '/recuperar-senha';

interface PublicHomePageProps {
  onNavigate: (path: PublicPath) => void;
}

const features = [
  {
    title: 'Consultas e retornos',
    description: 'Confira a especialidade, a data, o horário e a unidade quando o atendimento for agendado pela equipe.',
  },
  {
    title: 'Exames e procedimentos',
    description: 'Veja o que foi solicitado, acompanhe a situação e consulte as orientações registradas para o atendimento.',
  },
  {
    title: 'Encaminhamentos',
    description: 'Entenda para qual especialidade você foi encaminhado e acompanhe as próximas etapas disponíveis.',
  },
];

const steps = [
  { number: '01', title: 'Entre na sua conta', description: 'Use seu CPF e sua senha. No primeiro acesso, informe a senha temporária recebida por e-mail e cadastre uma senha pessoal.' },
  { number: '02', title: 'Encontre seus atendimentos', description: 'Na área Minha saúde, consulte solicitações, exames, consultas, retornos e encaminhamentos vinculados ao seu cadastro.' },
  { number: '03', title: 'Acompanhe as atualizações', description: 'Quando a equipe registrar uma mudança, você verá a situação, a data e os detalhes que estiverem disponíveis.' },
];

const profiles = [
  { title: 'Paciente', description: 'Consulta seus atendimentos, solicitações, orientações e dados da própria conta.' },
  { title: 'Médicos e enfermagem', description: 'Registram consultas, retornos, exames e encaminhamentos para os pacientes.' },
  { title: 'Recepção e gestão', description: 'Organizam a fila de guias, os agendamentos e os cadastros conforme as permissões.' },
];

const faqs = [
  {
    question: 'Como faço o meu primeiro acesso?',
    answer: 'O cadastro é feito pela equipe da unidade de saúde. Você recebe, no e-mail informado, o seu CPF de acesso e uma senha temporária. Ao entrar pela primeira vez, o sistema pede que você crie uma senha pessoal.',
  },
  {
    question: 'Não recebi o e-mail com a senha temporária. O que fazer?',
    answer: 'Confira a caixa de spam e a lixeira. Se o e-mail não estiver lá, procure a unidade onde você foi cadastrado para conferir se o endereço de e-mail foi registrado corretamente.',
  },
  {
    question: 'Esqueci a minha senha. Como recupero?',
    answer: 'Na tela de entrada, use a opção “Esqueceu a senha?”. Enviamos um link para o e-mail da sua conta. O link vale por 30 minutos e só pode ser usado uma vez.',
  },
  {
    question: 'O que significa uma solicitação “pendente”?',
    answer: 'Significa que a solicitação foi registrada, mas a unidade ainda não definiu data e horário. Você não precisa abrir outra solicitação: enquanto estiver pendente, o sistema envia um lembrete por e-mail a cada cinco dias.',
  },
  {
    question: 'Serei avisado quando o atendimento for agendado?',
    answer: 'Sim. Quando a equipe agenda, você recebe um e-mail de confirmação com data, horário e local do atendimento. As mesmas informações ficam disponíveis na área Minha saúde.',
  },
  {
    question: 'Posso usar o SUSpiro em caso de urgência?',
    answer: 'Não. O SUSpiro serve para acompanhar atendimentos já registrados e não substitui orientação médica. Em emergências, ligue 192 (SAMU) ou procure o pronto atendimento mais próximo.',
  },
];

function handleInternalLink(
  event: MouseEvent<HTMLAnchorElement>,
  onNavigate: PublicHomePageProps['onNavigate'],
  path: PublicPath = '/login',
) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  onNavigate(path);
}

export function PublicHomePage({ onNavigate }: PublicHomePageProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function followLogin(event: MouseEvent<HTMLAnchorElement>) {
    setMenuOpen(false);
    handleInternalLink(event, onNavigate);
  }

  function followRecovery(event: MouseEvent<HTMLAnchorElement>) {
    handleInternalLink(event, onNavigate, '/recuperar-senha');
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="public-home">
      <a className="public-home__skip-link" href="#conteudo">Pular para o conteúdo</a>

      <header className="public-header">
        <div className="public-container public-header__inner">
          <a className="public-brand" href="/" aria-label={`${brand.name} — página inicial`} onClick={(event) => {
            if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
              event.preventDefault();
              closeMenu();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}>
            <span className="public-brand__mark"><LogoMark aria-hidden="true" /></span>
            <span className="public-brand__word">{brand.name}<span>.</span></span>
          </a>

          <button
            className="public-mobile-menu"
            type="button"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="public-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? 'Fechar' : 'Menu'}
          </button>

          <nav id="public-navigation" className={`public-nav${menuOpen ? ' public-nav--open' : ''}`} aria-label="Navegação principal">
            <a href="#recursos" onClick={closeMenu}>Recursos</a>
            <a href="#como-funciona" onClick={closeMenu}>Como funciona</a>
            <a href="#perfis" onClick={closeMenu}>Perfis de acesso</a>
            <a href="#duvidas" onClick={closeMenu}>Dúvidas</a>
            <a className="public-nav__login" href="/login" onClick={followLogin}>Entrar</a>
          </nav>
        </div>
      </header>

      <main id="conteudo">
        <section className="public-hero">
          <div className="public-container public-hero__grid">
            <div className="public-hero__copy">
              <h1>Seus atendimentos, <span>mais fáceis de acompanhar.</span></h1>
              <p className="public-hero__description">
                O SUSpiro reúne as informações de consultas, exames, retornos e encaminhamentos registrados pela equipe de saúde. Você consulta o que foi solicitado, o que já tem data e qual é a próxima etapa.
              </p>
              <div className="public-hero__actions">
                <a className="public-button public-button--primary" href="/login" onClick={followLogin}>
                  Entrar na minha conta
                </a>
                <a className="public-button public-button--secondary" href="#como-funciona">Entender como funciona</a>
              </div>
              <p className="public-hero__note">Acesso individual às informações vinculadas à sua conta.</p>
            </div>

            <div className="public-hero-visual">
              <div className="public-hero-photo-frame">
                <img
                  className="public-hero-photo"
                  src="https://images.pexels.com/photos/27666717/pexels-photo-27666717.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Enfermeira usando uniforme verde e estetoscópio, com os braços cruzados em uma postura profissional."
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="public-section" id="recursos">
          <div className="public-container">
            <header className="public-section-heading">
              <span className="public-kicker">O que você pode acompanhar</span>
              <h2>Saiba o que cada informação significa.</h2>
              <p>Os dados aparecem conforme os profissionais registram e atualizam cada atendimento no sistema.</p>
            </header>
            <div className="public-feature-grid">
              {features.map((feature) => (
                <article className="public-feature-card" key={feature.title}>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="public-section public-how" id="como-funciona">
          <div className="public-container public-how__grid">
            <header className="public-how__intro">
              <span className="public-kicker">Como funciona</span>
              <h2>Comece em poucos passos.</h2>
              <p>Você não precisa conhecer termos técnicos. A plataforma apresenta as informações de forma organizada e explica a situação de cada solicitação.</p>
              <a className="public-text-link" href="/login" onClick={followLogin}>Acessar o SUSpiro</a>
            </header>
            <div className="public-steps">
              {steps.map((step) => (
                <article className="public-step" key={step.number}>
                  <span className="public-step__number">{step.number}</span>
                  <div><h3>{step.title}</h3><p>{step.description}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="public-section public-profiles" id="perfis">
          <div className="public-container">
            <header className="public-section-heading">
              <span className="public-kicker">Acesso por perfil</span>
              <h2>Uma plataforma, áreas de trabalho diferentes.</h2>
              <p>Cada pessoa acessa somente as funções necessárias para sua atuação.</p>
            </header>
            <div className="public-profile-grid">
              {profiles.map((profile) => (
                <article className="public-profile-card" key={profile.title}>
                  <div><h3>{profile.title}</h3><p>{profile.description}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="public-section public-faq" id="duvidas">
          <div className="public-container public-faq__grid">
            <header className="public-faq__intro">
              <span className="public-kicker">Dúvidas frequentes</span>
              <h2>Respostas para as perguntas mais comuns.</h2>
              <p>Reunimos o que pacientes mais perguntam sobre acesso, senha, solicitações e avisos por e-mail.</p>
            </header>
            <div className="public-faq__list">
              {faqs.map((item) => (
                <details className="public-faq__item" key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <div className="public-container">
          <div className="public-footer__top">
            <div className="public-footer__about">
              <a className="public-brand public-brand--footer" href="/" aria-label={`${brand.name} — página inicial`}>
                <span className="public-brand__mark"><LogoMark aria-hidden="true" /></span>
                <span className="public-brand__word">{brand.name}<span>.</span></span>
              </a>
              <p>Plataforma digital para organizar e acompanhar consultas, exames, retornos e encaminhamentos em saúde.</p>
              <a className="public-footer__access" href="/login" onClick={followLogin}>Acessar minha conta</a>
            </div>

            <nav className="public-footer__column" aria-label="Plataforma">
              <h3>Plataforma</h3>
              <ul>
                <li><a href="#recursos">Recursos</a></li>
                <li><a href="#como-funciona">Como funciona</a></li>
                <li><a href="#perfis">Perfis de acesso</a></li>
                <li><a href="#duvidas">Dúvidas frequentes</a></li>
              </ul>
            </nav>

            <nav className="public-footer__column" aria-label="Acesso">
              <h3>Acesso</h3>
              <ul>
                <li><a href="/login" onClick={followLogin}>Entrar</a></li>
                <li><a href="/recuperar-senha" onClick={followRecovery}>Recuperar senha</a></li>
              </ul>
            </nav>

            <div className="public-footer__column public-footer__help">
              <h3>Em caso de urgência</h3>
              <p>O SUSpiro não atende emergências. Ligue ou procure ajuda imediata:</p>
              <ul>
                <li><strong>192</strong> <span>SAMU</span></li>
                <li><strong>136</strong> <span>Disque Saúde</span></li>
              </ul>
            </div>
          </div>

          <div className="public-footer__bottom">
            <small>© {new Date().getFullYear()} {brand.name}. Todos os direitos reservados.</small>
            <small>O SUSpiro não substitui orientação médica nem serviços de emergência.</small>
            <a href="#conteudo" className="public-footer__top-link">Voltar ao topo</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicHomePage;
