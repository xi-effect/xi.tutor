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

  test('приглашение в url: имя ставит ученика и открывает инвайт', async ({ page }) => {
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

    const stages: string[] = [];
    page.on('request', (request) => {
      const match = request.url().match(/onboarding-stages\/([^/?]+)/);
      if (request.method() === 'PUT' && match?.[1]) {
        stages.push(decodeURIComponent(match[1]));
      }
    });

    await page.goto('/welcome/user?invite=invite-e2e-1');
    await expect(welcomeTitle(page, 'Давайте познакомимся')).toBeVisible();

    const profileUpdate = page.waitForRequest(
      (request) => request.method() === 'PATCH' && request.url().includes('/users/current/'),
    );
    await page.locator('input[autocomplete="name"]').fill('Иван Тестов');
    await page.getByRole('button', { name: 'Продолжить' }).click();

    expect((await profileUpdate).postDataJSON()).toMatchObject({
      display_name: 'Иван Тестов',
      default_layout: 'student',
    });
    await expect(page).toHaveURL(/\/invite\/invite-e2e-1/, { timeout: 15_000 });
    await expect(page).not.toHaveURL(/\/welcome\/role/);
    expect(stages).toEqual(['default-layout', 'training']);
  });

  test('письмо с token не стирает приглашение: имя пропускает роль', async ({ page }) => {
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

    await page.addInitScript(() => {
      localStorage.setItem('invite.pending_code', 'invite-e2e-1');
    });

    await page.goto('/welcome/user?token=email-token');
    await expect(welcomeTitle(page, 'Давайте познакомимся')).toBeVisible();
    await page.locator('input[autocomplete="name"]').fill('Иван Тестов');
    await page.getByRole('button', { name: 'Продолжить' }).click();

    await expect(page).toHaveURL(/\/invite\/invite-e2e-1/, { timeout: 15_000 });
    await expect(page).not.toHaveURL(/\/welcome\/role/);
  });

  test('роль завершает welcome и открывает главную', async ({ page }) => {
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
    await page.getByRole('button', { name: 'Начать работу' }).click();

    await expect(page).toHaveURL(/\/($|\?)/, { timeout: 15_000 });
    await expect(page).not.toHaveURL(/\/welcome\//);
  });

  test('роль с invite.pending_code → /invite/$id', async ({ page }) => {
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

    await page.addInitScript(() => {
      localStorage.setItem('invite.pending_code', 'invite-e2e-1');
    });

    await page.goto('/welcome/role');
    await expect(welcomeTitle(page, 'Выберите роль')).toBeVisible();
    await page.getByRole('button', { name: 'Начать работу' }).click();

    await expect(page).toHaveURL(/\/invite\/invite-e2e-1/, { timeout: 15_000 });
  });
});
