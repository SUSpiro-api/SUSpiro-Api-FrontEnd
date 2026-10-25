// Monta a página do perfil do profissional logado.

import { MaterialIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import { ConfirmationPanel } from '../../components/ui/ConfirmationPanel';
import { FormSection } from '../../components/ui/FormSection';
import { Notice } from '../../components/ui/Notice';
import { PasswordField } from '../../components/ui/PasswordField';
import { TextField } from '../../components/ui/TextField';
import { perfilLabel } from '../auth/perfil';
import type { AuthUser } from '../auth/types';
import { maskCpf } from '../../utils/mask';
import { NOME_MAX_LENGTH } from './validation';
import { usePerfilForm } from './hooks/usePerfilForm';
import '../../components/layout/layout.css';
import './PerfilPage.css';

interface PerfilPageProps {
  user: AuthUser;
  onAtualizarUsuario: (updates: Partial<Pick<AuthUser, 'nome'>>) => void;
  onVoltar: () => void;
  /** Exibe esta tela com foco em segurança para o atalho da sidebar do paciente. */
  securityMode?: boolean;
}

export function PerfilPage({ user, onAtualizarUsuario, onVoltar, securityMode = false }: PerfilPageProps) {
  const form = usePerfilForm({ user, onAtualizarUsuario, securityOnly: securityMode });

  return (
    <div className="page page--form">
      <header className="page__header">
        <h1 className="page__title">{securityMode ? 'Proteja sua conta' : 'Meu perfil'}</h1>
        {!form.salvo && (
          <p className="page__description">{securityMode ? 'Mantenha seus dados de acesso protegidos e troque sua senha sempre que precisar.' : 'Atualize os dados da sua conta e a senha usada para entrar.'}</p>
        )}
      </header>

      <div className="form-page__grid">
        <div className="card form-page__main">
          {form.salvo ? (
            <ConfirmationPanel
              title={securityMode ? 'Senha atualizada' : 'Alterações salvas'}
              description={securityMode ? 'Sua senha foi atualizada com sucesso.' : 'Suas informações de conta foram atualizadas.'}
              details={securityMode ? [] : [
                { label: 'Nome', value: form.nome.trim() },
                { label: 'CPF', value: (user.cpfMascarado ?? maskCpf(user.sub)) },
                { label: 'Perfil', value: perfilLabel(user.perfil) },
              ].filter((detail) => detail.value)}
              primaryAction={{ label: securityMode ? 'Voltar à segurança da conta' : 'Continuar no perfil', onClick: form.continuarEditando }}
              secondaryAction={{ label: securityMode ? 'Voltar à minha saúde' : 'Voltar ao início', onClick: onVoltar }}
            />
          ) : (
            <form
              ref={form.formRef}
              onSubmit={form.handleSubmit}
              noValidate
              aria-label={securityMode ? "Formulário de proteção da conta" : "Formulário do perfil"}
            >
              {!securityMode && <FormSection title="Dados da conta">
                <div className="form-grid">
                  <div className="form-grid__full">
                    <TextField
                      label="Nome completo"
                      placeholder="Digite o nome completo"
                      autoComplete="name"
                      maxLength={NOME_MAX_LENGTH}
                      required
                      error={form.fieldErrors.nome}
                      value={form.nome}
                      onChange={(event) => form.alterarNome(event.target.value)}
                    />
                  </div>
                  <div className="form-grid__full perfil-readonly">
                    <div className="perfil-readonly__field">
                      <span className="perfil-readonly__label">CPF</span>
                      <span className="perfil-readonly__value">{(user.cpfMascarado ?? maskCpf(user.sub))}</span>
                    </div>
                    <div className="perfil-readonly__field">
                      <span className="perfil-readonly__label">Perfil de acesso</span>
                      <span className="perfil-readonly__value">{perfilLabel(user.perfil)}</span>
                    </div>
                  </div>
                </div>
              </FormSection>}

              <FormSection
                title={securityMode ? 'Senha de acesso' : 'Alterar senha'}
                description={securityMode ? 'Informe sua senha atual e escolha uma nova senha que só você conheça.' : 'Preencha apenas se quiser trocar a senha atual.'}
              >
                <div className="form-grid">
                  <PasswordField
                    label="Senha atual"
                    autoComplete="current-password"
                    value={form.senhaAtual}
                    onChange={(event) => form.alterarSenhaAtual(event.target.value)}
                    error={form.fieldErrors.senhaAtual}
                  />
                  <PasswordField
                    label="Nova senha"
                    hint="12 a 72 caracteres, com maiúscula, minúscula, número e símbolo."
                    autoComplete="new-password"
                    value={form.novaSenha}
                    onChange={(event) => form.alterarNovaSenha(event.target.value)}
                    error={form.fieldErrors.novaSenha}
                  />
                  <PasswordField
                    label="Confirmar nova senha"
                    autoComplete="new-password"
                    value={form.confirmacao}
                    onChange={(event) => form.alterarConfirmacao(event.target.value)}
                    error={form.fieldErrors.confirmacao}
                  />
                </div>
              </FormSection>

              {form.formError && <Notice variant="error">{form.formError}</Notice>}

              <div className="form-actions">
                <Button variant="secondary" onClick={onVoltar} disabled={form.isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={form.isSubmitting} aria-busy={form.isSubmitting}>
                  {form.isSubmitting ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              </div>
            </form>
          )}
        </div>

        <aside className="form-page__aside" aria-label="Orientações da conta">
          {!securityMode && <section className="form-aside">
            <h2 className="form-aside__title">
              <MaterialIcon name="person" size={18} aria-hidden="true" />
              Sua conta
            </h2>
            <p className="form-aside__text">
              O CPF é a sua identidade de acesso e não pode ser alterado. O perfil de acesso é
              definido pelo administrador da unidade.
            </p>
          </section>}

          <section className="form-aside">
            <h2 className="form-aside__title">
              <MaterialIcon name="lock" size={18} aria-hidden="true" />
              Senha segura
            </h2>
            <ul className="form-aside__list">
              <li>Use de 12 a 72 caracteres, com maiúscula, minúscula, número e símbolo.</li>
              <li>Evite repetir senhas usadas em outros serviços.</li>
              <li>Não compartilhe sua senha, nem mesmo com pessoas que trabalham na unidade.</li>
              <li>Após trocar a senha, use a nova no próximo acesso.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
