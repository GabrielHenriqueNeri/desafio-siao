import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function MarcaSiao({ tamanho = 30 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 48 48" aria-hidden="true">
      <rect x="4" y="4" width="40" height="40" rx="10" fill="#2E5AAC" />
      <path
        d="M15 30.5c1.8 2.4 4.6 3.8 8 3.8 4.4 0 7.5-2.2 7.5-5.6 0-3.1-2-4.6-6.3-5.6l-2.4-.6c-2.4-.6-3.4-1.4-3.4-2.9 0-1.8 1.7-3 4.2-3 2.4 0 4.3 1 5.6 2.8"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
          <MarcaSiao />
          <span>Sião</span>
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
