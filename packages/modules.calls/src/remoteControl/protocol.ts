import type { RemoteInput } from 'common.platform';

/**
 * Remote-control messages over the LiveKit data channel.
 *
 * The sharer (Electron only) announces `state` to everyone; a viewer asks with
 * `request`, gets `deny` or a `state` naming them as controller, then streams
 * `input` to the sharer only. `release` hands control back.
 */
export const REMOTE_CONTROL_TOPIC = 'sovlium.remote-control';

export type RemoteControlMessage =
  | { type: 'state'; available: boolean; controller: string | null }
  | { type: 'request' }
  | { type: 'deny' }
  | { type: 'release' }
  | { type: 'input'; input: RemoteInput };

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function encodeRemoteControl(message: RemoteControlMessage): Uint8Array {
  return encoder.encode(JSON.stringify(message));
}

export function decodeRemoteControl(payload: Uint8Array): RemoteControlMessage | null {
  try {
    const value = JSON.parse(decoder.decode(payload)) as { type?: unknown } | null;
    if (!value || typeof value !== 'object') return null;
    switch (value.type) {
      case 'state':
      case 'request':
      case 'deny':
      case 'release':
      case 'input':
        return value as RemoteControlMessage;
      default:
        return null;
    }
  } catch {
    return null;
  }
}
