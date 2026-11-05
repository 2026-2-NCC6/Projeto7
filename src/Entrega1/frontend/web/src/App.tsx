import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireRole } from './auth/RequireRole';
import { Layout } from './components/Layout';
import { EmptyState } from './components/ui';
import {
  AdminAuditPage,
  AdminDevicesPage,
  AdminOverviewPage,
  AdminSessionsPage,
  AdminUsersPage,
} from './pages/admin/AdminPages';
import { SignInPage, SignUpPage } from './pages/AuthPages';
import { CatalogPage } from './pages/CatalogPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { SessionDetailPage } from './pages/SessionDetailPage';
import { StudioListPage } from './pages/studio/StudioListPage';
import { TrainingAnalyticsPage } from './pages/studio/TrainingAnalyticsPage';
import { TrainingEditorPage } from './pages/studio/TrainingEditorPage';
import { TrainingPage } from './pages/TrainingPage';

const ANY = ['player', 'coach', 'admin'] as const;
const AUTHORS = ['coach', 'admin'] as const;
const ADMINS = ['admin'] as const;

function NotFound() {
  return (
    <div className="card">
      <EmptyState title="Página não encontrada.">
        <Link to="/">Voltar ao catálogo</Link>
      </EmptyState>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<CatalogPage />} />
            <Route path="treinos/:id" element={<TrainingPage />} />
            <Route path="entrar" element={<SignInPage />} />
            <Route path="cadastro" element={<SignUpPage />} />
            <Route path="historico" element={<RequireRole roles={[...ANY]}><HistoryPage /></RequireRole>} />
            <Route path="perfil" element={<RequireRole roles={[...ANY]}><ProfilePage /></RequireRole>} />
            <Route path="sessoes/:id" element={<RequireRole roles={[...ANY]}><SessionDetailPage /></RequireRole>} />
            <Route path="estudio" element={<RequireRole roles={[...AUTHORS]}><StudioListPage /></RequireRole>} />
            <Route path="estudio/novo" element={<RequireRole roles={[...AUTHORS]}><TrainingEditorPage /></RequireRole>} />
            <Route path="estudio/:id" element={<RequireRole roles={[...AUTHORS]}><TrainingEditorPage /></RequireRole>} />
            <Route path="estudio/:id/analise" element={<RequireRole roles={[...AUTHORS]}><TrainingAnalyticsPage /></RequireRole>} />
            <Route path="admin" element={<RequireRole roles={[...ADMINS]}><AdminOverviewPage /></RequireRole>} />
            <Route path="admin/revisao" element={<RequireRole roles={[...ADMINS]}><StudioListPage reviewQueue /></RequireRole>} />
            <Route path="admin/usuarios" element={<RequireRole roles={[...ADMINS]}><AdminUsersPage /></RequireRole>} />
            <Route path="admin/sessoes" element={<RequireRole roles={[...ADMINS]}><AdminSessionsPage /></RequireRole>} />
            <Route path="admin/dispositivos" element={<RequireRole roles={[...ADMINS]}><AdminDevicesPage /></RequireRole>} />
            <Route path="admin/auditoria" element={<RequireRole roles={[...ADMINS]}><AdminAuditPage /></RequireRole>} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
