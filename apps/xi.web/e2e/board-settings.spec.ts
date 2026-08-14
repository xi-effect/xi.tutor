import { expect, test } from '@playwright/test';
import { openBoard } from './fixtures/board';

test.describe('Доска — настройки', () => {
  test('открывает меню настроек и горячие клавиши', async ({ page }) => {
    await openBoard(page);

    await page.locator('[data-umami-event="board-settings-menu"]').click();
    await expect(page.getByText('Приостановить работу с доской')).toBeVisible();
    await expect(page.getByText('Горячие клавиши')).toBeVisible();
    await expect(page.getByText('Скачать')).toBeVisible();
    await expect(page.getByText('Очистить доску')).toBeVisible();

    await page.locator('[data-umami-event="board-hotkeys-help"]').click();
    await expect(page.getByText('Горячие клавиши').first()).toBeVisible();
    await expect(page.getByText('Инструменты')).toBeVisible();
  });

  test('переключает видимость комментариев', async ({ page }) => {
    await openBoard(page);

    await page.locator('[data-umami-event="board-settings-menu"]').click();
    await page.locator('[data-umami-event="board-comments-toggle-visibility"]').click();

    await page.locator('[data-umami-event="board-settings-menu"]').click();
    await expect(page.getByText('Показать комментарии')).toBeVisible();
  });

  test('меняет фон доски', async ({ page }) => {
    await openBoard(page);

    await page.locator('[data-umami-event="board-settings-menu"]').click();
    await page.getByText('Тип фона').hover();
    await expect(page.locator('[data-umami-event-type="grid"]')).toBeVisible();
    await page.locator('[data-umami-event-type="grid"]').click({ force: true });

    await page.locator('[data-umami-event="board-settings-menu"]').click();
    await page.getByText('Цвет фона').hover();
    await expect(page.locator('[data-umami-event-color="cream"]')).toBeVisible();
    await page.locator('[data-umami-event-color="cream"]').click({ force: true });
  });

  test('ставит доску на паузу', async ({ page }) => {
    await openBoard(page);

    await page.locator('[data-umami-event="board-settings-menu"]').click();
    await page.locator('[data-umami-event="board-toggle-lock"]').click();

    await page.locator('[data-umami-event="board-settings-menu"]').click();
    await expect(page.getByText('Возобновить работу с доской')).toBeVisible();
  });
});
