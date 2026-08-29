import { useState } from 'react';
import { Login } from '../../components/Login';
import { ForgotPasswordPage } from './ForgotPasswordPage';

type LoginStage = 'login' | 'forgot';

export function LoginPage() {
  const [stage, setStage] = useState<LoginStage>('login');

  if (stage === 'forgot') {
    return <ForgotPasswordPage onBack={() => setStage('login')} />;
  }

  return <Login onForgotPassword={() => setStage('forgot')} />;
}

export default LoginPage;
