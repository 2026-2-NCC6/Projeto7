import { useNavigate } from 'react-router-dom';
import type { SessionSummary } from '../api/types';
import { formatDateTime, formatDuration, formatNumber, formatPercent } from '../content/format';
import { endReasonLabels, modeLabels } from '../content/labels';
import { EmptyState } from './ui';

export function SessionTable({ sessions, showPlayer = false }: { sessions: SessionSummary[]; showPlayer?: boolean }) {
  const navigate = useNavigate();

  if (sessions.length === 0) {
    return <EmptyState title="Nenhuma sessão no período." />;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Quando</th>
            {showPlayer ? <th>Jogador</th> : null}
            <th>Treino ou modo</th>
            <th>Resultado</th>
            <th className="num">Pontos</th>
            <th className="num">Precisão</th>
            <th className="num">Duração</th>
            <th>Origem</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr
              key={session.id}
              className="clickable"
              tabIndex={0}
              onClick={() => navigate(`/sessoes/${session.id}`)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  navigate(`/sessoes/${session.id}`);
                }
              }}
            >
              <td>{formatDateTime(session.playedAt)}</td>
              {showPlayer ? <td>{session.playerName}</td> : null}
              <td>
                {session.training ? (
                  <span>
                    {session.training.title ?? 'Treino'}{' '}
                    <span className="muted small">
                      etapa {session.training.stepIndex + 1} · v{session.training.version}
                    </span>
                  </span>
                ) : (
                  <span>
                    {modeLabels[session.mode]}
                    {session.level > 0 ? <span className="muted small"> nível {session.level}</span> : null}
                  </span>
                )}
              </td>
              <td>
                {session.endReason === 'emergencyStop' ? (
                  <span className="badge badge-danger">{endReasonLabels.emergencyStop}</span>
                ) : session.cleared ? (
                  <span className="badge badge-accent">Concluída</span>
                ) : (
                  <span className="badge">{session.endReason ? endReasonLabels[session.endReason] : 'Encerrada'}</span>
                )}
              </td>
              <td className="num">{formatNumber(session.score)}</td>
              <td className="num">{formatPercent(session.accuracyPercent)}</td>
              <td className="num">{formatDuration(session.durationMs)}</td>
              <td>
                <span className="row" style={{ gap: 6 }}>
                  <span className="badge">{session.deviceKind === 'websocket' ? 'Parede' : 'Simulador'}</span>
                  {session.offline ? <span className="badge badge-warning">Offline</span> : null}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pager({
  total,
  limit,
  offset,
  onChange,
}: {
  total: number;
  limit: number;
  offset: number;
  onChange: (offset: number) => void;
}) {
  if (total <= limit) {
    return null;
  }

  return (
    <div className="row-between small">
      <span className="muted">
        {offset + 1}–{Math.min(total, offset + limit)} de {total}
      </span>
      <div className="row">
        <button type="button" className="btn btn-secondary btn-sm" disabled={offset === 0} onClick={() => onChange(Math.max(0, offset - limit))}>
          Anteriores
        </button>
        <button type="button" className="btn btn-secondary btn-sm" disabled={offset + limit >= total} onClick={() => onChange(offset + limit)}>
          Próximas
        </button>
      </div>
    </div>
  );
}
