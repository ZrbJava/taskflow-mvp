import { describe, expect, it } from "vitest";
import {
  normalizeDateRange,
  parseYmdParam,
  updatedAtFilterFromQuery,
} from "./date-query";

describe("parseYmdParam", () => {
  it("accepts valid YYYY-MM-DD", () => {
    expect(parseYmdParam("2026-04-21")).toBe("2026-04-21");
  });

  it("rejects invalid calendar dates", () => {
    expect(parseYmdParam("2026-02-30")).toBeUndefined();
  });
});

describe("normalizeDateRange", () => {
  it("swaps when from > to", () => {
    expect(normalizeDateRange("2026-04-10", "2026-04-01")).toEqual({
      dateFrom: "2026-04-01",
      dateTo: "2026-04-10",
    });
  });
});

describe("updatedAtFilterFromQuery", () => {
  it("builds gte/lte in UTC", () => {
    const f = updatedAtFilterFromQuery("2026-01-01", "2026-01-02");
    expect(f?.gte?.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(f?.lte?.toISOString()).toBe("2026-01-02T23:59:59.999Z");
  });
});
