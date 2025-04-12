/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router';

// Import Routes

import { Route as rootRoute } from './pages/__root';
import { Route as AboutImport } from './pages/about';
import { Route as appLayoutImport } from './pages/(app)/_layout';
import { Route as authSignupIndexImport } from './pages/(auth)/signup/index';
import { Route as authSigninIndexImport } from './pages/(auth)/signin/index';
import { Route as appLayoutIndexImport } from './pages/(app)/_layout/index';
import { Route as appLayoutPaymentsIndexImport } from './pages/(app)/_layout/payments/index';
import { Route as appLayoutMaterialsIndexImport } from './pages/(app)/_layout/materials/index';
import { Route as appLayoutClassroomsIndexImport } from './pages/(app)/_layout/classrooms/index';
import { Route as appLayoutCallIndexImport } from './pages/(app)/_layout/call/index';
import { Route as appLayoutCalendarIndexImport } from './pages/(app)/_layout/calendar/index';
import { Route as appLayoutBoardIndexImport } from './pages/(app)/_layout/board/index';
import { Route as appLayoutCallCallIdImport } from './pages/(app)/_layout/call/$callId';
import { Route as appLayoutWelcomeUserIndexImport } from './pages/(app)/_layout/welcome/user/index';
import { Route as appLayoutWelcomeSocialsIndexImport } from './pages/(app)/_layout/welcome/socials/index';
import { Route as appLayoutWelcomeRoleIndexImport } from './pages/(app)/_layout/welcome/role/index';
import { Route as appLayoutWelcomeAboutIndexImport } from './pages/(app)/_layout/welcome/about/index';

// Create Virtual Routes

const appImport = createFileRoute('/(app)')();

// Create/Update Routes

const appRoute = appImport.update({
  id: '/(app)',
  getParentRoute: () => rootRoute,
} as any);

const AboutRoute = AboutImport.update({
  id: '/about',
  path: '/about',
  getParentRoute: () => rootRoute,
} as any);

const appLayoutRoute = appLayoutImport.update({
  id: '/_layout',
  getParentRoute: () => appRoute,
} as any);

const authSignupIndexRoute = authSignupIndexImport.update({
  id: '/(auth)/signup/',
  path: '/signup/',
  getParentRoute: () => rootRoute,
} as any);

const authSigninIndexRoute = authSigninIndexImport.update({
  id: '/(auth)/signin/',
  path: '/signin/',
  getParentRoute: () => rootRoute,
} as any);

const appLayoutIndexRoute = appLayoutIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => appLayoutRoute,
} as any);

const appLayoutPaymentsIndexRoute = appLayoutPaymentsIndexImport.update({
  id: '/payments/',
  path: '/payments/',
  getParentRoute: () => appLayoutRoute,
} as any);

const appLayoutMaterialsIndexRoute = appLayoutMaterialsIndexImport.update({
  id: '/materials/',
  path: '/materials/',
  getParentRoute: () => appLayoutRoute,
} as any);

const appLayoutClassroomsIndexRoute = appLayoutClassroomsIndexImport.update({
  id: '/classrooms/',
  path: '/classrooms/',
  getParentRoute: () => appLayoutRoute,
} as any);

const appLayoutCallIndexRoute = appLayoutCallIndexImport.update({
  id: '/call/',
  path: '/call/',
  getParentRoute: () => appLayoutRoute,
} as any);

const appLayoutCalendarIndexRoute = appLayoutCalendarIndexImport.update({
  id: '/calendar/',
  path: '/calendar/',
  getParentRoute: () => appLayoutRoute,
} as any);

const appLayoutBoardIndexRoute = appLayoutBoardIndexImport.update({
  id: '/board/',
  path: '/board/',
  getParentRoute: () => appLayoutRoute,
} as any);

const appLayoutCallCallIdRoute = appLayoutCallCallIdImport.update({
  id: '/call/$callId',
  path: '/call/$callId',
  getParentRoute: () => appLayoutRoute,
} as any);

const appLayoutWelcomeUserIndexRoute = appLayoutWelcomeUserIndexImport.update({
  id: '/welcome/user/',
  path: '/welcome/user/',
  getParentRoute: () => appLayoutRoute,
} as any);

