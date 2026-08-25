import type { Page } from '@playwright/test';

export async function fillSigninForm(page: Page, email: string, password: string) {
  await page.getByLabel('Электронная почта').fill(email);
  await page.getByLabel('Пароль').fill(password);
}

export async function submitSignin(page: Page) {
  await page.getByRole('button', { name: 'Войти' }).click();
}

export async function fillSignupForm(
  page: Page,
  data: { username: string; email: string; password: string },
) {
  await page.getByLabel('Имя пользователя').fill(data.username);
  await page.getByLabel('Электронная почта').fill(data.email);
  await page.getByLabel('Пароль').fill(data.password);
}

export async function acceptSignupConsent(page: Page) {
  await page.getByRole('checkbox').click();
}

export async function submitSignup(page: Page) {
  await page.getByRole('button', { name: 'Создать аккаунт' }).click();
}
