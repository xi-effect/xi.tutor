/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router'

import { Route as rootRouteImport } from './pages/__root'
import { Route as AboutRouteImport } from './pages/about'
import { Route as appLayoutRouteImport } from './pages/(app)/_layout'
import { Route as authSignupIndexRouteImport } from './pages/(auth)/signup/index'
import { Route as authSigninIndexRouteImport } from './pages/(auth)/signin/index'
import { Route as authResetPasswordIndexRouteImport } from './pages/(auth)/reset-password/index'
import { Route as appLayoutIndexRouteImport } from './pages/(app)/_layout/index'
import { Route as authResetPasswordResetTokenRouteImport } from './pages/(auth)/reset-password/$resetToken'
import { Route as appWelcomeLayoutRouteImport } from './pages/(app)/welcome/_layout'
import { Route as appInviteInviteIdRouteImport } from './pages/(app)/invite/$inviteId'
import { Route as appWelcomeUserIndexRouteImport } from './pages/(app)/welcome/user/index'
import { Route as appWelcomeSocialsIndexRouteImport } from './pages/(app)/welcome/socials/index'
import { Route as appWelcomeRoleIndexRouteImport } from './pages/(app)/welcome/role/index'
import { Route as appLayoutPaymentsIndexRouteImport } from './pages/(app)/_layout/payments/index'
import { Route as appLayoutMaterialsIndexRouteImport } from './pages/(app)/_layout/materials/index'
import { Route as appLayoutEditorIndexRouteImport } from './pages/(app)/_layout/editor/index'
import { Route as appLayoutDraftTableIndexRouteImport } from './pages/(app)/_layout/draftTable/index'
import { Route as appLayoutClassroomsIndexRouteImport } from './pages/(app)/_layout/classrooms/index'
import { Route as appLayoutCallIndexRouteImport } from './pages/(app)/_layout/call/index'
import { Route as appLayoutCalendarIndexRouteImport } from './pages/(app)/_layout/calendar/index'
import { Route as appLayoutClassroomsClassroomIdRouteImport } from './pages/(app)/_layout/classrooms/$classroomId'
import { Route as appLayoutCallCallIdRouteImport } from './pages/(app)/_layout/call/$callId'
import { Route as appLayoutBoardBoardIdRouteImport } from './pages/(app)/_layout/board/$boardId'

const appRouteImport = createFileRoute('/(app)')()
const appWelcomeRouteImport = createFileRoute('/(app)/welcome')()

const appRoute = appRouteImport.update({
  id: '/(app)',
  getParentRoute: () => rootRouteImport,
} as any)
const AboutRoute = AboutRouteImport.update({
  id: '/about',
  path: '/about',
  getParentRoute: () => rootRouteImport,
} as any)
const appWelcomeRoute = appWelcomeRouteImport.update({
  id: '/welcome',
  path: '/welcome',
  getParentRoute: () => appRoute,
} as any)
const appLayoutRoute = appLayoutRouteImport.update({
  id: '/_layout',
  getParentRoute: () => appRoute,
} as any)
const authSignupIndexRoute = authSignupIndexRouteImport.update({
  id: '/(auth)/signup/',
  path: '/signup/',
  getParentRoute: () => rootRouteImport,
} as any)
const authSigninIndexRoute = authSigninIndexRouteImport.update({
  id: '/(auth)/signin/',
  path: '/signin/',
  getParentRoute: () => rootRouteImport,
} as any)
const authResetPasswordIndexRoute = authResetPasswordIndexRouteImport.update({
  id: '/(auth)/reset-password/',
  path: '/reset-password/',
  getParentRoute: () => rootRouteImport,
} as any)
const appLayoutIndexRoute = appLayoutIndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => appLayoutRoute,
} as any)
const authResetPasswordResetTokenRoute =
  authResetPasswordResetTokenRouteImport.update({
    id: '/(auth)/reset-password/$resetToken',
    path: '/reset-password/$resetToken',
    getParentRoute: () => rootRouteImport,
  } as any)
