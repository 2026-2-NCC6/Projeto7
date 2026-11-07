import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import type { AuthUser } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { ErrorMessage } from '../components/ui';

function homeOf(user: AuthUser): string {
  if (user.role === 'admin') {
    return '/admin';
  }
  return user.role === 'coach' ? '/estudio' : '/historico';
}

function useAfterAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  return (user: AuthUser) => navigate(from ?? homeOf(user), { replace: true });
}

export function SignInPage() {
  const { user, signIn } = useAuth();
  const done = useAfterAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to={homeOf(user)} replace />;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      done(await signIn(email, password));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível entrar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card stack auth-page" onSubmit={submit}>
      <div className="stack-sm">
        <h1>Entrar</h1>
        <p className="muted">Use a mesma conta do aplicativo.</p>
      </div>
      {error ? <ErrorMessage message={error} /> : null}
      <label className="field">
        <span>E-mail</span>
        <input className="input" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="field">
        <span>Senha</span>
        <input className="input" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? 'Entrando…' : 'Entrar'}
      </button>
      <p className="small muted">
        Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
      </p>
    </form>
  );
}

export function SignUpPage() {
  const { user, signUp } = useAuth();
  const done = useAfterAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to={homeOf(user)} replace />;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      done(await signUp(name, email, password));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível criar a conta.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card stack auth-page" onSubmit={submit}>
      <div className="stack-sm">
        <h1>Criar conta</h1>
        <p className="muted">Toda conta nova é de jogador. Um administrador pode torná-la de treinador.</p>
      </div>
      {error ? <ErrorMessage message={error} /> : null}
      <label className="field">
        <span>Nome completo</span>
        <input className="input" autoComplete="name" required minLength={2} value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="field">
        <span>E-mail</span>
        <input className="input" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="field">
        <span>Senha (mínimo 8 caracteres)</span>
        <input className="input" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? 'Criando…' : 'Criar conta'}
      </button>
      <p className="small muted">
        Já tem conta? <Link to="/entrar">Entrar</Link>
      </p>
    </form>
  );
}
