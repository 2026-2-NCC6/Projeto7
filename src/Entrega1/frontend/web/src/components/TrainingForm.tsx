import { useState } from 'react';
import type { StreakMultiplier } from '@app/gameplay/modes/shared/scoring';
import type { TargetColor, TrainingContent, TrainingStep } from '../api/types';
import {
  audienceLabels,
  categoryLabels,
  colorLabels,
  difficultyLabels,
  licenseLabels,
  objectiveLabels,
  optionsOf,
  pricingLabels,
  stepModeLabels,
} from '../content/labels';

const COLORS: TargetColor[] = ['amber', 'blue', 'red'];

export function colorStep(): TrainingStep {
  return {
    title: 'Sequência de cores',
    mode: 'level_color',
    config: { sequenceLength: 5, palette: ['amber', 'blue', 'red'], reactionWindowMs: null, maxMistakes: null, pointsPerHit: 10, recoveryMs: 800 },
  };
}

export function scoreStep(): TrainingStep {
  return {
    title: 'Corrida de pontos',
    mode: 'level_score',
    config: {
      targetScore: 200,
      timeLimitMs: 90000,
      pointsPerColor: { amber: 10, blue: 20, red: 30 },
      palette: ['amber', 'blue', 'red'],
      streakMultiplier: null,
      missPenalty: 0,
      requiredAccuracyPercent: null,
      recoveryMs: 120,
    },
  };
}

export function emptyContent(): TrainingContent {
  return {
    title: '',
    summary: '',
    audience: 'adults',
    objective: 'precision',
    difficulty: 'beginner',
    estimatedMinutes: 10,
    instructions: '',
    scoringRules: '',
    equipment: ['Raquete', 'Bolas'],
    risks: ['Rebote da bola'],
    steps: [colorStep()],
    marketplace: {
      category: 'precision',
      commercialDescription: '',
      license: 'free',
      pricingModel: 'free',
      priceCents: null,
      compatibility: ['Parede Smash 3x2 (protocolo v2)'],
    },
  };
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input className="input" type="number" value={Number.isFinite(value) ? value : ''} min={min} max={max} step={step} disabled={disabled} onChange={(event) => onChange(event.target.valueAsNumber)} />
    </label>
  );
}

function OptionalNumber({
  label,
  value,
  onChange,
  fallback,
  unit,
  min,
  max,
  scale = 1,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  fallback: number;
  unit: string;
  min?: number;
  max?: number;
  scale?: number;
}) {
  return (
    <div className="field">
      <span>{label}</span>
      <div className="row" style={{ flexWrap: 'nowrap' }}>
        <label className="check small">
          <input type="checkbox" checked={value !== null} onChange={(event) => onChange(event.target.checked ? fallback : null)} />
          Limitar
        </label>
        <input
          className="input"
          type="number"
          aria-label={`${label} em ${unit}`}
          disabled={value === null}
          min={min}
          max={max}
          value={value === null ? '' : value / scale}
          onChange={(event) => onChange(event.target.valueAsNumber * scale)}
        />
        <span className="small muted">{unit}</span>
      </div>
    </div>
  );
}

