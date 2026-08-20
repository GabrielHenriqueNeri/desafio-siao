/** Envelope padrão de resposta paginada da API. */
export interface Paginated<T> {
  dados: T[];
  total: number;
  pagina: number;
  limite: number;
  total_paginas: number;
}

export function paginar<T>(
  dados: T[],
  total: number,
  pagina: number,
  limite: number,
): Paginated<T> {
  return {
    dados,
    total,
    pagina,
    limite,
    total_paginas: Math.max(1, Math.ceil(total / limite)),
  };
}
