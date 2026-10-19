export type EmbedProviderId =
  | 'youtube'
  | 'rutube'
  | 'vk'
  | 'figma'
  | 'google-docs'
  | 'google-maps'
  | 'miro'
  | 'codepen'
  | 'yandex-docs';

export type EmbedErrorCode =
  | 'empty'
  | 'too_long'
  | 'invalid_url'
  | 'insecure_protocol'
  | 'forbidden_url_parts'
  | 'unsupported_markup'
  | 'unsupported_host'
  | 'unsupported_link';

export interface ResolvedEmbed {
  provider: EmbedProviderId;
  label: string;
  src: string;
  openUrl: string;
  allow: string;
  w: number;
  h: number;
}

export type EmbedParseResult =
  { ok: true; embed: ResolvedEmbed } | { ok: false; error: EmbedErrorCode };

export type ProviderResult = { src: string; openUrl?: string; w: number; h: number };

export interface ProviderDef {
  id: EmbedProviderId;
  label: string;
  hosts: readonly string[];
  allow: string;
  resolve: (u: URL, parts: string[]) => ProviderResult | null;
}
