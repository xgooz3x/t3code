import { IssueTrackerKind } from "@t3tools/contracts";
import { defineIssueTrackerDriver } from "@t3tools/issue-tracker-core/server/driver";
import { withOwnServices } from "@t3tools/source-control-core/server/driver";

import * as GitHubIssueTracker from "./GitHubIssueTracker.ts";
import * as GitHubRest from "./GitHubRest.ts";

export const driver = defineIssueTrackerDriver({
  kind: IssueTrackerKind.make("github"),
  // The source control driver keeps its clients private, so the tracker builds its own.
  make: withOwnServices(GitHubIssueTracker.make, GitHubRest.layerWithDependencies),
});
