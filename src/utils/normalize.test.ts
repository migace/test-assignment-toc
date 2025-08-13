import { describe, it, expect } from "vitest";
import { normalize } from "./normalize";

describe("normalize", () => {
  it("should lowercase the string", () => {
    expect(normalize("ABC")).toBe("abc");
  });

  it("should remove diacritics", () => {
    expect(normalize("café")).toBe("cafe");
    expect(normalize("naïve")).toBe("naive");
    expect(normalize("façade")).toBe("facade");
  });

  it("should handle mixed case and diacritics", () => {
    expect(normalize("Éléphant")).toBe("elephant");
  });

  it("should handle empty string", () => {
    expect(normalize("")).toBe("");
  });

  it("should handle strings without diacritics", () => {
    expect(normalize("hello")).toBe("hello");
  });
});
