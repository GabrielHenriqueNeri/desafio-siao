import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { TOKEN_KEY, USUARIO_KEY } from '../api/client';
import { authApi } from '../api/services';
import { Usuario } from '../api/types';

interface AuthContexto {
  usuario: Usuario | null;
  autenticado: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (dados: Record<string, unknown>) => Promise<void>;
  logout: () => void;
}

const Contexto = createContext<AuthContexto | null>(null);

function lerUsuarioSalvo(): Usuario | null {
  try {
    const bruto = localStorage.getItem(USUARIO_KEY);
    return bruto ? (JSON.parse(bruto) as Usuario) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(lerUsuarioSalvo);

  const guardarSessao = useCallback((token: string, dados: Usuario) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(dados));
    setUsuario(dados);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const resposta = await authApi.login(email, password);
      guardarSessao(resposta.access_token, resposta.usuario);
    },
    [guardarSessao],
  );

  const register = useCallback(
    async (dados: Record<string, unknown>) => {
      const resposta = await authApi.register(dados);
      guardarSessao(resposta.access_token, resposta.usuario);
    },
    [guardarSessao],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({
      usuario,
      autenticado: usuario !== null && localStorage.getItem(TOKEN_KEY) !== null,
      login,
      register,
      logout,
    }),
    [usuario, login, register, logout],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth(): AuthContexto {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return contexto;
}
