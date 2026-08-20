import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { extrairErro } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { MarcaSiao } from '../components/Layout';
import { Campo, ErroForm } from '../components/ui';

const REGISTRO_INICIAL = {
  nome: '',
  cpf: '',
  email: '',
  password: '',
  telefone: '',
  endereco: '',
  cidade: '',
  estado: '',
  cep: '',
};

export function LoginPage() {
  const { login, register } = useAuth();
  const navegar = useNavigate();

  const [modo, setModo] = useState<'login' | 'registro'>('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [registro, setRegistro] = useState({ ...REGISTRO_INICIAL });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const mudarRegistro = (campo: string, valor: string) =>
    setRegistro((atual) => ({ ...atual, [campo]: valor }));

  async function aoEnviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      if (modo === 'login') {
        await login(email, senha);
      } else {
        await register({ ...registro, estado: registro.estado.toUpperCase() });
      }
      navegar('/');
    } catch (excecao) {
      setErro(extrairErro(excecao));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pagina-login">
      <div className={modo === 'registro' ? 'caixa-login larga' : 'caixa-login'}>
        <div className="marca-login">
          <MarcaSiao tamanho={36} />
          <span>Sião · Cartórios e Imóveis</span>
        </div>
        <p className="descricao">
          {modo === 'login'
            ? 'Entre com seu e-mail e senha para acessar o sistema.'
            : 'Preencha seus dados para criar a conta de acesso.'}
        </p>

        <form onSubmit={aoEnviar}>
          <ErroForm mensagem={erro} />

          {modo === 'login' ? (
            <>
              <Campo rotulo="E-mail">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com.br"
                  required
                  autoFocus
                />
              </Campo>
              <Campo rotulo="Senha">
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                  required
                  minLength={8}
                />
              </Campo>
            </>
          ) : (
            <div className="grade-form">
              <Campo rotulo="Nome completo" larguraTotal>
                <input
                  type="text"
                  value={registro.nome}
                  onChange={(e) => mudarRegistro('nome', e.target.value)}
                  required
                  autoFocus
                />
              </Campo>
              <Campo rotulo="CPF">
                <input
                  type="text"
                  value={registro.cpf}
                  onChange={(e) => mudarRegistro('cpf', e.target.value)}
                  placeholder="000.000.000-00"
                  required
                />
              </Campo>
              <Campo rotulo="Telefone">
                <input
                  type="text"
                  value={registro.telefone}
                  onChange={(e) => mudarRegistro('telefone', e.target.value)}
                  placeholder="(81) 90000-0000"
                  required
                />
              </Campo>
              <Campo rotulo="E-mail">
                <input
                  type="email"
                  value={registro.email}
                  onChange={(e) => mudarRegistro('email', e.target.value)}
                  required
                />
              </Campo>
              <Campo rotulo="Senha (mín. 8, letras e números)">
                <input
                  type="password"
                  value={registro.password}
                  onChange={(e) => mudarRegistro('password', e.target.value)}
                  required
                  minLength={8}
                />
              </Campo>
              <Campo rotulo="Endereço" larguraTotal>
                <input
                  type="text"
                  value={registro.endereco}
                  onChange={(e) => mudarRegistro('endereco', e.target.value)}
                  placeholder="Rua, número, complemento"
                  required
                />
              </Campo>
              <Campo rotulo="Cidade">
                <input
                  type="text"
                  value={registro.cidade}
                  onChange={(e) => mudarRegistro('cidade', e.target.value)}
                  required
                />
              </Campo>
              <Campo rotulo="Estado (UF)">
                <input
                  type="text"
                  value={registro.estado}
                  onChange={(e) => mudarRegistro('estado', e.target.value)}
                  placeholder="PE"
                  maxLength={2}
                  required
                />
              </Campo>
              <Campo rotulo="CEP">
                <input
                  type="text"
                  value={registro.cep}
                  onChange={(e) => mudarRegistro('cep', e.target.value)}
                  placeholder="00000-000"
                  required
                />
              </Campo>
            </div>
          )}

          <button className="btn principal" type="submit" disabled={enviando}>
            {enviando ? 'Enviando…' : modo === 'login' ? 'Entrar' : 'Criar conta e entrar'}
          </button>
        </form>

        <div className="alternar-login">
          {modo === 'login' ? (
            <>
              Não tem conta?{' '}
              <button onClick={() => { setModo('registro'); setErro(null); }}>
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem conta?{' '}
              <button onClick={() => { setModo('login'); setErro(null); }}>
                Fazer login
              </button>
            </>
          )}
        </div>

        {modo === 'login' && (
          <div className="dica-login">
            Acesso de demonstração: <strong>admin@siao.com.br</strong> · senha{' '}
            <strong>Admin@123</strong>
          </div>
        )}
      </div>
    </div>
  );
}