const appWelcomeLayoutRoute = appWelcomeLayoutRouteImport.update({
  id: '/_layout',
  getParentRoute: () => appWelcomeRoute,
} as any)
const appInviteInviteIdRoute = appInviteInviteIdRouteImport.update({
  id: '/invite/$inviteId',
  path: '/invite/$inviteId',
  getParentRoute: () => appRoute,
} as any)
const appWelcomeUserIndexRoute = appWelcomeUserIndexRouteImport.update({
  id: '/user/',
  path: '/user/',
  getParentRoute: () => appWelcomeRoute,
} as any)
const appWelcomeSocialsIndexRoute = appWelcomeSocialsIndexRouteImport.update({
  id: '/socials/',
  path: '/socials/',
  getParentRoute: () => appWelcomeRoute,
} as any)
const appWelcomeRoleIndexRoute = appWelcomeRoleIndexRouteImport.update({
  id: '/role/',
  path: '/role/',
  getParentRoute: () => appWelcomeRoute,
} as any)
const appLayoutPaymentsIndexRoute = appLayoutPaymentsIndexRouteImport.update({
  id: '/payments/',
  path: '/payments/',
  getParentRoute: () => appLayoutRoute,
} as any)
const appLayoutMaterialsIndexRoute = appLayoutMaterialsIndexRouteImport.update({
  id: '/materials/',
  path: '/materials/',
  getParentRoute: () => appLayoutRoute,
} as any)
const appLayoutEditorIndexRoute = appLayoutEditorIndexRouteImport.update({
  id: '/editor/',
  path: '/editor/',
  getParentRoute: () => appLayoutRoute,
} as any)
const appLayoutDraftTableIndexRoute =
  appLayoutDraftTableIndexRouteImport.update({
    id: '/draftTable/',
    path: '/draftTable/',
    getParentRoute: () => appLayoutRoute,
  } as any)
const appLayoutClassroomsIndexRoute =
  appLayoutClassroomsIndexRouteImport.update({
    id: '/classrooms/',
    path: '/classrooms/',
    getParentRoute: () => appLayoutRoute,
  } as any)
const appLayoutCallIndexRoute = appLayoutCallIndexRouteImport.update({
  id: '/call/',
  path: '/call/',
  getParentRoute: () => appLayoutRoute,
} as any)
const appLayoutCalendarIndexRoute = appLayoutCalendarIndexRouteImport.update({
  id: '/calendar/',
  path: '/calendar/',
  getParentRoute: () => appLayoutRoute,
} as any)
const appLayoutClassroomsClassroomIdRoute =
  appLayoutClassroomsClassroomIdRouteImport.update({
    id: '/classrooms/$classroomId',
    path: '/classrooms/$classroomId',
    getParentRoute: () => appLayoutRoute,
  } as any)
const appLayoutCallCallIdRoute = appLayoutCallCallIdRouteImport.update({
  id: '/call/$callId',
  path: '/call/$callId',
  getParentRoute: () => appLayoutRoute,
} as any)
const appLayoutBoardBoardIdRoute = appLayoutBoardBoardIdRouteImport.update({
  id: '/board/$boardId',
  path: '/board/$boardId',
  getParentRoute: () => appLayoutRoute,
} as any)

