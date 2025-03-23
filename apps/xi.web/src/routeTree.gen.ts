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
import { Route as appLayoutContentIndexImport } from './pages/(app)/_layout/content/index';
import { Route as appLayoutClassroomsIndexImport } from './pages/(app)/_layout/classrooms/index';
import { Route as appLayoutCalendarIndexImport } from './pages/(app)/_layout/calendar/index';

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

const appLayoutContentIndexRoute = appLayoutContentIndexImport.update({
  id: '/content/',
  path: '/content/',
  getParentRoute: () => appLayoutRoute,
} as any);

const appLayoutClassroomsIndexRoute = appLayoutClassroomsIndexImport.update({
  id: '/classrooms/',
  path: '/classrooms/',
  getParentRoute: () => appLayoutRoute,
} as any);

const appLayoutCalendarIndexRoute = appLayoutCalendarIndexImport.update({
  id: '/calendar/',
  path: '/calendar/',
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
    '/(app)/_layout/calendar/': {
      id: '/(app)/_layout/calendar/';
      path: '/calendar';
      fullPath: '/calendar';
      preLoaderRoute: typeof appLayoutCalendarIndexImport;
      parentRoute: typeof appLayoutImport;
    };
    '/(app)/_layout/classrooms/': {
      id: '/(app)/_layout/classrooms/';
      path: '/classrooms';
      fullPath: '/classrooms';
      preLoaderRoute: typeof appLayoutClassroomsIndexImport;
      parentRoute: typeof appLayoutImport;
    };
    '/(app)/_layout/content/': {
      id: '/(app)/_layout/content/';
      path: '/content';
      fullPath: '/content';
      preLoaderRoute: typeof appLayoutContentIndexImport;
      parentRoute: typeof appLayoutImport;
    };
    '/(app)/_layout/payments/': {
      id: '/(app)/_layout/payments/';
      path: '/payments';
      fullPath: '/payments';
      preLoaderRoute: typeof appLayoutPaymentsIndexImport;
      parentRoute: typeof appLayoutImport;
    };
  }
}

// Create and export the route tree

interface appLayoutRouteChildren {
  appLayoutIndexRoute: typeof appLayoutIndexRoute;
  appLayoutCalendarIndexRoute: typeof appLayoutCalendarIndexRoute;
  appLayoutClassroomsIndexRoute: typeof appLayoutClassroomsIndexRoute;
  appLayoutContentIndexRoute: typeof appLayoutContentIndexRoute;
  appLayoutPaymentsIndexRoute: typeof appLayoutPaymentsIndexRoute;
}

const appLayoutRouteChildren: appLayoutRouteChildren = {
  appLayoutIndexRoute: appLayoutIndexRoute,
  appLayoutCalendarIndexRoute: appLayoutCalendarIndexRoute,
  appLayoutClassroomsIndexRoute: appLayoutClassroomsIndexRoute,
  appLayoutContentIndexRoute: appLayoutContentIndexRoute,
  appLayoutPaymentsIndexRoute: appLayoutPaymentsIndexRoute,
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
  '/calendar': typeof appLayoutCalendarIndexRoute;
  '/classrooms': typeof appLayoutClassroomsIndexRoute;
  '/content': typeof appLayoutContentIndexRoute;
  '/payments': typeof appLayoutPaymentsIndexRoute;
}

export interface FileRoutesByTo {
  '/about': typeof AboutRoute;
  '/': typeof appLayoutIndexRoute;
  '/signin': typeof authSigninIndexRoute;
  '/signup': typeof authSignupIndexRoute;
  '/calendar': typeof appLayoutCalendarIndexRoute;
  '/classrooms': typeof appLayoutClassroomsIndexRoute;
  '/content': typeof appLayoutContentIndexRoute;
  '/payments': typeof appLayoutPaymentsIndexRoute;
}

export interface FileRoutesById {
  __root__: typeof rootRoute;
  '/about': typeof AboutRoute;
  '/(app)': typeof appRouteWithChildren;
  '/(app)/_layout': typeof appLayoutRouteWithChildren;
  '/(app)/_layout/': typeof appLayoutIndexRoute;
  '/(auth)/signin/': typeof authSigninIndexRoute;
  '/(auth)/signup/': typeof authSignupIndexRoute;
  '/(app)/_layout/calendar/': typeof appLayoutCalendarIndexRoute;
  '/(app)/_layout/classrooms/': typeof appLayoutClassroomsIndexRoute;
  '/(app)/_layout/content/': typeof appLayoutContentIndexRoute;
  '/(app)/_layout/payments/': typeof appLayoutPaymentsIndexRoute;
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath;
  fullPaths:
    | '/about'
    | '/'
    | '/signin'
    | '/signup'
    | '/calendar'
    | '/classrooms'
    | '/content'
    | '/payments';
  fileRoutesByTo: FileRoutesByTo;
  to:
    | '/about'
    | '/'
    | '/signin'
    | '/signup'
    | '/calendar'
    | '/classrooms'
    | '/content'
    | '/payments';
  id:
    | '__root__'
    | '/about'
    | '/(app)'
    | '/(app)/_layout'
    | '/(app)/_layout/'
    | '/(auth)/signin/'
    | '/(auth)/signup/'
    | '/(app)/_layout/calendar/'
    | '/(app)/_layout/classrooms/'
    | '/(app)/_layout/content/'
    | '/(app)/_layout/payments/';
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
        "/(app)/_layout/calendar/",
        "/(app)/_layout/classrooms/",
        "/(app)/_layout/content/",
        "/(app)/_layout/payments/"
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
    "/(app)/_layout/calendar/": {
      "filePath": "(app)/_layout/calendar/index.tsx",
      "parent": "/(app)/_layout"
    },
    "/(app)/_layout/classrooms/": {
      "filePath": "(app)/_layout/classrooms/index.tsx",
      "parent": "/(app)/_layout"
    },
    "/(app)/_layout/content/": {
      "filePath": "(app)/_layout/content/index.tsx",
      "parent": "/(app)/_layout"
    },
    "/(app)/_layout/payments/": {
      "filePath": "(app)/_layout/payments/index.tsx",
      "parent": "/(app)/_layout"
    }
  }
}
ROUTE_MANIFEST_END */
