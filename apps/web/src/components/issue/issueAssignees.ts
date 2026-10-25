import type { IssueActor, IssueAssigneeCandidate } from "@t3tools/contracts";

/**
 * The assignee set to write after toggling `candidate`, named by candidate id: a write names
 * people the way the tracker addresses them, which is not the login on every tracker (GitLab
 * uses numeric ids). Null when a current assignee is not among the candidates, so their id is
 * unknown and writing would drop or misname them.
 */
export function assigneeIdsAfterToggle(
  current: ReadonlyArray<IssueActor>,
  candidates: ReadonlyArray<IssueAssigneeCandidate>,
  candidate: IssueAssigneeCandidate,
): ReadonlyArray<string> | null {
  const login = candidate.login.toLowerCase();
  const idByLogin = new Map(candidates.map((entry) => [entry.login.toLowerCase(), entry.id]));
  const logins = current.map((actor) => actor.login.toLowerCase());
  const kept = logins.filter((existing) => existing !== login);
  const keptIds = kept.flatMap((existing) => idByLogin.get(existing) ?? []);
  if (keptIds.length !== kept.length) return null;
  return logins.includes(login) ? keptIds : [...keptIds, candidate.id];
}
