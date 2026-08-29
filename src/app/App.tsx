import { useEffect, useState } from 'react';
import { ForgotPasswordFeature, LoginFeature } from '../features/auth';
import { getCurrentPath, navigate } from './navigation';
import '../styles/global.css';

type Route = '/' | '/login' | '/recuperar-senha';

function resolveRoute(pathname: string): Route {
  if (pathname === '/recuperar-senha') return '/recuperar-senha';
  if (pathname === '/login') return '/login';
  return '/';
}

export default function App() {
  const [route, setRoute] = useState<Route>(resolveRoute(getCurrentPath()));

  useEffect(() => {
    const handlePopState = () => setRoute(resolveRoute(getCurrentPath()));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const goToLogin = () => {
    navigate('/login');
    setRoute('/login');
  };

  const goToForgotPassword = () => {
    navigate('/recuperar-senha');
    setRoute('/recuperar-senha');
  };

  if (route === '/recuperar-senha') {
    return <ForgotPasswordFeature onBack={goToLogin} />;
  }

  if (route === '/login') {
    return <LoginFeature onForgotPassword={goToForgotPassword} />;
  }

  return <LoginFeature onForgotPassword={goToForgotPassword} />;
}
