const readJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

const readGzipJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }

  // If CDN/server decoded Content-Encoding already, JSON can be read directly.
  if (response.headers.get('content-encoding')?.includes('gzip')) {
    return response.json() as Promise<T>;
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  const isGzip = bytes[0] === 0x1f && bytes[1] === 0x8b;
  if (!isGzip) {
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  }

  if (!('DecompressionStream' in globalThis)) {
    throw new Error(
      'DecompressionStream is unavailable. Serve .gz with Content-Encoding: gzip or add a decoder fallback.',
    );
  }

  const body = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return JSON.parse(await new Response(body).text()) as T;
};

export { readGzipJson, readJson };