export interface FileRoutesByFullPath {
  '/about': typeof AboutRoute
  '/': typeof appLayoutIndexRoute
  '/invite/$inviteId': typeof appInviteInviteIdRoute
  '/welcome': typeof appWelcomeLayoutRoute
  '/reset-password/$resetToken': typeof authResetPasswordResetTokenRoute
  '/reset-password': typeof authResetPasswordIndexRoute
  '/signin': typeof authSigninIndexRoute
  '/signup': typeof authSignupIndexRoute
  '/board/$boardId': typeof appLayoutBoardBoardIdRoute
  '/call/$callId': typeof appLayoutCallCallIdRoute
  '/classrooms/$classroomId': typeof appLayoutClassroomsClassroomIdRoute
  '/calendar': typeof appLayoutCalendarIndexRoute
  '/call': typeof appLayoutCallIndexRoute
  '/classrooms': typeof appLayoutClassroomsIndexRoute
  '/draftTable': typeof appLayoutDraftTableIndexRoute
  '/editor': typeof appLayoutEditorIndexRoute
  '/materials': typeof appLayoutMaterialsIndexRoute
  '/payments': typeof appLayoutPaymentsIndexRoute
  '/welcome/role': typeof appWelcomeRoleIndexRoute
  '/welcome/socials': typeof appWelcomeSocialsIndexRoute
  '/welcome/user': typeof appWelcomeUserIndexRoute
}
export interface FileRoutesByTo {
  '/about': typeof AboutRoute
  '/invite/$inviteId': typeof appInviteInviteIdRoute
  '/welcome': typeof appWelcomeLayoutRoute
  '/reset-password/$resetToken': typeof authResetPasswordResetTokenRoute
  '/': typeof appLayoutIndexRoute
  '/reset-password': typeof authResetPasswordIndexRoute
  '/signin': typeof authSigninIndexRoute
  '/signup': typeof authSignupIndexRoute
  '/board/$boardId': typeof appLayoutBoardBoardIdRoute
  '/call/$callId': typeof appLayoutCallCallIdRoute
  '/classrooms/$classroomId': typeof appLayoutClassroomsClassroomIdRoute
  '/calendar': typeof appLayoutCalendarIndexRoute
  '/call': typeof appLayoutCallIndexRoute
  '/classrooms': typeof appLayoutClassroomsIndexRoute
  '/draftTable': typeof appLayoutDraftTableIndexRoute
  '/editor': typeof appLayoutEditorIndexRoute
  '/materials': typeof appLayoutMaterialsIndexRoute
  '/payments': typeof appLayoutPaymentsIndexRoute
  '/welcome/role': typeof appWelcomeRoleIndexRoute
  '/welcome/socials': typeof appWelcomeSocialsIndexRoute
  '/welcome/user': typeof appWelcomeUserIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/about': typeof AboutRoute
  '/(app)': typeof appRouteWithChildren
  '/(app)/_layout': typeof appLayoutRouteWithChildren
  '/(app)/invite/$inviteId': typeof appInviteInviteIdRoute
  '/(app)/welcome': typeof appWelcomeRouteWithChildren
  '/(app)/welcome/_layout': typeof appWelcomeLayoutRoute
  '/(auth)/reset-password/$resetToken': typeof authResetPasswordResetTokenRoute
  '/(app)/_layout/': typeof appLayoutIndexRoute
  '/(auth)/reset-password/': typeof authResetPasswordIndexRoute
  '/(auth)/signin/': typeof authSigninIndexRoute
  '/(auth)/signup/': typeof authSignupIndexRoute
  '/(app)/_layout/board/$boardId': typeof appLayoutBoardBoardIdRoute
  '/(app)/_layout/call/$callId': typeof appLayoutCallCallIdRoute
  '/(app)/_layout/classrooms/$classroomId': typeof appLayoutClassroomsClassroomIdRoute
  '/(app)/_layout/calendar/': typeof appLayoutCalendarIndexRoute
  '/(app)/_layout/call/': typeof appLayoutCallIndexRoute
  '/(app)/_layout/classrooms/': typeof appLayoutClassroomsIndexRoute
  '/(app)/_layout/draftTable/': typeof appLayoutDraftTableIndexRoute
  '/(app)/_layout/editor/': typeof appLayoutEditorIndexRoute
  '/(app)/_layout/materials/': typeof appLayoutMaterialsIndexRoute
  '/(app)/_layout/payments/': typeof appLayoutPaymentsIndexRoute
  '/(app)/welcome/role/': typeof appWelcomeRoleIndexRoute
  '/(app)/welcome/socials/': typeof appWelcomeSocialsIndexRoute
  '/(app)/welcome/user/': typeof appWelcomeUserIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/about'
    | '/'
    | '/invite/$inviteId'
    | '/welcome'
    | '/reset-password/$resetToken'
    | '/reset-password'
    | '/signin'
    | '/signup'
    | '/board/$boardId'
    | '/call/$callId'
    | '/classrooms/$classroomId'
    | '/calendar'
    | '/call'
    | '/classrooms'
    | '/draftTable'
    | '/editor'
    | '/materials'
    | '/payments'
    | '/welcome/role'
    | '/welcome/socials'
    | '/welcome/user'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/about'
    | '/invite/$inviteId'
    | '/welcome'
    | '/reset-password/$resetToken'
    | '/'
    | '/reset-password'
    | '/signin'
    | '/signup'
    | '/board/$boardId'
    | '/call/$callId'
    | '/classrooms/$classroomId'
    | '/calendar'
    | '/call'
    | '/classrooms'
    | '/draftTable'
    | '/editor'
    | '/materials'
    | '/payments'
    | '/welcome/role'
    | '/welcome/socials'
    | '/welcome/user'
  id:
    | '__root__'
    | '/about'
    | '/(app)'
    | '/(app)/_layout'
    | '/(app)/invite/$inviteId'
    | '/(app)/welcome'
    | '/(app)/welcome/_layout'
    | '/(auth)/reset-password/$resetToken'
    | '/(app)/_layout/'
    | '/(auth)/reset-password/'
    | '/(auth)/signin/'
    | '/(auth)/signup/'
    | '/(app)/_layout/board/$boardId'
    | '/(app)/_layout/call/$callId'
    | '/(app)/_layout/classrooms/$classroomId'
    | '/(app)/_layout/calendar/'
    | '/(app)/_layout/call/'
    | '/(app)/_layout/classrooms/'
    | '/(app)/_layout/draftTable/'
    | '/(app)/_layout/editor/'
    | '/(app)/_layout/materials/'
    | '/(app)/_layout/payments/'
    | '/(app)/welcome/role/'
    | '/(app)/welcome/socials/'
    | '/(app)/welcome/user/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  AboutRoute: typeof AboutRoute
  appRoute: typeof appRouteWithChildren
  authResetPasswordResetTokenRoute: typeof authResetPasswordResetTokenRoute
  authResetPasswordIndexRoute: typeof authResetPasswordIndexRoute
  authSigninIndexRoute: typeof authSigninIndexRoute
  authSignupIndexRoute: typeof authSignupIndexRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/(app)': {
      id: '/(app)'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof appRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/about': {
      id: '/about'
      path: '/about'
      fullPath: '/about'
      preLoaderRoute: typeof AboutRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/(app)/welcome': {
      id: '/(app)/welcome'
      path: '/welcome'
      fullPath: '/welcome'
      preLoaderRoute: typeof appWelcomeRouteImport
      parentRoute: typeof appRoute
    }
    '/(app)/_layout': {
      id: '/(app)/_layout'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof appLayoutRouteImport
      parentRoute: typeof appRoute
    }
    '/(auth)/signup/': {
      id: '/(auth)/signup/'
      path: '/signup'
      fullPath: '/signup'
      preLoaderRoute: typeof authSignupIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/(auth)/signin/': {
      id: '/(auth)/signin/'
      path: '/signin'
      fullPath: '/signin'
      preLoaderRoute: typeof authSigninIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/(auth)/reset-password/': {
      id: '/(auth)/reset-password/'
      path: '/reset-password'
      fullPath: '/reset-password'
      preLoaderRoute: typeof authResetPasswordIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/(app)/_layout/': {
      id: '/(app)/_layout/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof appLayoutIndexRouteImport
      parentRoute: typeof appLayoutRoute
    }
    '/(auth)/reset-password/$resetToken': {
      id: '/(auth)/reset-password/$resetToken'
      path: '/reset-password/$resetToken'
      fullPath: '/reset-password/$resetToken'
      preLoaderRoute: typeof authResetPasswordResetTokenRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/(app)/welcome/_layout': {
      id: '/(app)/welcome/_layout'
      path: '/welcome'
      fullPath: '/welcome'
      preLoaderRoute: typeof appWelcomeLayoutRouteImport
      parentRoute: typeof appWelcomeRoute
    }
    '/(app)/invite/$inviteId': {
      id: '/(app)/invite/$inviteId'
      path: '/invite/$inviteId'
      fullPath: '/invite/$inviteId'
      preLoaderRoute: typeof appInviteInviteIdRouteImport
      parentRoute: typeof appRoute
    }
    '/(app)/welcome/user/': {
      id: '/(app)/welcome/user/'
      path: '/user'
      fullPath: '/welcome/user'
      preLoaderRoute: typeof appWelcomeUserIndexRouteImport
      parentRoute: typeof appWelcomeRoute
    }
    '/(app)/welcome/socials/': {
      id: '/(app)/welcome/socials/'
      path: '/socials'
      fullPath: '/welcome/socials'
      preLoaderRoute: typeof appWelcomeSocialsIndexRouteImport
      parentRoute: typeof appWelcomeRoute
    }
    '/(app)/welcome/role/': {
      id: '/(app)/welcome/role/'
      path: '/role'
      fullPath: '/welcome/role'
      preLoaderRoute: typeof appWelcomeRoleIndexRouteImport
      parentRoute: typeof appWelcomeRoute
    }
    '/(app)/_layout/payments/': {
      id: '/(app)/_layout/payments/'
      path: '/payments'
      fullPath: '/payments'
      preLoaderRoute: typeof appLayoutPaymentsIndexRouteImport
      parentRoute: typeof appLayoutRoute
    }
    '/(app)/_layout/materials/': {
      id: '/(app)/_layout/materials/'
      path: '/materials'
      fullPath: '/materials'
      preLoaderRoute: typeof appLayoutMaterialsIndexRouteImport
      parentRoute: typeof appLayoutRoute
    }
    '/(app)/_layout/editor/': {
      id: '/(app)/_layout/editor/'
      path: '/editor'
      fullPath: '/editor'
      preLoaderRoute: typeof appLayoutEditorIndexRouteImport
      parentRoute: typeof appLayoutRoute
    }
    '/(app)/_layout/draftTable/': {
      id: '/(app)/_layout/draftTable/'
      path: '/draftTable'
      fullPath: '/draftTable'
      preLoaderRoute: typeof appLayoutDraftTableIndexRouteImport
      parentRoute: typeof appLayoutRoute
    }
    '/(app)/_layout/classrooms/': {
      id: '/(app)/_layout/classrooms/'
      path: '/classrooms'
      fullPath: '/classrooms'
      preLoaderRoute: typeof appLayoutClassroomsIndexRouteImport
      parentRoute: typeof appLayoutRoute
    }
    '/(app)/_layout/call/': {
      id: '/(app)/_layout/call/'
      path: '/call'
      fullPath: '/call'
      preLoaderRoute: typeof appLayoutCallIndexRouteImport
      parentRoute: typeof appLayoutRoute
    }
    '/(app)/_layout/calendar/': {
      id: '/(app)/_layout/calendar/'
      path: '/calendar'
      fullPath: '/calendar'
      preLoaderRoute: typeof appLayoutCalendarIndexRouteImport
      parentRoute: typeof appLayoutRoute
    }
    '/(app)/_layout/classrooms/$classroomId': {
      id: '/(app)/_layout/classrooms/$classroomId'
      path: '/classrooms/$classroomId'
      fullPath: '/classrooms/$classroomId'
      preLoaderRoute: typeof appLayoutClassroomsClassroomIdRouteImport
      parentRoute: typeof appLayoutRoute
    }
    '/(app)/_layout/call/$callId': {
      id: '/(app)/_layout/call/$callId'
      path: '/call/$callId'
      fullPath: '/call/$callId'
      preLoaderRoute: typeof appLayoutCallCallIdRouteImport
      parentRoute: typeof appLayoutRoute
    }
    '/(app)/_layout/board/$boardId': {
      id: '/(app)/_layout/board/$boardId'
      path: '/board/$boardId'
      fullPath: '/board/$boardId'
      preLoaderRoute: typeof appLayoutBoardBoardIdRouteImport
      parentRoute: typeof appLayoutRoute
    }
  }
}

