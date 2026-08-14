import { expect, test } from '@playwright/test';
import {
  mockHomeAfterAuth,
  mockNoise,
  mockSignupFailure,
  mockSignupSuccess,
  mockUnauthenticatedSession,
} from './fixtures/apiMocks';
import { mockUser } from './fixtures/mockUser';
import { acceptSignupConsent, fillSignupForm, submitSignup } from './fixtures/forms';

test.describe('Signup', () => {
  test.beforeEach(async ({ page }) => {
    await mockNoise(page);
    await mockUnauthenticatedSession(page);
  });

  test('показывает клиентскую валидацию username', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: 'Регистрация' })).toBeVisible();

    const username = page.getByLabel('Имя пользователя');
    await username.fill('ab');
    await username.blur();

    await expect(page.getByText(/Минимум/)).toBeVisible();
  });

  test('показывает ошибку, если нет consent', async ({ page }) => {
    await page.goto('/signup');
    await fillSignupForm(page, {
      username: 'valid_user',
      email: 'valid@example.com',
      password: 'secret1',
    });

    await submitSignup(page);

    await expect(
      page
        .locator('[id$="-form-item-message"]')
        .filter({ hasText: 'Отметьте, что принимаете условия' }),
    ).toBeVisible();

    await acceptSignupConsent(page);
    await expect(
      page
        .locator('[id$="-form-item-message"]')
        .filter({ hasText: 'Отметьте, что принимаете условия' }),
    ).toBeHidden();
  });

  test('показывает ошибку, если username занят', async ({ page }) => {
    await mockSignupFailure(page, 'Username already registered');
    await page.goto('/signup');

    await fillSignupForm(page, {
      username: 'taken_user',
      email: 'new@example.com',
      password: 'secret1',
    });
    await acceptSignupConsent(page);
    await submitSignup(page);

    await expect(
      page
        .locator('[id$="-form-item-message"]')
        .filter({ hasText: 'Такое имя пользователя уже занято' }),
    ).toBeVisible();
  });

  test('успешная регистрация ведёт на /welcome/email', async ({ page }) => {
    const user = mockUser({
      onboarding_stage: 'email-confirmation',
      display_name: null,
      default_layout: null,
    });
    const home = await mockHomeAfterAuth(page, user);
    await mockSignupSuccess(page);

    await page.goto('/signup');
    await fillSignupForm(page, {
      username: 'fresh_user',
      email: 'fresh@example.com',
      password: 'secret1',
    });
    await acceptSignupConsent(page);

    home.markAuthenticated();
    await submitSignup(page);

    await expect(page).toHaveURL(/\/welcome\/email/, { timeout: 15_000 });
  });
});
