import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { PracticeGoal, PractitionerProfile } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { ErrorMessage, Loaded, PageHeader } from '../components/ui';
import { ageGroupLabels, goalLabels, handLabels, optionsOf, roleLabels, skillLabels } from '../content/labels';
import { useResource } from '../hooks/useResource';

export function ProfilePage() {
  const profile = useResource(() => api.profile(), []);
  const { rename } = useAuth();
  const [name, setName] = useState('');
  const [practitioner, setPractitioner] = useState<PractitionerProfile | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile.data) {
      setName(profile.data.player.name);
      setPractitioner(profile.data.player.practitioner);
    }
  }, [profile.data]);

  const set = <K extends keyof PractitionerProfile>(key: K, value: PractitionerProfile[K]) => {
    setPractitioner((current) => (current ? { ...current, [key]: value } : current));
    setStatus('idle');
  };

  const toggleGoal = (goal: PracticeGoal) => {
    if (!practitioner) {
      return;
    }
    set(
      'goals',
      practitioner.goals.includes(goal)
        ? practitioner.goals.filter((item) => item !== goal)
        : [...practitioner.goals, goal],
    );
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!practitioner) {
      return;
    }
    setStatus('saving');
    setError(null);
    try {
      const saved = await api.updateProfile(name, practitioner);
      rename(saved.name);
      setStatus('saved');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar.');
      setStatus('idle');
    }
  };

  const minor = practitioner?.ageGroup === 'child' || practitioner?.ageGroup === 'teen';

  return (
    <div className="stack-lg" style={{ maxWidth: 760 }}>
      <PageHeader
        eyebrow="Conta"
        title="Perfil do praticante"
        description="Usado para recomendar treinos e adaptar a experiência. Nada aqui é obrigatório."
      />
      <Loaded resource={profile}>
        {(view) =>
          practitioner ? (
            <form className="card stack" onSubmit={submit}>
              {error ? <ErrorMessage message={error} /> : null}
              {status === 'saved' ? <div className="alert alert-success">Perfil salvo.</div> : null}
              <div className="form-grid">
                <label className="field">
                  <span>Nome</span>
                  <input className="input" required minLength={2} value={name} onChange={(event) => { setName(event.target.value); setStatus('idle'); }} />
                </label>
                <label className="field">
                  <span>E-mail</span>
                  <input className="input" value={view.player.email} disabled />
                </label>
                <label className="field">
                  <span>Papel</span>
                  <input className="input" value={roleLabels[view.player.role]} disabled />
                </label>
                <label className="field">
                  <span>Faixa etária</span>
                  <select className="select" value={practitioner.ageGroup ?? ''} onChange={(event) => set('ageGroup', (event.target.value || null) as PractitionerProfile['ageGroup'])}>
                    <option value="">Prefiro não informar</option>
                    {optionsOf(ageGroupLabels).map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Nível no tênis</span>
                  <select className="select" value={practitioner.skillLevel ?? ''} onChange={(event) => set('skillLevel', (event.target.value || null) as PractitionerProfile['skillLevel'])}>
                    <option value="">Prefiro não informar</option>
                    {optionsOf(skillLabels).map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Mão dominante</span>
                  <select className="select" value={practitioner.dominantHand ?? ''} onChange={(event) => set('dominantHand', (event.target.value || null) as PractitionerProfile['dominantHand'])}>
                    <option value="">Prefiro não informar</option>
                    {optionsOf(handLabels).map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <fieldset className="stack-sm" style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend className="eyebrow" style={{ marginBottom: 8 }}>Objetivos</legend>
                <div className="chips">
                  {optionsOf(goalLabels).map((option) => (
                    <button key={option.value} type="button" className="chip" aria-pressed={practitioner.goals.includes(option.value)} onClick={() => toggleGoal(option.value)}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="field">
                <span>Restrições ou cuidados (até 280 caracteres)</span>
                <textarea className="textarea" maxLength={280} value={practitioner.restrictions ?? ''} onChange={(event) => set('restrictions', event.target.value || null)} placeholder="Ex.: dor no punho direito, asma leve" />
              </label>
              {minor ? (
                <div className="alert alert-info small">
                  Proteção reforçada para menores: no ranking público aparece só o primeiro nome e a inicial do
                  sobrenome, e as restrições só são vistas por você e pelos administradores.
                </div>
              ) : null}
              <div className="row">
                <button className="btn btn-primary" type="submit" disabled={status === 'saving'}>
                  {status === 'saving' ? 'Salvando…' : 'Salvar perfil'}
                </button>
              </div>
            </form>
          ) : null
        }
      </Loaded>
    </div>
  );
}
