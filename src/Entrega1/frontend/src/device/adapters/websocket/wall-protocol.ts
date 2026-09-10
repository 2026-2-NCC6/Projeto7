/**
 * The wire format between the ESP32 and the app. An impact frame is the
 * `Impacto` contract and carries no `tipo`, so it validates against the same zod
 * schema the simulator uses; everything else is a tagged control frame.
 */
export const WALL_PROTOCOL_VERSION = 1;

export type WallFrameKind = 'hello' | 'status' | 'erro';

export interface WallControlFrame {
  readonly tipo: WallFrameKind;
  readonly [field: string]: unknown;
}

export interface WallCommand {
  readonly cmd: 'session' | 'ping';
  readonly [field: string]: unknown;
}

/** Control frames are tagged; an untagged frame is an impact. */
export function controlFrameOf(message: unknown): WallControlFrame | null {
  if (typeof message !== 'object' || message === null) {
    return null;
  }

  const tipo = (message as { tipo?: unknown }).tipo;

  return typeof tipo === 'string' ? (message as WallControlFrame) : null;
}

export function sessionCommand(sessao: string): string {
  return JSON.stringify({ cmd: 'session', sessao });
}
