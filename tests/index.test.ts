import { describe, test, expect } from "bun:test";
describe("agent-behavioral-fuzzer", () => {
  test("module loads", async () => { const m = await import("./index"); expect(m).toBeDefined(); });
});
