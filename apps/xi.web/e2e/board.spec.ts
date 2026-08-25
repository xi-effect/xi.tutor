import { expect, test } from '@playwright/test';
import { E2E_BOARD, openBoard } from './fixtures/board';

test.describe('Доска — открытие и шапка', () => {
  test('открывает канвас и название материала', async ({ page }) => {
    await openBoard(page);

    await expect(page.locator('[data-testid="board-canvas"]')).toBeVisible();
    await expect(page.locator('#whiteboard-container')).toBeVisible();
    await expect(page.getByText(E2E_BOARD.name)).toBeVisible();
    await expect(page.locator('[data-board-toolbar-ui]')).toBeVisible();
  });

  test('открывает ленту комментариев', async ({ page }) => {
    await openBoard(page);

    await page.locator('[data-umami-event="board-comments-feed"]').click();
    await expect(page.getByText('Комментарии на доске')).toBeVisible();
    await expect(page.getByText('Пока нет комментариев')).toBeVisible();
  });

  test('открывает таймер', async ({ page }) => {
    await openBoard(page);

    await page.locator('[data-umami-event="board-timer-menu"]').click();
    await expect(page.locator('[data-umami-event="board-timer-play"]')).toBeVisible();
    await expect(page.locator('[data-umami-event="board-timer-reset"]')).toBeVisible();
  });

  test('переключает режим фокуса', async ({ page }) => {
    await openBoard(page);

    const toggle = page.locator('[data-umami-event="board-toggle-focus-mode"]');
    await toggle.click();
    await expect(toggle).toHaveAttribute('data-umami-event-state', 'exit');
    await toggle.click();
    await expect(toggle).toHaveAttribute('data-umami-event-state', 'enter');
  });
});
