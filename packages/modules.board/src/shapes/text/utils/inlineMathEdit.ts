export type InlineMathEditRequest = {
  pos: number;
  latex: string;
};

const listeners = new Set<(request: InlineMathEditRequest) => void>();

export function subscribeInlineMathEdit(listener: (request: InlineMathEditRequest) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function requestInlineMathEdit(request: InlineMathEditRequest) {
  listeners.forEach((listener) => listener(request));
}
