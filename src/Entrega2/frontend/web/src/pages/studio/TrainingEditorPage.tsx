import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client';
import type { StudioTrainingDetail, TrainingContent } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { emptyContent, TrainingForm } from '../../components/TrainingForm';
import { TrainingSimulator, type StepOutcome } from '../../components/TrainingSimulator';
import { ErrorMessage, PageHeader, Section, Spinner, StatusBadge } from '../../components/ui';
import { formatDateTime } from '../../content/format';

type Busy = null | 'save' | 'action';

function sameContent(left: TrainingContent, right: TrainingContent): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function TrainingEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [training, setTraining] = useState<StudioTrainingDetail | null>(null);
  const [content, setContent] = useState<TrainingContent>(emptyContent);
  const [loading, setLoading] = useState(Boolean(id));
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [simulation, setSimulation] = useState<StepOutcome[] | null>(null);
  const [changeNote, setChangeNote] = useState('');
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    if (!id) {
      setTraining(null);
      setContent(emptyContent());
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .studioDetail(id)
      .then((detail) => {
        setTraining(detail);
        setContent(detail.draft);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Treino não encontrado.'))
      .finally(() => setLoading(false));
  }, [id]);

  const apply = (detail: StudioTrainingDetail, message: string) => {
    setTraining(detail);
    setContent(detail.draft);
    setNotice(message);
    setError(null);
  };

  const run = async (kind: Busy, action: () => Promise<StudioTrainingDetail>, message: string) => {
    setBusy(kind);
    setError(null);
    setNotice(null);
    try {
      apply(await action(), message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Algo deu errado.');
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    setBusy('save');
    setError(null);
    setNotice(null);
    try {
      if (training) {
        apply(await api.updateTraining(training.id, content), 'Rascunho salvo. Simule de novo antes de publicar.');
      } else {
        const created = await api.createTraining(content);
        navigate(`/estudio/${created.id}`, { replace: true });
      }
      setSimulation(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar.');
    } finally {
      setBusy(null);
    }
  };

  const finishSimulation = (outcomes: StepOutcome[]) => {
    setSimulating(false);
    setSimulation(outcomes);
    if (!training) {
      return;
    }
    const passed = outcomes.length === training.draft.steps.length && outcomes.every((outcome) => outcome.cleared);
    void run(
      'action',
      () => api.recordSimulation(training.id, training.revision, passed),
      passed ? 'Simulação aprovada: todas as etapas foram concluídas.' : 'Simulação registrada sem aprovação: alguma etapa não foi concluída.',
    );
  };

  if (loading) {
    return <Spinner />;
  }

  const dirty = training ? !sameContent(training.draft, content) : true;
  const isAdmin = user?.role === 'admin';
  const ownsIt = training ? training.authorId === user?.id : true;
  const status = training?.status;
  const archived = status === 'archived';
  const canPublish = isAdmin && training && !dirty && training.simulated && (status === 'in_review' || (status === 'draft' && ownsIt));
  const canSubmit = training && !dirty && status === 'draft' && training.simulated && !(isAdmin && ownsIt);

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow={training ? `Revisão ${training.revision} · por ${training.authorName}` : 'Estúdio'}
        title={training ? content.title || 'Treino sem título' : 'Novo treino'}
        description={
          training
            ? `Atualizado em ${formatDateTime(training.updatedAt)}${training.currentVersion ? ` · versão publicada: v${training.currentVersion}` : ' · ainda não publicado'}`
            : 'Defina público, regras e etapas. Depois salve, simule e envie para revisão.'
        }
        actions={
          <div className="row">
            {status ? <StatusBadge status={status} /> : null}
            {training?.listed ? (
              <Link className="btn btn-secondary btn-sm" to={`/treinos/${training.id}`}>
                Ver no catálogo
              </Link>
            ) : null}
            {training ? (
              <Link className="btn btn-secondary btn-sm" to={`/estudio/${training.id}/analise`}>
                Análise
              </Link>
            ) : null}
          </div>
        }
      />

      {error ? <ErrorMessage message={error} /> : null}
      {notice ? <div className="alert alert-success" role="status">{notice}</div> : null}
      {training?.reviewNote ? (
        <div className="alert alert-info">Comentário da revisão: {training.reviewNote}</div>
      ) : null}

      <div className="split">
        <TrainingForm content={content} onChange={setContent} disabled={archived || busy !== null} />

        <div className="stack aside-first" style={{ alignSelf: 'start' }}>
          <Section title="Fluxo de publicação">
            <ol className="list stack-sm small">
              <li className={training && !dirty ? 'feedback-correct' : ''}>Salvar o rascunho</li>
              <li className={training?.simulated && !dirty ? 'feedback-correct' : ''}>Simular todas as etapas</li>
              <li className={status === 'in_review' || status === 'published' ? 'feedback-correct' : ''}>Enviar para revisão</li>
              <li className={status === 'published' ? 'feedback-correct' : ''}>Publicação pelo administrador</li>
            </ol>
            <button type="button" className="btn btn-primary" disabled={archived || busy !== null || (training !== null && !dirty)} onClick={() => void save()}>
              {busy === 'save' ? 'Salvando…' : training ? 'Salvar rascunho' : 'Criar rascunho'}
            </button>
            {training && !archived ? (
              <button type="button" className="btn btn-secondary" disabled={dirty || busy !== null || simulating} onClick={() => { setSimulation(null); setSimulating(true); }}>
                Simular treino
              </button>
            ) : null}
            {dirty && training ? <p className="small muted">Salve as alterações para simular.</p> : null}
            {canSubmit ? (
              <button type="button" className="btn btn-secondary" disabled={busy !== null} onClick={() => void run('action', () => api.submitTraining(training.id), 'Enviado para revisão de um administrador.')}>
                Enviar para revisão
              </button>
            ) : null}
            {canPublish ? (
              <div className="stack-sm">
                <label className="field">
                  <span>O que mudou nesta versão</span>
                  <input className="input" maxLength={280} value={changeNote} onChange={(event) => setChangeNote(event.target.value)} placeholder="Ex.: mais tempo na etapa 2" />
                </label>
                <button type="button" className="btn btn-primary" disabled={busy !== null} onClick={() => void run('action', () => api.publishTraining(training.id, changeNote), 'Publicado. O app já recebe esta versão.')}>
                  Publicar versão {training.currentVersion + 1}
                </button>
              </div>
            ) : null}
            {isAdmin && training && status === 'in_review' && !ownsIt ? (
              <div className="stack-sm">
                <label className="field">
                  <span>Devolver ao autor com comentário</span>
                  <input className="input" maxLength={280} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} />
                </label>
                <button type="button" className="btn btn-secondary" disabled={busy !== null || reviewNote.trim().length === 0} onClick={() => void run('action', () => api.returnTraining(training.id, reviewNote), 'Treino devolvido ao autor.')}>
                  Devolver
                </button>
              </div>
            ) : null}
            {training ? (
              archived ? (
                <button type="button" className="btn btn-secondary" disabled={busy !== null} onClick={() => void run('action', () => api.restoreTraining(training.id), 'Treino restaurado.')}>
                  Restaurar
                </button>
              ) : (
                <button type="button" className="btn btn-ghost" disabled={busy !== null} onClick={() => void run('action', () => api.archiveTraining(training.id), 'Treino arquivado e retirado do catálogo.')}>
                  Arquivar
                </button>
              )
            ) : null}
          </Section>

          {simulating && training ? (
            <Section title="Simulação" actions={<button type="button" className="btn btn-ghost btn-sm" onClick={() => setSimulating(false)}>Cancelar</button>}>
              <p className="small muted">Clique nos alvos como se fossem as batidas na parede. As regras são as mesmas do app.</p>
              <TrainingSimulator content={training.draft} onFinished={finishSimulation} />
            </Section>
          ) : null}

          {simulation ? (
            <Section title="Resultado da simulação">
              <ul className="list small">
                {simulation.map((outcome, index) => (
                  <li key={index} className={outcome.cleared ? 'feedback-correct' : 'feedback-incorrect'}>
                    {outcome.title}: {outcome.cleared ? 'concluída' : 'não concluída'} · {outcome.score} pts em {outcome.attempts} batidas
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {training && training.versions.length > 0 ? (
            <Section title="Versões publicadas">
              <ul className="list small stack-sm">
                {training.versions.map((version) => (
                  <li key={version.version}>
                    <strong>v{version.version}</strong> · {formatDateTime(version.publishedAt)} por {version.publishedByName}
                    {version.changeNote ? <span className="muted"> — {version.changeNote}</span> : null}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
