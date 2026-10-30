import { Component, type ErrorInfo, type ReactNode } from 'react';
import { MaterialIcon } from '../icons';

interface AppErrorBoundaryProps {
  children: ReactNode;
  resetKey?: string;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Erro não tratado na interface SUSpiro.', error, info.componentStack);
  }

  componentDidUpdate(previousProps: AppErrorBoundaryProps): void {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="app-error" role="alert" aria-labelledby="app-error-title">
        <span className="app-error__icon" aria-hidden="true">
          <MaterialIcon name="error" size={32} />
        </span>
        <h1 id="app-error-title">Não foi possível carregar esta tela</h1>
        <p>Ocorreu um erro inesperado na interface. Tente novamente.</p>
        <button type="button" className="dashboard-button dashboard-button--primary" onClick={this.handleRetry}>
          <MaterialIcon name="refresh" size={18} />
          Tentar novamente
        </button>
      </main>
    );
  }
}
