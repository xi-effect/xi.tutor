import { expect, test } from '@playwright/test';
import {
  mockAuthenticatedSession,
  mockNoise,
  mockOnboardingTransition,
  mockProfileUpdate,
} from './fixtures/apiMocks';
import { mockUser } from './fixtures/mockUser';

const welcomeTitle = (page: import('@playwright/test').Page, title: string) =>
  page.locator('#title').filter({ hasText: title });

test.describe('Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    await mockNoise(page);
  });

  test('completed на /welcome/* редиректит на /', async ({ page }) => {
    await mockAuthenticatedSession(
      page,
      mockUser({ onboarding_stage: 'completed', default_layout: 'tutor' }),
    );

    await page.goto('/welcome/user');
    await expect(page).toHaveURL(/\/($|\?)/, { timeout: 15_000 });
    await expect(page).not.toHaveURL(/\/welcome\//);
  });

  test('стадия user-information открывает /welcome/user', async ({ page }) => {
    await mockAuthenticatedSession(
      page,
      mockUser({
        onboarding_stage: 'user-information',
        display_name: null,
        default_layout: null,
      }),
    );

    await page.goto('/');
    await expect(page).toHaveURL(/\/welcome\/user/, { timeout: 15_000 });
    await expect(welcomeTitle(page, 'Давайте познакомимся')).toBeVisible();
  });

  test('профиль → роль: submit displayName', async ({ page }) => {
    await mockAuthenticatedSession(
      page,
      mockUser({
        onboarding_stage: 'user-information',
        display_name: null,
        default_layout: null,
      }),
    );
    await mockProfileUpdate(page);
    await mockOnboardingTransition(page);

    await page.goto('/welcome/user');
    await expect(welcomeTitle(page, 'Давайте познакомимся')).toBeVisible();
    await page.locator('input[autocomplete="name"]').fill('Иван Тестов');
    await page.getByRole('button', { name: 'Продолжить' }).click();

    await expect(page).toHaveURL(/\/welcome\/role/, { timeout: 15_000 });
    await expect(welcomeTitle(page, 'Выберите роль')).toBeVisible();
  });

  test('роль → socials', async ({ page }) => {
    await mockAuthenticatedSession(
      page,
      mockUser({
        onboarding_stage: 'default-layout',
        display_name: 'Иван',
        default_layout: null,
      }),
    );
    await mockProfileUpdate(page);
    await mockOnboardingTransition(page);

    await page.goto('/welcome/role');
    await expect(welcomeTitle(page, 'Выберите роль')).toBeVisible();
    await page.getByRole('button', { name: 'Продолжить' }).click();

    await expect(page).toHaveURL(/\/welcome\/socials/, { timeout: 15_000 });
    await expect(welcomeTitle(page, 'Настройте уведомления')).toBeVisible();
  });

  test('socials с invite.pending_code → /invite/$id', async ({ page }) => {
    await mockAuthenticatedSession(
      page,
      mockUser({
        onboarding_stage: 'notifications',
        display_name: 'Иван',
        default_layout: 'tutor',
      }),
    );
    await mockOnboardingTransition(page);

    await page.addInitScript(() => {
      localStorage.setItem('invite.pending_code', 'invite-e2e-1');
    });

    await page.goto('/welcome/socials');
    await expect(welcomeTitle(page, 'Настройте уведомления')).toBeVisible();
    await page.getByRole('button', { name: 'Начать работу' }).click();

    await expect(page).toHaveURL(/\/invite\/invite-e2e-1/, { timeout: 15_000 });
  });
});
