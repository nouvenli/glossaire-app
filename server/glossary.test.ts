import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("glossaries router", () => {
  it("should list glossaries for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // This will return an empty list if no glossaries exist
    const result = await caller.glossaries.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should validate glossary creation input", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      // This should fail validation due to empty title
      await caller.glossaries.create({
        title: "",
        description: "Test",
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.message).toContain("Too small");
    }
  });
});

describe("entries router", () => {
  it("should validate entry creation input", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      // This should fail validation due to empty term
      await caller.entries.create({
        glossaryId: 1,
        term: "",
        definition: "Test definition",
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.message).toContain("Too small");
    }
  });

  it("should validate search input", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // This should return an empty list if glossary doesn't exist
    const result = await caller.entries.search({
      glossaryId: 999,
      searchTerm: "test",
    });
    expect(Array.isArray(result)).toBe(true);
  });
});
