import { expect, test } from '@playwright/test';
import { openBoard } from './fixtures/board';

const TOOLS = [
  'select',
  'hand',
  'pen',
  'eraser',
  'text',
  'geo',
  'arrow',
  'frame',
  'sticker',
  'emoji',
  'asset',
] as const;

test.describe('Доска — инструменты', () => {
  test('показывает основные инструменты тулбара', async ({ page }) => {
    await openBoard(page);

    for (const tool of TOOLS) {
      await expect(page.locator(`[data-board-tool="${tool}"]`).first()).toBeVisible();
    }
  });

  test('переключает инструменты и помечает активный', async ({ page }) => {
    await openBoard(page);

    await page.locator('[data-board-tool="hand"]').first().click();
    await expect(page.locator('[data-board-tool="hand"]').first()).toHaveAttribute(
      'data-isactive',
      'true',
    );

    await page.locator('[data-board-tool="select"]').first().click();
    await expect(page.locator('[data-board-tool="select"]').first()).toHaveAttribute(
      'data-isactive',
      'true',
    );
  });

  test('включает перо и показывает канвас для рисования', async ({ page }) => {
    await openBoard(page);

    await page.locator('[data-board-tool="pen"]').first().click();
    await expect(page.locator('[data-board-tool="pen"]').first()).toHaveAttribute(
      'data-isactive',
      'true',
    );
    await expect(page.locator('.dr-canvas').first()).toBeVisible();
  });

  test('ставит текстовый инструмент', async ({ page }) => {
    await openBoard(page);

    await page.locator('[data-board-tool="text"]').first().click();
    await expect(page.locator('[data-board-tool="text"]').first()).toHaveAttribute(
      'data-isactive',
      'true',
    );
  });

  test('открывает оси координат из меню ещё', async ({ page }) => {
    await openBoard(page);

    await page.locator('[data-board-tool="more-menu"]').locator('visible=true').click();
    await page.getByRole('menuitem', { name: 'Оси координат' }).click();
    await expect(page.getByRole('menuitem', { name: 'Оси координат' })).toBeHidden();
  });
});