interface appLayoutRouteChildren {
  appLayoutIndexRoute: typeof appLayoutIndexRoute
  appLayoutBoardBoardIdRoute: typeof appLayoutBoardBoardIdRoute
  appLayoutCallCallIdRoute: typeof appLayoutCallCallIdRoute
  appLayoutClassroomsClassroomIdRoute: typeof appLayoutClassroomsClassroomIdRoute
  appLayoutCalendarIndexRoute: typeof appLayoutCalendarIndexRoute
  appLayoutCallIndexRoute: typeof appLayoutCallIndexRoute
  appLayoutClassroomsIndexRoute: typeof appLayoutClassroomsIndexRoute
  appLayoutDraftTableIndexRoute: typeof appLayoutDraftTableIndexRoute
  appLayoutEditorIndexRoute: typeof appLayoutEditorIndexRoute
  appLayoutMaterialsIndexRoute: typeof appLayoutMaterialsIndexRoute
  appLayoutPaymentsIndexRoute: typeof appLayoutPaymentsIndexRoute
}

const appLayoutRouteChildren: appLayoutRouteChildren = {
  appLayoutIndexRoute: appLayoutIndexRoute,
  appLayoutBoardBoardIdRoute: appLayoutBoardBoardIdRoute,
  appLayoutCallCallIdRoute: appLayoutCallCallIdRoute,
  appLayoutClassroomsClassroomIdRoute: appLayoutClassroomsClassroomIdRoute,
  appLayoutCalendarIndexRoute: appLayoutCalendarIndexRoute,
  appLayoutCallIndexRoute: appLayoutCallIndexRoute,
  appLayoutClassroomsIndexRoute: appLayoutClassroomsIndexRoute,
  appLayoutDraftTableIndexRoute: appLayoutDraftTableIndexRoute,
  appLayoutEditorIndexRoute: appLayoutEditorIndexRoute,
  appLayoutMaterialsIndexRoute: appLayoutMaterialsIndexRoute,
  appLayoutPaymentsIndexRoute: appLayoutPaymentsIndexRoute,
}