const appLayoutWelcomeSocialsIndexRoute = appLayoutWelcomeSocialsIndexImport.update({
  id: '/welcome/socials/',
  path: '/welcome/socials/',
  getParentRoute: () => appLayoutRoute,
} as any);

const appLayoutWelcomeRoleIndexRoute = appLayoutWelcomeRoleIndexImport.update({
  id: '/welcome/role/',
  path: '/welcome/role/',
  getParentRoute: () => appLayoutRoute,
} as any);

const appLayoutWelcomeAboutIndexRoute = appLayoutWelcomeAboutIndexImport.update({
  id: '/welcome/about/',
  path: '/welcome/about/',
  getParentRoute: () => appLayoutRoute,
} as any);

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/about': {
      id: '/about';
      path: '/about';
      fullPath: '/about';
      preLoaderRoute: typeof AboutImport;
      parentRoute: typeof rootRoute;
    };
    '/(app)': {
      id: '/(app)';
      path: '/';
      fullPath: '/';
      preLoaderRoute: typeof appImport;
      parentRoute: typeof rootRoute;
    };
    '/(app)/_layout': {
      id: '/(app)/_layout';
      path: '/';
      fullPath: '/';
      preLoaderRoute: typeof appLayoutImport;
      parentRoute: typeof appRoute;
    };
    '/(app)/_layout/': {
      id: '/(app)/_layout/';
      path: '/';
      fullPath: '/';
      preLoaderRoute: typeof appLayoutIndexImport;
      parentRoute: typeof appLayoutImport;
    };
    '/(auth)/signin/': {
      id: '/(auth)/signin/';
      path: '/signin';
      fullPath: '/signin';
      preLoaderRoute: typeof authSigninIndexImport;
      parentRoute: typeof rootRoute;
    };
    '/(auth)/signup/': {
      id: '/(auth)/signup/';
      path: '/signup';
      fullPath: '/signup';
      preLoaderRoute: typeof authSignupIndexImport;
      parentRoute: typeof rootRoute;
    };
    '/(app)/_layout/call/$callId': {
      id: '/(app)/_layout/call/$callId';
      path: '/call/$callId';
      fullPath: '/call/$callId';
      preLoaderRoute: typeof appLayoutCallCallIdImport;
      parentRoute: typeof appLayoutImport;
    };
    '/(app)/_layout/board/': {
      id: '/(app)/_layout/board/';
      path: '/board';
      fullPath: '/board';
      preLoaderRoute: typeof appLayoutBoardIndexImport;
      parentRoute: typeof appLayoutImport;
    };
    '/(app)/_layout/calendar/': {
      id: '/(app)/_layout/calendar/';
      path: '/calendar';
      fullPath: '/calendar';
      preLoaderRoute: typeof appLayoutCalendarIndexImport;
      parentRoute: typeof appLayoutImport;
    };
    '/(app)/_layout/call/': {
      id: '/(app)/_layout/call/';
      path: '/call';
      fullPath: '/call';
      preLoaderRoute: typeof appLayoutCallIndexImport;
      parentRoute: typeof appLayoutImport;
    };
    '/(app)/_layout/classrooms/': {
      id: '/(app)/_layout/classrooms/';
      path: '/classrooms';
      fullPath: '/classrooms';
      preLoaderRoute: typeof appLayoutClassroomsIndexImport;
      parentRoute: typeof appLayoutImport;
    };
    '/(app)/_layout/materials/': {
      id: '/(app)/_layout/materials/';
      path: '/materials';
      fullPath: '/materials';
      preLoaderRoute: typeof appLayoutMaterialsIndexImport;
      parentRoute: typeof appLayoutImport;
    };
    '/(app)/_layout/payments/': {
      id: '/(app)/_layout/payments/';
      path: '/payments';
      fullPath: '/payments';
      preLoaderRoute: typeof appLayoutPaymentsIndexImport;
      parentRoute: typeof appLayoutImport;
    };
    '/(app)/_layout/welcome/about/': {
      id: '/(app)/_layout/welcome/about/';
      path: '/welcome/about';
      fullPath: '/welcome/about';
      preLoaderRoute: typeof appLayoutWelcomeAboutIndexImport;
      parentRoute: typeof appLayoutImport;
    };
    '/(app)/_layout/welcome/role/': {
      id: '/(app)/_layout/welcome/role/';
      path: '/welcome/role';
      fullPath: '/welcome/role';
      preLoaderRoute: typeof appLayoutWelcomeRoleIndexImport;
      parentRoute: typeof appLayoutImport;
    };
    '/(app)/_layout/welcome/socials/': {
      id: '/(app)/_layout/welcome/socials/';
      path: '/welcome/socials';
      fullPath: '/welcome/socials';
      preLoaderRoute: typeof appLayoutWelcomeSocialsIndexImport;
      parentRoute: typeof appLayoutImport;
    };
    '/(app)/_layout/welcome/user/': {
      id: '/(app)/_layout/welcome/user/';
      path: '/welcome/user';
      fullPath: '/welcome/user';
      preLoaderRoute: typeof appLayoutWelcomeUserIndexImport;
      parentRoute: typeof appLayoutImport;
    };
  }
}

