/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activity from "../activity.js";
import type * as agent from "../agent.js";
import type * as agentSettings from "../agentSettings.js";
import type * as crons from "../crons.js";
import type * as ebay from "../ebay.js";
import type * as functions from "../functions.js";
import type * as gemini from "../gemini.js";
import type * as http from "../http.js";
import type * as products from "../products.js";
import type * as purchaseOrders from "../purchaseOrders.js";
import type * as seed from "../seed.js";
import type * as shops from "../shops.js";
import type * as system from "../system.js";
import type * as users from "../users.js";
import type * as wallets from "../wallets.js";
import type * as whatsapp from "../whatsapp.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activity: typeof activity;
  agent: typeof agent;
  agentSettings: typeof agentSettings;
  crons: typeof crons;
  ebay: typeof ebay;
  functions: typeof functions;
  gemini: typeof gemini;
  http: typeof http;
  products: typeof products;
  purchaseOrders: typeof purchaseOrders;
  seed: typeof seed;
  shops: typeof shops;
  system: typeof system;
  users: typeof users;
  wallets: typeof wallets;
  whatsapp: typeof whatsapp;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
