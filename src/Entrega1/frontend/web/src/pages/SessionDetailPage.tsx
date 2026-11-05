import { useParams } from 'react-router-dom';
import { wallTarget } from '@app/device/contracts/target';
import { api } from '../api/client';
import { WallMap } from '../components/charts';
import { EmptyState, Loaded, PageHeader, Section, StatTile } from '../components/ui';
import { formatDateTime, formatDuration, formatMs, formatNumber, formatPercent } from '../content/format';
import { endReasonLabels, modeLabels } from '../content/labels';
import { targetsFromSession } from '../content/metrics';
import { useResource } from '../hooks/useResource';

export function SessionDetailPage() {
  const { id = '' } = useParams();
  const session = useResource(() => api.session(id), [id]);

  return (
    <Loaded resource={session}>
      {(detail) => (
        <div className="stack-lg">
          <PageHeader
            eyebrow={`${detail.playerName} · ${formatDateTime(detail.playedAt)}`}
            title={detail.training ? `${detail.training.title ?? 'Treino'} — etapa ${detail.training.stepIndex + 1}` : modeLabels[detail.mode]}
            description={detail.training ? `${modeLabels[detail.mode]} · versão ${detail.training.version} do treino` : detail.level > 0 ? `Nível ${detail.level}` : 'Modo infinito'}
            actions={
              <div className="row">
                {detail.endReason === 'emergencyStop' ? (
                  <span className="badge badge-danger">Parada de emergência</span>
                ) : (
                  <span className={detail.cleared ? 'badge badge-accent' : 'badge'}>
                    {detail.endReason ? endReasonLabels[detail.endReason] : detail.cleared ? 'Concluída' : 'Encerrada'}
                  </span>
                )}
                <span className="badge">{detail.deviceKind === 'websocket' ? `Parede ${detail.deviceId ?? ''}` : 'Simulador'}</span>
                {detail.offline ? <span className="badge badge-warning">Sincronizada depois (offline)</span> : null}
              </div>
            }
          />

          {detail.stopReason ? (
            <div className="alert alert-danger">Motivo da parada: {detail.stopReason}</div>
          ) : null}

          <div className="grid-tiles">
            <StatTile label="Pontos" value={formatNumber(detail.score)} hint={`${formatNumber(detail.xpAwarded)} XP`} />
            <StatTile label="Precisão" value={formatPercent(detail.accuracyPercent)} hint={`${detail.hits} acertos, ${detail.misses} erros`} />
            <StatTile label="Melhor sequência" value={formatNumber(detail.bestStreak)} />
            <StatTile label="Reação média" value={formatMs(detail.avgResponseMs)} hint={`melhor ${formatMs(detail.bestResponseMs)}`} />
            <StatTile label="Duração" value={formatDuration(detail.durationMs)} />
            <StatTile
              label="Interrupções"
              value={formatNumber(detail.interruptions.pauses + detail.interruptions.deviceLosses)}
              hint={`${detail.interruptions.pauses} pausas · ${detail.interruptions.deviceLosses} quedas · ${detail.interruptions.faults} falhas`}
            />
          </div>

          <div className="split">
            <Section title="Batida a batida">
              {detail.attempts.length === 0 ? (
                <EmptyState title="Esta sessão não trouxe a sequência de batidas.">
                  Sessões gravadas antes da telemetria detalhada guardam só os totais.
                </EmptyState>
              ) : (
                <div className="stack">
                  <div className="timeline" aria-label="Sequência de tentativas">
                    {detail.attempts.map((attempt, index) => (
                      <span
                        key={index}
                        className={`timeline-dot ${attempt.verdict}`}
                        title={`${index + 1}: ${attempt.verdict === 'correct' ? 'acerto' : 'erro'} em ${formatMs(attempt.responseMs)}`}
                      >
                        {attempt.targetId ? `A${attempt.targetId}` : '—'}
                      </span>
                    ))}
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th className="num">#</th>
                          <th className="num">Momento</th>
                          <th>Alvo</th>
                          <th>Resultado</th>
                          <th className="num">Reação</th>
                          <th className="num">Pontos</th>
                          <th className="num">Intensidade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.attempts.map((attempt, index) => {
                          const target = attempt.targetId ? wallTarget(attempt.targetId) : null;
                          return (
                            <tr key={index}>
                              <td className="num">{index + 1}</td>
                              <td className="num">{formatDuration(attempt.atMs)}</td>
                              <td>
                                {target ? (
                                  <span className="row" style={{ gap: 6 }}>
                                    <span className={`color-dot ${target.color}`} />A{target.id}
                                  </span>
                                ) : (
                                  <span className="muted">tempo esgotado</span>
                                )}
                              </td>
                              <td className={attempt.verdict === 'correct' ? 'feedback-correct' : 'feedback-incorrect'}>
                                {attempt.verdict === 'correct' ? 'Acerto' : 'Erro'}
                              </td>
                              <td className="num">{formatMs(attempt.responseMs)}</td>
                              <td className="num">{attempt.scoreDelta > 0 ? `+${attempt.scoreDelta}` : attempt.scoreDelta}</td>
                              <td className="num">{attempt.intensity === null ? '—' : formatNumber(attempt.intensity)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Section>
            <Section title="Parede">
              <WallMap targets={targetsFromSession(detail.targets)} />
              <p className="small muted">
                A intensidade é o pico do ADC (0–4095) e só compara batidas no mesmo alvo: cada pastilha tem
                resposta própria.
              </p>
            </Section>
          </div>
        </div>
      )}
    </Loaded>
  );
}
