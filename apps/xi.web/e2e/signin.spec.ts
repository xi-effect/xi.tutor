import { expect, test } from '@playwright/test';
import {
  mockAuthenticatedSession,
  mockHomeAfterAuth,
  mockNoise,
  mockSigninFailure,
  mockSigninSuccess,
  mockUnauthenticatedSession,
} from './fixtures/apiMocks';
import { mockUser } from './fixtures/mockUser';
import { fillSigninForm, submitSignin } from './fixtures/forms';

test.describe('Signin', () => {
  test.beforeEach(async ({ page }) => {
    await mockNoise(page);
  });

  test('редиректит неавторизованный deep link на /signin', async ({ page }) => {
    await mockUnauthenticatedSession(page);
    await page.goto('/classrooms/1');
    await expect(page).toHaveURL(/\/signin/);
    expect(page.url()).toContain('redirect');
  });

  test('не показывает форму входа, если сессия уже есть', async ({ page }) => {
    const user = mockUser({ onboarding_stage: 'completed', default_layout: 'tutor' });
    await mockAuthenticatedSession(page, user);

    await page.goto('/signin');

    await expect(page).not.toHaveURL(/\/signin/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Вход в аккаунт' })).toHaveCount(0);
  });

  test('с живой сессией уводит с /signin на redirect', async ({ page }) => {
    const user = mockUser({ onboarding_stage: 'completed', default_layout: 'tutor' });
    await mockAuthenticatedSession(page, user);

    await page.goto('/signin?redirect=/classrooms');

    await expect(page).toHaveURL(/\/classrooms/, { timeout: 15_000 });
  });

  test('показывает ошибку при неизвестном email', async ({ page }) => {
    await mockUnauthenticatedSession(page);
    await mockSigninFailure(page, 'User not found');

    await page.goto('/signin');
    await expect(page.getByRole('heading', { name: 'Вход в аккаунт' })).toBeVisible();

    await fillSigninForm(page, 'missing@example.com', 'password1');
    await submitSignin(page);

    await expect(
      page.locator('[id$="-form-item-message"]').filter({ hasText: 'Не удалось найти аккаунт' }),
    ).toBeVisible();
  });

  test('показывает ошибку при неверном пароле', async ({ page }) => {
    await mockUnauthenticatedSession(page);
    await mockSigninFailure(page, 'Wrong password');

    await page.goto('/signin');
    await fillSigninForm(page, 'user@example.com', 'wrong-pass');
    await submitSignin(page);

    await expect(
      page.locator('[id$="-form-item-message"]').filter({ hasText: 'Неправильный пароль' }),
    ).toBeVisible();
  });

  test('успешный вход с redirect query', async ({ page }) => {
    const user = mockUser({ onboarding_stage: 'completed', default_layout: 'tutor' });
    const home = await mockHomeAfterAuth(page, user);
    await mockSigninSuccess(page);

    await page.goto('/signin?redirect=/calendar');
    await fillSigninForm(page, user.email, 'password1');

    home.markAuthenticated();
    await submitSignin(page);

    await expect(page).toHaveURL(/\/calendar/, { timeout: 15_000 });
  });
});
