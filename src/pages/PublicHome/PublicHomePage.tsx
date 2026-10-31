import { useState, type MouseEvent } from 'react';
import { LogoMark } from '../../components/icons';
import { brand } from '../../config/brand';
import './PublicHomePage.css';

interface PublicHomePageProps {
  onNavigate: (path: '/login') => void;
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

function handleInternalLink(
  event: MouseEvent<HTMLAnchorElement>,
  onNavigate: PublicHomePageProps['onNavigate'],
) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  onNavigate('/login');
}

export function PublicHomePage({ onNavigate }: PublicHomePageProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function followLogin(event: MouseEvent<HTMLAnchorElement>) {
    setMenuOpen(false);
    handleInternalLink(event, onNavigate);
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
              <a className="public-photo-credit" href="https://www.pexels.com/photo/a-female-nurse-in-green-scrubs-standing-with-her-arms-crossed-27666717/" target="_blank" rel="noreferrer">Foto ilustrativa · Tran Nhu Tuan / Pexels</a>
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

        <section className="public-final-cta">
          <div className="public-container public-final-cta__inner">
            <div>
              <span className="public-kicker">SUSpiro</span>
              <h2>Consulte suas informações de atendimento.</h2>
              <p>Entre na sua conta para visualizar os registros disponíveis para você.</p>
            </div>
            <a className="public-button public-button--primary" href="/login" onClick={followLogin}>
              Ir para o login
            </a>
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <div className="public-container public-footer__grid">
          <section className="public-footer__brand" aria-labelledby="public-footer-brand-title">
            <a className="public-brand public-brand--footer" href="/" aria-label={`${brand.name} — página inicial`}>
              <span className="public-brand__mark"><LogoMark aria-hidden="true" /></span>
              <span className="public-brand__word" id="public-footer-brand-title">{brand.name}<span>.</span></span>
            </a>
            <p>
              Uma plataforma digital para organizar solicitações, consultas, exames,
              retornos e encaminhamentos em um só lugar.
            </p>
            <span className="public-footer__tagline">Informação organizada para acompanhar cada etapa do cuidado.</span>
          </section>

          <nav className="public-footer__nav" aria-label="Navegação institucional">
            <h2>Conheça o SUSpiro</h2>
            <a href="#recursos">O que você pode acompanhar</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#perfis">Perfis de acesso</a>
          </nav>

          <nav className="public-footer__nav" aria-label="Acesso à plataforma">
            <h2>Acesso à plataforma</h2>
            <a href="/login" onClick={followLogin}>Área do paciente</a>
            <a href="/login" onClick={followLogin}>Área dos profissionais</a>
            <a href="/login" onClick={followLogin}>Recepção e gestão</a>
            <a className="public-footer__access-link" href="/login" onClick={followLogin}>Entrar no sistema <span aria-hidden="true">→</span></a>
          </nav>

          <section className="public-footer__guidance" aria-labelledby="public-footer-guidance-title">
            <h2 id="public-footer-guidance-title">Informações importantes</h2>
            <p>
              Cada conta visualiza as funcionalidades e informações permitidas para seu perfil,
              conforme os registros disponíveis na unidade de saúde.
            </p>
            <p>
              O SUSpiro não substitui orientação médica e não é um canal de urgência ou emergência.
              Em situações urgentes, procure atendimento presencial imediatamente.
            </p>
          </section>
        </div>

        <div className="public-footer__bottom">
          <div className="public-container public-footer__bottom-inner">
            <span>© {new Date().getFullYear()} SUSpiro. Todos os direitos reservados.</span>
            <span>Plataforma digital de apoio à organização do atendimento em saúde.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicHomePage;
