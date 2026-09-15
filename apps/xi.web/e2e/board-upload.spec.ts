import { expect, test, type Page } from '@playwright/test';
import { mockContentFileUploads, openBoard } from './fixtures/board';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

async function pickBoardFile(page: Page, file: { name: string; mimeType: string; buffer: Buffer }) {
  await page.locator('[data-board-tool="asset"]').first().click();
  const chooserPromise = page.waitForEvent('filechooser');
  await page.locator('[data-umami-event="board-asset-from-computer"]').click();
  const chooser = await chooserPromise;
  await chooser.setFiles(file);
}

test.describe('Доска — загрузка файлов', () => {
  test('отправляет png на generic POST /content-service/files/', async ({ page }) => {
    await openBoard(page);
    const uploaded = await mockContentFileUploads(page);

    const kindSpecific: string[] = [];
    await page.route('**/file-kinds/**/files/', async (route) => {
      if (route.request().method() === 'POST') {
        kindSpecific.push(route.request().url());
      }
      await route.fallback();
    });

    await pickBoardFile(page, {
      name: 'photo.png',
      mimeType: 'image/png',
      buffer: PNG_1X1,
    });

    await expect.poll(() => uploaded.length).toBeGreaterThan(0);
    expect(uploaded[0]?.url).toMatch(/\/content-service\/files\/?(\?.*)?$/);
    expect(uploaded[0]?.url).not.toContain('/file-kinds/');
    expect(kindSpecific).toEqual([]);
  });

  test('отправляет pdf на ту же generic ручку', async ({ page }) => {
    await openBoard(page);
    const uploaded = await mockContentFileUploads(page);

    await pickBoardFile(page, {
      name: 'notes.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.1\ntrailer\n%%EOF\n'),
    });

    await expect.poll(() => uploaded.length).toBeGreaterThan(0);
    expect(uploaded[0]?.url).toContain('/content-service/files/');
  });

  test('отправляет pptx с octet-stream на generic ручку', async ({ page }) => {
    await openBoard(page);
    const uploaded = await mockContentFileUploads(page);

    await pickBoardFile(page, {
      name: 'deck.pptx',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('PK\u0003\u0004'),
    });

    await expect.poll(() => uploaded.length).toBeGreaterThan(0);
    expect(uploaded[0]?.url).toContain('/content-service/files/');
  });
});
