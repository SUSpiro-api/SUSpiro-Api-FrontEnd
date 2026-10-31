export interface CepEndereco {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

/** Consulta a base pública dos Correios operada pelo ViaCEP para validar e completar o endereço. */
export async function consultarCep(value: string, signal?: AbortSignal): Promise<CepEndereco | null> {
  const cep = value.replace(/\D/g, '');
  if (!/^\d{8}$/.test(cep)) return null;

  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) throw new Error('Não foi possível consultar o CEP.');
  const data = await response.json() as ViaCepResponse;
  if (data.erro || !data.cep || !data.uf || !data.localidade) return null;

  return {
    cep: data.cep.replace(/\D/g, ''),
    logradouro: data.logradouro?.trim() ?? '',
    bairro: data.bairro?.trim() ?? '',
    cidade: data.localidade.trim(),
    estado: data.uf.trim().toUpperCase(),
  };
}
