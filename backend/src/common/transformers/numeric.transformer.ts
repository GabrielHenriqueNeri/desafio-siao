import { ValueTransformer } from 'typeorm';

/**
 * O driver `pg` devolve colunas NUMERIC como string (para não perder precisão).
 * Para os valores deste domínio (área e avaliação em 2 casas), converter para
 * number no JSON é seguro e mais ergonômico para o consumidor da API.
 */
export class NumericTransformer implements ValueTransformer {
  to(valor?: number | null): number | null | undefined {
    return valor;
  }

  from(valor?: string | null): number | null {
    if (valor === null || valor === undefined) return null;
    return parseFloat(valor);
  }
}
