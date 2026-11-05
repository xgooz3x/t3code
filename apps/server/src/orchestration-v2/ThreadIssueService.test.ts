import * as NodeCrypto from "@effect/platform-node/NodeCrypto";
import { describe, expect, it } from "@effect/vitest";
import {
  IssueTrackerKind,
  ProjectId,
  ThreadId,
  type IssueDetail,
  type OrchestrationV2ThreadShell,
  type ThreadIssueLink,
} from "@t3tools/contracts";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Ref from "effect/Ref";
import * as TestClock from "effect/testing/TestClock";

import * as IssueService from "../issue/IssueService.ts";
import * as Orchestrator from "./Orchestrator.ts";
import * as ThreadIssueService from "./ThreadIssueService.ts";

const THREAD_ID = ThreadId.make("thread-1");
const SYNCED_AT = "2026-08-20T00:00:00.000Z";

const link: ThreadIssueLink = {
  tracker: IssueTrackerKind.make("github"),
  host: "github.com",
  scope: "owner/repository",
  key: "1",
  projectId: ProjectId.make("project-1"),
  url: "https://github.com/owner/repository/issues/1",
  source: "manual",
  linkedAt: SYNCED_AT,
  snapshot: {
    displayKey: "#1",
    title: "Issue",
    state: { category: "open", name: "Open" },
    closedAt: null,
    syncedAt: SYNCED_AT,
  },
};

describe("ThreadIssueService", () => {
  it.effect("does not re-read an unchanged issue until it is stale again", () =>
    Effect.gen(function* () {
      const reads = yield* Ref.make(0);
      const layer = ThreadIssueService.layer.pipe(
        Layer.provide(
          Layer.mergeAll(
            NodeCrypto.layer,
            Layer.mock(Orchestrator.OrchestratorV2)({
              getThreadShell: () =>
                // The service reads only these fields of the shell.
                Effect.succeed({
                  id: THREAD_ID,
                  deletedAt: null,
                  issues: [link],
                } as unknown as OrchestrationV2ThreadShell),
            }),
            Layer.mock(IssueService.IssueService)({
              detail: () =>
                Ref.update(reads, (count) => count + 1).pipe(
                  // An unchanged issue: the read dispatches nothing.
                  Effect.as({
                    displayKey: "#1",
                    title: "Issue",
                    state: { category: "open", name: "Open" },
                    closedAt: null,
                  } as unknown as IssueDetail),
                ),
            }),
          ),
        ),
      );
      yield* Effect.gen(function* () {
        const service = yield* ThreadIssueService.ThreadIssueService;
        const staleAfterMs = ThreadIssueService.BACKGROUND_STALE_AFTER_MS;
        yield* TestClock.setTime(Date.parse(SYNCED_AT) + staleAfterMs + 1);
        yield* service.refresh(THREAD_ID, { staleAfterMs });
        yield* service.drain;
        yield* service.refresh(THREAD_ID, { staleAfterMs });
        yield* service.drain;
        expect(yield* Ref.get(reads)).toBe(1);

        yield* TestClock.adjust(staleAfterMs + 1);
        yield* service.refresh(THREAD_ID, { staleAfterMs });
        yield* service.drain;
        expect(yield* Ref.get(reads)).toBe(2);
      }).pipe(Effect.provide(layer));
    }),
  );
});
