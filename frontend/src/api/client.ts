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

/** Converte o erro da API em mensagem amigável para exibir no formulário. */
export function extrairErro(erro: unknown): string {
  if (axios.isAxiosError(erro)) {
    const mensagem = erro.response?.data?.message;
    if (Array.isArray(mensagem)) return mensagem.join(' · ');
    if (typeof mensagem === 'string') return mensagem;
    if (erro.code === 'ERR_NETWORK') return 'API fora do ar — verifique o backend';
  }
  return 'Erro inesperado — tente novamente';
}
