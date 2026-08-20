import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { Layout } from './components/Layout';
import { CartoriosPage } from './pages/CartoriosPage';
import { DashboardPage } from './pages/DashboardPage';
import { ImoveisPage } from './pages/ImoveisPage';
import { LoginPage } from './pages/LoginPage';
import { RelatoriosPage } from './pages/RelatoriosPage';
import { UsuariosPage } from './pages/UsuariosPage';

export default function App() {
  const { autenticado } = useAuth();

  if (!autenticado) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/cartorios" element={<CartoriosPage />} />
        <Route path="/imoveis" element={<ImoveisPage />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
        <Route path="/relatorios" element={<RelatoriosPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
