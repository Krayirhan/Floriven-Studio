import { describe, expect, it } from "vitest";
import { validateDesignSpecIdentity } from "./identity-validator";

const node = (id: string, interactions = []) => ({ id, type: "Stack", props: {}, interactions, children: [] });
describe("DesignSpec identity validator", () => {
  it("rejects duplicate node and screen ids", () => {
    const issues = validateDesignSpecIdentity({ screens: [{ id: "home", name: "Home", root: node("same") }, { id: "home", name: "Copy", root: node("same") }] });
    expect(issues.map((issue) => issue.code)).toEqual(["DUPLICATE_SCREEN_ID", "DUPLICATE_NODE_ID"]);
  });
  it("rejects unknown action targets", () => {
    const issues = validateDesignSpecIdentity({ screens: [{ id: "home", name: "Home", root: node("root", [{ event: "tap", action: { type: "navigate", targetScreenId: "missing" } }]) }] });
    expect(issues[0]?.code).toBe("INVALID_ACTION_TARGET");
  });
});
