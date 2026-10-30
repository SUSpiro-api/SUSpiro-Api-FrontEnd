import { useState } from 'react';
import type { UsuarioCriado } from '../service';

export function useCadastroFuncionarioPage() {
  const [criado, setCriado] = useState<UsuarioCriado | null>(null);
  function cadastrarOutro() { setCriado(null); }
  return { criado, setCriado, cadastrarOutro };
}
