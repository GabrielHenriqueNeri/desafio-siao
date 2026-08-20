import { useEffect, useState } from 'react';
import { imoveisApi, relatoriosApi } from '../api/services';
import {
  fmtBRL,
  fmtNum,
  Imovel,
  LinhaAgrupada,
  ResumoGeral,
  STATUS_IMOVEL,
  TIPOS_IMOVEL,
} from '../api/types';
import { BadgeStatus, Carregando, EstadoVazio } from '../components/ui';

export function DashboardPage() {
  const [resumo, setResumo] = useState<ResumoGeral | null>(null);
  const [porTipo, setPorTipo] = useState<LinhaAgrupada[]>([]);
  const [recentes, setRecentes] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([
      relatoriosApi.resumo(),
      relatoriosApi.porTipo(),
      imoveisApi.listar({ pagina: 1, limite: 5 }),
    ])
      .then(([resumoApi, tipos, imoveis]) => {
        setResumo(resumoApi);
        setPorTipo(tipos);
        setRecentes(imoveis.dados);
      })
      .finally(() => setCarregando(false));
  }, []);

  if (carregando || !resumo) return <Carregando />;

  const maiorTotal = Math.max(1, ...porTipo.map((linha) => linha.total));

  return (
    <>
      <div className="topo-pagina">
        <div>
          <h1>Dashboard</h1>
          <div className="sub">Visão geral do acervo registrado</div>
        </div>
      </div>

      <div className="cartoes">
        <div className="cartao destaque">
          <div className="rotulo">Cartórios</div>
          <div className="valor">{fmtNum.format(resumo.total_cartorios)}</div>
        </div>
        <div className="cartao destaque">
          <div className="rotulo">Imóveis</div>
          <div className="valor">{fmtNum.format(resumo.total_imoveis)}</div>
        </div>
        <div className="cartao destaque">
          <div className="rotulo">Usuários</div>
          <div className="valor">{fmtNum.format(resumo.total_usuarios)}</div>
        </div>
        <div className="cartao destaque">
          <div className="rotulo">Valor avaliado</div>
          <div className="valor">{fmtBRL.format(resumo.valor_total_avaliado)}</div>
        </div>
        <div className="cartao destaque">
          <div className="rotulo">Área registrada</div>
          <div className="valor">{fmtNum.format(resumo.area_total_registrada)} m²</div>
        </div>
      </div>

      <div className="painel">
        <div className="cabecalho">
          <h2>Imóveis por tipo</h2>
        </div>
        {porTipo.length === 0 ? (
          <EstadoVazio mensagem="Nenhum imóvel cadastrado ainda." />
        ) : (
          <div style={{ padding: '10px 0' }}>
            {porTipo.map((linha) => (
              <div className="linha-barra" key={linha.chave}>
                <span>{TIPOS_IMOVEL[linha.chave] ?? linha.chave}</span>
                <div className="trilho">
                  <div
                    className="preenchido"
                    style={{ width: `${(linha.total / maiorTotal) * 100}%` }}
                  />
                </div>
                <span className="qtd">
                  {linha.total} imóve{linha.total === 1 ? 'l' : 'is'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="painel">
        <div className="cabecalho">
          <h2>Últimos imóveis cadastrados</h2>
        </div>
        <div className="rolagem">
          {recentes.length === 0 ? (
            <EstadoVazio mensagem="Nenhum imóvel cadastrado ainda." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Tipo</th>
                  <th>Cidade</th>
                  <th>Valor avaliado</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentes.map((imovel) => (
                  <tr key={imovel.id}>
                    <td>
                      <span className="principal-cell">{imovel.matricula}</span>
                    </td>
                    <td>{TIPOS_IMOVEL[imovel.tipo] ?? imovel.tipo}</td>
                    <td>
                      {imovel.cidade}/{imovel.estado}
                    </td>
                    <td>{fmtBRL.format(imovel.valor_avaliado)}</td>
                    <td>
                      <BadgeStatus
                        status={imovel.status}
                        rotulo={STATUS_IMOVEL[imovel.status] ?? imovel.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
