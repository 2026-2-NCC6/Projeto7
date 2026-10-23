import { parseDeviceMessage } from './parse-device-message';

const context = { deviceId: 'smash-wall', simulatedImpact: false, receivedAt: 1_000 };
const impacto = { alvo: 6, linha: 2, coluna: 3, intensidade: 1873, t_ms: 41_230, sessao: 'app-1' };

describe('parseDeviceMessage', () => {
  it('turns a wall impact into a target hit', () => {
    expect(parseDeviceMessage(impacto, context)).toMatchObject({
      kind: 'targetHit',
      targetId: 6,
      row: 2,
      column: 3,
      impact: { raw: 1873, simulated: false },
    });
  });

  it.each([
    ['a target beyond the six on the wall', { ...impacto, alvo: 7 }],
    ['a third row', { ...impacto, linha: 3 }],
  ])('rejects %s', (_, message) => {
    expect(parseDeviceMessage(message, context)).toMatchObject({ kind: 'fault', code: 'malformedMessage' });
  });
});