function PaletteField({ palette, onChange }: { palette: readonly TargetColor[]; onChange: (palette: TargetColor[]) => void }) {
  return (
    <div className="field">
      <span>Cores usadas</span>
      <div className="chips">
        {COLORS.map((color) => {
          const active = palette.includes(color);
          return (
            <button
              key={color}
              type="button"
              className="chip row"
              style={{ gap: 6 }}
              aria-pressed={active}
              onClick={() => onChange(active ? palette.filter((item) => item !== color) : COLORS.filter((item) => item === color || palette.includes(item)))}
            >
              <span className={`color-dot ${color}`} />
              {colorLabels[color]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepEditor({ step, onChange }: { step: TrainingStep; onChange: (step: TrainingStep) => void }) {
  if (step.mode === 'level_color') {
    const config = step.config;
    const set = (changes: Partial<typeof config>) => onChange({ ...step, config: { ...config, ...changes } });
    return (
      <div className="stack">
        <PaletteField palette={config.palette} onChange={(palette) => set({ palette })} />
        <div className="form-grid">
          <NumberField label="Acertos seguidos para concluir" value={config.sequenceLength} min={1} max={50} onChange={(sequenceLength) => set({ sequenceLength })} />
          <NumberField label="Pontos por acerto (até 50)" value={config.pointsPerHit} min={1} max={50} onChange={(pointsPerHit) => set({ pointsPerHit })} />
          <NumberField label="Descanso entre batidas (ms)" value={config.recoveryMs} min={80} max={3000} step={10} onChange={(recoveryMs) => set({ recoveryMs })} />
          <OptionalNumber label="Tempo por cor" value={config.reactionWindowMs} fallback={4000} unit="s" min={0.5} max={30} scale={1000} onChange={(reactionWindowMs) => set({ reactionWindowMs })} />
          <OptionalNumber label="Erros permitidos" value={config.maxMistakes} fallback={5} unit="erros" min={1} max={50} onChange={(maxMistakes) => set({ maxMistakes })} />
        </div>
      </div>
    );
  }

  const config = step.config;
  const set = (changes: Partial<typeof config>) => onChange({ ...step, config: { ...config, ...changes } });
  return (
    <div className="stack">
      <PaletteField palette={config.palette} onChange={(palette) => set({ palette })} />
      <div className="form-grid">
        <NumberField label="Meta de pontos" value={config.targetScore} min={10} max={100000} onChange={(targetScore) => set({ targetScore })} />
        {COLORS.map((color) => (
          <NumberField
            key={color}
            label={`Pontos — ${colorLabels[color]}`}
            value={config.pointsPerColor[color]}
            min={0}
            max={50}
            disabled={!config.palette.includes(color)}
            onChange={(points) => set({ pointsPerColor: { ...config.pointsPerColor, [color]: points } })}
          />
        ))}
        <NumberField label="Penalidade por erro (0 ou negativa)" value={config.missPenalty} min={-50} max={0} onChange={(missPenalty) => set({ missPenalty })} />
        <NumberField label="Descanso entre batidas (ms)" value={config.recoveryMs} min={80} max={3000} step={10} onChange={(recoveryMs) => set({ recoveryMs })} />
        <OptionalNumber label="Tempo da etapa" value={config.timeLimitMs} fallback={90000} unit="s" min={10} max={1800} scale={1000} onChange={(timeLimitMs) => set({ timeLimitMs })} />
        <OptionalNumber label="Precisão mínima" value={config.requiredAccuracyPercent} fallback={60} unit="%" min={1} max={100} onChange={(requiredAccuracyPercent) => set({ requiredAccuracyPercent })} />
      </div>
      <div className="field">
        <label className="check">
          <input
            type="checkbox"
            checked={config.streakMultiplier !== null}
            onChange={(event) => set({ streakMultiplier: event.target.checked ? { every: 5, step: 0.25, max: 2 } : null })}
          />
          Multiplicar pontos em sequência de acertos
        </label>
      </div>
      {config.streakMultiplier ? <StreakFields multiplier={config.streakMultiplier} onChange={(streakMultiplier) => set({ streakMultiplier })} /> : null}
    </div>
  );
}

function StreakFields({ multiplier, onChange }: { multiplier: StreakMultiplier; onChange: (multiplier: StreakMultiplier) => void }) {
  return (
    <div className="form-grid">
      <NumberField label="A cada quantos acertos" value={multiplier.every} min={1} max={20} onChange={(every) => onChange({ ...multiplier, every })} />
      <NumberField label="Aumento por degrau" value={multiplier.step} min={0.05} max={1} step={0.05} onChange={(step) => onChange({ ...multiplier, step })} />
      <NumberField label="Multiplicador máximo (até 3)" value={multiplier.max} min={1} max={3} step={0.25} onChange={(max) => onChange({ ...multiplier, max })} />
    </div>
  );
}

function ListField({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (items: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const value = draft.trim();
    if (value && items.length < 10) {
      onChange([...items, value]);
      setDraft('');
    }
  };

  return (
    <div className="field">
      <span>{label}</span>
      <div className="chips">
        {items.map((item, index) => (
          <span key={`${item}-${index}`} className="badge" style={{ fontSize: '0.8125rem' }}>
            {item}
            <button type="button" className="btn-ghost" style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} aria-label={`Remover ${item}`} onClick={() => onChange(items.filter((_, position) => position !== index))}>
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="row" style={{ flexWrap: 'nowrap' }}>
        <input
          className="input"
          value={draft}
          maxLength={120}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="btn btn-secondary btn-sm" onClick={add}>
          Adicionar
        </button>
      </div>
    </div>
  );
}

function Select<T extends string>({ label, value, labels, onChange }: { label: string; value: T; labels: Record<T, string>; onChange: (value: T) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select className="select" value={value} onChange={(event) => onChange(event.target.value as T)}>
        {optionsOf(labels).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TrainingForm({ content, onChange, disabled }: { content: TrainingContent; onChange: (content: TrainingContent) => void; disabled: boolean }) {
  const set = <K extends keyof TrainingContent>(key: K, value: TrainingContent[K]) => onChange({ ...content, [key]: value });
  const setMarket = <K extends keyof TrainingContent['marketplace']>(key: K, value: TrainingContent['marketplace'][K]) =>
    onChange({ ...content, marketplace: { ...content.marketplace, [key]: value } });
  const setStep = (index: number, step: TrainingStep) => set('steps', content.steps.map((item, position) => (position === index ? step : item)));
  const moveStep = (index: number, delta: number) => {
    const steps = [...content.steps];
    const [moved] = steps.splice(index, 1);
    steps.splice(index + delta, 0, moved);
    set('steps', steps);
  };

  return (
    <fieldset className="stack-lg" disabled={disabled} style={{ border: 'none', padding: 0, margin: 0, minWidth: 0 }}>
      <section className="card stack">
        <h2>Identificação</h2>
        <div className="form-grid">
          <label className="field" style={{ gridColumn: '1 / -1' }}>
            <span>Título</span>
            <input className="input" required minLength={3} maxLength={80} value={content.title} onChange={(event) => set('title', event.target.value)} />
          </label>
          <label className="field" style={{ gridColumn: '1 / -1' }}>
            <span>Resumo (até 280 caracteres)</span>
            <textarea className="textarea" maxLength={280} value={content.summary} onChange={(event) => set('summary', event.target.value)} />
          </label>
          <Select label="Público-alvo" value={content.audience} labels={audienceLabels} onChange={(value) => set('audience', value)} />
          <Select label="Objetivo" value={content.objective} labels={objectiveLabels} onChange={(value) => set('objective', value)} />
          <Select label="Dificuldade" value={content.difficulty} labels={difficultyLabels} onChange={(value) => set('difficulty', value)} />
          <NumberField label="Duração estimada (min)" value={content.estimatedMinutes} min={1} max={180} onChange={(value) => set('estimatedMinutes', value)} />
        </div>
      </section>

      <section className="card stack">
        <h2>Regras e preparação</h2>
        <label className="field">
          <span>Instruções para o praticante</span>
          <textarea className="textarea" maxLength={2000} value={content.instructions} onChange={(event) => set('instructions', event.target.value)} />
        </label>
        <label className="field">
          <span>Critérios de pontuação</span>
          <textarea className="textarea" maxLength={2000} value={content.scoringRules} onChange={(event) => set('scoringRules', event.target.value)} />
        </label>
        <div className="form-grid">
          <ListField label="Equipamentos necessários" items={content.equipment} placeholder="Ex.: raquete infantil" onChange={(value) => set('equipment', value)} />
          <ListField label="Riscos e cuidados" items={content.risks} placeholder="Ex.: piso molhado" onChange={(value) => set('risks', value)} />
        </div>
      </section>

      <section className="card stack">
        <div className="row-between">
          <h2>Sequência de etapas ({content.steps.length}/10)</h2>
          <div className="row">
            <button type="button" className="btn btn-secondary btn-sm" disabled={content.steps.length >= 10} onClick={() => set('steps', [...content.steps, colorStep()])}>
              + Etapa Color
            </button>
            <button type="button" className="btn btn-secondary btn-sm" disabled={content.steps.length >= 10} onClick={() => set('steps', [...content.steps, scoreStep()])}>
              + Etapa Score
            </button>
          </div>
        </div>
        {content.steps.length === 0 ? <p className="muted">Adicione ao menos uma etapa.</p> : null}
        {content.steps.map((step, index) => (
          <div key={index} className="card-flat step-card stack">
            <div className="row-between">
              <span className="eyebrow">
                Etapa {index + 1} · {stepModeLabels[step.mode]}
              </span>
              <div className="row" style={{ gap: 6 }}>
                <button type="button" className="btn btn-ghost btn-sm" disabled={index === 0} onClick={() => moveStep(index, -1)} aria-label="Subir etapa">
                  ↑
                </button>
                <button type="button" className="btn btn-ghost btn-sm" disabled={index === content.steps.length - 1} onClick={() => moveStep(index, 1)} aria-label="Descer etapa">
                  ↓
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => set('steps', content.steps.filter((_, position) => position !== index))}>
                  Remover
                </button>
              </div>
            </div>
            <label className="field">
              <span>Nome da etapa</span>
              <input className="input" required minLength={2} maxLength={80} value={step.title} onChange={(event) => setStep(index, { ...step, title: event.target.value })} />
            </label>
            <StepEditor step={step} onChange={(next) => setStep(index, next)} />
          </div>
        ))}
      </section>

      <section className="card stack">
        <h2>Marketplace</h2>
        <p className="small muted">Metadados para o futuro marketplace. Nenhuma cobrança acontece no MVP.</p>
        <div className="form-grid">
          <Select label="Categoria" value={content.marketplace.category} labels={categoryLabels} onChange={(value) => setMarket('category', value)} />
          <Select label="Licença" value={content.marketplace.license} labels={licenseLabels} onChange={(value) => setMarket('license', value)} />
          <Select
            label="Remuneração"
            value={content.marketplace.pricingModel}
            labels={pricingLabels}
            onChange={(value) => onChange({ ...content, marketplace: { ...content.marketplace, pricingModel: value, priceCents: value === 'free' ? null : content.marketplace.priceCents ?? 990 } })}
          />
          <label className="field">
            <span>Preço (R$)</span>
            <input
              className="input"
              type="number"
              min={0}
              step={0.01}
              disabled={content.marketplace.pricingModel === 'free'}
              value={content.marketplace.priceCents === null ? '' : content.marketplace.priceCents / 100}
              onChange={(event) => setMarket('priceCents', Number.isFinite(event.target.valueAsNumber) ? Math.round(event.target.valueAsNumber * 100) : null)}
            />
          </label>
        </div>
        <label className="field">
          <span>Descrição comercial</span>
          <textarea className="textarea" maxLength={600} value={content.marketplace.commercialDescription} onChange={(event) => setMarket('commercialDescription', event.target.value)} />
        </label>
        <ListField label="Compatibilidade" items={content.marketplace.compatibility} placeholder="Ex.: Parede Smash 3x2" onChange={(value) => setMarket('compatibility', value)} />
      </section>
    </fieldset>
  );
}
