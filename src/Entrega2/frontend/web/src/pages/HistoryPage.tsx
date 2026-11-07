import { useMemo, useState } from 'react';
import { api } from '../api/client';
import { ActivityChart, WallMap } from '../components/charts';
import { Pager, SessionTable } from '../components/SessionTable';
import { Loaded, PageHeader, Section, StatTile } from '../components/ui';
import { formatDuration, formatNumber, formatPercent, toDateInput } from '../content/format';
import { periodMetrics } from '../content/metrics';
import { useResource } from '../hooks/useResource';

const PAGE = 20;
const PERIOD_SAMPLE = 100;
const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(days: number): string {
  return toDateInput(new Date(Date.now() - days * DAY_MS));
}

function endOf(day: string): string {
  return new Date(new Date(`${day}T00:00:00`).getTime() + DAY_MS).toISOString();
}

export function HistoryPage() {
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(toDateInput(new Date()));
  const [trainingId, setTrainingId] = useState('');
  const [offset, setOffset] = useState(0);

  const range = useMemo(
    () => ({ from: new Date(`${from}T00:00:00`).toISOString(), to: endOf(to), trainingId }),
    [from, to, trainingId],
  );

  const statistics = useResource(() => api.statistics(), []);
  const catalog = useResource(() => api.catalog({}), []);
  const sample = useResource(() => api.mySessions({ ...range, limit: PERIOD_SAMPLE, offset: 0 }), [range]);
  const page = useResource(() => api.mySessions({ ...range, limit: PAGE, offset }), [range, offset]);

  const metrics = sample.data ? periodMetrics(sample.data.items) : null;

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow="Jogador"
        title="Meu histórico"
        description="Sessões jogadas no app, com a parede real ou com o simulador, filtradas por período e treino."
      />

      <div className="card filters" style={{ marginBottom: 0 }}>
        <label className="field">
          <span>De</span>
          <input className="input" type="date" value={from} max={to} onChange={(event) => { setFrom(event.target.value); setOffset(0); }} />
        </label>
        <label className="field">
          <span>Até</span>
          <input className="input" type="date" value={to} min={from} onChange={(event) => { setTo(event.target.value); setOffset(0); }} />
        </label>
        <label className="field">
          <span>Treino</span>
          <select className="select" value={trainingId} onChange={(event) => { setTrainingId(event.target.value); setOffset(0); }}>
            <option value="">Todos, inclusive modos livres</option>
            {(catalog.data ?? []).map((training) => (
              <option key={training.id} value={training.id}>
                {training.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {metrics ? (
        <div className="grid-tiles">
          <StatTile label="Volume" value={formatNumber(metrics.sessions)} hint={`${formatNumber(metrics.attempts)} batidas`} />
          <StatTile label="Precisão" value={formatPercent(metrics.accuracyPercent)} />
          <StatTile label="Consistência" value={formatPercent(metrics.consistencyPercent)} hint="estabilidade da precisão" />
          <StatTile label="Tempo jogado" value={formatDuration(metrics.playTimeMs)} />
          <StatTile
            label="Progressão"
            value={
              metrics.progressionPoints === null
                ? '—'
                : `${metrics.progressionPoints >= 0 ? '+' : ''}${Math.round(metrics.progressionPoints)} pts`
            }
            hint="precisão: 2ª metade vs 1ª"
          />
        </div>
      ) : null}

      <Section title="Sessões">
        <Loaded resource={page}>
          {(result) => (
            <div className="stack">
              <SessionTable sessions={result.items} />
              <Pager total={result.total} limit={PAGE} offset={offset} onChange={setOffset} />
            </div>
          )}
        </Loaded>
      </Section>

      <Loaded resource={statistics}>
        {(stats) => (
          <div className="split">
            <Section title="Últimos 30 dias">
              <ActivityChart activity={stats.activity} />
            </Section>
            <Section title="Precisão por alvo">
              <WallMap targets={stats.targets} />
            </Section>
          </div>
        )}
      </Loaded>
    </div>
  );
}
