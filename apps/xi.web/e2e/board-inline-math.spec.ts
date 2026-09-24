import { expect, test } from '@playwright/test';
import { openBoard } from './fixtures/board';

test.describe('Доска — формула внутри текста', () => {
  test('вставляет MathLive-формулу в существующий text shape', async ({ page }) => {
    await openBoard(page);

    await page.locator('[data-board-tool="text"]').first().click();
    await page.locator('.dr-canvas').click({ position: { x: 420, y: 260 } });

    const textEditor = page.locator('.ProseMirror').last();
    await expect(textEditor).toBeVisible();
    await textEditor.pressSequentially('Уравнение: ');

    // DefaultRichTextToolbar is portalled outside the canvas viewport in the
    // E2E fixture, so invoke its real button without coordinate-based clicking.
    await page
      .getByRole('button', { name: 'Математика' })
      .evaluate((button: HTMLButtonElement) => button.click());
    const mathField = page.locator('math-field[aria-label="Редактор математической формулы"]');
    await expect(mathField).toBeVisible();
    const fieldBox = await mathField.boundingBox();
    expect(fieldBox?.y).toBeGreaterThanOrEqual(0);
    expect((fieldBox?.y ?? 0) + (fieldBox?.height ?? 0)).toBeLessThanOrEqual(
      await page.evaluate(() => innerHeight),
    );
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.tagName))
      .toBe('MATH-FIELD');
    for (const key of ['KeyX', 'Shift+Digit6', 'Digit2', 'Shift+Equal', 'Digit1']) {
      await page.keyboard.press(key);
    }
    await expect
      .poll(() => mathField.evaluate((node) => (node as { value?: string }).value ?? ''))
      .toMatch(/x\^\{?2/);

    await page
      .getByRole('button', { name: 'Применить', exact: true })
      .evaluate((button: HTMLButtonElement) => button.click());
    const inlineMath = page.locator('[data-type="inline-math"]').last();
    await expect(inlineMath).toHaveAttribute('data-latex', /x\^\{?2/);
    await expect(page.locator('.dr-shape[data-shape-type="math"]')).toHaveCount(0);
  });

  test('преобразует $...$ в inlineMath и открывает визуальное редактирование', async ({ page }) => {
    await openBoard(page);

    await page.locator('[data-board-tool="text"]').first().click();
    await page.locator('.dr-canvas').click({ position: { x: 420, y: 260 } });

    const textEditor = page.locator('.ProseMirror').last();
    await expect(textEditor).toBeVisible();
    await textEditor.pressSequentially('Формула $\\frac{a+b}{c}$ ');

    const inlineMath = page.locator('[data-type="inline-math"]').last();
    await expect(inlineMath).toHaveAttribute('data-latex', '\\frac{a+b}{c}');
    await inlineMath.click();
    const mathField = page.locator('math-field[aria-label="Редактор математической формулы"]');
    await expect(mathField).toBeVisible();
    await expect
      .poll(() => mathField.evaluate((node) => (node as { value?: string }).value ?? ''))
      .toContain('\\frac');
  });
});
