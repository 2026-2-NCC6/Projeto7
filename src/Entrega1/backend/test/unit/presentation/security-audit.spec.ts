import {
  AuditedRequest,
  auditEntryFor,
  maskEmail,
} from '../../../src/presentation/http/security-audit';

const request = (overrides: Partial<AuditedRequest>): AuditedRequest => ({
  method: 'GET',
  path: '/me/home',
  status: 200,
  ip: '10.0.0.7',
  userId: undefined,
  email: undefined,
  ...overrides,
});

describe('security audit', () => {
  it('records a failed sign-in with a masked e-mail and nothing from the password', () => {
    const entry = auditEntryFor(
      request({
        method: 'POST',
        path: '/auth/sign-in',
        status: 401,
        email: 'Ana.Souza@smash.test',
      }),
    );

    expect(entry).toEqual({
      event: 'auth.sign_in',
      outcome: 'failure',
      status: 401,
      method: 'POST',
      path: '/auth/sign-in',
      ip: '10.0.0.7',
      email: 'a***@smash.test',
    });
    expect(JSON.stringify(entry)).not.toContain('Souza');
  });

  it('records a successful sign-up', () => {
    expect(
      auditEntryFor(request({ method: 'POST', path: '/auth/sign-up', status: 201 })),
    ).toMatchObject({ event: 'auth.sign_up', outcome: 'success' });
  });

  it.each([400, 401, 403, 409, 429])('records a %i on any other route as refused', (status) => {
    expect(auditEntryFor(request({ status, userId: 'u-1' }))).toMatchObject({
      event: 'request.refused',
      outcome: 'failure',
      userId: 'u-1',
    });
  });

  it('records server errors', () => {
    expect(auditEntryFor(request({ status: 500 }))?.event).toBe('request.failed');
  });

  it('stays quiet for ordinary traffic', () => {
    expect(auditEntryFor(request({ status: 200 }))).toBeNull();
    expect(auditEntryFor(request({ status: 404 }))).toBeNull();
  });

  it('never writes an e-mail it cannot mask', () => {
    expect(maskEmail('sem-arroba')).toBeUndefined();
    expect(maskEmail(42)).toBeUndefined();
  });
});
