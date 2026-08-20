import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { LogoSiao } from './LogoSiao';

const LINKS = [
  { para: '/', rotulo: 'Dashboard', fim: true },
  { para: '/cartorios', rotulo: 'Cartórios' },
  { para: '/imoveis', rotulo: 'Imóveis' },
  { para: '/usuarios', rotulo: 'Usuários' },
  { para: '/relatorios', rotulo: 'Relatórios' },
];

export function Layout() {
  const { usuario, logout } = useAuth();

  return (
    <div className="app">
      <aside className="lateral">
        <div className="marca">
          <LogoSiao largura={104} corPalavra="#FFFFFF" />
        </div>
        <nav>
          {LINKS.map((link) => (
            <NavLink
              key={link.para}
              to={link.para}
              end={link.fim}
              className={({ isActive }) => (isActive ? 'ativo' : undefined)}
            >
              {link.rotulo}
            </NavLink>
          ))}
        </nav>
        <div className="rodape-lateral">
          Gestão de cartórios e imóveis
          <br />
          Desafio técnico · 2026
        </div>
      </aside>
      <div>
        <main className="conteudo">
          <div className="topo-pagina" style={{ marginBottom: 0 }}>
            <div />
            <div className="sessao-usuario">
              <span>
                Olá, <strong>{usuario?.nome?.split(' ')[0]}</strong>
              </span>
              <button className="btn mini" onClick={logout}>
                Sair
              </button>
            </div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
