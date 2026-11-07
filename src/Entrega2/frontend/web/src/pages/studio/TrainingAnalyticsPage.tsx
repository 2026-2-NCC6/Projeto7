import { Link, useParams } from 'react-router-dom';
import { api } from '../../api/client';
import { ActivityChart, WallMap } from '../../components/charts';
import { SessionTable } from '../../components/SessionTable';
import { EmptyState, Loaded, PageHeader, Section, StatTile } from '../../components/ui';
import { formatDuration, formatMs, formatNumber, formatPercent } from '../../content/format';
import { useResource } from '../../hooks/useResource';

export function TrainingAnalyticsPage() {
  const { id = '' } = useParams();
  const training = useResource(() => api.studioDetail(id), [id]);
  const analytics = useResource(() => api.trainingAnalytics(id), [id]);

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow="Análise do treino"
        title={training.data?.draft.title ?? 'Treino'}
        description="Todas as sessões jogadas a partir deste treino, em qualquer versão."
        actions={
          <Link className="btn btn-secondary btn-sm" to={`/estudio/${id}`}>
            Voltar ao editor
          </Link>
        }
      />
      <Loaded resource={analytics}>
        {(data) =>
          data.summary.sessions === 0 ? (
            <div className="card">
              <EmptyState title="Ninguém jogou este treino ainda.">Publique e jogue pelo app para ver os dados aqui.</EmptyState>
            </div>
          ) : (
            <div className="stack-lg">
              <div className="grid-tiles">
                <StatTile label="Sessões" value={formatNumber(data.summary.sessions)} hint={`${formatNumber(data.summary.hardwareSessions)} na parede real`} />
                <StatTile label="Precisão" value={formatPercent(data.summary.accuracyPercent)} />
                <StatTile label="Reação média" value={formatMs(data.summary.averageResponseMs)} />
                <StatTile label="Tempo jogado" value={formatDuration(data.summary.playTimeMs)} />
                <StatTile label="Melhor pontuação" value={formatNumber(data.summary.bestScore)} />
              </div>
              <Section title="Desempenho por etapa">
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Versão</th>
                        <th>Etapa</th>
                        <th className="num">Sessões</th>
                        <th className="num">Conclusão</th>
                        <th className="num">Precisão</th>
                        <th className="num">Pontuação média</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.steps.map((step) => (
                        <tr key={`${step.version}-${step.stepIndex}`}>
                          <td>v{step.version}</td>
                          <td>{step.stepIndex + 1}. {training.data?.draft.steps[step.stepIndex]?.title ?? ''}</td>
                          <td className="num">{formatNumber(step.sessions)}</td>
                          <td className="num">{formatPercent((step.clearedSessions / step.sessions) * 100)}</td>
                          <td className="num">{formatPercent(step.hits + step.misses > 0 ? (step.hits / (step.hits + step.misses)) * 100 : null)}</td>
                          <td className="num">{formatNumber(step.averageScore)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
              <div className="split">
                <Section title="Últimos 30 dias">
                  <ActivityChart activity={data.activity} />
                </Section>
                <Section title="Precisão por alvo">
                  <WallMap targets={data.targets} />
                </Section>
              </div>
              <Section title="Sessões recentes">
                <SessionTable sessions={data.recentSessions} showPlayer />
              </Section>
            </div>
          )
        }
      </Loaded>
    </div>
  );
}
