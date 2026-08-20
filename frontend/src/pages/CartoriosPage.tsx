import { FormEvent, useCallback, useEffect, useState } from 'react';
import { extrairErro } from '../api/client';
import { cartoriosApi } from '../api/services';
import { mascaraCep, mascaraCnpj, mascaraCpf, mascaraTelefone } from '../utils/mascaras';
import { useDebounce } from '../utils/useDebounce';
import { Cartorio, Paginated } from '../api/types';
import {
  Campo,
  Carregando,
  ErroForm,
  EstadoErro,
  EstadoVazio,
  Modal,
  Paginacao,
} from '../components/ui';

const FORM_INICIAL = {
  nome: '',
  cnpj: '',
  telefone: '',
  email: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
  responsavel_nome: '',
  responsavel_cpf: '',
};

type FormCartorio = typeof FORM_INICIAL;

export function CartoriosPage() {
  const [lista, setLista] = useState<Paginated<Cartorio> | null>(null);
  const [busca, setBusca] = useState('');
  const buscaEstavel = useDebounce(busca);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState<string | null>(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Cartorio | null>(null);
  const [form, setForm] = useState<FormCartorio>({ ...FORM_INICIAL });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [excluindo, setExcluindo] = useState<Cartorio | null>(null);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  const carregar = useCallback(() => {
    setCarregando(true);
    setErroLista(null);
    cartoriosApi
      .listar({ pagina, limite: 10, busca: buscaEstavel })
      .then((resposta) => {
        // Se o último registro da página foi excluído, recua uma página em vez
        // de deixar uma lista vazia na tela
        if (resposta.dados.length === 0 && resposta.pagina > 1) {
          setPagina(resposta.pagina - 1);
          return;
        }
        setLista(resposta);
      })
      .catch((excecao) => setErroLista(extrairErro(excecao)))
      .finally(() => setCarregando(false));
  }, [pagina, buscaEstavel]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const mudar = (campo: keyof FormCartorio, valor: string) =>
    setForm((atual) => ({ ...atual, [campo]: valor }));

  function abrirCriar() {
    setEditando(null);
    setForm({ ...FORM_INICIAL });
    setErro(null);
    setModalAberto(true);
  }

  function abrirEditar(cartorio: Cartorio) {
    setEditando(cartorio);
    setForm({
      nome: cartorio.nome,
      cnpj: cartorio.cnpj,
      telefone: cartorio.telefone,
      email: cartorio.email,
      logradouro: cartorio.logradouro,
      numero: String(cartorio.numero),
      bairro: cartorio.bairro,
      cidade: cartorio.cidade,
      estado: cartorio.estado,
      cep: cartorio.cep,
      responsavel_nome: cartorio.responsavel_nome,
      responsavel_cpf: cartorio.responsavel_cpf,
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
      estado: form.estado.toUpperCase(),
    };
    try {
      if (editando) {
        await cartoriosApi.atualizar(editando.id, payload);
      } else {
        await cartoriosApi.criar(payload);
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
      await cartoriosApi.excluir(excluindo.id);
      setExcluindo(null);
      carregar();
    } catch (excecao) {
      setErroExclusao(extrairErro(excecao));
    }
  }

  return (
    <>
      <div className="topo-pagina">
        <div>
          <h1>Cartórios</h1>
          <div className="sub">Cadastro dos cartórios que registram usuários e imóveis</div>
        </div>
        <button className="btn principal" onClick={abrirCriar}>
          + Novo cartório
        </button>
      </div>

      <div className="painel">
        <div className="cabecalho">
          <h2>Lista de cartórios</h2>
          <div className="filtros">
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ ou cidade…"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPagina(1);
              }}
              style={{ minWidth: 260 }}
            />
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
            <EstadoVazio mensagem="Nenhum cartório encontrado." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Cartório</th>
                  <th>CNPJ</th>
                  <th>Cidade</th>
                  <th>Responsável</th>
                  <th>Contato</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.dados.map((cartorio) => (
                  <tr key={cartorio.id}>
                    <td>
                      <div className="principal-cell">{cartorio.nome}</div>
                      <div className="secundaria-cell">
                        {cartorio.logradouro}, {cartorio.numero} · {cartorio.bairro}
                      </div>
                    </td>
                    <td>{cartorio.cnpj}</td>
                    <td>
                      {cartorio.cidade}/{cartorio.estado}
                    </td>
                    <td>
                      <div>{cartorio.responsavel_nome}</div>
                      <div className="secundaria-cell">{cartorio.responsavel_cpf}</div>
                    </td>
                    <td>
                      <div>{cartorio.telefone}</div>
                      <div className="secundaria-cell">{cartorio.email}</div>
                    </td>
                    <td>
                      <div className="acoes-cell">
                        <button className="btn mini" onClick={() => abrirEditar(cartorio)}>
                          Editar
                        </button>
                        <button
                          className="btn mini perigo"
                          onClick={() => {
                            setErroExclusao(null);
                            setExcluindo(cartorio);
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
        titulo={editando ? `Editar cartório #${editando.id}` : 'Novo cartório'}
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        acoes={
          <>
            <button className="btn" onClick={() => setModalAberto(false)}>
              Cancelar
            </button>
            <button className="btn principal" type="submit" form="form-cartorio" disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </button>
          </>
        }
      >
        <form id="form-cartorio" onSubmit={salvar}>
          <ErroForm mensagem={erro} />
          <div className="grade-form">
            <Campo rotulo="Nome do cartório" larguraTotal>
              <input type="text" value={form.nome} onChange={(e) => mudar('nome', e.target.value)} required />
            </Campo>
            <Campo rotulo="CNPJ">
              <input type="text" value={form.cnpj} onChange={(e) => mudar('cnpj', mascaraCnpj(e.target.value))} placeholder="00.000.000/0000-00" required />
            </Campo>
            <Campo rotulo="Telefone">
              <input type="text" value={form.telefone} onChange={(e) => mudar('telefone', mascaraTelefone(e.target.value))} placeholder="(81) 90000-0000" required />
            </Campo>
            <Campo rotulo="E-mail" larguraTotal>
              <input type="email" value={form.email} onChange={(e) => mudar('email', e.target.value)} required />
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
            <Campo rotulo="Nome do responsável">
              <input type="text" value={form.responsavel_nome} onChange={(e) => mudar('responsavel_nome', e.target.value)} required />
            </Campo>
            <Campo rotulo="CPF do responsável">
              <input type="text" value={form.responsavel_cpf} onChange={(e) => mudar('responsavel_cpf', mascaraCpf(e.target.value))} placeholder="000.000.000-00" required />
            </Campo>
          </div>
        </form>
      </Modal>

      <Modal
        titulo="Excluir cartório"
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
          Excluir o cartório <strong>{excluindo?.nome}</strong>? A exclusão é lógica (soft
          delete) e será bloqueada se houver usuários ou imóveis vinculados.
        </p>
      </Modal>
    </>
  );
}
