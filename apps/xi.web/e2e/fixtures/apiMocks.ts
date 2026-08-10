import type { Page, Route } from '@playwright/test';
import { mockUser, type MockUser } from './mockUser';

const BACKEND = 'https://api.sovlium.ru';

async function fulfillJson(route: Route, status: number, body: unknown) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'content-type',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    },
    body: JSON.stringify(body),
  });
}

async function fulfillCorsPreflight(route: Route) {
  await route.fulfill({
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'content-type',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    },
  });
}

type HomeController = {
  mode: 'unauthenticated' | 'authenticated';
  user: MockUser;
  getStage?: () => string;
};

const homeState = new WeakMap<Page, HomeController>();

async function ensureHomeMock(page: Page) {
  if (homeState.has(page)) return;

  const state: HomeController = {
    mode: 'unauthenticated',
    user: mockUser(),
  };
  homeState.set(page, state);

  await page.route(`${BACKEND}/api/protected/user-service/users/current/home/`, async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await fulfillCorsPreflight(route);
      return;
    }

    const current = homeState.get(page);
    if (!current || current.mode === 'unauthenticated') {
      await fulfillJson(route, 401, { detail: 'Not authenticated' });
      return;
    }

    const stage = current.getStage?.() ?? current.user.onboarding_stage;
    await fulfillJson(route, 200, {
      ...current.user,
      onboarding_stage: stage,
      default_layout:
        stage === 'notifications' || stage === 'training' || stage === 'completed'
          ? (current.user.default_layout ?? 'tutor')
          : current.user.default_layout,
    });
  });
}

function getHomeState(page: Page): HomeController {
  const state = homeState.get(page);
  if (!state) {
    throw new Error('Home mock is not initialized. Call mockAuthenticatedSession first.');
  }
  return state;
}

export async function mockUnauthenticatedSession(page: Page) {
  await ensureHomeMock(page);
  homeState.get(page)!.mode = 'unauthenticated';
}

export async function mockAuthenticatedSession(page: Page, user: MockUser = mockUser()) {
  await ensureHomeMock(page);
  const state = homeState.get(page)!;
  state.mode = 'authenticated';
  state.user = user;
  state.getStage = undefined;
}

export async function mockHomeAfterAuth(page: Page, user: MockUser) {
  await ensureHomeMock(page);
  const state = homeState.get(page)!;
  state.mode = 'unauthenticated';
  state.user = user;
  state.getStage = undefined;

  return {
    markAuthenticated: () => {
      state.mode = 'authenticated';
    },
  };
}

export async function mockHomeWithStage(page: Page, user: MockUser, getStage: () => string) {
  await ensureHomeMock(page);
  const state = homeState.get(page)!;
  state.mode = 'authenticated';
  state.user = user;
  state.getStage = getStage;
}

export async function mockSigninSuccess(page: Page) {
  await page.route(`${BACKEND}/api/public/user-service/signin/`, async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await fulfillCorsPreflight(route);
      return;
    }
    await fulfillJson(route, 200, { status: 200, theme: 'light' });
  });
}

export async function mockSigninFailure(
  page: Page,
  detail: 'User not found' | 'Wrong password' | string,
  status = 401,
) {
  await page.route(`${BACKEND}/api/public/user-service/signin/`, async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await fulfillCorsPreflight(route);
      return;
    }
    await fulfillJson(route, status, { detail });
  });
}

export async function mockSignupSuccess(page: Page) {
  await page.route(`${BACKEND}/api/public/user-service/signup/`, async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await fulfillCorsPreflight(route);
      return;
    }
    await fulfillJson(route, 200, { status: 200 });
  });
}

export async function mockSignupFailure(page: Page, detail: string, status = 400) {
  await page.route(`${BACKEND}/api/public/user-service/signup/`, async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await fulfillCorsPreflight(route);
      return;
    }
    await fulfillJson(route, status, { detail });
  });
}

export async function mockProfileUpdate(page: Page) {
  await page.route(`${BACKEND}/api/protected/user-service/users/current/`, async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await fulfillCorsPreflight(route);
      return;
    }

    if (route.request().method() === 'PATCH') {
      const state = getHomeState(page);
      const body = (route.request().postDataJSON() ?? {}) as Partial<MockUser>;
      const updated: MockUser = { ...state.user, ...body };
      state.user = updated;
      await fulfillJson(route, 200, updated);
      return;
    }

    await route.continue();
  });
}

export async function mockOnboardingTransition(page: Page) {
  await page.route(
    /https:\/\/api\.sovlium\.ru\/api\/protected\/user-service\/users\/current\/onboarding-stages\//,
    async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await fulfillCorsPreflight(route);
        return;
      }

      const state = homeState.get(page);
      const match = route
        .request()
        .url()
        .match(/onboarding-stages\/([^/?]+)/);
      if (state && match?.[1]) {
        state.user = { ...state.user, onboarding_stage: match[1] };
      }

      await fulfillJson(route, 200, {});
    },
  );
}

export async function mockNoise(page: Page) {
  await page.route(/cloud\.umami\.is|umami\.[a-z]+\/api/, (route) =>
    route.fulfill({ status: 204, body: '' }),
  );
  await page.route(/mc\.yandex\.(ru|com)/, (route) => route.fulfill({ status: 204, body: '' }));
  await page.route(/\/socket\.io\//, (route) => route.abort());
}
