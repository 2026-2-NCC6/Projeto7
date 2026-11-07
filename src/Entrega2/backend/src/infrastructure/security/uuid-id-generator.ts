import { randomUUID } from 'node:crypto';
import { IdGenerator } from '../../application/ports/id-generator.port';

export class UuidIdGenerator implements IdGenerator {
  generate(): string {
    return randomUUID();
  }
}
