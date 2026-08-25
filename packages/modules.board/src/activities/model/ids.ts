import { nanoid } from 'nanoid';

export function createActivityId(): string {
  return nanoid(8);
}
