/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as CompareRouteImport } from './routes/compare'
import { Route as PayoutsRouteImport } from './routes/payouts'
import { Route as DeskRouteImport } from './routes/desk'

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const CompareRoute = CompareRouteImport.update({
  id: '/compare',
  path: '/compare',
  getParentRoute: () => rootRouteImport,
} as any)
const PayoutsRoute = PayoutsRouteImport.update({
  id: '/payouts',
  path: '/payouts',
  getParentRoute: () => rootRouteImport,
} as any)
const DeskRoute = DeskRouteImport.update({
  id: '/desk',
  path: '/desk',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/compare': typeof CompareRoute
  '/payouts': typeof PayoutsRoute
  '/desk': typeof DeskRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/compare': typeof CompareRoute
  '/payouts': typeof PayoutsRoute
  '/desk': typeof DeskRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/compare': typeof CompareRoute
  '/payouts': typeof PayoutsRoute
  '/desk': typeof DeskRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/compare' | '/payouts' | '/desk'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/compare' | '/payouts' | '/desk'
  id: '__root__' | '/' | '/compare' | '/payouts' | '/desk'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  CompareRoute: typeof CompareRoute
  PayoutsRoute: typeof PayoutsRoute
  DeskRoute: typeof DeskRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/compare': {
      id: '/compare'
      path: '/compare'
      fullPath: '/compare'
      preLoaderRoute: typeof CompareRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/payouts': {
      id: '/payouts'
      path: '/payouts'
      fullPath: '/payouts'
      preLoaderRoute: typeof PayoutsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/desk': {
      id: '/desk'
      path: '/desk'
      fullPath: '/desk'
      preLoaderRoute: typeof DeskRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  CompareRoute: CompareRoute,
  PayoutsRoute: PayoutsRoute,
  DeskRoute: DeskRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { createStart } from '@tanstack/react-start'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
  }
}
