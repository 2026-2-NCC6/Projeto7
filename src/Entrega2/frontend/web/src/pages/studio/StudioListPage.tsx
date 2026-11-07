import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import type { TrainingStatus } from '../../api/types';
import { ColorDots, EmptyState, Loaded, PageHeader, StatusBadge } from '../../components/ui';
import { formatDateTime, formatNumber } from '../../content/format';
import { audienceLabels, optionsOf, statusLabels } from '../../content/labels';
import { useResource } from '../../hooks/useResource';

export function StudioListPage({ reviewQueue = false }: { reviewQueue?: boolean }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<TrainingStatus | ''>(reviewQueue ? 'in_review' : '');
  const trainings = useResource(() => api.studio(status || undefined), [status]);

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow={reviewQueue ? 'Administração' : 'Estúdio'}
        title={reviewQueue ? 'Revisão de treinos' : 'Meus treinos'}
        description={
          reviewQueue
            ? 'Treinos enviados por treinadores e simulados até o fim. Abra para publicar ou devolver.'
            : 'Rascunhos, revisões e versões publicadas. Administradores veem os treinos de todos.'
        }
        actions={
          <Link to="/estudio/novo" className="btn btn-primary">
            Criar treino
          </Link>
        }
      />
      <div className="chips" role="group" aria-label="Filtrar por situação">
        <button type="button" className="chip" aria-pressed={status === ''} onClick={() => setStatus('')}>
          Todos
        </button>
        {optionsOf(statusLabels).map((option) => (
          <button key={option.value} type="button" className="chip" aria-pressed={status === option.value} onClick={() => setStatus(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
      <Loaded resource={trainings}>
        {(items) =>
          items.length === 0 ? (
            <div className="card">
              <EmptyState title={reviewQueue ? 'Nada aguardando revisão.' : 'Nenhum treino aqui ainda.'} />
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Treino</th>
                    <th>Situação</th>
                    <th>Público</th>
                    <th>Alvos</th>
                    <th>Autor</th>
                    <th className="num">Versão</th>
                    <th className="num">Sessões</th>
                    <th>Atualizado</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((training) => (
                    <tr key={training.id} className="clickable" tabIndex={0} onClick={() => navigate(`/estudio/${training.id}`)} onKeyDown={(event) => event.key === 'Enter' && navigate(`/estudio/${training.id}`)}>
                      <td>
                        <strong>{training.draft.title}</strong>
                        <div className="small muted">
                          {training.draft.steps.length} etapa(s)
                          {training.listed && training.hasUnpublishedChanges ? ' · alterações não publicadas' : ''}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={training.status} />
                      </td>
                      <td>{audienceLabels[training.draft.audience]}</td>
                      <td>
                        <ColorDots colors={training.targetColors} />
                      </td>
                      <td>{training.authorName}</td>
                      <td className="num">{training.currentVersion ? `v${training.currentVersion}` : '—'}</td>
                      <td className="num">{formatNumber(training.sessions)}</td>
                      <td>{formatDateTime(training.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </Loaded>
    </div>
  );
}
