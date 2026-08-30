import { readHtml, writeHtmlAndText } from 'common.platform';

export async function writeClipboardHtmlAndText(html: string, plain: string) {
  try {
    await writeHtmlAndText(html, plain);
  } catch (error) {
    console.error('Failed to write clipboard:', error);
  }
}

export async function readClipboardHtml(): Promise<string> {
  try {
    return await readHtml();
  } catch (error) {
    console.error('Failed to read clipboard:', error);
    return '';
  }
}
