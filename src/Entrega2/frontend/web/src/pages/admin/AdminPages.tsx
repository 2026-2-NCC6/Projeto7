import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import type { AuditEvent, UserRole } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { ActivityChart, WallMap } from '../../components/charts';
import { Pager, SessionTable } from '../../components/SessionTable';
import { EmptyState, ErrorMessage, Loaded, PageHeader, Section, StatTile } from '../../components/ui';
import { formatDateTime, formatDuration, formatMs, formatNumber, formatPercent, toDateInput } from '../../content/format';
import { ageGroupLabels, auditLabels, modeLabels, optionsOf, roleLabels, statusLabels } from '../../content/labels';
import { useResource } from '../../hooks/useResource';

const PAGE = 20;

export function AdminOverviewPage() {
  const overview = useResource(() => api.adminOverview(), []);

  return (
    <div className="stack-lg">
      <PageHeader eyebrow="Administração" title="Visão geral" description="Todas as sessões, jogadores, treinos e a operação da parede." />
      <Loaded resource={overview}>
        {(data) => (
          <div className="stack-lg">
            <div className="grid-tiles">
              <StatTile label="Sessões" value={formatNumber(data.summary.sessions)} hint={`${formatNumber(data.summary.hardwareSessions)} na parede real`} />
              <StatTile label="Precisão geral" value={formatPercent(data.summary.accuracyPercent)} />
              <StatTile label="Reação média" value={formatMs(data.summary.averageResponseMs)} />
              <StatTile label="Tempo jogado" value={formatDuration(data.summary.playTimeMs)} />
              <StatTile label="Jogadores" value={formatNumber(data.usersByRole.player)} hint={`${data.usersByRole.coach} treinadores · ${data.usersByRole.admin} admins`} />
              <StatTile label="Treinos publicados" value={formatNumber(data.trainingsByStatus.published)} hint={`${data.trainingsByStatus.in_review} em revisão · ${data.trainingsByStatus.draft} rascunhos`} />
              <StatTile label="Paradas de emergência" value={formatNumber(data.operations.emergencyStops)} />
              <StatTile label="Sessões offline" value={formatNumber(data.operations.offlineSessions)} hint={`${formatNumber(data.operations.trainingSessions)} sessões de treinos publicados`} />
            </div>
            <div className="split">
              <Section title="Últimos 30 dias">
                <ActivityChart activity={data.activity} />
              </Section>
              <Section title="Precisão por alvo (todas as sessões)">
                <WallMap targets={data.targets} />
              </Section>
            </div>
            <Section title="Por modo de jogo">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Modo</th>
                      <th className="num">Sessões</th>
                      <th className="num">Tempo</th>
                      <th className="num">Precisão</th>
                      <th className="num">Melhor pontuação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.modes.map((mode) => (
                      <tr key={mode.mode}>
                        <td>{modeLabels[mode.mode]}</td>
                        <td className="num">{formatNumber(mode.sessions)}</td>
                        <td className="num">{formatDuration(mode.playTimeMs)}</td>
                        <td className="num">{formatPercent(mode.accuracyPercent)}</td>
                        <td className="num">{formatNumber(mode.bestScore)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        )}
      </Loaded>
    </div>
  );
}

export function AdminUsersPage() {
  const { user: me } = useAuth();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const users = useResource(() => api.adminUsers({ search, role, limit: PAGE, offset }), [search, role, offset]);

  const change = async (id: string, next: UserRole) => {
    setError(null);
    try {
      await api.changeRole(id, next);
      users.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível mudar o papel.');
    }
  };

  return (
    <div className="stack-lg">
      <PageHeader eyebrow="Administração" title="Usuários e papéis" description="Promova jogadores a treinadores ou administradores. Toda mudança fica na auditoria." />
      <div className="card filters" style={{ marginBottom: 0 }}>
        <label className="field">
          <span>Buscar</span>
          <input className="input" type="search" placeholder="Nome ou e-mail" value={search} onChange={(event) => { setSearch(event.target.value); setOffset(0); }} />
        </label>
        <label className="field">
          <span>Papel</span>
          <select className="select" value={role} onChange={(event) => { setRole(event.target.value as UserRole | ''); setOffset(0); }}>
            <option value="">Todos</option>
            {optionsOf(roleLabels).map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
      {error ? <ErrorMessage message={error} /> : null}
      <Loaded resource={users}>
        {(page) => (
          <div className="stack">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Faixa etária</th>
                    <th className="num">Sessões</th>
                    <th>Última sessão</th>
                    <th>Papel</th>
                  </tr>
                </thead>
                <tbody>
                  {page.items.map((item) => (
                    <tr key={item.id}>
                      <td><strong>{item.name}</strong></td>
                      <td className="small">{item.email}</td>
                      <td className="small">{item.ageGroup ? ageGroupLabels[item.ageGroup] : '—'}</td>
                      <td className="num">{formatNumber(item.sessions)}</td>
                      <td className="small">{formatDateTime(item.lastPlayedAt)}</td>
                      <td>
                        <select className="select" aria-label={`Papel de ${item.name}`} value={item.role} disabled={item.id === me?.id} onChange={(event) => void change(item.id, event.target.value as UserRole)}>
                          {optionsOf(roleLabels).map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager total={page.total} limit={PAGE} offset={offset} onChange={setOffset} />
          </div>
        )}
      </Loaded>
    </div>
  );
}

export function AdminSessionsPage() {
  const [from, setFrom] = useState(toDateInput(new Date(Date.now() - 30 * 86_400_000)));
  const [to, setTo] = useState(toDateInput(new Date()));
  const [trainingId, setTrainingId] = useState('');
  const [offset, setOffset] = useState(0);
  const trainings = useResource(() => api.studio(), []);
  const sessions = useResource(
    () =>
      api.adminSessions({
        from: new Date(`${from}T00:00:00`).toISOString(),
        to: new Date(new Date(`${to}T00:00:00`).getTime() + 86_400_000).toISOString(),
        trainingId,
        limit: PAGE,
        offset,
      }),
    [from, to, trainingId, offset],
  );

  return (
    <div className="stack-lg">
      <PageHeader eyebrow="Administração" title="Sessões" description="Todas as sessões registradas, de qualquer jogador." />
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
            <option value="">Todos</option>
            {(trainings.data ?? []).map((training) => (
              <option key={training.id} value={training.id}>
                {training.draft.title} ({statusLabels[training.status]})
              </option>
            ))}
          </select>
        </label>
      </div>
      <Loaded resource={sessions}>
        {(page) => (
          <div className="stack">
            <SessionTable sessions={page.items} showPlayer />
            <Pager total={page.total} limit={PAGE} offset={offset} onChange={setOffset} />
          </div>
        )}
      </Loaded>
    </div>
  );
}

export function AdminDevicesPage() {
  const devices = useResource(() => api.adminDevices(), []);

  return (
    <div className="stack-lg">
      <PageHeader eyebrow="Administração" title="Dispositivos" description="Paredes e simuladores que já registraram sessões, com quedas, falhas e paradas." />
      <Loaded resource={devices}>
        {(items) =>
          items.length === 0 ? (
            <div className="card"><EmptyState title="Nenhum dispositivo registrou sessões ainda." /></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Dispositivo</th>
                    <th>Tipo</th>
                    <th className="num">Sessões</th>
                    <th className="num">Jogadores</th>
                    <th className="num">Quedas</th>
                    <th className="num">Falhas</th>
                    <th className="num">Paradas</th>
                    <th>Visto por último</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((device) => (
                    <tr key={`${device.deviceId}-${device.deviceKind}`}>
                      <td><strong>{device.deviceId}</strong></td>
                      <td>{device.deviceKind === 'websocket' ? 'Parede (WebSocket)' : 'Simulador do app'}</td>
                      <td className="num">{formatNumber(device.sessions)}</td>
                      <td className="num">{formatNumber(device.players)}</td>
                      <td className="num">{formatNumber(device.deviceLosses)}</td>
                      <td className="num">{formatNumber(device.faults)}</td>
                      <td className="num">{formatNumber(device.emergencyStops)}</td>
                      <td>{formatDateTime(device.lastSeenAt)}</td>
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

function describe(event: AuditEvent): string {
  const details = event.details;
  if (event.action === 'user.role_changed') {
    return `${roleLabels[details.from as UserRole] ?? details.from} → ${roleLabels[details.to as UserRole] ?? details.to}`;
  }
  if (event.action === 'training.published') {
    return `versão ${String(details.version)}${details.changeNote ? ` — ${String(details.changeNote)}` : ''}`;
  }
  if (event.action === 'session.emergency_stop') {
    return String(details.reason ?? 'sem motivo informado');
  }
  if (typeof details.path === 'string') {
    return `${String(details.method)} ${details.path} → ${String(details.status)}${details.email ? ` · ${String(details.email)}` : ''}`;
  }
  return details.title ? String(details.title) : '';
}

export function AdminAuditPage() {
  const [action, setAction] = useState('');
  const events = useResource(() => api.adminAudit({ action, limit: 100 }), [action]);

  return (
    <div className="stack-lg">
      <PageHeader eyebrow="Administração" title="Auditoria" description="Autenticação, publicações, mudanças de papel, paradas de emergência e requisições recusadas." />
      <div className="card filters" style={{ marginBottom: 0 }}>
        <label className="field">
          <span>Evento</span>
          <select className="select" value={action} onChange={(event) => setAction(event.target.value)}>
            <option value="">Todos</option>
            {Object.entries(auditLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>
      <Loaded resource={events}>
        {(items) =>
          items.length === 0 ? (
            <div className="card"><EmptyState title="Nenhum evento registrado." /></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Quando</th>
                    <th>Evento</th>
                    <th>Quem</th>
                    <th>Detalhe</th>
                    <th>Origem</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((event) => (
                    <tr key={event.id}>
                      <td className="small">{formatDateTime(event.at)}</td>
                      <td>
                        <span className={event.outcome === 'failure' ? 'badge badge-danger' : 'badge'}>{auditLabels[event.action] ?? event.action}</span>
                      </td>
                      <td className="small">{event.actorName ?? '—'}</td>
                      <td className="small">
                        {event.targetType === 'training' && event.targetId ? <Link to={`/estudio/${event.targetId}`}>treino</Link> : null}
                        {event.targetType === 'session' && event.targetId ? <Link to={`/sessoes/${event.targetId}`}>sessão</Link> : null}{' '}
                        {describe(event)}
                      </td>
                      <td className="small muted">{event.ip ?? '—'}</td>
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
