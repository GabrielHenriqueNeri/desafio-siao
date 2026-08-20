export interface Cartorio {
  id: number;
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  logradouro: string;
  numero: number;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  responsavel_id: number | null;
  responsavel_nome: string;
  responsavel_cpf: string;
  created_at: string;
  updated_at: string;
}

export interface Usuario {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  cartorio_id: number | null;
  cartorio?: Cartorio | null;
  created_at: string;
  updated_at: string;
}

export interface Imovel {
  id: number;
  matricula: string;
  tipo: string;
  logradouro: string;
  numero: number;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  area_total: number;
  valor_avaliado: number;
  status: string;
  proprietario_id: number | null;
  proprietario_nome: string;
  proprietario_cpf: string;
  cartorio_id: number;
  cartorio?: Cartorio;
  created_at: string;
  updated_at: string;
}

export interface Paginated<T> {
  dados: T[];
  total: number;
  pagina: number;
  limite: number;
  total_paginas: number;
}

export interface LoginResponse {
  access_token: string;
  usuario: Usuario;
}

export interface ResumoGeral {
  total_cartorios: number;
  total_usuarios: number;
  total_imoveis: number;
  valor_total_avaliado: number;
  area_total_registrada: number;
}

export interface LinhaPorCartorio {
  cartorio_id: number;
  cartorio_nome: string;
  total_imoveis: number;
  valor_total_avaliado: number;
  total_usuarios: number;
}

export interface LinhaAgrupada {
  chave: string;
  total: number;
  valor_total_avaliado: number;
}

export const TIPOS_IMOVEL: Record<string, string> = {
  casa: 'Casa',
  apartamento: 'Apartamento',
  terreno: 'Terreno',
  sala_comercial: 'Sala comercial',
  galpao: 'Galpão',
  rural: 'Rural',
  outro: 'Outro',
};

export const STATUS_IMOVEL: Record<string, string> = {
  regular: 'Regular',
  pendente: 'Pendente',
  alienado: 'Alienado',
  bloqueado: 'Bloqueado',
  cancelado: 'Cancelado',
};

export const fmtBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export const fmtNum = new Intl.NumberFormat('pt-BR');
