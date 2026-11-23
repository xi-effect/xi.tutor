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

  test('подтверждённая почта на /welcome/email уводит с экрана ожидания', async ({ page }) => {
    await mockAuthenticatedSession(
      page,
      mockUser({ onboarding_stage: 'completed', default_layout: 'tutor' }),
    );

    await page.goto('/welcome/email');
    await expect(page).toHaveURL(/\/($|\?)/, { timeout: 15_000 });
    await expect(page).not.toHaveURL(/\/welcome\//);
    await expect(page.getByRole('heading', { name: 'Подтвердите почту' })).toHaveCount(0);
  });

  test('после подтверждения почты /welcome/email открывает следующий шаг', async ({ page }) => {
    await mockAuthenticatedSession(
      page,
      mockUser({
        onboarding_stage: 'user-information',
        display_name: 'Иван',
        default_layout: null,
      }),
    );

    await page.goto('/welcome/email');
    await expect(page).toHaveURL(/\/welcome\/role/, { timeout: 15_000 });
    await expect(welcomeTitle(page, 'Выберите роль')).toBeVisible();
  });

  test('неподтверждённая почта остаётся на /welcome/email', async ({ page }) => {
    await mockAuthenticatedSession(
      page,
      mockUser({
        onboarding_stage: 'email-confirmation',
        display_name: 'Иван',
        default_layout: null,
      }),
    );

    await page.goto('/welcome/email');
    await expect(page).toHaveURL(/\/welcome\/email/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Подтвердите почту' })).toBeVisible();
  });

  test('completed на /welcome/* редиректит на /', async ({ page }) => {
    await mockAuthenticatedSession(
      page,
      mockUser({ onboarding_stage: 'completed', default_layout: 'tutor' }),
    );

    await page.goto('/welcome/role');
    await expect(page).toHaveURL(/\/($|\?)/, { timeout: 15_000 });
    await expect(page).not.toHaveURL(/\/welcome\//);
  });

  test('стадия user-information открывает выбор роли', async ({ page }) => {
    await mockAuthenticatedSession(
      page,
      mockUser({
        onboarding_stage: 'user-information',
        display_name: 'Иван',
        default_layout: null,
      }),
    );

    await page.goto('/');
    await expect(page).toHaveURL(/\/welcome\/role/, { timeout: 15_000 });
    await expect(welcomeTitle(page, 'Выберите роль')).toBeVisible();
  });

  test('приглашение в url: ученик пропускает выбор роли и открывает инвайт', async ({ page }) => {
    await mockAuthenticatedSession(
      page,
      mockUser({
        onboarding_stage: 'user-information',
        display_name: 'Иван',
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

    const profileUpdate = page.waitForRequest(
      (request) => request.method() === 'PATCH' && request.url().includes('/users/current/'),
    );
    await page.goto('/welcome/role?invite=invite-e2e-1');

    expect((await profileUpdate).postDataJSON()).toMatchObject({
      default_layout: 'student',
    });
    await expect(page).toHaveURL(/\/invite\/invite-e2e-1/, { timeout: 15_000 });
    await expect(page).not.toHaveURL(/\/welcome\/role/);
    expect(stages).toEqual(['default-layout', 'training']);
  });

  test('сохранённое приглашение пропускает выбор роли', async ({ page }) => {
    await mockAuthenticatedSession(
      page,
      mockUser({
        onboarding_stage: 'user-information',
        display_name: 'Иван',
        default_layout: null,
      }),
    );
    await mockProfileUpdate(page);
    await mockOnboardingTransition(page);

    await page.addInitScript(() => {
      localStorage.setItem('invite.pending_code', 'invite-e2e-1');
    });

    await page.goto('/welcome/role?token=email-token');

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
