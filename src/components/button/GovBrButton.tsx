import { Button } from '../ui/Button';


interface GovBrButtonProps {
  onClick?: () => void;
}

export function GovBrButton({ onClick }: GovBrButtonProps) {
  return (
    <Button type="button" variant="secondary" onClick={onClick}>
      
      Entrar com gov.br
    </Button>
  );
}
