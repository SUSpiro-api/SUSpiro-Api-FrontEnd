import { useState } from 'react';
import { Button } from '../ui/Button';
import { GovBrIcon } from '../icons';

const OFFICIAL_LOGO_URL = 'https://www.gov.br/ds/assets/img/govbr-logo.png';

interface GovBrButtonProps {
  onClick?: () => void;
}

{
  /*Botão de autenticação via gov.br.*/
}

export function GovBrButton({ onClick }: GovBrButtonProps) {
  const [officialLogoFailed, setOfficialLogoFailed] = useState(false);

  return (
    <Button type="button" variant="secondary" onClick={onClick}>
      {officialLogoFailed ? (
        <GovBrIcon />
      ) : (
        <img
          src={OFFICIAL_LOGO_URL}
          alt=""
          className="login-govbr-button__logo"
          onError={() => setOfficialLogoFailed(true)}
        />
      )}
      Entrar com gov.br
    </Button>
  );
}
