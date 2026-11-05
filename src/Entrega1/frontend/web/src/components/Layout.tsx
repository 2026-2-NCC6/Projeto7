import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { roleLabels } from '../content/labels';
import type { UserRole } from '../api/types';

interface NavItem {
  to: string;
  label: string;
  roles?: UserRole[];
  end?: boolean;
}

const NAV: { title: string; items: NavItem[] }[] = [
  {
    title: 'Treinar',
    items: [
      { to: '/', label: 'Catálogo de treinos', end: true },
      { to: '/historico', label: 'Meu histórico', roles: ['player', 'coach', 'admin'] },
      { to: '/perfil', label: 'Perfil do praticante', roles: ['player', 'coach', 'admin'] },
    ],
  },
  {
    title: 'Estúdio',
    items: [
      { to: '/estudio', label: 'Meus treinos', roles: ['coach', 'admin'], end: true },
      { to: '/estudio/novo', label: 'Criar treino', roles: ['coach', 'admin'] },
    ],
  },
  {
    title: 'Administração',
    items: [
      { to: '/admin', label: 'Visão geral', roles: ['admin'], end: true },
      { to: '/admin/revisao', label: 'Revisão de treinos', roles: ['admin'] },
      { to: '/admin/usuarios', label: 'Usuários e papéis', roles: ['admin'] },
      { to: '/admin/sessoes', label: 'Sessões', roles: ['admin'] },
      { to: '/admin/dispositivos', label: 'Dispositivos', roles: ['admin'] },
      { to: '/admin/auditoria', label: 'Auditoria', roles: ['admin'] },
    ],
  },
];

type Theme = 'system' | 'light' | 'dark';
const THEME_KEY = 'smash.theme';

function readTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    return 'system';
  }
}

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      return;
    }
  }, [theme]);

  const next: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' };
  return [theme, () => setTheme((current) => next[current])];
}

const THEME_LABEL: Record<Theme, string> = { system: 'Tema: sistema', light: 'Tema: claro', dark: 'Tema: escuro' };

function Brand() {
  return (
    <NavLink to="/" className="brand" aria-label="Smash, página inicial">
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
        <circle cx="16" cy="16" r="15" fill="var(--lime)" />
        <path d="M5 11c6 2 16 2 22 0M5 21c6-2 16-2 22 0" fill="none" stroke="var(--on-lime)" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span>Smash</span>
    </NavLink>
  );
}

export function Layout() {
  const { user, hasRole, signOut } = useAuth();
  const [theme, cycleTheme] = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const sections = NAV.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.roles || (user && hasRole(...item.roles))),
  })).filter((section) => section.items.length > 0);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="row topbar-group">
          <button
            type="button"
            className="btn btn-ghost menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            Menu
          </button>
          <Brand />
        </div>
        <div className="row topbar-group">
          <button type="button" className="btn btn-ghost btn-sm" onClick={cycleTheme} aria-label={THEME_LABEL[theme]}>
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor" />
            </svg>
            <span className="theme-name">{THEME_LABEL[theme]}</span>
          </button>
          {user ? (
            <div className="row user-box">
              <div className="stack-sm user-name">
                <strong className="small">{user.name}</strong>
                <span className="eyebrow">{roleLabels[user.role]}</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => void signOut().then(() => navigate('/'))}
              >
                Sair
              </button>
            </div>
          ) : (
            <NavLink to="/entrar" className="btn btn-primary btn-sm">
              Entrar
            </NavLink>
          )}
        </div>
      </header>

      <div className="body">
        <nav id="main-nav" className={`sidebar ${menuOpen ? 'open' : ''}`} aria-label="Navegação principal">
          {sections.map((section) => (
            <div key={section.title} className="stack-sm">
              <span className="eyebrow nav-title">{section.title}</span>
              {section.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className="nav-link">
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
          <div className="stack-sm">
            <span className="eyebrow nav-title">Integração</span>
            <a className="nav-link" href="/api/docs" target="_blank" rel="noreferrer">
              Documentação da API
            </a>
          </div>
        </nav>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
