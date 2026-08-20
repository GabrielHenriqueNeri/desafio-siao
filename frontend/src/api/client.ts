import axios from 'axios';

export const TOKEN_KEY = 'siao.token';
export const USUARIO_KEY = 'siao.usuario';

/**
 * Em desenvolvimento o Vite faz proxy de /api para http://localhost:3000.
 * Em produção (nginx do Docker) o /api também é proxy para o container da API.
 * VITE_API_URL permite apontar para outra origem se necessário.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token expirado/inválido → limpa a sessão e volta para o login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? '';
    if (status === 401 && !url.includes('/auth/')) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USUARIO_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

/** Converte o erro da API em mensagem amigável para exibir na interface. */
export function extrairErro(erro: unknown): string {
  if (axios.isAxiosError(erro)) {
    const resposta = erro.response;
    const mensagem = resposta?.data?.message;
    if (Array.isArray(mensagem)) return mensagem.join(' · ');
    if (typeof mensagem === 'string') return mensagem;

    // Sem resposta nenhuma: o navegador não alcançou o servidor
    if (erro.code === 'ERR_NETWORK' || !resposta) {
      return 'Não foi possível conectar à API — verifique se o backend está rodando';
    }
    // 5xx sem corpo JSON: em dev é tipicamente o proxy do Vite sem conseguir
    // falar com a porta 3000 (backend parado ou ainda subindo)
    if (resposta.status >= 500) {
      return `API indisponível (erro ${resposta.status}) — verifique se o backend e o banco de dados estão no ar (http://localhost:3000/api/health)`;
    }
    if (resposta.status === 401) {
      return 'Sessão expirada — entre novamente';
    }
  }
  return 'Erro inesperado — tente novamente';
}
