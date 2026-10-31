import { useCallback, useEffect, useState } from 'react';
import { getCurrentPath, navigate } from './navigation';
import { resolveRoute, type Route } from './routes';

export function useAppNavigation() {
  const [route, setRoute] = useState<Route>(() => resolveRoute(getCurrentPath()));

  useEffect(() => {
    function updateRoute() {
      setRoute(resolveRoute(getCurrentPath()));
    }

    window.addEventListener('popstate', updateRoute);
    return () => window.removeEventListener('popstate', updateRoute);
  }, []);

  const goTo = useCallback((path: Route) => {
    navigate(path);
    setRoute(path);
  }, []);

  return { route, goTo };
}
