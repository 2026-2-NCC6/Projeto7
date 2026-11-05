import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import type { TrainingContent, TrainingStep } from '../api/types';
import { ColorDots, Loaded, PageHeader, Section } from '../components/ui';
import { formatDateTime, formatPrice } from '../content/format';
import {
  audienceLabels,
  categoryLabels,
  colorLabels,
  difficultyLabels,
  licenseLabels,
  objectiveLabels,
  pricingLabels,
  stepModeLabels,
} from '../content/labels';
import { useResource } from '../hooks/useResource';

function seconds(ms: number | null): string {
  return ms === null ? 'sem limite' : `${Math.round(ms / 1000)} s`;
}

export function StepRules({ step }: { step: TrainingStep }) {
  if (step.mode === 'level_color') {
    const { config } = step;
    return (
      <dl className="dl small">
        <dt>Sequência</dt>
        <dd>{config.sequenceLength} acertos seguidos</dd>
        <dt>Cores</dt>
        <dd>{config.palette.map((color) => colorLabels[color]).join(', ')}</dd>
        <dt>Tempo por cor</dt>
        <dd>{seconds(config.reactionWindowMs)}</dd>
        <dt>Erros permitidos</dt>
        <dd>{config.maxMistakes ?? 'ilimitados'}</dd>
        <dt>Pontos por acerto</dt>
        <dd>{config.pointsPerHit}</dd>
        <dt>Descanso entre batidas</dt>
        <dd>{config.recoveryMs} ms</dd>
      </dl>
    );
  }

  const { config } = step;
  return (
    <dl className="dl small">
      <dt>Meta</dt>
      <dd>{config.targetScore} pontos</dd>
      <dt>Tempo</dt>
      <dd>{seconds(config.timeLimitMs)}</dd>
      <dt>Cores que pontuam</dt>
      <dd>
        {config.palette.map((color) => `${colorLabels[color]} (${config.pointsPerColor[color]})`).join(', ')}
      </dd>
      <dt>Sequência</dt>
      <dd>
        {config.streakMultiplier
          ? `+${config.streakMultiplier.step}x a cada ${config.streakMultiplier.every} acertos, até ${config.streakMultiplier.max}x`
          : 'sem multiplicador'}
      </dd>
      <dt>Penalidade</dt>
      <dd>{config.missPenalty === 0 ? 'nenhuma' : `${config.missPenalty} pontos por erro`}</dd>
      <dt>Precisão mínima</dt>
      <dd>{config.requiredAccuracyPercent === null ? 'nenhuma' : `${config.requiredAccuracyPercent}%`}</dd>
    </dl>
  );
}

export function TrainingOverview({ content }: { content: TrainingContent }) {
  return (
    <div className="split">
      <div className="stack">
        <Section title="Como jogar">
          <p>{content.instructions || 'Sem instruções.'}</p>
          <div className="stack-sm">
            <h3>Pontuação</h3>
            <p className="muted">{content.scoringRules || 'Segue as regras de cada etapa.'}</p>
          </div>
        </Section>
        <Section title={`Etapas (${content.steps.length})`}>
          <ol className="stack list" style={{ paddingLeft: 0, listStyle: 'none' }}>
            {content.steps.map((step, index) => (
              <li key={index} className="card-flat step-card stack-sm">
                <div className="row-between">
                  <strong>
                    {index + 1}. {step.title}
                  </strong>
                  <span className="badge">{stepModeLabels[step.mode]}</span>
                </div>
                <StepRules step={step} />
              </li>
            ))}
          </ol>
        </Section>
      </div>
      <div className="stack">
        <Section title="Preparação">
          <div className="stack-sm">
            <span className="eyebrow">Equipamentos</span>
            {content.equipment.length ? (
              <ul className="list">
                {content.equipment.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <span className="muted">Nenhum além da raquete.</span>
            )}
          </div>
          <div className="stack-sm">
            <span className="eyebrow">Riscos e cuidados</span>
            {content.risks.length ? (
              <ul className="list">
                {content.risks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <span className="muted">Nenhum informado.</span>
            )}
          </div>
          <div className="alert alert-info small">
            O app tem um botão de parada de emergência em toda partida. Ele interrompe o treino e trava novas
            partidas até alguém reiniciar o sistema.
          </div>
        </Section>
        <Section title="Marketplace">
          <dl className="dl small">
            <dt>Categoria</dt>
            <dd>{categoryLabels[content.marketplace.category]}</dd>
            <dt>Licença</dt>
            <dd>{licenseLabels[content.marketplace.license]}</dd>
            <dt>Modelo</dt>
            <dd>
              {pricingLabels[content.marketplace.pricingModel]}
              {content.marketplace.priceCents !== null ? ` · ${formatPrice(content.marketplace.priceCents)}` : ''}
            </dd>
            <dt>Compatível com</dt>
            <dd>{content.marketplace.compatibility.join(', ') || '—'}</dd>
          </dl>
          {content.marketplace.commercialDescription ? (
            <p className="muted small">{content.marketplace.commercialDescription}</p>
          ) : null}
          <p className="small muted">A cobrança ainda não está ativa: o MVP só registra os metadados.</p>
        </Section>
      </div>
    </div>
  );
}

export function TrainingPage() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const version = params.get('versao') ? Number(params.get('versao')) : undefined;
  const detail = useResource(() => api.catalogDetail(id, version), [id, version]);
  const versions = useResource(() => api.catalogVersions(id), [id]);

  return (
    <Loaded resource={detail}>
      {(training) => (
        <div className="stack-lg">
          <PageHeader
            eyebrow={`${audienceLabels[training.audience]} · ${difficultyLabels[training.difficulty]} · ${objectiveLabels[training.objective]}`}
            title={training.title}
            description={training.summary}
            actions={
              <div className="row">
                <ColorDots colors={training.targetColors} />
                <span className="badge">{training.estimatedMinutes} min</span>
                <span className="badge badge-accent">versão {training.version}</span>
              </div>
            }
          />
          <div className="alert alert-info">
            Para jogar, abra o app Smash no celular, vá em <strong>Jogar → Treinos</strong> e escolha “{training.title}”.
          </div>
          <TrainingOverview content={training.content} />
          <Section title="Histórico de versões">
            <Loaded resource={versions}>
              {(entries) => (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Versão</th>
                        <th>Publicada em</th>
                        <th>Por</th>
                        <th>Alterações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => (
                        <tr key={entry.version}>
                          <td>
                            <Link to={`/treinos/${training.id}?versao=${entry.version}`}>v{entry.version}</Link>
                          </td>
                          <td>{formatDateTime(entry.publishedAt)}</td>
                          <td>{entry.publishedByName}</td>
                          <td className="muted">{entry.changeNote || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Loaded>
          </Section>
        </div>
      )}
    </Loaded>
  );
}
