import { usePageTitle } from './usePageTitle';
import { useAppNavigation } from './useAppNavigation';
import { useAuthSession } from './useAuthSession';

export function useAppController() {
  const navigation = useAppNavigation();
  const session = useAuthSession({ goTo: navigation.goTo });
  usePageTitle(navigation.route, session.user);

  return { ...navigation, ...session };
}
