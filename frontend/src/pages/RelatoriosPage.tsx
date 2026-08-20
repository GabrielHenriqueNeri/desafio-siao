import { useEffect, useState } from 'react';
import { relatoriosApi } from '../api/services';
import {
  fmtBRL,
  LinhaAgrupada,
  LinhaPorCartorio,
  STATUS_IMOVEL,
  TIPOS_IMOVEL,
} from '../api/types';
import { Carregando, EstadoVazio } from '../components/ui';

function TabelaAgrupada({
  titulo,
  linhas,
  rotulos,
}: {
  titulo: string;
  linhas: LinhaAgrupada[];
  rotulos: Record<string, string>;
}) {
  const maior = Math.max(1, ...linhas.map((linha) => linha.total));
  return (
    <div className="painel">
      <div className="cabecalho">
        <h2>{titulo}</h2>
      </div>
      {linhas.length === 0 ? (
        <EstadoVazio mensagem="Sem dados para exibir." />
      ) : (
        <div style={{ padding: '10px 0' }}>
          {linhas.map((linha) => (
            <div className="linha-barra" key={linha.chave}>
              <span>{rotulos[linha.chave] ?? linha.chave}</span>
              <div className="trilho">
                <div
                  className="preenchido"
                  style={{ width: `${(linha.total / maior) * 100}%` }}
                />
              </div>
              <span className="qtd">
                {linha.total} · {fmtBRL.format(linha.valor_total_avaliado)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function RelatoriosPage() {
  const [porCartorio, setPorCartorio] = useState<LinhaPorCartorio[]>([]);
  const [porTipo, setPorTipo] = useState<LinhaAgrupada[]>([]);
  const [porStatus, setPorStatus] = useState<LinhaAgrupada[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([
      relatoriosApi.porCartorio(),
      relatoriosApi.porTipo(),
      relatoriosApi.porStatus(),
    ])
      .then(([cartorios, tipos, status]) => {
        setPorCartorio(cartorios);
        setPorTipo(tipos);
        setPorStatus(status);
      })
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <Carregando />;

  return (
    <>
      <div className="topo-pagina">
        <div>
          <h1>Relatórios</h1>
          <div className="sub">Consolidados do acervo por cartório, tipo e status</div>
        </div>
      </div>

      <div className="painel">
        <div className="cabecalho">
          <h2>Consolidado por cartório</h2>
        </div>
        <div className="rolagem">
          {porCartorio.length === 0 ? (
            <EstadoVazio mensagem="Nenhum cartório cadastrado." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Cartório</th>
                  <th>Imóveis registrados</th>
                  <th>Usuários vinculados</th>
                  <th>Valor total avaliado</th>
                </tr>
              </thead>
              <tbody>
                {porCartorio.map((linha) => (
                  <tr key={linha.cartorio_id}>
                    <td>
                      <span className="principal-cell">{linha.cartorio_nome}</span>
                    </td>
                    <td>{linha.total_imoveis}</td>
                    <td>{linha.total_usuarios}</td>
                    <td>{fmtBRL.format(linha.valor_total_avaliado)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <TabelaAgrupada titulo="Imóveis por tipo" linhas={porTipo} rotulos={TIPOS_IMOVEL} />
      <TabelaAgrupada titulo="Imóveis por status" linhas={porStatus} rotulos={STATUS_IMOVEL} />
    </>
  );
}
