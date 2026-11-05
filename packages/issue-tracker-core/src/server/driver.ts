/**
 * What an issue tracker package hands the server: one driver per tracker kind. Git hosts ship
 * theirs inside their source control package; a standalone tracker ships its own. `make`'s `R`
 * channel is everything the server must provide.
 */
import type { IssueTrackerKind } from "@t3tools/contracts";
import type * as Effect from "effect/Effect";

import type { IssueTrackerApi } from "./IssueTracker.ts";

export interface IssueTrackerDriver<R = never> {
  readonly kind: IssueTrackerKind;
  readonly make: Effect.Effect<IssueTrackerApi, never, R>;
}

/** Declares a driver with its `R` inferred from `make`. */
export const defineIssueTrackerDriver = <R>(driver: IssueTrackerDriver<R>): IssueTrackerDriver<R> =>
  driver;
