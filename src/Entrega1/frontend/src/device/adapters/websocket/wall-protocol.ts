import type { WallFeedback } from '../../contracts/target-device';
import { TARGET_IDS } from '../../contracts/target';

/**
 * The wire format between the ESP32 and the app. An impact frame is the
 * `Impacto` contract and carries no `tipo`, so it validates against the same zod
 * schema the simulator uses; everything else is a tagged control frame.
 *
 * Version 2 is the 3×2 wall: `alvo` 1..6, `linha` 1..2, `coluna` 1..3.
 */
export const WALL_PROTOCOL_VERSION = 2;

export type WallFrameKind = 'hello' | 'status' | 'erro';

export interface WallControlFrame {
  readonly tipo: WallFrameKind;
  readonly [field: string]: unknown;
}

export interface WallCommand {
  readonly cmd: 'session' | 'ping' | 'feedback';
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

/**
 * Why a `hello` frame describes a wall this app cannot play on, or null when it
 * matches. Catches a board still running firmware built for another layout.
 */
export function helloMismatch(frame: WallControlFrame): string | null {
  if (frame.protocolo !== WALL_PROTOCOL_VERSION) {
    return `protocolo ${String(frame.protocolo)}, esperado ${WALL_PROTOCOL_VERSION}`;
  }

  if (frame.alvos !== TARGET_IDS.length) {
    return `${String(frame.alvos)} alvos, esperado ${TARGET_IDS.length}`;
  }

  return null;
}

export function sessionCommand(sessao: string): string {
  return JSON.stringify({ cmd: 'session', sessao });
}

const FEEDBACK_RESULT: Record<WallFeedback, string> = {
  hit: 'acerto',
  miss: 'erro',
  levelCleared: 'nivel_concluido',
  levelFailed: 'nivel_falhou',
};

export function feedbackCommand(feedback: WallFeedback): string {
  return JSON.stringify({ cmd: 'feedback', resultado: FEEDBACK_RESULT[feedback] });
}
