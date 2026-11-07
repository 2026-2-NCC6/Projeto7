import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Audience, Difficulty, Objective, TargetColor } from '../api/types';
import { ColorDots, EmptyState, Loaded } from '../components/ui';
import { formatNumber, formatPrice } from '../content/format';
import {
  audienceLabels,
  colorLabels,
  difficultyLabels,
  objectiveLabels,
  optionsOf,
  pricingLabels,
} from '../content/labels';
import { useResource } from '../hooks/useResource';

interface Filters {
  search: string;
  audience: Audience | '';
  objective: Objective | '';
  difficulty: Difficulty | '';
  maxMinutes: string;
  color: TargetColor | '';
}

const EMPTY: Filters = { search: '', audience: '', objective: '', difficulty: '', maxMinutes: '', color: '' };

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | '';
  options: { value: T; label: string }[];
  onChange: (value: T | '') => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select className="select" value={value} onChange={(event) => onChange(event.target.value as T | '')}>
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const HERO_COLORS: TargetColor[] = ['amber', 'blue', 'red', 'red', 'amber', 'blue'];

export function CatalogPage() {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const catalog = useResource(
    () =>
      api.catalog({
        search: filters.search,
        audience: filters.audience,
        objective: filters.objective,
        difficulty: filters.difficulty,
        maxMinutes: filters.maxMinutes,
        color: filters.color,
      }),
    [filters],
  );

  return (
    <div className="stack-lg">
      <section className="hero">
        <div className="stack">
          <span className="eyebrow">Smash · parede instrumentada</span>
          <h1>Treinos de tênis que respondem a cada batida.</h1>
          <p className="muted">
            Seis alvos com sensores piezoelétricos, um ESP32 e o aplicativo no celular. Escolha um treino
            publicado por um treinador, conecte a parede e jogue: cada acerto, erro e intensidade fica
            registrado.
          </p>
          <div className="row">
            <a className="btn btn-secondary" href="#catalogo">
              Ver treinos
            </a>
            <Link className="btn btn-ghost" to="/cadastro" style={{ color: '#0f1216' }}>
              Criar conta
            </Link>
          </div>
        </div>
        <div className="hero-wall" aria-hidden="true">
          {HERO_COLORS.map((color, index) => (
            <span key={index} style={{ background: `var(--${color})` }} />
          ))}
        </div>
      </section>

      <section id="catalogo" className="stack">
        <div className="row-between">
          <h2>Catálogo de treinos</h2>
          {catalog.data ? <span className="muted small">{catalog.data.length} treino(s)</span> : null}
        </div>

        <div className="filters">
          <label className="field">
            <span>Buscar</span>
            <input
              className="input"
              type="search"
              placeholder="Nome ou descrição"
              value={filters.search}
              onChange={(event) => set('search', event.target.value)}
            />
          </label>
          <Select label="Público" value={filters.audience} options={optionsOf(audienceLabels)} onChange={(value) => set('audience', value)} />
          <Select label="Objetivo" value={filters.objective} options={optionsOf(objectiveLabels)} onChange={(value) => set('objective', value)} />
          <Select label="Dificuldade" value={filters.difficulty} options={optionsOf(difficultyLabels)} onChange={(value) => set('difficulty', value)} />
          <Select
            label="Duração máxima"
            value={filters.maxMinutes}
            options={[
              { value: '10', label: 'Até 10 min' },
              { value: '20', label: 'Até 20 min' },
              { value: '40', label: 'Até 40 min' },
            ]}
            onChange={(value) => set('maxMinutes', value)}
          />
          <Select label="Alvos usados" value={filters.color} options={optionsOf(colorLabels)} onChange={(value) => set('color', value)} />
        </div>

        <Loaded resource={catalog}>
          {(trainings) =>
            trainings.length === 0 ? (
              <div className="card">
                <EmptyState title="Nenhum treino com esses filtros.">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setFilters(EMPTY)}>
                    Limpar filtros
                  </button>
                </EmptyState>
              </div>
            ) : (
              <div className="grid">
                {trainings.map((training) => (
                  <Link key={training.id} to={`/treinos/${training.id}`} className="card training-card">
                    <div className="row-between">
                      <span className="badge badge-accent">{audienceLabels[training.audience]}</span>
                      <span className="badge">{difficultyLabels[training.difficulty]}</span>
                    </div>
                    <h3>{training.title}</h3>
                    <p className="muted small">{training.summary}</p>
                    <div className="row small muted">
                      <span>{objectiveLabels[training.objective]}</span>
                      <span>·</span>
                      <span>{training.estimatedMinutes} min</span>
                      <span>·</span>
                      <span>{training.stepCount} etapa(s)</span>
                    </div>
                    <div className="row-between small">
                      <ColorDots colors={training.targetColors} />
                      <span className="muted">
                        {training.pricingModel === 'free'
                          ? pricingLabels.free
                          : `${pricingLabels[training.pricingModel]} · ${formatPrice(training.priceCents)}`}
                      </span>
                    </div>
                    <div className="row-between small muted">
                      <span>por {training.authorName}</span>
                      <span>{formatNumber(training.sessions)} sessões · v{training.version}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )
          }
        </Loaded>
      </section>
    </div>
  );
}
