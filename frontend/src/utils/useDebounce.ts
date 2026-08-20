import { useEffect, useState } from 'react';

/**
 * Devolve o valor apenas depois que ele fica estável pelo tempo informado.
 * Usado na busca das listagens: sem isso, cada tecla dispararia uma
 * requisição à API.
 */
export function useDebounce<T>(valor: T, atrasoMs = 400): T {
  const [estavel, setEstavel] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setEstavel(valor), atrasoMs);
    return () => clearTimeout(temporizador);
  }, [valor, atrasoMs]);

  return estavel;
}
