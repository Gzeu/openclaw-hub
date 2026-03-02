/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agentActions from "../agentActions.js";
import type * as agentComms from "../agentComms.js";
import type * as agentNode from "../agentNode.js";
import type * as agents from "../agents.js";
import type * as authActions from "../authActions.js";
import type * as authQueries from "../authQueries.js";
import type * as blockchain from "../blockchain.js";
import type * as config from "../config.js";
import type * as crons from "../crons.js";
import type * as hubWallet from "../hubWallet.js";
import type * as seed from "../seed.js";
import type * as sessionMutations from "../sessionMutations.js";
import type * as tasks from "../tasks.js";
import type * as tools from "../tools.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agentActions: typeof agentActions;
  agentComms: typeof agentComms;
  agentNode: typeof agentNode;
  agents: typeof agents;
  authActions: typeof authActions;
  authQueries: typeof authQueries;
  blockchain: typeof blockchain;
  config: typeof config;
  crons: typeof crons;
  hubWallet: typeof hubWallet;
  seed: typeof seed;
  sessionMutations: typeof sessionMutations;
  tasks: typeof tasks;
  tools: typeof tools;
  users: typeof users;
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
