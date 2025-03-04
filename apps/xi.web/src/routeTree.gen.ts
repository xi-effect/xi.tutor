/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './pages/__root';
import { Route as AboutImport } from './pages/about';
import { Route as IndexImport } from './pages/index';
import { Route as SignupIndexImport } from './pages/signup/index';
import { Route as SigninIndexImport } from './pages/signin/index';
import { Route as CalendarIndexImport } from './pages/calendar/index';

// Create/Update Routes

const AboutRoute = AboutImport.update({
  id: '/about',
  path: '/about',
  getParentRoute: () => rootRoute,
} as any);

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any);

const SignupIndexRoute = SignupIndexImport.update({
  id: '/signup/',
  path: '/signup/',
  getParentRoute: () => rootRoute,
} as any);

const SigninIndexRoute = SigninIndexImport.update({
  id: '/signin/',
  path: '/signin/',
  getParentRoute: () => rootRoute,
} as any);

const CalendarIndexRoute = CalendarIndexImport.update({
  id: '/calendar/',
  path: '/calendar/',
  getParentRoute: () => rootRoute,
} as any);

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/';
      path: '/';
      fullPath: '/';
      preLoaderRoute: typeof IndexImport;
      parentRoute: typeof rootRoute;
    };
    '/about': {
      id: '/about';
      path: '/about';
      fullPath: '/about';
      preLoaderRoute: typeof AboutImport;
      parentRoute: typeof rootRoute;
    };
    '/calendar/': {
      id: '/calendar/';
      path: '/calendar';
      fullPath: '/calendar';
      preLoaderRoute: typeof CalendarIndexImport;
      parentRoute: typeof rootRoute;
    };
    '/signin/': {
      id: '/signin/';
      path: '/signin';
      fullPath: '/signin';
      preLoaderRoute: typeof SigninIndexImport;
      parentRoute: typeof rootRoute;
    };
    '/signup/': {
      id: '/signup/';
      path: '/signup';
      fullPath: '/signup';
      preLoaderRoute: typeof SignupIndexImport;
      parentRoute: typeof rootRoute;
    };
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute;
  '/about': typeof AboutRoute;
  '/calendar': typeof CalendarIndexRoute;
  '/signin': typeof SigninIndexRoute;
  '/signup': typeof SignupIndexRoute;
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute;
  '/about': typeof AboutRoute;
  '/calendar': typeof CalendarIndexRoute;
  '/signin': typeof SigninIndexRoute;
  '/signup': typeof SignupIndexRoute;
}

export interface FileRoutesById {
  __root__: typeof rootRoute;
  '/': typeof IndexRoute;
  '/about': typeof AboutRoute;
  '/calendar/': typeof CalendarIndexRoute;
  '/signin/': typeof SigninIndexRoute;
  '/signup/': typeof SignupIndexRoute;
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath;
  fullPaths: '/' | '/about' | '/calendar' | '/signin' | '/signup';
  fileRoutesByTo: FileRoutesByTo;
  to: '/' | '/about' | '/calendar' | '/signin' | '/signup';
  id: '__root__' | '/' | '/about' | '/calendar/' | '/signin/' | '/signup/';
  fileRoutesById: FileRoutesById;
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute;
  AboutRoute: typeof AboutRoute;
  CalendarIndexRoute: typeof CalendarIndexRoute;
  SigninIndexRoute: typeof SigninIndexRoute;
  SignupIndexRoute: typeof SignupIndexRoute;
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AboutRoute: AboutRoute,
  CalendarIndexRoute: CalendarIndexRoute,
  SigninIndexRoute: SigninIndexRoute,
  SignupIndexRoute: SignupIndexRoute,
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
        "/",
        "/about",
        "/calendar/",
        "/signin/",
        "/signup/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/about": {
      "filePath": "about.tsx"
    },
    "/calendar/": {
      "filePath": "calendar/index.tsx"
    },
    "/signin/": {
      "filePath": "signin/index.tsx"
    },
    "/signup/": {
      "filePath": "signup/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
