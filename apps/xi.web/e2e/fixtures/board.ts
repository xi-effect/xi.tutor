import type { Page, Route } from '@playwright/test';
import { mockAuthenticatedSession, mockNoise } from './apiMocks';
import { mockUser } from './mockUser';

const BACKEND = 'https://api.sovlium.ru';

const E2E_BOARD = {
  classroomId: 'e2e-classroom',
  boardId: 'e2e-board',
  name: 'E2E доска',
};

async function fulfillJson(route: Route, status: number, body: unknown) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'content-type,x-content-token',
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
      'Access-Control-Allow-Headers': 'content-type,x-content-token',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    },
  });
}

const mockMaterial = {
  id: 9001,
  name: E2E_BOARD.name,
  content_kind: 'board',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  kind: 'classroom',
};

export async function mockBoardSession(page: Page) {
  await mockNoise(page);
  await mockAuthenticatedSession(
    page,
    mockUser({ onboarding_stage: 'completed', default_layout: 'tutor' }),
  );

  await page.route(/wss?:\/\/hocus\./, (route) => route.abort());
  await page.route('**/*hocus*', (route) => {
    if (route.request().resourceType() === 'websocket') {
      return route.abort();
    }
    return route.fallback();
  });

  await page.route(`${BACKEND}/api/protected/**`, async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await fulfillCorsPreflight(route);
      return;
    }

    const url = route.request().url();
    const method = route.request().method();

    if (url.includes('/users/current/home/')) {
      await route.fallback();
      return;
    }

    if (url.includes('/materials/') && url.includes('/storage-item/')) {
      await fulfillJson(route, 200, {
        access_group_id: 'e2e-group',
        storage_token: 'e2e-token',
        kind: 'board',
        ydoc_id: 'e2e-ydoc',
      });
      return;
    }

    if (url.includes('/materials/') && method === 'GET') {
      await fulfillJson(route, 200, mockMaterial);
      return;
    }

    if (url.includes('/materials/') && (method === 'PATCH' || method === 'PUT')) {
      await fulfillJson(route, 200, mockMaterial);
      return;
    }

    if (url.includes('/classrooms')) {
      await fulfillJson(route, 200, []);
      return;
    }

    if (url.includes('/notifications')) {
      await fulfillJson(route, 200, []);
      return;
    }

    await fulfillJson(route, 200, {});
  });
}

export function boardPath() {
  return `/classrooms/${E2E_BOARD.classroomId}/boards/${E2E_BOARD.boardId}?demo=1`;
}

export async function openBoard(page: Page) {
  await mockBoardSession(page);
  await page.goto(boardPath());
  await page.locator('[data-testid="board-canvas"]').waitFor({ state: 'visible', timeout: 30_000 });
}

export { E2E_BOARD };
