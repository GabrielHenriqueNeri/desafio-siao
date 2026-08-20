import { api } from './client';
import {
  Cartorio,
  Imovel,
  LinhaAgrupada,
  LinhaPorCartorio,
  LoginResponse,
  Paginated,
  ResumoGeral,
  Usuario,
} from './types';

export interface ListaParams {
  pagina?: number;
  limite?: number;
  busca?: string;
  tipo?: string;
  status?: string;
  cartorio_id?: number;
}

/** Remove chaves vazias para não sujar a query string. */
function limpar(params: ListaParams): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, valor]) => valor !== undefined && valor !== null && valor !== '',
    ),
  );
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }).then((r) => r.data),
  register: (dados: Record<string, unknown>) =>
    api.post<LoginResponse>('/auth/register', dados).then((r) => r.data),
  perfil: () => api.get<Usuario>('/auth/perfil').then((r) => r.data),
};

export const cartoriosApi = {
  listar: (params: ListaParams) =>
    api.get<Paginated<Cartorio>>('/cartorios', { params: limpar(params) }).then((r) => r.data),
  criar: (dados: Record<string, unknown>) =>
    api.post<Cartorio>('/cartorios', dados).then((r) => r.data),
  atualizar: (id: number, dados: Record<string, unknown>) =>
    api.patch<Cartorio>(`/cartorios/${id}`, dados).then((r) => r.data),
  excluir: (id: number) => api.delete(`/cartorios/${id}`),
};

export const usuariosApi = {
  listar: (params: ListaParams) =>
    api.get<Paginated<Usuario>>('/usuarios', { params: limpar(params) }).then((r) => r.data),
  criar: (dados: Record<string, unknown>) =>
    api.post<Usuario>('/usuarios', dados).then((r) => r.data),
  atualizar: (id: number, dados: Record<string, unknown>) =>
    api.patch<Usuario>(`/usuarios/${id}`, dados).then((r) => r.data),
  excluir: (id: number) => api.delete(`/usuarios/${id}`),
};

export const imoveisApi = {
  listar: (params: ListaParams) =>
    api.get<Paginated<Imovel>>('/imoveis', { params: limpar(params) }).then((r) => r.data),
  criar: (dados: Record<string, unknown>) =>
    api.post<Imovel>('/imoveis', dados).then((r) => r.data),
  atualizar: (id: number, dados: Record<string, unknown>) =>
    api.patch<Imovel>(`/imoveis/${id}`, dados).then((r) => r.data),
  excluir: (id: number) => api.delete(`/imoveis/${id}`),
};

export const relatoriosApi = {
  resumo: () => api.get<ResumoGeral>('/relatorios/resumo').then((r) => r.data),
  exportarImoveisCsv: () =>
    api
      .get<Blob>('/relatorios/exportar/imoveis', { responseType: 'blob' })
      .then((r) => r.data),
  porCartorio: () =>
    api.get<LinhaPorCartorio[]>('/relatorios/imoveis-por-cartorio').then((r) => r.data),
  porTipo: () => api.get<LinhaAgrupada[]>('/relatorios/imoveis-por-tipo').then((r) => r.data),
  porStatus: () =>
    api.get<LinhaAgrupada[]>('/relatorios/imoveis-por-status').then((r) => r.data),
};
