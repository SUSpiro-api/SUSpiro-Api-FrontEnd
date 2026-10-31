import { useState } from 'react';
import type { PacienteCriado } from '../service';

export function useCadastroCidadaoPage() {
  const [criado, setCriado] = useState<PacienteCriado | null>(null);
  function cadastrarOutro() { setCriado(null); }
  return { criado, setCriado, cadastrarOutro };
}
