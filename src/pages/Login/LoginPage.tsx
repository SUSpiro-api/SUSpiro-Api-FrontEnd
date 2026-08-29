import { Login } from '../../components/Login';

interface LoginPageProps {
  onForgotPassword: () => void;
}

export function LoginPage({ onForgotPassword }: LoginPageProps) {
  return <Login onForgotPassword={onForgotPassword} />;
}

export default LoginPage;
