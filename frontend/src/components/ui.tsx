import { ReactNode } from 'react';
import { Paginated } from '../api/types';

export function Modal({
  titulo,
  aberto,
  aoFechar,
  children,
  acoes,
  estreito,
}: {
  titulo: string;
  aberto: boolean;
  aoFechar: () => void;
  children: ReactNode;
  acoes?: ReactNode;
  estreito?: boolean;
}) {
  if (!aberto) return null;
  return (
    <div className="modal-fundo" onMouseDown={(e) => e.target === e.currentTarget && aoFechar()}>
      <div className={estreito ? 'modal estreito' : 'modal'}>
        <div className="modal-topo">
          <h2>{titulo}</h2>
          <button className="fechar-x" onClick={aoFechar} aria-label="Fechar">
            ×
          </button>
        </div>
        <div className="modal-corpo">{children}</div>
        {acoes && <div className="modal-acoes">{acoes}</div>}
      </div>
    </div>
  );
}

export function Campo({
  rotulo,
  children,
  larguraTotal,
}: {
  rotulo: string;
  children: ReactNode;
  larguraTotal?: boolean;
}) {
  return (
    <div className={larguraTotal ? 'campo largura-total' : 'campo'}>
      <label>{rotulo}</label>
      {children}
    </div>
  );
}

export function ErroForm({ mensagem }: { mensagem: string | null }) {
  if (!mensagem) return null;
  return <div className="erro-form">{mensagem}</div>;
}

export function Paginacao<T>({
  dados,
  aoMudar,
}: {
  dados: Paginated<T>;
  aoMudar: (pagina: number) => void;
}) {
  return (
    <div className="paginacao">
      <span>
        {dados.total} registro{dados.total === 1 ? '' : 's'} · página {dados.pagina} de{' '}
        {dados.total_paginas}
      </span>
      <div className="botoes">
        <button
          className="btn mini"
          disabled={dados.pagina <= 1}
          onClick={() => aoMudar(dados.pagina - 1)}
        >
          ‹ Anterior
        </button>
        <button
          className="btn mini"
          disabled={dados.pagina >= dados.total_paginas}
          onClick={() => aoMudar(dados.pagina + 1)}
        >
          Próxima ›
        </button>
      </div>
    </div>
  );
}

export function Carregando() {
  return <div className="carregando">Carregando…</div>;
}

/** Falha de carregamento com ação de recuperação — nunca deixar a tela em loading eterno. */
export function EstadoErro({
  mensagem,
  aoTentarNovamente,
}: {
  mensagem: string;
  aoTentarNovamente: () => void;
}) {
  return (
    <div className="estado-erro">
      <p>{mensagem}</p>
      <button className="btn" onClick={aoTentarNovamente}>
        Tentar novamente
      </button>
    </div>
  );
}

export function EstadoVazio({ mensagem }: { mensagem: string }) {
  return <div className="estado-vazio">{mensagem}</div>;
}

const BADGE_STATUS: Record<string, string> = {
  regular: 'ok',
  pendente: 'alerta',
  alienado: 'info',
  bloqueado: 'perigo',
  cancelado: 'perigo',
};

export function BadgeStatus({ status, rotulo }: { status: string; rotulo: string }) {
  return <span className={`badge ${BADGE_STATUS[status] ?? 'neutro'}`}>{rotulo}</span>;
}