// Create and export the route tree

interface appLayoutRouteChildren {
  appLayoutIndexRoute: typeof appLayoutIndexRoute;
  appLayoutCallCallIdRoute: typeof appLayoutCallCallIdRoute;
  appLayoutBoardIndexRoute: typeof appLayoutBoardIndexRoute;
  appLayoutCalendarIndexRoute: typeof appLayoutCalendarIndexRoute;
  appLayoutCallIndexRoute: typeof appLayoutCallIndexRoute;
  appLayoutClassroomsIndexRoute: typeof appLayoutClassroomsIndexRoute;
  appLayoutMaterialsIndexRoute: typeof appLayoutMaterialsIndexRoute;
  appLayoutPaymentsIndexRoute: typeof appLayoutPaymentsIndexRoute;
  appLayoutWelcomeAboutIndexRoute: typeof appLayoutWelcomeAboutIndexRoute;
  appLayoutWelcomeRoleIndexRoute: typeof appLayoutWelcomeRoleIndexRoute;
  appLayoutWelcomeSocialsIndexRoute: typeof appLayoutWelcomeSocialsIndexRoute;
  appLayoutWelcomeUserIndexRoute: typeof appLayoutWelcomeUserIndexRoute;
}

const appLayoutRouteChildren: appLayoutRouteChildren = {
  appLayoutIndexRoute: appLayoutIndexRoute,
  appLayoutCallCallIdRoute: appLayoutCallCallIdRoute,
  appLayoutBoardIndexRoute: appLayoutBoardIndexRoute,
  appLayoutCalendarIndexRoute: appLayoutCalendarIndexRoute,
  appLayoutCallIndexRoute: appLayoutCallIndexRoute,
  appLayoutClassroomsIndexRoute: appLayoutClassroomsIndexRoute,
  appLayoutMaterialsIndexRoute: appLayoutMaterialsIndexRoute,
  appLayoutPaymentsIndexRoute: appLayoutPaymentsIndexRoute,
  appLayoutWelcomeAboutIndexRoute: appLayoutWelcomeAboutIndexRoute,
  appLayoutWelcomeRoleIndexRoute: appLayoutWelcomeRoleIndexRoute,
  appLayoutWelcomeSocialsIndexRoute: appLayoutWelcomeSocialsIndexRoute,
  appLayoutWelcomeUserIndexRoute: appLayoutWelcomeUserIndexRoute,
};

const appLayoutRouteWithChildren = appLayoutRoute._addFileChildren(appLayoutRouteChildren);

interface appRouteChildren {
  appLayoutRoute: typeof appLayoutRouteWithChildren;
}

const appRouteChildren: appRouteChildren = {
  appLayoutRoute: appLayoutRouteWithChildren,
};

const appRouteWithChildren = appRoute._addFileChildren(appRouteChildren);

