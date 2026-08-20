import { FormEvent, useCallback, useEffect, useState } from 'react';
import { extrairErro } from '../api/client';
import { cartoriosApi, usuariosApi } from '../api/services';
import { mascaraCep, mascaraCpf, mascaraTelefone } from '../utils/mascaras';
import { useDebounce } from '../utils/useDebounce';
import { Cartorio, Paginated, Usuario } from '../api/types';
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
  cpf: '',
  email: '',
  password: '',
  telefone: '',
  endereco: '',
  cidade: '',
  estado: '',
  cep: '',
  cartorio_id: '',
};

type FormUsuario = typeof FORM_INICIAL;

export function UsuariosPage() {
  const [lista, setLista] = useState<Paginated<Usuario> | null>(null);
  const [cartorios, setCartorios] = useState<Cartorio[]>([]);
  const [busca, setBusca] = useState('');
  const buscaEstavel = useDebounce(busca);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState<string | null>(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState<FormUsuario>({ ...FORM_INICIAL });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [excluindo, setExcluindo] = useState<Usuario | null>(null);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  useEffect(() => {
    cartoriosApi
      .listar({ pagina: 1, limite: 100 })
      .then((r) => setCartorios(r.dados))
      .catch(() => setCartorios([]));
  }, []);

  const carregar = useCallback(() => {
    setCarregando(true);
    setErroLista(null);
    usuariosApi
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

  const mudar = (campo: keyof FormUsuario, valor: string) =>
    setForm((atual) => ({ ...atual, [campo]: valor }));

  function abrirCriar() {
    setEditando(null);
    setForm({ ...FORM_INICIAL });
    setErro(null);
    setModalAberto(true);
  }

  function abrirEditar(usuario: Usuario) {
    setEditando(usuario);
    setForm({
      nome: usuario.nome,
      cpf: usuario.cpf,
      email: usuario.email,
      password: '',
      telefone: usuario.telefone,
      endereco: usuario.endereco,
      cidade: usuario.cidade,
      estado: usuario.estado,
      cep: usuario.cep,
      cartorio_id: usuario.cartorio_id ? String(usuario.cartorio_id) : '',
    });
    setErro(null);
    setModalAberto(true);
  }

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSalvando(true);

    const payload: Record<string, unknown> = {
      ...form,
      estado: form.estado.toUpperCase(),
      // "Sem vínculo" precisa virar null explícito — omitir o campo faria a API
      // manter o cartório atual, impossibilitando desvincular
      cartorio_id: form.cartorio_id ? Number(form.cartorio_id) : null,
    };
    // Na edição, senha em branco significa "não alterar"
    if (editando && !form.password) {
      delete payload.password;
    }

    try {
      if (editando) {
        await usuariosApi.atualizar(editando.id, payload);
      } else {
        await usuariosApi.criar(payload);
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
      await usuariosApi.excluir(excluindo.id);
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
          <h1>Usuários</h1>
          <div className="sub">Contas de acesso vinculadas aos cartórios</div>
        </div>
        <button className="btn principal" onClick={abrirCriar}>
          + Novo usuário
        </button>
      </div>

      <div className="painel">
        <div className="cabecalho">
          <h2>Lista de usuários</h2>
          <div className="filtros">
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou CPF…"
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
            <EstadoVazio mensagem="Nenhum usuário encontrado." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>CPF</th>
                  <th>Contato</th>
                  <th>Cidade</th>
                  <th>Cartório</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.dados.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>
                      <div className="principal-cell">{usuario.nome}</div>
                      <div className="secundaria-cell">{usuario.email}</div>
                    </td>
                    <td>{usuario.cpf}</td>
                    <td>{usuario.telefone}</td>
                    <td>
                      {usuario.cidade}/{usuario.estado}
                    </td>
                    <td>
                      <span className="secundaria-cell">
                        {usuario.cartorio?.nome ?? 'Sem vínculo'}
                      </span>
                    </td>
                    <td>
                      <div className="acoes-cell">
                        <button className="btn mini" onClick={() => abrirEditar(usuario)}>
                          Editar
                        </button>
                        <button
                          className="btn mini perigo"
                          onClick={() => {
                            setErroExclusao(null);
                            setExcluindo(usuario);
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
        titulo={editando ? `Editar usuário #${editando.id}` : 'Novo usuário'}
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        acoes={
          <>
            <button className="btn" onClick={() => setModalAberto(false)}>
              Cancelar
            </button>
            <button className="btn principal" type="submit" form="form-usuario" disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </button>
          </>
        }
      >
        <form id="form-usuario" onSubmit={salvar}>
          <ErroForm mensagem={erro} />
          <div className="grade-form">
            <Campo rotulo="Nome completo" larguraTotal>
              <input type="text" value={form.nome} onChange={(e) => mudar('nome', e.target.value)} required />
            </Campo>
            <Campo rotulo="CPF">
              <input type="text" value={form.cpf} onChange={(e) => mudar('cpf', mascaraCpf(e.target.value))} placeholder="000.000.000-00" required />
            </Campo>
            <Campo rotulo="E-mail">
              <input type="email" value={form.email} onChange={(e) => mudar('email', e.target.value)} required />
            </Campo>
            <Campo rotulo={editando ? 'Nova senha (deixe em branco para manter)' : 'Senha (mín. 8, letras e números)'}>
              <input
                type="password"
                value={form.password}
                onChange={(e) => mudar('password', e.target.value)}
                minLength={8}
                required={!editando}
              />
            </Campo>
            <Campo rotulo="Telefone">
              <input type="text" value={form.telefone} onChange={(e) => mudar('telefone', mascaraTelefone(e.target.value))} placeholder="(81) 90000-0000" required />
            </Campo>
            <Campo rotulo="Endereço" larguraTotal>
              <input type="text" value={form.endereco} onChange={(e) => mudar('endereco', e.target.value)} required />
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
            <Campo rotulo="Cartório (opcional)">
              <select value={form.cartorio_id} onChange={(e) => mudar('cartorio_id', e.target.value)}>
                <option value="">Sem vínculo</option>
                {cartorios.map((cartorio) => (
                  <option key={cartorio.id} value={cartorio.id}>
                    {cartorio.nome}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
        </form>
      </Modal>

      <Modal
        titulo="Excluir usuário"
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
          Excluir o usuário <strong>{excluindo?.nome}</strong>? A exclusão é lógica (soft
          delete) e a conta perde o acesso ao sistema.
        </p>
      </Modal>
    </>
  );
}