const appLayoutRouteWithChildren = appLayoutRoute._addFileChildren(
  appLayoutRouteChildren,
)

interface appWelcomeRouteChildren {
  appWelcomeLayoutRoute: typeof appWelcomeLayoutRoute
  appWelcomeRoleIndexRoute: typeof appWelcomeRoleIndexRoute
  appWelcomeSocialsIndexRoute: typeof appWelcomeSocialsIndexRoute
  appWelcomeUserIndexRoute: typeof appWelcomeUserIndexRoute
}

const appWelcomeRouteChildren: appWelcomeRouteChildren = {
  appWelcomeLayoutRoute: appWelcomeLayoutRoute,
  appWelcomeRoleIndexRoute: appWelcomeRoleIndexRoute,
  appWelcomeSocialsIndexRoute: appWelcomeSocialsIndexRoute,
  appWelcomeUserIndexRoute: appWelcomeUserIndexRoute,
}

const appWelcomeRouteWithChildren = appWelcomeRoute._addFileChildren(
  appWelcomeRouteChildren,
)

interface appRouteChildren {
  appLayoutRoute: typeof appLayoutRouteWithChildren
  appInviteInviteIdRoute: typeof appInviteInviteIdRoute
  appWelcomeRoute: typeof appWelcomeRouteWithChildren
}

const appRouteChildren: appRouteChildren = {
  appLayoutRoute: appLayoutRouteWithChildren,
  appInviteInviteIdRoute: appInviteInviteIdRoute,
  appWelcomeRoute: appWelcomeRouteWithChildren,
}

const appRouteWithChildren = appRoute._addFileChildren(appRouteChildren)

const rootRouteChildren: RootRouteChildren = {
  AboutRoute: AboutRoute,
  appRoute: appRouteWithChildren,
  authResetPasswordResetTokenRoute: authResetPasswordResetTokenRoute,
  authResetPasswordIndexRoute: authResetPasswordIndexRoute,
  authSigninIndexRoute: authSigninIndexRoute,
  authSignupIndexRoute: authSignupIndexRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
