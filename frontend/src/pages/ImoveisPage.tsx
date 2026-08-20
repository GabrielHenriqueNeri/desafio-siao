import { FormEvent, useCallback, useEffect, useState } from 'react';
import { extrairErro } from '../api/client';
import { cartoriosApi, imoveisApi, relatoriosApi } from '../api/services';
import { baixarArquivo } from '../utils/baixarArquivo';
import { mascaraCep, mascaraCpf } from '../utils/mascaras';
import { useDebounce } from '../utils/useDebounce';
import {
  Cartorio,
  fmtBRL,
  fmtNum,
  Imovel,
  Paginated,
  STATUS_IMOVEL,
  TIPOS_IMOVEL,
} from '../api/types';
import {
  BadgeStatus,
  Campo,
  Carregando,
  ErroForm,
  EstadoErro,
  EstadoVazio,
  Modal,
  Paginacao,
} from '../components/ui';

const FORM_INICIAL = {
  matricula: '',
  tipo: 'casa',
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
  area_total: '',
  valor_avaliado: '',
  status: 'regular',
  proprietario_nome: '',
  proprietario_cpf: '',
  cartorio_id: '',
};

type FormImovel = typeof FORM_INICIAL;

export function ImoveisPage() {
  const [lista, setLista] = useState<Paginated<Imovel> | null>(null);
  const [cartorios, setCartorios] = useState<Cartorio[]>([]);
  const [busca, setBusca] = useState('');
  const buscaEstavel = useDebounce(busca);
  const [exportando, setExportando] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState<string | null>(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Imovel | null>(null);
  const [form, setForm] = useState<FormImovel>({ ...FORM_INICIAL });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [excluindo, setExcluindo] = useState<Imovel | null>(null);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  useEffect(() => {
    // Carrega opções do select de cartórios uma única vez;
    // se falhar, o erro visível fica por conta da listagem principal
    cartoriosApi
      .listar({ pagina: 1, limite: 100 })
      .then((r) => setCartorios(r.dados))
      .catch(() => setCartorios([]));
  }, []);

  const carregar = useCallback(() => {
    setCarregando(true);
    setErroLista(null);
    imoveisApi
      .listar({
        pagina,
        limite: 10,
        busca: buscaEstavel,
        tipo: filtroTipo || undefined,
        status: filtroStatus || undefined,
      })
      .then(setLista)
      .catch((excecao) => setErroLista(extrairErro(excecao)))
      .finally(() => setCarregando(false));
  }, [pagina, buscaEstavel, filtroTipo, filtroStatus]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const mudar = (campo: keyof FormImovel, valor: string) =>
    setForm((atual) => ({ ...atual, [campo]: valor }));

  function abrirCriar() {
    setEditando(null);
    setForm({ ...FORM_INICIAL, cartorio_id: cartorios[0] ? String(cartorios[0].id) : '' });
    setErro(null);
    setModalAberto(true);
  }

  function abrirEditar(imovel: Imovel) {
    setEditando(imovel);
    setForm({
      matricula: imovel.matricula,
      tipo: imovel.tipo,
      logradouro: imovel.logradouro,
      numero: String(imovel.numero),
      bairro: imovel.bairro,
      cidade: imovel.cidade,
      estado: imovel.estado,
      cep: imovel.cep,
      area_total: String(imovel.area_total),
      valor_avaliado: String(imovel.valor_avaliado),
      status: imovel.status,
      proprietario_nome: imovel.proprietario_nome,
      proprietario_cpf: imovel.proprietario_cpf,
      cartorio_id: String(imovel.cartorio_id),
    });
    setErro(null);
    setModalAberto(true);
  }

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSalvando(true);
    const payload = {
      ...form,
      numero: Number(form.numero),
      area_total: Number(form.area_total),
      valor_avaliado: Number(form.valor_avaliado),
      cartorio_id: Number(form.cartorio_id),
      estado: form.estado.toUpperCase(),
    };
    try {
      if (editando) {
        await imoveisApi.atualizar(editando.id, payload);
      } else {
        await imoveisApi.criar(payload);
      }
      setModalAberto(false);
      carregar();
    } catch (excecao) {
      setErro(extrairErro(excecao));
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarExclusao() {
    if (!excluindo) return;
    setErroExclusao(null);
    try {
      await imoveisApi.excluir(excluindo.id);
      setExcluindo(null);
      carregar();
    } catch (excecao) {
      setErroExclusao(extrairErro(excecao));
    }
  }

  async function exportarCsv() {
    setExportando(true);
    try {
      const csv = await relatoriosApi.exportarImoveisCsv();
      baixarArquivo(csv, 'imoveis.csv');
    } finally {
      setExportando(false);
    }
  }

  return (
    <>
      <div className="topo-pagina">
        <div>
          <h1>Imóveis</h1>
          <div className="sub">Registro de imóveis por cartório</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" onClick={exportarCsv} disabled={exportando}>
            {exportando ? 'Exportando…' : '⬇ Exportar CSV'}
          </button>
          <button className="btn principal" onClick={abrirCriar}>
            + Novo imóvel
          </button>
        </div>
      </div>

      <div className="painel">
        <div className="cabecalho">
          <h2>Lista de imóveis</h2>
          <div className="filtros">
            <input
              type="text"
              placeholder="Buscar matrícula, cidade ou proprietário…"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPagina(1);
              }}
              style={{ minWidth: 250 }}
            />
            <select
              value={filtroTipo}
              onChange={(e) => {
                setFiltroTipo(e.target.value);
                setPagina(1);
              }}
            >
              <option value="">Todos os tipos</option>
              {Object.entries(TIPOS_IMOVEL).map(([valor, rotulo]) => (
                <option key={valor} value={valor}>
                  {rotulo}
                </option>
              ))}
            </select>
            <select
              value={filtroStatus}
              onChange={(e) => {
                setFiltroStatus(e.target.value);
                setPagina(1);
              }}
            >
              <option value="">Todos os status</option>
              {Object.entries(STATUS_IMOVEL).map(([valor, rotulo]) => (
                <option key={valor} value={valor}>
                  {rotulo}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="rolagem">
          {erroLista ? (
            <div style={{ padding: 18 }}>
              <EstadoErro mensagem={erroLista} aoTentarNovamente={carregar} />
            </div>
          ) : carregando || !lista ? (
            <Carregando />
          ) : lista.dados.length === 0 ? (
            <EstadoVazio mensagem="Nenhum imóvel encontrado com esses filtros." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Matrícula / Cartório</th>
                  <th>Tipo</th>
                  <th>Endereço</th>
                  <th>Proprietário</th>
                  <th>Valor / Área</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.dados.map((imovel) => (
                  <tr key={imovel.id}>
                    <td>
                      <div className="principal-cell" style={{ whiteSpace: 'nowrap' }}>
                        {imovel.matricula}
                      </div>
                      <div className="secundaria-cell">{imovel.cartorio?.nome ?? '—'}</div>
                    </td>
                    <td>{TIPOS_IMOVEL[imovel.tipo] ?? imovel.tipo}</td>
                    <td>
                      <div>
                        {imovel.logradouro}, {imovel.numero}
                      </div>
                      <div className="secundaria-cell">
                        {imovel.bairro} · {imovel.cidade}/{imovel.estado}
                      </div>
                    </td>
                    <td>
                      <div>{imovel.proprietario_nome}</div>
                      <div className="secundaria-cell">{imovel.proprietario_cpf}</div>
                    </td>
                    <td className="nowrap">
                      <div>{fmtBRL.format(imovel.valor_avaliado)}</div>
                      <div className="secundaria-cell">{fmtNum.format(imovel.area_total)} m²</div>
                    </td>
                    <td>
                      <BadgeStatus
                        status={imovel.status}
                        rotulo={STATUS_IMOVEL[imovel.status] ?? imovel.status}
                      />
                    </td>
                    <td>
                      <div className="acoes-cell">
                        <button className="btn mini" onClick={() => abrirEditar(imovel)}>
                          Editar
                        </button>
                        <button
                          className="btn mini perigo"
                          onClick={() => {
                            setErroExclusao(null);
                            setExcluindo(imovel);
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!erroLista && lista && lista.dados.length > 0 && (
          <Paginacao dados={lista} aoMudar={setPagina} />
        )}
      </div>

      <Modal
        titulo={editando ? `Editar imóvel ${editando.matricula}` : 'Novo imóvel'}
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        acoes={
          <>
            <button className="btn" onClick={() => setModalAberto(false)}>
              Cancelar
            </button>
            <button className="btn principal" type="submit" form="form-imovel" disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </button>
          </>
        }
      >
        <form id="form-imovel" onSubmit={salvar}>
          <ErroForm mensagem={erro} />
          <div className="grade-form">
            <Campo rotulo="Matrícula">
              <input type="text" value={form.matricula} onChange={(e) => mudar('matricula', e.target.value)} required />
            </Campo>
            <Campo rotulo="Cartório">
              <select value={form.cartorio_id} onChange={(e) => mudar('cartorio_id', e.target.value)} required>
                <option value="" disabled>
                  Selecione…
                </option>
                {cartorios.map((cartorio) => (
                  <option key={cartorio.id} value={cartorio.id}>
                    {cartorio.nome}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Tipo">
              <select value={form.tipo} onChange={(e) => mudar('tipo', e.target.value)}>
                {Object.entries(TIPOS_IMOVEL).map(([valor, rotulo]) => (
                  <option key={valor} value={valor}>
                    {rotulo}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Status">
              <select value={form.status} onChange={(e) => mudar('status', e.target.value)}>
                {Object.entries(STATUS_IMOVEL).map(([valor, rotulo]) => (
                  <option key={valor} value={valor}>
                    {rotulo}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Logradouro">
              <input type="text" value={form.logradouro} onChange={(e) => mudar('logradouro', e.target.value)} required />
            </Campo>
            <Campo rotulo="Número">
              <input type="number" min={0} value={form.numero} onChange={(e) => mudar('numero', e.target.value)} required />
            </Campo>
            <Campo rotulo="Bairro">
              <input type="text" value={form.bairro} onChange={(e) => mudar('bairro', e.target.value)} required />
            </Campo>
            <Campo rotulo="Cidade">
              <input type="text" value={form.cidade} onChange={(e) => mudar('cidade', e.target.value)} required />
            </Campo>
            <Campo rotulo="Estado (UF)">
              <input type="text" value={form.estado} onChange={(e) => mudar('estado', e.target.value)} maxLength={2} placeholder="PE" required />
            </Campo>
            <Campo rotulo="CEP">
              <input type="text" value={form.cep} onChange={(e) => mudar('cep', mascaraCep(e.target.value))} placeholder="00000-000" required />
            </Campo>
            <Campo rotulo="Área total (m²)">
              <input type="number" min={0.01} step="0.01" value={form.area_total} onChange={(e) => mudar('area_total', e.target.value)} required />
            </Campo>
            <Campo rotulo="Valor avaliado (R$)">
              <input type="number" min={0} step="0.01" value={form.valor_avaliado} onChange={(e) => mudar('valor_avaliado', e.target.value)} required />
            </Campo>
            <Campo rotulo="Nome do proprietário">
              <input type="text" value={form.proprietario_nome} onChange={(e) => mudar('proprietario_nome', e.target.value)} required />
            </Campo>
            <Campo rotulo="CPF do proprietário">
              <input type="text" value={form.proprietario_cpf} onChange={(e) => mudar('proprietario_cpf', mascaraCpf(e.target.value))} placeholder="000.000.000-00" required />
            </Campo>
          </div>
        </form>
      </Modal>

      <Modal
        titulo="Excluir imóvel"
        aberto={excluindo !== null}
        aoFechar={() => setExcluindo(null)}
        estreito
        acoes={
          <>
            <button className="btn" onClick={() => setExcluindo(null)}>
              Cancelar
            </button>
            <button className="btn perigo" onClick={confirmarExclusao}>
              Excluir
            </button>
          </>
        }
      >
        <ErroForm mensagem={erroExclusao} />
        <p>
          Excluir o imóvel de matrícula <strong>{excluindo?.matricula}</strong>? A exclusão é
          lógica (soft delete) e o registro pode ser restaurado pela API.
        </p>
      </Modal>
    </>
  );
}
