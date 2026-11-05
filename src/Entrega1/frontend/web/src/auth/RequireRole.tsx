import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { UserRole } from '../api/types';
import { EmptyState } from '../components/ui';
import { useAuth } from './AuthContext';

export function RequireRole({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
  const { user, hasRole } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/entrar" replace state={{ from: location.pathname }} />;
  }

  if (!hasRole(...roles)) {
    return (
      <div className="card">
        <EmptyState title="Esta área não está disponível para o seu papel.">
          Peça a um administrador para mudar o papel da sua conta.
        </EmptyState>
      </div>
    );
  }

  return <>{children}</>;
}
