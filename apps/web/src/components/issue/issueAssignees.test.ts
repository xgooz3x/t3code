import { describe, expect, it } from "vite-plus/test";

import { assigneeIdsAfterToggle } from "./issueAssignees.ts";

const ada = { login: "ada", name: null, avatarUrl: null };
const bob = { login: "bob", name: null, avatarUrl: null };
const candidates = [
  { ...ada, id: "11" },
  { ...bob, id: "22" },
];

describe("assigneeIdsAfterToggle", () => {
  it("names kept assignees by candidate id when adding someone", () => {
    expect(assigneeIdsAfterToggle([ada], candidates, candidates[1]!)).toEqual(["11", "22"]);
  });

  it("removes an assignee and names the rest by candidate id", () => {
    expect(assigneeIdsAfterToggle([ada, bob], candidates, candidates[0]!)).toEqual(["22"]);
  });

  it("refuses when a current assignee has no candidate id", () => {
    expect(assigneeIdsAfterToggle([ada, bob], [candidates[0]!], candidates[0]!)).toBeNull();
  });
});