export interface FileRoutesByFullPath {
  '/about': typeof AboutRoute;
  '/': typeof appLayoutIndexRoute;
  '/signin': typeof authSigninIndexRoute;
  '/signup': typeof authSignupIndexRoute;
  '/call/$callId': typeof appLayoutCallCallIdRoute;
  '/board': typeof appLayoutBoardIndexRoute;
  '/calendar': typeof appLayoutCalendarIndexRoute;
  '/call': typeof appLayoutCallIndexRoute;
  '/classrooms': typeof appLayoutClassroomsIndexRoute;
  '/materials': typeof appLayoutMaterialsIndexRoute;
  '/payments': typeof appLayoutPaymentsIndexRoute;
  '/welcome/about': typeof appLayoutWelcomeAboutIndexRoute;
  '/welcome/role': typeof appLayoutWelcomeRoleIndexRoute;
  '/welcome/socials': typeof appLayoutWelcomeSocialsIndexRoute;
  '/welcome/user': typeof appLayoutWelcomeUserIndexRoute;
}

export interface FileRoutesByTo {
  '/about': typeof AboutRoute;
  '/': typeof appLayoutIndexRoute;
  '/signin': typeof authSigninIndexRoute;
  '/signup': typeof authSignupIndexRoute;
  '/call/$callId': typeof appLayoutCallCallIdRoute;
  '/board': typeof appLayoutBoardIndexRoute;
  '/calendar': typeof appLayoutCalendarIndexRoute;
  '/call': typeof appLayoutCallIndexRoute;
  '/classrooms': typeof appLayoutClassroomsIndexRoute;
  '/materials': typeof appLayoutMaterialsIndexRoute;
  '/payments': typeof appLayoutPaymentsIndexRoute;
  '/welcome/about': typeof appLayoutWelcomeAboutIndexRoute;
  '/welcome/role': typeof appLayoutWelcomeRoleIndexRoute;
  '/welcome/socials': typeof appLayoutWelcomeSocialsIndexRoute;
  '/welcome/user': typeof appLayoutWelcomeUserIndexRoute;
}

export interface FileRoutesById {
  __root__: typeof rootRoute;
  '/about': typeof AboutRoute;
  '/(app)': typeof appRouteWithChildren;
  '/(app)/_layout': typeof appLayoutRouteWithChildren;
  '/(app)/_layout/': typeof appLayoutIndexRoute;
  '/(auth)/signin/': typeof authSigninIndexRoute;
  '/(auth)/signup/': typeof authSignupIndexRoute;
  '/(app)/_layout/call/$callId': typeof appLayoutCallCallIdRoute;
  '/(app)/_layout/board/': typeof appLayoutBoardIndexRoute;
  '/(app)/_layout/calendar/': typeof appLayoutCalendarIndexRoute;
  '/(app)/_layout/call/': typeof appLayoutCallIndexRoute;
  '/(app)/_layout/classrooms/': typeof appLayoutClassroomsIndexRoute;
  '/(app)/_layout/materials/': typeof appLayoutMaterialsIndexRoute;
  '/(app)/_layout/payments/': typeof appLayoutPaymentsIndexRoute;
  '/(app)/_layout/welcome/about/': typeof appLayoutWelcomeAboutIndexRoute;
  '/(app)/_layout/welcome/role/': typeof appLayoutWelcomeRoleIndexRoute;
  '/(app)/_layout/welcome/socials/': typeof appLayoutWelcomeSocialsIndexRoute;
  '/(app)/_layout/welcome/user/': typeof appLayoutWelcomeUserIndexRoute;
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath;
  fullPaths:
    | '/about'
    | '/'
    | '/signin'
    | '/signup'
    | '/call/$callId'
    | '/board'
    | '/calendar'
    | '/call'
    | '/classrooms'
    | '/materials'
    | '/payments'
    | '/welcome/about'
    | '/welcome/role'
    | '/welcome/socials'
    | '/welcome/user';
  fileRoutesByTo: FileRoutesByTo;
  to:
    | '/about'
    | '/'
    | '/signin'
    | '/signup'
    | '/call/$callId'
    | '/board'
    | '/calendar'
    | '/call'
    | '/classrooms'
    | '/materials'
    | '/payments'
    | '/welcome/about'
    | '/welcome/role'
    | '/welcome/socials'
    | '/welcome/user';
  id:
    | '__root__'
    | '/about'
    | '/(app)'
    | '/(app)/_layout'
    | '/(app)/_layout/'
    | '/(auth)/signin/'
    | '/(auth)/signup/'
    | '/(app)/_layout/call/$callId'
    | '/(app)/_layout/board/'
    | '/(app)/_layout/calendar/'
    | '/(app)/_layout/call/'
    | '/(app)/_layout/classrooms/'
    | '/(app)/_layout/materials/'
    | '/(app)/_layout/payments/'
    | '/(app)/_layout/welcome/about/'
    | '/(app)/_layout/welcome/role/'
    | '/(app)/_layout/welcome/socials/'
    | '/(app)/_layout/welcome/user/';
  fileRoutesById: FileRoutesById;
}

