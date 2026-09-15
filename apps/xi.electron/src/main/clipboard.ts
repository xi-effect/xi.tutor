import { clipboard } from 'electron';

export function writeClipboardText(text: string): void {
  clipboard.writeText(text);
}

export function readClipboardText(): string {
  return clipboard.readText();
}

export function writeClipboardHtml(html: string, text: string): void {
  clipboard.write({
    html,
    text: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
  });
}

export function readClipboardHtml(): string {
  return clipboard.readHTML();
}
