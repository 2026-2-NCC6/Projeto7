import type { DeviceConnectionStatus } from '../../device/contracts';
import { colorLevels } from '../modes/color/color-levels';
import { colorRules, type ColorRoundState } from '../modes/color/color-rules';
import { applyInput, startSession, type GameInput, type GameSession } from './game-session';

const config = colorLevels[0];

function start(deviceStatus: DeviceConnectionStatus): GameSession<ColorRoundState> {
  return startSession({ rules: colorRules, config, random: () => 0, deviceStatus, startedAt: 0 });
}

function wall(status: DeviceConnectionStatus): GameInput {
  return { kind: 'deviceEvent', event: { kind: 'status', status, deviceId: 'smash-wall', at: 0 } };
}

function play(session: GameSession<ColorRoundState>, ...inputs: GameInput[]) {
  return inputs.reduce((current, input) => applyInput(current, input, colorRules, config), session);
}

describe('game session — pause and wall connection', () => {
  it('drops to wall lost and counts down again when the wall returns mid-level', () => {
    const session = play(start('connected'), wall('lost'));
    expect(session.phase.kind).toBe('deviceLost');

    expect(play(session, wall('connected')).phase).toEqual({ kind: 'preparing', remainingMs: 3000 });
  });

  it('stays paused while the wall drops and returns with the app in the background', () => {
    const session = play(start('connected'), { kind: 'pause' }, wall('lost'), wall('connected'));

    expect(session.phase.kind).toBe('paused');
    expect(session.deviceStatus).toBe('connected');
    expect(play(session, { kind: 'resume' }).phase.kind).toBe('preparing');
  });

  it('resumes into wall lost when the wall is still gone', () => {
    const session = play(start('connected'), { kind: 'pause' }, wall('lost'), { kind: 'resume' });

    expect(session.phase.kind).toBe('deviceLost');
    expect(play(session, wall('connected')).phase.kind).toBe('preparing');
  });

  it('pauses a level that is waiting for the wall when the app leaves', () => {
    const session = play(start('disconnected'), { kind: 'pause' }, wall('connected'));

    expect(session.phase.kind).toBe('paused');
    expect(play(session, { kind: 'resume' }).phase.kind).toBe('preparing');
  });
});

describe('game session — emergency stop', () => {
  it('ends a level in any live phase and ignores hits and ticks afterwards', () => {
    const stopped = play(start('connected'), { kind: 'emergencyStop' });

    expect(stopped.phase).toEqual({ kind: 'levelFailed', reason: 'emergencyStop' });
    expect(play(stopped, { kind: 'tick', deltaMs: 5000 }, { kind: 'resume' })).toBe(stopped);
  });

  it('stops a paused level or one waiting for the wall', () => {
    expect(play(start('connected'), { kind: 'pause' }, { kind: 'emergencyStop' }).phase).toEqual({
      kind: 'levelFailed',
      reason: 'emergencyStop',
    });
    expect(play(start('lost'), { kind: 'emergencyStop' }).phase.kind).toBe('levelFailed');
  });
});

describe('game session — interruptions', () => {
  it('counts each pause, each wall drop and each wall fault', () => {
    const fault: GameInput = {
      kind: 'deviceEvent',
      event: { kind: 'fault', code: 'malformedMessage', detail: '', at: 0 },
    };
    const session = play(
      start('connected'),
      { kind: 'pause' },
      { kind: 'resume' },
      wall('lost'),
      wall('lost'),
      wall('connected'),
      fault,
    );

    expect(session.interruptions).toEqual({ pauses: 1, deviceLosses: 1, faults: 1 });
  });
});