export interface RootRouteChildren {
  AboutRoute: typeof AboutRoute;
  appRoute: typeof appRouteWithChildren;
  authSigninIndexRoute: typeof authSigninIndexRoute;
  authSignupIndexRoute: typeof authSignupIndexRoute;
}

const rootRouteChildren: RootRouteChildren = {
  AboutRoute: AboutRoute,
  appRoute: appRouteWithChildren,
  authSigninIndexRoute: authSigninIndexRoute,
  authSignupIndexRoute: authSignupIndexRoute,
};

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>();

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/about",
        "/(app)",
        "/(auth)/signin/",
        "/(auth)/signup/"
      ]
    },
    "/about": {
      "filePath": "about.tsx"
    },
    "/(app)": {
      "filePath": "(app)",
      "children": [
        "/(app)/_layout"
      ]
    },
    "/(app)/_layout": {
      "filePath": "(app)/_layout.tsx",
      "parent": "/(app)",
      "children": [
        "/(app)/_layout/",
        "/(app)/_layout/call/$callId",
        "/(app)/_layout/board/",
        "/(app)/_layout/calendar/",
        "/(app)/_layout/call/",
        "/(app)/_layout/classrooms/",
        "/(app)/_layout/materials/",
        "/(app)/_layout/payments/",
        "/(app)/_layout/welcome/about/",
        "/(app)/_layout/welcome/role/",
        "/(app)/_layout/welcome/socials/",
        "/(app)/_layout/welcome/user/"
      ]
    },
    "/(app)/_layout/": {
      "filePath": "(app)/_layout/index.tsx",
      "parent": "/(app)/_layout"
    },
    "/(auth)/signin/": {
      "filePath": "(auth)/signin/index.tsx"
    },
    "/(auth)/signup/": {
      "filePath": "(auth)/signup/index.tsx"
    },
    "/(app)/_layout/call/$callId": {
      "filePath": "(app)/_layout/call/$callId.tsx",
      "parent": "/(app)/_layout"
    },
    "/(app)/_layout/board/": {
      "filePath": "(app)/_layout/board/index.tsx",
      "parent": "/(app)/_layout"
    },
    "/(app)/_layout/calendar/": {
      "filePath": "(app)/_layout/calendar/index.tsx",
      "parent": "/(app)/_layout"
    },
    "/(app)/_layout/call/": {
      "filePath": "(app)/_layout/call/index.tsx",
      "parent": "/(app)/_layout"
    },
    "/(app)/_layout/classrooms/": {
      "filePath": "(app)/_layout/classrooms/index.tsx",
      "parent": "/(app)/_layout"
    },
    "/(app)/_layout/materials/": {
      "filePath": "(app)/_layout/materials/index.tsx",
      "parent": "/(app)/_layout"
    },
    "/(app)/_layout/payments/": {
      "filePath": "(app)/_layout/payments/index.tsx",
      "parent": "/(app)/_layout"
    },
    "/(app)/_layout/welcome/about/": {
      "filePath": "(app)/_layout/welcome/about/index.tsx",
      "parent": "/(app)/_layout"
    },
    "/(app)/_layout/welcome/role/": {
      "filePath": "(app)/_layout/welcome/role/index.tsx",
      "parent": "/(app)/_layout"
    },
    "/(app)/_layout/welcome/socials/": {
      "filePath": "(app)/_layout/welcome/socials/index.tsx",
      "parent": "/(app)/_layout"
    },
    "/(app)/_layout/welcome/user/": {
      "filePath": "(app)/_layout/welcome/user/index.tsx",
      "parent": "/(app)/_layout"
    }
  }
}
ROUTE_MANIFEST_END */
