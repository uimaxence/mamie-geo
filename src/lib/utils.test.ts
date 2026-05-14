import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn()", () => {
  it("concatène plusieurs classes string", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("ignore les falsy (false, null, undefined)", () => {
    expect(cn("foo", false && "bar", null, undefined, "baz")).toBe("foo baz");
  });

  it("applique tailwind-merge pour dédupliquer les classes en conflit", () => {
    // px-2 doit être écrasé par px-4 (dernière classe gagne)
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("dédupe les classes répétées", () => {
    // tailwind-merge garde la version la plus à droite
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("accepte des tableaux conditionnels (clsx)", () => {
    expect(cn(["foo", "bar"], { baz: true, qux: false })).toBe("foo bar baz");
  });
});
